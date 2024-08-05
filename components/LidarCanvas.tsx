"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import {
  updateCreateHelper,
  changeSelectedObjectInfo,
  updateGoalNum,
  updateRouteNum,
} from "@/store/canvasSlice";

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

import { CANVAS_CLASSES, CANVAS_ACTION, NODE_TYPE } from "@/constants";

interface LidarCanvasProps {
  className: string;
  cloudData?: string[][] | null;
  topoData?: UserData[] | null;
}

interface UserData {
  id: string;
  info: string;
  links: string[];
  links_from?: string[];
  name: string;
  pose: string;
  type: string;
}

interface NodePos {
  x: number;
  y: number;
  z: number;
  rz: number;
  idx?: number;
}

const LidarCanvas = ({
  className,
  cloudData = null,
  topoData,
}: LidarCanvasProps) => {
  const dispatch = useDispatch();
  // root state
  const { action, isMarkingMode, createHelper } = useSelector(
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
  const robotModel = useRef<THREE.Object3D>();
  const lidarPoints = useRef<number>();
  const mappingPointsArr = useRef<number[]>([]);
  const currSelectionBoxRef = useRef<THREE.BoxHelper>();
  const prevSelectionBoxRef = useRef<THREE.BoxHelper>();

  const nodesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const raycastTargetsRef = useRef<THREE.Object3D[]>([]);
  const selectedNodeRef = useRef<THREE.Object3D | null>(null);
  const selectedNodesArrayRef = useRef<THREE.Object3D[]>([]);

  const goals = useRef<number[]>([0]);
  const goalNum = useRef<number>(0);
  const routes = useRef<number[]>([0]);
  const routeNum = useRef<number>(0);

  const isMarkingModeRef = useRef<boolean>(false);

  // robot info

  const url = process.env.NEXT_PUBLIC_WEB_API_URL;

  let robotPose: { x: number; y: number; rz: number } = { x: 0, y: 0, rz: 0 };
  let removedNodePos: NodePos | null = null;

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
    if (action.command === CANVAS_ACTION.DRAW_CLOUD) {
      drawCloud(action.target, cloudData);
    } else if (className === CANVAS_CLASSES.DEFAULT) {
      switch (action.command) {
        case CANVAS_ACTION.ADD_NODE:
          if (className !== CANVAS_CLASSES.DEFAULT) break;
          const nodePose: NodePos = {
            x: Number(createHelper.x),
            y: Number(createHelper.y),
            z: Number(createHelper.z),
            rz: Number(createHelper.rz),
          };
          if (action.category === NODE_TYPE.ROUTE) {
            addRouteNode(nodePose);
          } else if (action.category === NODE_TYPE.GOAL) {
            addGoalNode(nodePose);
          }
          break;
        case CANVAS_ACTION.DELETE_NODE:
          const selectedObject = selectedNodeRef.current;
          if (selectedObject) removeNode(selectedObject);
          break;
        case CANVAS_ACTION.SAVE_ANNOTATION:
          saveAnnotation(action.name);
          break;
        case CANVAS_ACTION.UPDATE_PROPERTY:
          updateProperty(action.category, action.value);
          break;
        case CANVAS_ACTION.ADD_LINK:
          const selectedNodesArray = selectedNodesArrayRef.current;
          addLinks(selectedNodesArray[0], selectedNodesArray[1]);
          break;
        case CANVAS_ACTION.REMOVE_LINK:
          removeLink(action.target, action.value);
          break;
        case CANVAS_ACTION.DRAW_CLOUD_TOPO:
          drawCloud(CANVAS_CLASSES.DEFAULT, cloudData);
          drawTopo();
          break;
        default:
          break;
      }
    } else if (className === CANVAS_CLASSES.SIDEBAR) {
      switch (action.command) {
        case CANVAS_ACTION.MAPPING_STOP:
          clearMappingPoints(CANVAS_CLASSES.SIDEBAR);
          break;
        default:
          break;
      }
    }
  }, [action]);

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
    const scene = sceneRef.current;
    const selectedObj = selectedNodeRef.current;
    const currSelectionBox = currSelectionBoxRef.current;
    if (!scene || !selectedObj || !currSelectionBox) return;

    switch (category) {
      case "name":
        let isDuplicatedName: boolean = false;
        const nodes = Array.from(nodesRef.current.values());
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].name === value) {
            isDuplicatedName = true;
            break;
          }
        }
        // TODO If isDuplicatedName is true. Warn!
        if (!isDuplicatedName) {
          selectedObj.name = value;
          // update label
          removeLabelFromNode(selectedObj);
          addLabelToNode(selectedObj);
        }

        break;
      case "pose-x":
        selectedObj.position.x = Number(value);
        removeAllLinksRelateTo(selectedObj.uuid);
        updateLinks(selectedObj);
        break;
      case "pose-y":
        selectedObj.position.y = Number(value);
        removeAllLinksRelateTo(selectedObj.uuid);
        updateLinks(selectedObj);
        break;
      // case "pose-z":
      //   selectedObj.position.z = Number(value);
      //   updateLinks(selectedObj)
      //   break;
      case "pose-rz":
        selectedObj.rotation.z = Number(value);
        break;
      case "type":
        if (selectedObj.userData.type !== value) {
          const selectedObj = selectedNodeRef.current;
          if (selectedObj) removeNode(selectedObj);

          if (value === NODE_TYPE.GOAL) {
            addGoalNode(removedNodePos as NodePos);
          } else if (value === NODE_TYPE.ROUTE) {
            addRouteNode(removedNodePos as NodePos);
          }
        }
        break;
      case "info":
        selectedObj.userData.info = value;
        break;
      default:
        break;
    }

    // selection box
    if (transformControlRef.current?.object)
      currSelectionBox.setFromObject(transformControlRef.current.object);

    // update selected object info
    dispatchChange();
  };

  const init3DScene = () => {
    if (!canvasRef.current) return;
    // scene
    const scene = new THREE.Scene();

    const color = new THREE.Color(0x1f2939);
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
      30,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.01,
      9999
    );
    cameraRef.current = camera;
    camera.up.set(0, 1, 0);
    camera.position.set(0, 0, 500);

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

    control.minDistance = 0.1;
    control.maxDistance = 9999;

    // transform control
    const transformControl: TransformControls = new TransformControls(
      camera,
      renderer.domElement
    );
    transformControlRef.current = transformControl;
    // transformControl.mode = "rotate";
    // tfControl.showX = false;
    // tfControl.showY = false;
    transformControl.showZ = false;
    // transformControl.size = 0.8;
    transformControl.addEventListener("change", handleTransformChange);
    transformControl.addEventListener("dragging-changed", (event) => {
      control.enabled = !event.value;
    });
    transformControl.addEventListener("mouseUp", () => {
      // selection box
      if (transformControl.object) {
        const obj: THREE.Object3D | undefined = transformControl.object;
        dispatch(
          updateCreateHelper({
            x: obj.position.x.toString(),
            y: obj.position.y.toString(),
            z: obj.position.z.toString(),
            rz: obj.rotation.z.toString(),
          })
        );
      }
    });
    scene.add(transformControl);

    // Light
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));

    // Selection Box
    currSelectionBoxRef.current = new THREE.BoxHelper(
      new THREE.Object3D(),
      0xf3ff00
    );
    currSelectionBoxRef.current.material.depthTest = false;
    currSelectionBoxRef.current.visible = false;

    prevSelectionBoxRef.current = new THREE.BoxHelper(
      new THREE.Object3D(),
      0xff0000
    );
    prevSelectionBoxRef.current.material.depthTest = false;
    prevSelectionBoxRef.current.visible = false;

    scene.add(currSelectionBoxRef.current);
    scene.add(prevSelectionBoxRef.current);

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

  const getIntersectByRaycasting = (
    event: MouseEvent | TouchEvent,
    target: THREE.Object3D[],
    recursive: boolean = true
  ): THREE.Intersection | null => {
    if (
      !canvasRef.current ||
      !cameraRef.current ||
      !sceneRef.current ||
      !transformControlRef.current
    )
      return null;
    const raycaster = getRaycaster(event);
    if (!raycaster) return null;

    const intersects = raycaster.intersectObjects(target, recursive);

    let intersect: THREE.Intersection | null;

    if (intersects.length) {
      intersect = intersects[0];
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
      // console.log("selected Object: ", topParent);

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
      hideSelectionHelpers();

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
    const currSelectionBox = currSelectionBoxRef.current;
    const prevSelectionBox = prevSelectionBoxRef.current;
    const transformControl = transformControlRef.current;
    if (!scene || !currSelectionBox || !prevSelectionBox || !transformControl)
      return;

    hideSelectionHelpers();

    if (transformControl.object) {
      currSelectionBox.setFromObject(transformControl.object);
      currSelectionBox.visible = true;
    }
    if (selectedNodesArray.length > 1) {
      prevSelectionBox.setFromObject(selectedNodesArray[0]);
      prevSelectionBox.visible = true;
    }
  };

  const hideSelectionHelpers = () => {
    const currSelectionBox = currSelectionBoxRef.current;
    const prevSelectionBox = prevSelectionBoxRef.current;
    if (!currSelectionBox || !prevSelectionBox) return;
    currSelectionBox.visible = false;
    prevSelectionBox.visible = false;
  };

  const createNodeHelper = (event: MouseEvent | TouchEvent) => {
    const raycaster = getRaycaster(event);
    transformControlRef.current?.detach();
    if (!sceneRef.current || !raycaster) return;

    const plane = sceneRef.current.getObjectByName("plane");
    if (!plane) return;
    const intersects = raycaster.intersectObject(plane, true);

    if (intersects.length > 0) {
      // remove prev craeteHelper
      const prevHelper = sceneRef.current.getObjectByName("createHelper");
      if (prevHelper) {
        sceneRef.current.remove(prevHelper);
      }

      const intersect = intersects[0];

      const loader = new ThreeMFLoader();

      loader.load("amr.3MF", function (group) {
        group.scale.set(0.0315, 0.0315, 0.0315);
        group.position.set(intersect.point.x, intersect.point.y, 0);
        group.name = "createHelper";

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
        // transformControlRef.current?.attach(group);

        dispatch(
          updateCreateHelper({
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
        if (isMarkingModeRef.current) {
          selectObject(null);
          createNodeHelper(event);
        }
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
    if (isMarkingModeRef.current && isMouseDown && pressedMouseBtn === 2) {
      let targetObj: THREE.Object3D | undefined = undefined;
      if (selectedNodeRef.current) {
        targetObj = selectedNodeRef.current;
      } else {
        const createHelper = sceneRef.current?.getObjectByName("createHelper");
        if (createHelper) targetObj = createHelper;
      }
      if (
        targetObj &&
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
        if (!intersects.length) return;

        const v3 = intersects[0].point;
        const angle = Math.atan2(
          v3.y - targetObj.position.y,
          v3.x - targetObj.position.x
        );
        targetObj.rotation.z = angle;
      }
    }
  };

  const handleTouchMove = () => {
    isTouchDragging = true;
  };

  const erasePoint = (point: THREE.Intersection | null) => {
    if (!point) return;

    const index = point.index;

    if (index !== undefined) {
      const points = sceneRef.current?.getObjectByName(
        "PointCloud"
      ) as THREE.Points;

      const positions = points.geometry.attributes.position.array;
      const indexToRemove = index * 3;

      const newPositions = new Float32Array(positions.length - 3);
      newPositions.set(positions.slice(0, indexToRemove), 0);
      newPositions.set(positions.slice(indexToRemove + 3), indexToRemove);

      points.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(newPositions, 3)
      );
      points.geometry.attributes.position.needsUpdate = true;
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    isMouseDown = false;
    pressedMouseBtn = null;

    switch (event.button) {
      case 0:
        // Normal cursor
        if (!document.body.classList.contains("eraser-cursor")) {
          const intersect = getIntersectByRaycasting(
            event,
            raycastTargetsRef.current
          );
          if (intersect !== null) {
            selectObject(intersect.object);
          } else if (!isMouseDragged) {
            selectObject(null);
          }
        } else {
          // Eraser cursor
          const pointCloud: THREE.Object3D | undefined =
            sceneRef.current?.getObjectByName("PointCloud");
          if (!pointCloud) return null;
          const intersect = getIntersectByRaycasting(
            event,
            [pointCloud],
            false
          );
          erasePoint(intersect);
        }

        break;
      default:
        break;
    }

    if (!transformControlRef.current || event.button !== 2) return;
    const createHelepr: THREE.Object3D | undefined =
      sceneRef.current?.getObjectByName("createHelper");
    if (createHelepr) {
      dispatch(
        updateCreateHelper({
          x: createHelepr.position.x.toString(),
          y: createHelepr.position.y.toString(),
          z: createHelepr.position.z.toString(),
          rz: createHelepr.rotation.z.toString(),
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
    // [TEMP]
    originPoint.scale.set(31.5, 31.5, 31.5);
    sceneRef.current.add(axesHelperOrin); // scene에 추가
    sceneRef.current.add(originPoint);

    const loader = new ThreeMFLoader();

    loader.load("amr_texture.3MF", function (group) {
      group.name = "amr";
      group.scale.set(0.0315, 0.0315, 0.0315);

      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.material.color.set(new THREE.Color(0x0087fc));
          const edges = new THREE.EdgesGeometry(obj.geometry);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
          });
          const line = new THREE.LineSegments(edges, lineMaterial);
          obj.add(line);
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
          // [TEMP]
          robotPose = {
            x: parseFloat(res.pose.x) * 31.5,
            y: parseFloat(res.pose.y) * 31.5,
            rz: (parseFloat(res.pose.rz) * Math.PI) / 180,
          };
          driveRobot(robotPose);
          // setRobotStatus(res);
        });
      });
    }
  };

  const setRobotStatus = (data) => {
    // setRobotX(data.pose.x);
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
      size: 3,
      color: 0xff355e,
    });

    const points = new THREE.Points(geo, material);
    points.scale.set(31.5, 31.5, 31.5);
    lidarPoints.current = points.id;

    sceneRef.current?.add(points);
  };

  const drawCloud = (targetCanvas: string, cloud: string[][] | null) => {
    if (!cloud) return;
    if (className !== targetCanvas) return;

    resetCamera();
    clearMappingPoints(className);

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
        size: 2.5,
        color: 0x74ff24,
      });

      const points = new THREE.Points(geo, material);
      points.name = "PointCloud";
      points.scale.set(31.5, 31.5, 31.5);

      mappingPointsArr.current.push(points.id);

      sceneRef.current?.add(points);
    }
  };

  const drawTopo = async () => {
    const scene = sceneRef.current;
    if (!topoData || !scene) return;

    clearAllNodes();
    // repaint all nodes
    // The following codes(Type1 and Type2) show the difference between "Promise all" and "Promise"

    // Type1
    // for (let i = 0; i < topoData.length; i++) {
    //   // First, Create Node
    //   const topo = topoData[i];
    //   const poseArr = topo.pose.split(",");
    //   const nodePos: NodePos = {
    //     x: Number(poseArr[0]),
    //     y: Number(poseArr[1]),
    //     z: Number(poseArr[2]),
    //     rz: Number(poseArr[5]),
    //     idx: i,
    //   };
    //   if (topo.type === "GOAL") {
    //     await addGoalNode(nodePos);
    //   } else if (topo.type === "ROUTE") {
    //     await addRouteNode(nodePos);
    //   }
    // }

    // Type 2
    const tasks = topoData.map((topo, i) => {
      const poseArr = topo.pose.split(",");

      const nodePos: NodePos = {
        // [TEMP]
        x: Number(poseArr[0]) * 31.5,
        y: Number(poseArr[1]) * 31.5,
        z: Number(poseArr[2]) * 31.5,
        rz: Number(poseArr[5]),
        idx: i,
      };
      if (topo.type === NODE_TYPE.GOAL) {
        return addGoalNode(nodePos);
      } else if (topo.type === NODE_TYPE.ROUTE) {
        return addRouteNode(nodePos);
      }
    });

    await Promise.all(tasks);

    // After repaint all nodes, link nodes
    topoData.forEach((node) => {
      const from = scene.getObjectByName(node.name);

      node.links.forEach((link) => {
        const to = scene.getObjectByName(link);
        if (from && to) addLinks(from, to);
      });
    });
  };

  const clearMappingPoints = (targetCanvas: string) => {
    if (className !== targetCanvas) return;
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

  const clearAllNodes = () => {
    const scene = sceneRef.current;
    const nodes = nodesRef.current;
    if (!scene) return;

    const nodeIds = Array.from(nodes.keys());
    for (const id of nodeIds) {
      const node = scene.getObjectByProperty("uuid", id);
      if (node) {
        removeNode(node);
      }
    }
  };

  const resetCamera = () => {
    if (!cameraRef.current || !controlRef.current) return;
    cameraRef.current.up.set(0, 1, 0);
    cameraRef.current.position.set(0, 0, 500);
    cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));
    cameraRef.current.updateProjectionMatrix();
    controlRef.current.target.set(0, 0, 0);
    controlRef.current.update();
  };

  const render = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  // Returns "Promise" because it includes a callback method.
  const addGoalNode = (nodePos: NodePos): Promise<void> => {
    const loader = new ThreeMFLoader();
    return new Promise((resolve, reject) => {
      try {
        loader.load("amr.3MF", function (group) {
          setupNode(group, NODE_TYPE.GOAL, nodePos);
          group.scale.set(0.02835, 0.02835, 0.02835);
          // group.rotation.z = Number(createHelper.rz);

          group.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              // obj.material.color.set(new THREE.Color(0x33ff52));
              obj.material.color.set(new THREE.Color(0xf7ff00));

              obj.material.transparent = true;
              obj.material.opacity = 0.95;

              const edges = new THREE.EdgesGeometry(obj.geometry);
              const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                linewidth: 2,
              });
              const line = new THREE.LineSegments(edges, lineMaterial);
              obj.add(line);
            }
          });

          goalNum.current += 1;
          dispatch(updateGoalNum(goalNum.current));

          addLabelToNode(group);
          sceneRef.current?.add(group);

          raycastTargetsRef.current.push(group);

          selectObject(group);
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  const addRouteNode = (nodePos: NodePos) => {
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0x76d7c4 });
    const route = new THREE.Mesh(geometry, material);
    route.scale.set(0.63, 0.63, 0.63);

    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geo, mat);
    plane.scale.set(30, 30, 1);
    plane.visible = false;
    route.add(plane);

    setupNode(route, NODE_TYPE.ROUTE, nodePos);

    routeNum.current += 1;
    dispatch(updateRouteNum(routeNum.current));

    addLabelToNode(route);
    sceneRef.current?.add(route);
    raycastTargetsRef.current.push(route);
    selectObject(route);
  };

  const setupNode = (node: THREE.Object3D, type: string, nodePos: NodePos) => {
    // Set node position
    node.position.set(nodePos.x, nodePos.y, 0);
    node.rotation.z = nodePos.rz * (Math.PI / 180);
    const nodeId = node.uuid;
    nodesRef.current.set(nodeId, node);

    const nodes = type === NODE_TYPE.GOAL ? goals.current : routes.current;
    const prefix = type === NODE_TYPE.GOAL ? "goal" : "route";

    const isZeroExist = (element: number) => element === 0;
    const zeroIndex = nodes.findIndex(isZeroExist);

    if (zeroIndex >= 0) {
      nodes[zeroIndex] = 1;
      node.name = `${prefix}-${formatNumber(zeroIndex + 1)}`;
      node.userData.index = zeroIndex;
    } else {
      nodes.push(1);
      node.name = `${prefix}-${formatNumber(nodes.length)}`;
      node.userData.index = nodes.length - 1;
    }
    node.userData.links = [];
    node.userData.links_from = [];
    node.userData.type = type;
    node.userData.info = "";
    // called from drawTopo
    if (topoData && topoData.length && (nodePos.idx as number) >= 0) {
      const topo = topoData[nodePos.idx as number];
      // update userdata
      node.name = topo.name;
      node.userData.info = topo.info;
    }
  };

  const addLabelToNode = (node: THREE.Object3D) => {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "label";
    nodeDiv.textContent = node.name;
    nodeDiv.style.color = "white";
    nodeDiv.style.backgroundColor = "transparent";

    const nodeLabel = new CSS2DObject(nodeDiv);
    nodeLabel.name = "label";
    nodeLabel.center.set(-0.2, 1.5);
    node.add(nodeLabel);
  };

  const removeLabelFromNode = (node: THREE.Object3D) => {
    let label: THREE.Object3D | null = null;
    node.traverse((children) => {
      if (children.name === "label") label = children;
    });
    if (label) node.remove(label);
  };

  const removeNode = (target: THREE.Object3D) => {
    const scene = sceneRef.current;
    const nodes = nodesRef.current;
    if (!scene) return;

    removedNodePos = {
      x: target.position.x,
      y: target.position.y,
      z: target.position.z,
      rz: target.rotation.z,
    };

    // Num update
    if (target.userData.type === NODE_TYPE.GOAL) {
      goals.current[target.userData.index] = 0;
      goalNum.current -= 1;
      dispatch(updateGoalNum(goalNum.current));
    } else if (target.userData.type === NODE_TYPE.ROUTE) {
      routes.current[target.userData.index] = 0;
      routeNum.current -= 1;
      dispatch(updateRouteNum(routeNum.current));
    }

    if (transformControlRef.current) {
      transformControlRef.current.detach();
    }
    selectedNodeRef.current = null;

    // ======================================================
    // ==DO NOT CHANGE THE EXCUTION ORDER OF THE FUNCTIONS!==
    // ======================================================

    // remove 3d modeling & label
    removeLabelFromNode(target);

    // Remove the node from nodesRef
    nodes.delete(target.uuid);

    // Remove links
    removeAllLinksRelateTo(target.uuid);

    // Resetting the array which is used for raycasting
    const filteredObjects = raycastTargetsRef.current.filter(
      (obj) => obj.name !== target.name
    );
    raycastTargetsRef.current = filteredObjects;

    // select null
    selectObject(null);

    scene.remove(target);
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
        // [TEMP]
        .map((pos) => (pos / 31.5).toString().slice(0, 6))
        .toString();
      const rotation = node.rotation.toArray().slice(0, 3);
      const parsedRot = (rotation as number[])
        .map((rot) => (rot * (180 / Math.PI)).toString().slice(0, 6))
        .toString();
      const pose = parsedPos + "," + parsedRot;
      const linkedNodes = getLinkedNodes(node);
      const nodeData = {
        id: node.name,
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
    if (
      (node.userData as UserData).links &&
      (node.userData as UserData).links.length
    ) {
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
    const currSelectionBox = currSelectionBoxRef.current;
    const transformControl = transformControlRef.current;
    if (currSelectionBox && transformControl && transformControl.object) {
      currSelectionBox.setFromObject(transformControl.object);
    }
    if (selectedNodeRef.current) {
      removeAllLinksRelateTo(selectedNodeRef.current.uuid);
      updateLinks(selectedNodeRef.current);
    }

    dispatchChange();
    render();
  };

  const addLinks = (from: THREE.Object3D, to: THREE.Object3D) => {
    if (!from || !to) return;
    // This function should be called before updating the links
    // I mean, before 'Update links' logic...
    createArrow(from, to);

    // Update links
    // const selectedNodesArray = selectedNodesArrayRef.current;
    //
    // for (let i = 0; i < selectedNodesArray.length - 1; i++) {
    //   const from = selectedNodesArray[i];
    //   const to = selectedNodesArray[i + 1];
    //
    //   let links: string[] = [];
    //   links = [...from.userData.links];
    //   if (!links.includes(to.uuid)) {
    //     links.push(to.uuid);
    //     from.userData.links = links;
    //   }
    // }
    let links: string[] = [];
    links = [...from.userData.links];
    if (!links.includes(to.uuid)) {
      // Add uuid of the pointing node
      links.push(to.uuid);
      from.userData.links = links;
    }
    links = [...to.userData.links_from];
    if (!links.includes(from.uuid)) {
      // Add uuid of the node that points to itself
      links.push(from.uuid);
      to.userData.links_from = links;
    }
  };

  const createArrow = (
    from: THREE.Object3D,
    to: THREE.Object3D,
    color = 0x00f7ff
  ) => {
    // const selectedNodes = selectedNodesArrayRef.current;
    // if (selectedNodes.length > 1) {
    //   for (let i = 0; i < selectedNodes.length - 1; i++) {
    //     const start = selectedNodes[i];
    //     const end = selectedNodes[i + 1];
    //
    //     if (!start.userData.links.includes(end.uuid)) {
    //       const startPos = start.position;
    //       const endPos = end.position;
    //
    //       const dir = new THREE.Vector3()
    //         .subVectors(endPos, startPos)
    //         .normalize();
    //       const length = startPos.distanceTo(endPos);
    //       // default color is blue
    //       const arrowHelper = new THREE.ArrowHelper(
    //         dir,
    //         startPos,
    //         length,
    //         color
    //       );
    //       arrowHelper.name = `arrow-${start.name}-${end.name}`;
    //       sceneRef.current?.add(arrowHelper);
    //     }
    //   }
    // }

    if (!from.userData.links.includes(to.uuid)) {
      const startPos = from.position;
      const endPos = to.position;

      const dir = new THREE.Vector3().subVectors(endPos, startPos).normalize();
      const length = startPos.distanceTo(endPos);
      // default color is blue
      // 14.17 is one-half the length of the model diagonal.
      const arrowHelper = new THREE.ArrowHelper(
        dir,
        startPos,
        length - 14.17,
        color
      );
      arrowHelper.name = `arrow-${from.name}-${to.name}`;
      arrowHelper.setLength(length - 14.17, 10, 4.4);
      sceneRef.current?.add(arrowHelper);
    }
  };

  const removeAllLinksRelateTo = (targetNodeUUID: string) => {
    const scene = sceneRef.current;
    const nodes = nodesRef.current;
    if (!scene) return;

    // Update all nodes userdata(expecially, links) except itself.
    nodes.forEach((node) => {
      node.userData.links = (node.userData as UserData).links.filter(
        (uuid: string) => uuid !== targetNodeUUID
      );
      node.userData.links_from = (node.userData.links_from as string[]).filter(
        (uuid: string) => uuid !== targetNodeUUID
      );
    });

    // Because an arrow's name convention is `arrow-startNodeName-endNodeName`
    const target = scene.getObjectByProperty("uuid", targetNodeUUID);
    if (target) {
      const targetArrows = scene.children.filter(
        (child) =>
          child.name.includes(target.name) && child.type === "ArrowHelper"
      );

      targetArrows.forEach((arrow) => {
        scene.remove(arrow);
      });
    }
  };

  const removeLink = (fromUUID: string, toNodeName: string) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const from = scene.getObjectByProperty("uuid", fromUUID);
    const to = scene.getObjectByName(toNodeName);

    if (!from || !to) return;
    const targetArrow = scene.getObjectByName(`arrow-${from.name}-${to.name}`);
    if (targetArrow) {
      scene.remove(targetArrow);

      // Update selected node's userData.links
      let links: string[] = [];
      links = [...from.userData.links];
      let index = links.findIndex((link) => {
        link === to.uuid;
      });
      links.splice(index, 1);
      from.userData.links = links;

      // Update from data
      links = [...to.userData.links_from];
      index = links.findIndex((link) => {
        link === from.uuid;
      });
      links.splice(index, 1);
      to.userData.links_from = links;

      dispatchChange();
    }
  };

  // Update a ArrowHelper to point to a correct location.
  const updateLinks = (selectedObj: THREE.Object3D) => {
    const scene = sceneRef.current;
    if (!scene || !selectedObj) return;

    let tempLinks = [...selectedObj.userData.links];
    selectedObj.userData.links = [];

    for (const link of tempLinks) {
      const to = scene.getObjectByProperty("uuid", link);
      if (to) {
        addLinks(selectedObj, to);
      }
    }
    tempLinks = [...selectedObj.userData.links_from];
    selectedObj.userData.links_from = [];

    for (const link of tempLinks) {
      const from = scene.getObjectByProperty("uuid", link);
      if (from) {
        addLinks(from, selectedObj);
      }
    }
  };

  const formatNumber = (num: number): string => {
    if (num < 1 || num > 99) {
      throw new Error("Input number must be between 1 and 99");
    }
    return num < 10 ? `0${num}` : `${num}`;
  };

  return <canvas className={className} ref={canvasRef} />;
};

export default LidarCanvas;
