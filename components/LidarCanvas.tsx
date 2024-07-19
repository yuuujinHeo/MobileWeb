"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { updateInitData, changeSelectedObjectInfo } from "@/store/canvasSlice";

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

interface LidarCanvasProps {
  className: string;
  cloudData?: string[][] | null;
  topoData?: UserData[] | null;
}

interface UserData {
  id: string;
  info: string;
  links: string[];
  name: string;
  pose: string;
  type: string;
}

const LidarCanvas = ({ className, cloudData, topoData }: LidarCanvasProps) => {
  const dispatch = useDispatch();
  // root state
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

  const nodesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const raycastTargetsRef = useRef<THREE.Object3D[]>([]);
  const selectedNodeRef = useRef<THREE.Object3D | null>(null);
  const selectedNodesArrayRef = useRef<THREE.Object3D[]>([]);

  let routeNum = useRef<number>(0);
  let goalNum = useRef<number>(0);
  let isMarkingModeRef = useRef<boolean>(false);

  const url = process.env.NEXT_PUBLIC_WEB_API_URL;

  let robotPose: { x: number; y: number; rz: number } = { x: 0, y: 0, rz: 0 };
  let removedNodePos: {
    x: number;
    y: number;
    z: number;
    rz: number;
  } | null = null;

  // mouse event variables
  let isMouseDown: boolean = false;
  let isMouseDragged: boolean = false;
  let pressedMouseBtn: number | null;

  let isTouchDragging: boolean = false;
  let touchStartTime = 0;
  const LONG_TOUCH_DURATION = 1000;

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
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("mousedown", handleMouseDown);
        canvasRef.current.removeEventListener("mousemove", handleMouseMove);
        canvasRef.current.removeEventListener("mouseup", handleMouseUp);
        canvasRef.current.removeEventListener("touchstart", handleTouchStart);
        canvasRef.current.removeEventListener("touchmove", handleMouseMove);
        canvasRef.current.removeEventListener("touchend", handleTouchEnd);
      }
      rendererRef.current?.setAnimationLoop(null);

      if (socketRef.current && className !== CANVAS_CLASSES.OVERLAY) {
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
        if (cloudData) drawCloud(action.target, cloudData);
        break;
      case "ADD_NODE":
        if (action.category === "ROUTE") {
          addRouteNode();
        } else if (action.category === "GOAL") addGoalNode();
        break;
      case "DELETE_NODE":
        removeNode();
        break;
      case "SAVE_ANNOTATION":
        saveAnnotation(action.name);
        break;
      case "UPDATE_PROPERTY":
        updateProperty(action.category, action.value);
        break;
      case "ADD_LINK":
        addLinks();
        break;
      case "REMOVE_LINK":
        removeLink(action.target, action.value);
        break;
      case "DRAW_CLOUD_TOPO":
        if (cloudData) drawCloud(CANVAS_CLASSES.DEFAULT, cloudData);
        drawTopo();
        break;
      default:
        break;
    }
  }, [action]);

  const drawTopo = () => {
    if (!topoData) return;
  };

  useEffect(() => {
    if (className === CANVAS_CLASSES.DEFAULT) {
      if (isMarkingMode) {
        isMarkingModeRef.current = true;
        toggleMarkingMode();
      } else if (!isMarkingMode) {
        isMarkingModeRef.current = false;
        toggleMarkingMode();
      }
    }
    return () => {
      // toggleMarkingMode(false);
      // handleLocalizationOff();
    };
  }, [isMarkingMode]);

  const updateProperty = (category: string, value: string) => {
    const selectedObj = selectedNodeRef.current;
    if (!selectedObj) return;

    switch (category) {
      case "name":
        selectedObj.name = value;
        // update label
        removeLabelFromNode(selectedObj);
        addLabelToNode(selectedObj);
        break;
      case "pose-x":
        selectedObj.position.x = Number(value);
        break;
      case "pose-y":
        selectedObj.position.y = Number(value);
        break;
      case "pose-z":
        selectedObj.position.z = Number(value);
        break;
      case "pose-rz":
        selectedObj.rotation.z = Number(value);
        break;
      case "type":
        if (selectedObj.userData.type !== value) {
          removeNode();
          if (value === "GOAL") {
            addGoalNode();
          } else if (value === "ROUTE") {
            addRouteNode();
          }
        }
        break;
      case "info":
        selectedObj.userData.info = value;
        break;
      default:
        break;
    }

    // update selected object info
    dispatchChange();
  };

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
    tfControl.addEventListener("change", handleTransformChange);
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

    canvasRef.current.addEventListener("mousedown", handleMouseDown);
    canvasRef.current.addEventListener("mousemove", handleMouseMove);
    canvasRef.current.addEventListener("mouseup", handleMouseUp);
    canvasRef.current.addEventListener("touchstart", handleTouchStart);
    canvasRef.current.addEventListener("touchmove", handleTouchMove);
    canvasRef.current.addEventListener("touchend", handleTouchEnd);
  };

  const toggleMarkingMode = () => {
    if (
      !controlRef.current ||
      !rendererRef.current ||
      !canvasRef.current ||
      !transformControlRef.current
    )
      return;
    if (isMarkingModeRef.current) {
      resetCamera();
      controlRef.current.enableRotate = false;
    } else {
      transformControlRef.current.detach();
      controlRef.current.enableRotate = true;
    }
  };

  const getRaycaster = (event: MouseEvent | TouchEvent) => {
    if (!canvasRef.current || !cameraRef.current) return;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const pos = getCanvasRelativePosition(event);

    if (!pos) return;
    mouse.x = (pos.x / canvasRef.current.width) * 2 - 1;
    mouse.y = -(pos.y / canvasRef.current.height) * 2 + 1;

    raycaster.setFromCamera(mouse, cameraRef.current);

    return raycaster;
  };

  const findTopParent = (object: THREE.Object3D): THREE.Object3D => {
    let currenteObj: THREE.Object3D = object;
    while (
      currenteObj &&
      currenteObj.parent &&
      currenteObj.parent.type !== "Scene"
    ) {
      currenteObj = currenteObj.parent;
    }
    return currenteObj;
  };

  const getIntersectByRaycasting = (event: MouseEvent | TouchEvent) => {
    if (
      !canvasRef.current ||
      !cameraRef.current ||
      !sceneRef.current ||
      !transformControlRef.current
    )
      return null;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const pos = getCanvasRelativePosition(event);

    if (!pos) return null;
    mouse.x = (pos.x / canvasRef.current.width) * 2 - 1;
    mouse.y = -(pos.y / canvasRef.current.height) * 2 + 1;

    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(
      raycastTargetsRef.current,
      true
    );

    let intersect: THREE.Object3D | null;
    if (intersects.length) {
      intersect = intersects[0].object;
    } else {
      intersect = null;
    }

    return intersect;
  };

  const selectObject = (intersect: THREE.Object3D | null) => {
    transformControlRef.current?.detach();
    const scene = sceneRef.current;
    const selectedNodesArray = selectedNodesArrayRef.current;
    const transformControl = transformControlRef.current;
    if (!scene || !selectedNodesArray || !transformControl) return;

    if (intersect !== null) {
      let topParent: THREE.Object3D;
      topParent = findTopParent(intersect);

      selectedNodeRef.current = topParent;
      transformControl.attach(topParent);

      // nodes push
      // if (!selectedNodesArray.includes(topParent)) {
      //   selectedNodesArray.push(topParent);
      // } else {
      //   // if the selectedNodesRef array includes the passed intersect,
      //   // reorder selectedNodesRef so that the selected node move to the front.
      //   // This helpls in managing the order of selection.
      //
      //   // e.g) Given selctedNodeRef is [1, 2, 3, 4, 5],
      //   // selecting node 4 will reorder it to [4, 1, 2, 3, 5]
      //   const index = selectedNodesArray.indexOf(topParent);
      //   selectedNodesArray.splice(index, 1);
      //   selectedNodesArray.unshift(topParent);
      // }
      //

      // Limit the number of nodes that can be selectd to two
      // The code above is the original(multiselect).
      if (selectedNodesArray.length === 2) {
        // e.g) Given selctedNodeRef is [1, 2],
        // selecting node 2 will reorder it to [2, 1],
        // selecting node 3 will reorder it to [1, 3].
        if (!selectedNodesArray.includes(topParent)) {
          selectedNodesArray.splice(0, 1);
          selectedNodesArray.push(topParent);
        } else {
          selectedNodesArray.reverse();
        }
      } else if (selectedNodesArray.length < 2) {
        if (!selectedNodesArray.includes(topParent)) {
          selectedNodesArray.push(topParent);
        }
      }

      hilightObject();
      dispatchChange();
    } else {
      selectedNodeRef.current = null;
      selectedNodesArrayRef.current = [];
      clearAllBoxHelpers();

      dispatch(
        changeSelectedObjectInfo({
          id: "",
          name: "",
          links: [],
          pose: "",
          type: "",
          info: "",
        })
      );
    }
  };

  const hilightObject = () => {
    const scene = sceneRef.current;
    const selectedNodesArray = selectedNodesArrayRef.current;
    if (!scene) return;

    clearAllBoxHelpers();

    for (let i = 0; i < selectedNodesArray.length; i++) {
      const obj = selectedNodesArray[i];
      const color = i === 1 ? 0x0000ff : 0xff0000;
      const newBoxHelper = new THREE.BoxHelper(obj.children[0], color);
      newBoxHelper.name = `box-${obj.uuid}`;
      scene.add(newBoxHelper);
    }
  };

  const clearAllBoxHelpers = () => {
    if (sceneRef.current) {
      const boxHelpers = sceneRef.current.children.filter(
        (child) => child instanceof THREE.BoxHelper
      );
      boxHelpers.forEach((boxHelper) => {
        sceneRef.current?.remove(boxHelper);
      });
    }
  };

  const createNodeHelper = (event: MouseEvent | TouchEvent) => {
    const raycaster = getRaycaster(event);
    transformControlRef.current?.detach();
    if (!sceneRef.current || !raycaster) return;

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
            obj.material.transparent = true;
            obj.material.opacity = 0.4;
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
  };

  const handleMouseDown = (event: MouseEvent) => {
    isMouseDown = true;
    isMouseDragged = false;
    pressedMouseBtn = event.button;

    switch (event.button) {
      case 2:
        if (isMarkingModeRef.current) createNodeHelper(event);
        break;
      default:
        break;
    }
  };

  const handleTouchStart = (event) => {
    isTouchDragging = false;
    touchStartTime = new Date().getTime();
  };

  const handleMouseMove = (event: MouseEvent) => {
    isMouseDragged = true;
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

  const handleTouchMove = () => {
    isTouchDragging = true;
  };

  const handleMouseUp = (event: MouseEvent) => {
    isMouseDown = false;
    pressedMouseBtn = null;

    switch (event.button) {
      case 0:
        if (!isMouseDragged) {
          const intersect = getIntersectByRaycasting(event);
          selectObject(intersect);
        }

        break;
      default:
        break;
    }

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

  const handleTouchEnd = (event) => {
    const touchEndTime = new Date().getTime();
    const touchDuration = touchEndTime - touchStartTime;
    if (touchDuration >= LONG_TOUCH_DURATION && !isTouchDragging) {
      if (isMarkingModeRef.current) createNodeHelper(event);
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

  const getCanvasRelativePosition = (event: MouseEvent | TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    let clientX, clientY;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event instanceof TouchEvent && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    }

    return {
      x: ((clientX - rect.left) * canvasRef.current.width) / rect.width,
      y: ((clientY - rect.top) * canvasRef.current.height) / rect.height,
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

  const addGoalNode = () => {
    const loader = new ThreeMFLoader();
    loader.load("amr.3MF", function (group) {
      setupNode(group, "GOAL");
      group.scale.set(0.001, 0.001, 0.001);
      group.rotation.z = Number(initData.rz);

      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.material.color.set(new THREE.Color(0x33ff52));
        }
      });

      addLabelToNode(group);
      sceneRef.current?.add(group);

      raycastTargetsRef.current.push(group);

      selectObject(group);
    });
  };

  const addRouteNode = () => {
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0x76d7c4 });
    const route = new THREE.Mesh(geometry, material);
    route.scale.set(0.02, 0.02, 0.02);

    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geo, mat);
    plane.scale.set(30, 30, 1);
    plane.visible = false;
    route.add(plane);

    setupNode(route, "ROUTE");

    addLabelToNode(route);
    sceneRef.current?.add(route);
    raycastTargetsRef.current.push(route);
    selectObject(route);
  };

  const setupNode = (node: THREE.Object3D, type: string) => {
    // Set node position
    if (removedNodePos) {
      // The removedNodePos variable is always null,
      // except when the node type changes.
      // This is because it is initialized when the component is refreshed.
      // (e.g., when a state change occurs).
      node.position.set(removedNodePos.x, removedNodePos.y, 0);
    } else {
      node.position.set(Number(initData.x), Number(initData.y), 0);
    }
    const nodeId = node.uuid;
    nodesRef.current.set(nodeId, node);

    if (type === "ROUTE") {
      routeNum.current += 1;
      node.name = `route-${routeNum.current}`;
    } else if (type === "GOAL") {
      goalNum.current += 1;
      node.name = `goal-${goalNum.current}`;
    }

    node.userData.info = "";
    node.userData.links = [];
    node.userData.type = type;
  };

  const addLabelToNode = (node: THREE.Object3D) => {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "label";
    nodeDiv.textContent = node.name;
    nodeDiv.style.backgroundColor = "transparent";

    const nodeLabel = new CSS2DObject(nodeDiv);
    nodeLabel.name = "label";
    nodeLabel.center.set(-0.6, 1.5);
    node.add(nodeLabel);
  };

  const removeLabelFromNode = (node: THREE.Object3D) => {
    let label: THREE.Object3D | null = null;
    node.traverse((children) => {
      if (children.name === "label") label = children;
    });
    if (label) node.remove(label);
  };

  const removeNode = () => {
    const selectedObj = selectedNodeRef.current;
    const scene = sceneRef.current;
    const nodes = nodesRef.current;
    if (!selectedObj || !scene) return;

    removedNodePos = {
      x: selectedObj.position.x,
      y: selectedObj.position.y,
      z: selectedObj.position.z,
      rz: selectedObj.rotation.z,
    };

    // Num update
    // if (selectedObj.userData.type === "GOAL") {
    //   goalNum.current -= 1;
    // } else if (selectedObj.userData.type === "ROUTE") {
    //   routeNum.current -= 1;
    // }

    if (transformControlRef.current) {
      transformControlRef.current.detach();
    }
    selectedNodeRef.current = null;

    // ======================================================
    // ==DO NOT CHANGE THE EXCUTION ORDER OF THE FUNCTIONS!==
    // ======================================================

    // remove 3d modeling & label
    removeLabelFromNode(selectedObj);

    // Remove the node from nodesRef
    nodes.delete(selectedObj.uuid);

    // Remove links
    removeAllLinksRelateTo(selectedObj.uuid);

    // Resetting the array which is used for raycasting
    const filteredObjects = raycastTargetsRef.current.filter(
      (obj) => obj.name !== selectedObj.name
    );
    raycastTargetsRef.current = filteredObjects;

    // select null
    selectObject(null);

    scene.remove(selectedObj);
    // Reset the selected object info
    dispatch(
      changeSelectedObjectInfo({
        id: "",
        name: "",
        links: [],
        pose: "",
        type: "",
        info: "",
      })
    );
  };

  const saveAnnotation = async (filename: string) => {
    const nodeArr = Array.from(nodesRef.current, ([key, node]) => {
      const position = node.position.toArray();
      const parsedPos = position
        .map((pos) => pos.toString().slice(0, 6))
        .toString();
      const rotation = node.rotation.toArray().slice(0, 3);
      const parsedRot = (rotation as string[])
        .map((rot) => rot.toString().slice(0, 6))
        .toString();
      const pose = parsedPos + "," + parsedRot;
      const linkedNodes = getLinkedNodes(node);
      const nodeData = {
        id: node.uuid,
        name: node.name,
        pose: pose,
        info: node.userData.info,
        links: linkedNodes,
        type: node.userData.type,
      };
      return nodeData;
    });

    try {
      await axios.post(url + `/map/topo/${filename}`, nodeArr);
    } catch (e) {
      console.error(e);
    }
  };

  const dispatchChange = () => {
    const selectedNode = selectedNodeRef.current;
    const scene = sceneRef.current;
    if (!selectedNode || !scene) return;

    const position = selectedNode.position.toArray();
    const parsedPos = position
      .map((pos) => pos.toString().slice(0, 6))
      .toString();
    const rotation = selectedNode.rotation.toArray().slice(0, 3);
    const parsedRot = (rotation as string[])
      .map((rot) => rot.toString().slice(0, 6))
      .toString();
    const pose = parsedPos + "," + parsedRot;

    const linkedNodes = getLinkedNodes(selectedNode);

    dispatch(
      changeSelectedObjectInfo({
        id: selectedNode.uuid,
        name: selectedNode.name,
        links: linkedNodes,
        pose: pose,
        type: selectedNode.userData.type,
        info: selectedNode.userData.info,
      })
    );
  };

  const getLinkedNodes = (node: THREE.Object3D): string[] | null => {
    const scene = sceneRef.current;
    if (!scene) return null;
    let linkedNodes: string[] = [];
    if ((node.userData as UserData).links.length) {
      linkedNodes = (node.userData as UserData).links
        .map((uuid: string) => {
          const linkedNode = scene.getObjectByProperty("uuid", uuid);
          if (linkedNode) return linkedNode.name;
          // undefined is returned implicitly
        })
        .filter((name): name is string => name !== undefined);
    }
    return linkedNodes;
  };

  const handleTransformChange = () => {
    dispatchChange();
    render();
  };

  const addLinks = () => {
    // This function should be called before updating the links
    // I mean, before 'Update links' logic...
    createArrow();

    // Update links
    const selectedNodesArray = selectedNodesArrayRef.current;

    for (let i = 0; i < selectedNodesArray.length - 1; i++) {
      const from = selectedNodesArray[i];
      const to = selectedNodesArray[i + 1];

      let links: string[] = [];
      links = [...from.userData.links];
      if (!links.includes(to.uuid)) {
        links.push(to.uuid);
        from.userData.links = links;
      }
    }
  };

  const createArrow = (color = 0x0000ff) => {
    const selectedNodes = selectedNodesArrayRef.current;
    if (selectedNodes.length > 1) {
      for (let i = 0; i < selectedNodes.length - 1; i++) {
        const start = selectedNodes[i];
        const end = selectedNodes[i + 1];

        if (!start.userData.links.includes(end.uuid)) {
          const startPos = start.position;
          const endPos = end.position;

          const dir = new THREE.Vector3()
            .subVectors(endPos, startPos)
            .normalize();
          const length = startPos.distanceTo(endPos);
          // default color is blue
          const arrowHelper = new THREE.ArrowHelper(
            dir,
            startPos,
            length,
            color
          );
          arrowHelper.name = `arrow-${start.name}-${end.name}`;
          sceneRef.current?.add(arrowHelper);
        }
      }
    }
  };

  const removeAllLinksRelateTo = (targetNodeUUID: string) => {
    const scene = sceneRef.current;
    const nodes = nodesRef.current;
    if (!scene) return;

    // Update all nodes userdata(expecially, links)
    nodes.forEach((node) => {
      node.userData.links = (node.userData.links as string[]).filter(
        (uuid: string) => uuid !== targetNodeUUID
      );
    });

    // Because an arrow's name convention is `arrow-startNodeName-endNodeName`
    const target = scene.getObjectByProperty("uuid", targetNodeUUID);
    if (target) {
      const targetArrows = scene.children.filter((child) =>
        child.name.includes(target.name)
      );

      targetArrows.forEach((arrow) => {
        scene.remove(arrow);
      });
    }
  };

  const removeLink = (nodeId: string, deleteNodeName: string) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const from = scene.getObjectByProperty("uuid", nodeId);
    const to = scene.getObjectByName(deleteNodeName);

    if (!from || !to) return;
    const targetArrow = scene.getObjectByName(`arrow-${from.name}-${to.name}`);
    if (targetArrow) {
      scene.remove(targetArrow);

      // Update selected node's userData.links
      let links: string[] = [];
      links = [...from.userData.links];
      const index = links.findIndex((link) => {
        link === to.uuid;
      });
      links.splice(index, 1);
      from.userData.links = links;

      dispatchChange();
    }
  };

  return <canvas className={className} ref={canvasRef} />;
};

export default LidarCanvas;
