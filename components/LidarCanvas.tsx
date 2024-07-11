"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { updateInitData } from "@/store/canvasSlice";

// three
import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

import { io } from "socket.io-client";
import axios from "axios";

import { CANVAS_CLASSES } from "@/constants";
import { resourceLimits } from "worker_threads";

interface LidarCanvasProps {
  className: string;
  selectedMapCloud?: string[][] | null;
}

const LidarCanvas = ({ className, selectedMapCloud }: LidarCanvasProps) => {
  const dispatch = useDispatch();
  const { action, isMarkingMode, initData } = useSelector(
    (state: RootState) => state.canvas
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<any>();

  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlRef = useRef<MapControls | null>(null);
  const transformControlRef = useRef<TransformControls>();
  const isInitializedRef = useRef<boolean>(false);
  const robotModel = useRef<THREE.Object3D>();
  const lidarPoints = useRef<number>();
  const mappingPointsArr = useRef<number[]>([]);
  const nodesRef = useRef<Map<string, THREE.Group>>(new Map());
  let nodeNum = useRef<number>(0);

  const url = process.env.NEXT_PUBLIC_WEB_API_URL;

  let robotPose: { x: number; y: number; rz: number } = { x: 0, y: 0, rz: 0 };
  let isMouseDown: boolean = false;
  let pressedMouseBtn: number | null;

  // 3D Scene setting when the component is mounted
  useEffect(() => {
    init3DScene();
    if (className !== CANVAS_CLASSES.OVERLAY) {
      initRobot();
      connectSocket();
      reloadMappingData();
    }

    return () => {
      window.removeEventListener("resize", onWindowResize);
      rendererRef.current?.setAnimationLoop(null);

      if (className !== CANVAS_CLASSES.OVERLAY) {
        console.log("Socket disconnect ", socketRef.current.id);
        socketRef.current.disconnect();
      }
      //control dispose
      controlRef.current?.dispose();
      transformControlRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    switch (action.command) {
      case "MAPPING_START":
        // if (className === CANVAS_CLASSES.SIDEBAR && socketRef.current) {
        //   socketRef.current.on("mapping", (data) => {
        //     drawCloud(CANVAS_CLASSES.SIDEBAR, data);
        //   });
        // }
        break;
      case "MAPPING_STOP":
        clearMappingPoints();
        break;
      case "DRAW_CLOUD":
        if (selectedMapCloud) drawCloud(action.target, selectedMapCloud);
        break;
      case "ADD_NODE":
        addNode();
        break;
      case "SAVE_ANNOTATION":
        saveAnnotation(action.name);
        break;
      default:
        break;
    }
  }, [action]);

  useEffect(() => {
    if (className === CANVAS_CLASSES.DEFAULT) {
      if (isMarkingMode) {
        // handleLocalizationOn();
        toggleMarkingMode(true);
      } else if (isMarkingMode) {
        // handleLocalizationOff();
        toggleMarkingMode(false);
      }
    }
    return () => {
      toggleMarkingMode(false);
      // handleLocalizationOff();
    };
  }, [isMarkingMode]);

  const init3DScene = () => {
    if (!canvasRef.current) return;

    // scene
    const scene = new THREE.Scene();

    const color = new THREE.Color(0xffffff);
    scene.background = color;
    sceneRef.current = scene;

    // planeMesh for raycasting
    // [Note] For now, width and height values are arbitary.
    const planeGeometry = new THREE.PlaneGeometry(100000, 100000);
    const planeMaterial = new THREE.MeshBasicMaterial({
      visible: false,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.name = "plane";
    scene.add(plane);

    // camera
    const camera = new THREE.PerspectiveCamera(
      60,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      1,
      1000
    );
    cameraRef.current = camera;
    camera.up.set(0, 1, 0);
    camera.position.set(0, 0, 25);

    // renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    rendererRef.current = renderer;

    // label renderer
    const labelRenderer = new CSS2DRenderer();
    labelRendererRef.current = labelRenderer;
    labelRenderer.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    labelRenderer.domElement.style.pointerEvents = "none";
    canvasRef.current.parentElement?.appendChild(labelRenderer.domElement);

    const animate = () => {
      if (sceneRef.current && cameraRef.current) {
        rendererRef.current?.render(sceneRef.current, cameraRef.current);
        labelRenderer.render(sceneRef.current, cameraRef.current);
      }
    };
    rendererRef.current.setAnimationLoop(animate);

    // control
    const control = new MapControls(camera, renderer.domElement);
    controlRef.current = control;

    control.screenSpacePanning = true;

    control.minDistance = 5;
    control.maxDistance = 300;

    // transform control
    const tfControl: TransformControls = new TransformControls(
      camera,
      renderer.domElement
    );
    transformControlRef.current = tfControl;
    tfControl.mode = "rotate";
    tfControl.showX = false;
    tfControl.showY = false;
    tfControl.size = 0.5;
    tfControl.addEventListener("change", render);
    tfControl.addEventListener("dragging-changed", (event) => {
      control.enabled = !event.value;
    });
    tfControl.addEventListener("mouseUp", () => {
      const obj: THREE.Object3D | undefined = tfControl.object;
      if (obj) {
        dispatch(
          updateInitData({
            x: obj.position.x.toString(),
            y: obj.position.y.toString(),
            z: obj.position.z.toString(),
            rz: obj.rotation.z.toString(),
          })
        );
      }
    });
    scene.add(tfControl);

    // Light
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));

    isInitializedRef.current = true;

    // resize handling
    window.addEventListener("resize", onWindowResize);
  };

  const toggleMarkingMode = (cmd: boolean) => {
    if (
      !controlRef.current ||
      !rendererRef.current ||
      !canvasRef.current ||
      !transformControlRef.current
    )
      return;
    if (cmd) {
      resetCamera();
      controlRef.current.enableRotate = false;
      canvasRef.current.addEventListener("mousedown", handleMouseDown);
      canvasRef.current.addEventListener("mousemove", handleMouseMove);
      canvasRef.current.addEventListener("mouseup", handleMouseUp);
    } else {
      transformControlRef.current.detach();
      controlRef.current.enableRotate = true;
      canvasRef.current.removeEventListener("mousedown", handleMouseDown);
      canvasRef.current.removeEventListener("mousemove", handleMouseMove);
      canvasRef.current.removeEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    isMouseDown = true;
    pressedMouseBtn = event.button;

    if (pressedMouseBtn === 2) {
      if (
        !window ||
        !cameraRef.current ||
        !sceneRef.current ||
        !canvasRef.current ||
        !rendererRef.current
      )
        return;

      transformControlRef.current?.detach();

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const pos = getCanvasRelativePosition(event);

      if (!pos) return;
      mouse.x = (pos.x / canvasRef.current.width) * 2 - 1;
      mouse.y = -(pos.y / canvasRef.current.height) * 2 + 1; // note

      raycaster.setFromCamera(mouse, cameraRef.current);

      const plane = sceneRef.current.getObjectByName("plane");
      if (!plane) return;
      const intersects = raycaster.intersectObject(plane, true);

      if (intersects.length > 0) {
        // remove prev initpoint
        const prevInit = sceneRef.current.getObjectByName("initpoint");
        if (prevInit) {
          sceneRef.current.remove(prevInit);
        }

        const intersect = intersects[0];

        const loader = new ThreeMFLoader();

        loader.load("amr.3MF", function (group) {
          group.scale.set(0.001, 0.001, 0.001);
          group.position.set(intersect.point.x, intersect.point.y, 0);
          group.name = "initpoint";

          group.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              obj.material.color.set(new THREE.Color(0xbdc3c7));
            }
          });

          const axesHelper = new THREE.AxesHelper(2);
          axesHelper.scale.set(1000, 1000, 1000);
          group.add(axesHelper);

          sceneRef.current?.add(group);
          transformControlRef.current?.attach(group);

          dispatch(
            updateInitData({
              x: group.position.x.toString(),
              y: group.position.y.toString(),
              z: group.position.z.toString(),
              rz: "",
            })
          );
        });
      }
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isMouseDown && pressedMouseBtn === 2) {
      const marker: THREE.Object3D | undefined =
        transformControlRef.current?.object;
      if (
        marker &&
        canvasRef.current &&
        cameraRef.current &&
        sceneRef.current
      ) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const pos = getCanvasRelativePosition(event);
        if (!pos) return;

        mouse.x = (pos.x / canvasRef.current.width) * 2 - 1;
        mouse.y = -(pos.y / canvasRef.current.height) * 2 + 1;

        raycaster.setFromCamera(mouse, cameraRef.current);

        const plane = sceneRef.current.getObjectByName("plane");
        if (!plane) return;

        const intersects = raycaster.intersectObject(plane, true);
        if (!intersects) return;

        const v3 = intersects[0].point;
        const angle = Math.atan2(
          v3.y - marker.position.y,
          v3.x - marker.position.x
        );
        marker.rotation.z = angle;
      }
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    isMouseDown = false;
    pressedMouseBtn = null;

    if (!transformControlRef.current || event.button !== 2) return;
    const obj: THREE.Object3D | undefined = transformControlRef.current.object;
    if (obj) {
      dispatch(
        updateInitData({
          x: obj.position.x.toString(),
          y: obj.position.y.toString(),
          z: obj.position.z.toString(),
          rz: obj.rotation.z.toString(),
        })
      );
    }
  };

  const onWindowResize = () => {
    if (
      !canvasRef.current ||
      !cameraRef.current ||
      !rendererRef.current ||
      !controlRef.current ||
      !labelRendererRef.current
    )
      return;
    cameraRef.current.aspect =
      canvasRef.current.clientWidth / canvasRef.current.clientHeight;
    cameraRef.current.updateProjectionMatrix();
    controlRef.current.update();

    rendererRef.current.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    labelRendererRef.current.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
  };

  const getCanvasRelativePosition = (event: MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * canvasRef.current.width) / rect.width,
      y: ((event.clientY - rect.top) * canvasRef.current.height) / rect.height,
    };
  };

  const initRobot = async () => {
    if (!sceneRef.current) return;

    const originGeometry = new THREE.SphereGeometry(0.1); // 점의 모양을 구형으로 정의
    const originMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // 빨간색으로 재질 정의
    const originPoint = new THREE.Mesh(originGeometry, originMaterial); // 메쉬 생성

    const axesHelperOrin = new THREE.AxesHelper(2); // 길이 5의 축 생성
    sceneRef.current.add(axesHelperOrin); // scene에 추가
    sceneRef.current.add(originPoint);

    const loader = new ThreeMFLoader();

    loader.load("amr_texture.3MF", function (group) {
      group.name = "amr";
      group.scale.set(0.001, 0.001, 0.001);

      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.material.color.set(new THREE.Color(0x0087fc));
        }
      });

      robotModel.current = group;

      // An axes. The X axis is red. The Y axis is green. The Z axis is blue.
      const axesHelper = new THREE.AxesHelper(2);
      robotModel.current.add(axesHelper);

      axesHelper.scale.set(1000, 1000, 1000);
      group.add(axesHelper);

      if (sceneRef.current) {
        sceneRef.current.add(robotModel.current);
      }
    });

    // get Robot position
    try {
      const resp = await axios.get(url + "/status");
      const position = resp.data.pose;

      if (robotModel.current) {
        robotModel.current.position.set(position.x, position.y, 0);
        const radian = position.rz * (Math.PI / 180);
        robotModel.current.rotation.z = radian;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const connectSocket = () => {
    if (!socketRef.current) {
      fetch("/api/socket").finally(() => {
        socketRef.current = io();

        socketRef.current.on("connect", () => {
          console.log("Socket connected ", socketRef.current.id);
        });

        if (className !== CANVAS_CLASSES.OVERLAY) {
          socketRef.current.on("lidar", (data) => {
            drawLidar(data.data, {
              x: parseFloat(data.pose.x),
              y: parseFloat(data.pose.y),
              rz: (parseFloat(data.pose.rz) * Math.PI) / 180,
            });
          });
          socketRef.current.on("mapping", (data) => {
            drawCloud(CANVAS_CLASSES.SIDEBAR, data);
          });
        }

        socketRef.current.on("status", (data) => {
          const res = JSON.parse(data);
          robotPose = {
            x: parseFloat(res.pose.x),
            y: parseFloat(res.pose.y),
            rz: (parseFloat(res.pose.rz) * Math.PI) / 180,
          };
          driveRobot(robotPose);
        });
      });
    }
  };

  const reloadMappingData = async () => {
    try {
      await axios.get(url + "/mapping/reload");
    } catch (e) {
      console.error(e);
    }
  };

  const driveRobot = (data) => {
    if (!robotModel.current) return;
    robotModel.current.position.set(data.x, data.y, 0);

    robotModel.current.rotation.z = data.rz;
  };

  const transformLidarPoints = (point, pose) => {
    // if(point[0])
    const xL = point[0];
    const yL = point[1];

    // 회전 변환
    const xLPrime = xL * Math.cos(pose.rz) - yL * Math.sin(pose.rz);
    const yLPrime = xL * Math.sin(pose.rz) + yL * Math.cos(pose.rz);

    // 평행 이동
    const xM = pose.x + xLPrime;
    const yM = pose.y + yLPrime;

    return [xM, yM, point[2]];
  };

  const drawLidar = (
    data: string[][],
    pose: { x: number; y: number; rz: number }
  ) => {
    // Is it necessary?
    if (!isInitializedRef.current) return;

    if (lidarPoints.current) {
      const lidarPointsObj = sceneRef.current?.getObjectById(
        lidarPoints.current
      );
      if (lidarPointsObj) {
        sceneRef.current?.remove(lidarPointsObj);
      }
    }

    const geo = new THREE.BufferGeometry();

    const positions: number[] = [];

    data.forEach((arr: string[]) => {
      // set positions
      const parsedArr = arr.slice(0, 3).map(parseFloat);

      const newparsedArr = transformLidarPoints(parsedArr, pose);

      positions.push(...newparsedArr);
    });

    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    geo.computeBoundingSphere();

    const material = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xff0000,
    });

    const points = new THREE.Points(geo, material);
    lidarPoints.current = points.id;

    sceneRef.current?.add(points);
  };

  const drawCloud = (targetCanvas: string, cloud: string[][]) => {
    if (!isInitializedRef.current) return;
    if (className !== targetCanvas) return;

    // Reset before draw.
    if (targetCanvas === CANVAS_CLASSES.OVERLAY) {
      resetCamera();
      clearMappingPoints();
    }

    if (cloud) {
      const geo = new THREE.BufferGeometry();

      const positions: number[] = [];
      // const colors: number[] = [];
      //
      // const color = new THREE.Color();

      cloud.forEach((arr: string[]) => {
        // set positions
        const parsedArr = arr.slice(0, 3).map(parseFloat);

        positions.push(...parsedArr);

        // color.setRGB(0, 0.7, 0, THREE.SRGBColorSpace);
        // colors.push(color.r, color.g, color.b);
      });

      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      // geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

      geo.computeBoundingSphere();

      const material = new THREE.PointsMaterial({
        size: 0.07,
        color: 0x00be00,
      });

      const points = new THREE.Points(geo, material);

      mappingPointsArr.current.push(points.id);

      sceneRef.current?.add(points);
    }
  };

  const clearMappingPoints = () => {
    // clear socket
    if (socketRef.current) {
      socketRef.current.off("mapping");
    }
    // reset mapping points
    if (!mappingPointsArr.current || !sceneRef.current) return;
    for (const i of mappingPointsArr.current) {
      const points = sceneRef.current.getObjectById(i);
      if (points) sceneRef.current.remove(points);
    }
    mappingPointsArr.current = [];
  };

  const resetCamera = () => {
    if (!cameraRef.current || !controlRef.current) return;
    cameraRef.current.up.set(0, 1, 0);
    cameraRef.current.position.set(0, 0, 25);
    cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));
    cameraRef.current.updateProjectionMatrix();
    controlRef.current.target.set(0, 0, 0);
    controlRef.current.update();
  };

  const render = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const addNode = () => {
    const loader = new ThreeMFLoader();
    loader.load("amr.3MF", function (group) {
      group.scale.set(0.001, 0.001, 0.001);
      group.position.set(Number(initData.x), Number(initData.y), 0);
      group.rotation.z = Number(initData.rz);

      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.material.color.set(new THREE.Color(0x33ff52));
        }
      });

      const axesHelper = new THREE.AxesHelper(2);
      axesHelper.scale.set(1000, 1000, 1000);
      group.add(axesHelper);

      const nodeId = `node-${group.uuid}`;

      nodesRef.current.set(nodeId, group);

      nodeNum.current += 1;
      group.name = `node-${nodeNum.current}`;

      group.userData.info = "";
      group.userData.links = [];
      group.userData.type = "";

      sceneRef.current?.add(group);

      const nodeDiv = document.createElement("div");
      nodeDiv.className = "label";
      nodeDiv.textContent = group.name;
      nodeDiv.style.backgroundColor = "transparent";

      const nodeLabel = new CSS2DObject(nodeDiv);
      nodeLabel.center.set(-0.5, 1.5);
      group.add(nodeLabel);
    });
  };

  const saveAnnotation = async (filename: string) => {
    const nodeArr = Array.from(nodesRef.current, ([key, node]) => {
      const pos = node.position.toArray().toString();
      const rot = node.rotation.toArray().slice(0, 3).toString();
      const pose = pos + "," + rot;
      const nodeData = {
        id: node.uuid,
        name: node.name,
        pose: pose,
        info: node.userData.info,
        links: node.userData.links,
        type: node.userData.type,
      };
      return nodeData;
    });

    try {
      // const res = await axios.post(url + `/map/topo/${filename}`, nodeArr);
      // console.log(res);
    } catch (e) {
      console.error(e);
    }
  };

  return <canvas className={className} ref={canvasRef} />;
};

export default LidarCanvas;
