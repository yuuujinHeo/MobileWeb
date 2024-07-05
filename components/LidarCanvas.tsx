"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

// three
import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader";

import { io } from "socket.io-client";
import axios from "axios";

import { CANVAS_CLASSES } from "@/constants";

interface LidarCanvasProps {
  className: string;
  selectedMapCloud?: string[][] | null;
}

const LidarCanvas = ({ className, selectedMapCloud }: LidarCanvasProps) => {
  const { action } = useSelector((state: RootState) => state.canvas);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<any>();

  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlRef = useRef<MapControls | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const robotModel = useRef<THREE.Object3D>();

  const url = process.env.NEXT_PUBLIC_WEB_API_URL;

  const lidarPoints = useRef<number>();
  const mappingPointsArr = useRef<number[]>([]);
  let robotPose: { x: number; y: number; rz: number } = { x: 0, y: 0, rz: 0 };

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
      window.removeEventListener("click", onMouseClick);
      rendererRef.current?.setAnimationLoop(null);

      if (className !== CANVAS_CLASSES.OVERLAY) {
        console.log("Socket disconnect ", socketRef.current.id);
        socketRef.current.disconnect();
      }
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
      default:
        break;
    }
  }, [action]);

  const init3DScene = () => {
    if (!canvasRef.current) return;

    // scene
    const scene = new THREE.Scene();

    const color = new THREE.Color(0xffffff);
    scene.background = color;
    sceneRef.current = scene;

    // planeMesh for raycasting
    const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    const planeMaterial = new THREE.MeshBasicMaterial({
      visible: false,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
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
    camera.position.set(0, 25, 0);

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

    const animate = () => {
      if (sceneRef.current && cameraRef.current) {
        rendererRef.current?.render(sceneRef.current, cameraRef.current);
      }
    };

    rendererRef.current.setAnimationLoop(animate);

    // control
    const control = new MapControls(camera, renderer.domElement);
    controlRef.current = control;

    control.screenSpacePanning = false;

    control.minDistance = 5;
    control.maxDistance = 30;

    control.maxPolarAngle = Math.PI / 2;

    // Light
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));

    isInitializedRef.current = true;

    // resize handling
    window.addEventListener("resize", onWindowResize);
    window.addEventListener("click", onMouseClick);
  };

  const onWindowResize = () => {
    if (
      !canvasRef.current ||
      !cameraRef.current ||
      !rendererRef.current ||
      !controlRef.current
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
  };

  const onMouseClick = (event: MouseEvent) => {
    if (
      !window ||
      !cameraRef.current ||
      !sceneRef.current ||
      !canvasRef.current
    )
      return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const pos = getCanvasRelativePosition(event);

    if (!pos) return;
    mouse.x = (pos.x / canvasRef.current.width) * 2 - 1;
    mouse.y = (pos.y / canvasRef.current.height) * 2 - 1; // note

    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(
      sceneRef.current.children,
      true
    );

    console.log(11, sceneRef.current.children);

    if (intersects.length > 0) {
      console.log(1111, "pick", intersects[0]);
    } else {
      console.log(2222, "no pick");
      console.log(mouse.x, mouse.y);
      // const loader = new ThreeMFLoader();
      //
      // loader.load("amr_texture.3MF", function (group) {
      //   group.scale.set(0.001, 0.001, 0.001);
      //   group.rotateX(Math.PI / -2);
      //   group.position.set(mouse.x, mouse.y, 0);
      //
      //   group.traverse((obj) => {
      //     if (obj instanceof THREE.Mesh) {
      //       obj.material.color.set(new THREE.Color(0x33ff52));
      //     }
      //   });
      //
      //   robotModel.current = group;
      //
      //   sceneRef.current?.add(robotModel.current);
      // });
    }
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
    axesHelperOrin.rotateX(-Math.PI / 2);
    sceneRef.current.add(axesHelperOrin); // scene에 추가
    sceneRef.current.add(originPoint);

    const loader = new ThreeMFLoader();

    loader.load("amr_texture.3MF", function (group) {
      group.scale.set(0.001, 0.001, 0.001);
      group.rotateX(Math.PI / -2);

      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.material.color.set(new THREE.Color(0xc661a8));
        }
      });

      robotModel.current = group;

      // An axes. The X axis is red. The Y axis is green. The Z axis is blue.
      const axesHelper = new THREE.AxesHelper(2);
      robotModel.current.add(axesHelper);

      sceneRef.current?.add(robotModel.current);
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
    robotModel.current.position.set(data.x, 0, -data.y);

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

    points.rotation.x = -(Math.PI / 2);

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

      points.rotation.x = -(Math.PI / 2);

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
    cameraRef.current.position.set(0, 25, 0);
    cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));
    cameraRef.current.updateProjectionMatrix();
    controlRef.current.target.set(0, 0, 0);
    controlRef.current.update();
  };

  return <canvas className={className} ref={canvasRef} />;
};

export default LidarCanvas;
