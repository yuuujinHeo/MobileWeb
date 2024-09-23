"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import {
  updateRobotHelper,
  changeSelectedObjectInfo,
  updateGoalNum,
  updateRouteNum,
  updateTransformControlsMode,
} from "@/store/canvasSlice";

// prime
import { Toast } from "primereact/toast";

// three
import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader";
import {
  TransformControls,
  TransformControlsMode,
} from "three/examples/jsm/controls/TransformControls";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

import { io } from "socket.io-client";
import axios from "axios";

// libs
import { Command } from "@/lib/Command";
import {
  AddNodeCommand,
  DeleteNodeCommand,
  AddLinkCommand,
  RemoveLinkCommand,
  ChangeNameCommand,
  TransformNodeCommand,
  // ChangeNodeTypeCommand,
} from "@/lib/commands/Commands";

import {
  CANVAS_CLASSES,
  CANVAS_ACTION,
  CANVAS_OBJECT,
  NODE_TYPE,
  SCALE_FACTOR,
} from "@/constants";
import {
  LidarCanvasProps,
  UserData,
  NodePose,
  RobotState,
  Severity,
} from "@/interface/canvas";

const LidarCanvas = ({
  className,
  cloudData = null,
  topoData,
}: LidarCanvasProps) => {
  const dispatch = useDispatch();
  // root state
  // const { action, isMarkingMode, robotHelper } = useSelector(
  //   (state: RootState) => state.canvas
  // );
  const action = useSelector((state: RootState) => state.canvas.action);
  const isMarkingMode = useSelector(
    (state: RootState) => state.canvas.isMarkingMode
  );
  const robotHelper = useSelector(
    (state: RootState) => state.canvas.robotHelper
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<any>();

  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlRef = useRef<MapControls | null>(null);
  const transformControlRef = useRef<TransformControls>();
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const robotModel = useRef<THREE.Object3D>();
  // [TODO] remove lidarPoints ref
  const lidarPoints = useRef<number>();
  const mappingPointsArr = useRef<number[]>([]);
  const currSelectionBoxRef = useRef<THREE.BoxHelper>();
  const prevSelectionBoxRef = useRef<THREE.BoxHelper>();

  const nodesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const raycastTargetsRef = useRef<THREE.Object3D[]>([]);
  const selectedNodeRef = useRef<THREE.Object3D | null>(null);
  const selectedNodesArrayRef = useRef<THREE.Object3D[]>([]);

  const cloudRef = useRef<string[][] | null>(null);
  const goals = useRef<number[]>([0]);
  const goalNum = useRef<number>(0);
  const routes = useRef<number[]>([0]);
  const routeNum = useRef<number>(0);

  // 3d object's visible state
  const visibleStateRef = useRef({
    ALL: true,
    GOAL: true,
    ROUTE: true,
    NAME: true,
    LINK: true,
    ROBOT: true,
    ORIGIN: true,
  });
  const updatedNodeIds = useRef<Set<number>>(new Set());

  const undo = useRef<Command[]>([]);
  const redo = useRef<Command[]>([]);
  // const lastObjectId = useRef<number>(-1);

  const toast = useRef<Toast>(null);
  let lastToastMsg = "";

  const isMarkingModeRef = useRef<boolean>(false);

  // robot info
  const [robotState, setRobotState] = useState<RobotState>({
    x: "0.00",
    y: "0.00",
    rz: "0.00",
    localization: "none",
    auto_state: "stop",
    obs_state: "none",
  });

  const url = process.env.NEXT_PUBLIC_WEB_API_URL;

  let robotPose: { x: number; y: number; rz: number } = { x: 0, y: 0, rz: 0 };
  let removedNodePose: NodePose | null = null;

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
    if (className !== CANVAS_CLASSES.PREVIEW) {
      initRobot();
      connectSocket();
    }
    if (className === CANVAS_CLASSES.MAPPING) {
      reloadMappingData();
    }

    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("keydown", handleKeyDown);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("mousedown", handleMouseDown);
        canvasRef.current.removeEventListener("mousemove", handleMouseMove);
        canvasRef.current.removeEventListener("mouseup", handleMouseUp);
        canvasRef.current.removeEventListener("touchstart", handleTouchStart);
        canvasRef.current.removeEventListener("touchmove", handleMouseMove);
        canvasRef.current.removeEventListener("touchend", handleTouchEnd);
        // canvasRef.current.removeEventListener("keydown", handleKeyDown);
      }
      rendererRef.current?.setAnimationLoop(null);

      if (socketRef.current && className !== CANVAS_CLASSES.PREVIEW) {
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
      clearMapPoints(action.target);
      drawCloud(action.target, cloudData);
    } else if (className === CANVAS_CLASSES.DEFAULT) {
      const selectedNodesArray = selectedNodesArrayRef.current;
      let nodePose: NodePose;

      switch (action.command) {
        case CANVAS_ACTION.ADD_NODE:
          if (className !== CANVAS_CLASSES.DEFAULT) break;
          nodePose = {
            x: Number(robotHelper.x),
            y: Number(robotHelper.y),
            z: Number(robotHelper.z),
            rz: Number(robotHelper.rz),
          };
          addNode(action.category, nodePose);
          break;
        case CANVAS_ACTION.DELETE_NODE:
          const selectedObject = selectedNodeRef.current;
          if (selectedObject) {
            nodePose = {
              x: Number(selectedObject.position.x),
              y: Number(selectedObject.position.y),
              z: Number(selectedObject.position.z),
              rz: Number(selectedObject.rotation.z),
            };
            handleDeleteNode(selectedObject, nodePose);
          }
          break;
        case CANVAS_ACTION.UPDATE_PROPERTY:
          const selectedObj = selectedNodeRef.current;
          if (!selectedObj) return;
          setPropertyUndoRedo(action.category, action.value);
          updateProperty(selectedObj, action.category, action.value);
          break;
        case CANVAS_ACTION.ADD_LINK:
          linkNodes(selectedNodesArray[0], selectedNodesArray[1]);
          undo.current.push(
            new AddLinkCommand(
              removeLink,
              linkNodes,
              selectedNodesArray[0],
              selectedNodesArray[1]
            )
          );
          break;
        case CANVAS_ACTION.ADD_BIDIRECTIONAL_LINK:
          linkNodes(selectedNodesArray[0], selectedNodesArray[1]);
          linkNodes(selectedNodesArray[1], selectedNodesArray[0]);
          undo.current.push(
            new AddLinkCommand(
              removeLink,
              linkNodes,
              selectedNodesArray[0],
              selectedNodesArray[1],
              true
            )
          );
          break;
        case CANVAS_ACTION.REMOVE_LINK:
          removeLink(action.target, action.value);
          const from = sceneRef.current?.getObjectByProperty(
            "uuid",
            action.target
          );
          const to = sceneRef.current?.getObjectByName(action.value);
          undo.current.push(
            new RemoveLinkCommand(
              linkNodes,
              removeLink,
              from as THREE.Object3D,
              to as THREE.Object3D
            )
          );
          break;
        case CANVAS_ACTION.DRAW_CLOUD_TOPO:
          clearMapPoints(CANVAS_CLASSES.DEFAULT);
          drawCloud(CANVAS_CLASSES.DEFAULT, cloudData);
          clearAllNodes();
          drawTopo();
          break;
        case CANVAS_ACTION.SAVE_MAP:
          saveMap(action.value);
          break;
        case CANVAS_ACTION.TFC_SET_MODE:
          setTransformControlsMode(action.name as TransformControlsMode);
          break;
        case CANVAS_ACTION.TOGGLE_OBJECT:
          setVisibleState(action.target);
          toggleObject(action.target);
          break;
        case CANVAS_ACTION.TOGGLE_ALL:
          setVisibleState(action.target);
          toggleObject(CANVAS_OBJECT.GOAL);
          toggleObject(CANVAS_OBJECT.ROUTE);
          toggleObject(CANVAS_OBJECT.NAME);
          toggleObject(CANVAS_OBJECT.LINK);
          toggleObject(CANVAS_OBJECT.ROBOT);
          toggleObject(CANVAS_OBJECT.ORIGIN);
          break;
        default:
          break;
      }
    } else if (className === CANVAS_CLASSES.MAPPING) {
      switch (action.command) {
        case CANVAS_ACTION.MAPPING_START:
          addMappingListener();
          break;
        case CANVAS_ACTION.MAPPING_STOP:
          clearMapPoints(CANVAS_CLASSES.MAPPING);
          removeMappingListener();
          break;
        default:
          break;
      }
    }
  }, [action]);

  useEffect(() => {
    goalNum.current = 0;
    routeNum.current = 0;
    dispatch(updateGoalNum(goalNum.current));
    dispatch(updateRouteNum(routeNum.current));
  }, [cloudData, topoData]);

  const setPropertyUndoRedo = (category: string, value: string): void => {
    const selectedObj = selectedNodeRef.current;
    if (!selectedObj) return;
    switch (category) {
      case "name":
        undo.current.push(
          new ChangeNameCommand(updateProperty, selectedObj, category, value)
        );
        break;
      case "pose-x":
      case "pose-y":
      case "pose-rz":
        undo.current.push(
          new TransformNodeCommand(updateProperty, selectedObj, category, value)
        );
        break;
      // case "type":
      //   undo.current.push(new ChangeNodeTypeCommand(undoChangeNodeType, value));
      default:
        break;
    }
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

  useEffect(() => {
    cloudRef.current = cloudData;
  }, [cloudData]);

  const updateProperty = (
    target: THREE.Object3D,
    category: string,
    value: string
  ): void => {
    const scene = sceneRef.current;
    const currSelectionBox = currSelectionBoxRef.current;
    const transformControl = transformControlRef.current;
    if (!scene || !target || !currSelectionBox || !transformControl) return;

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
          // Remove the arrow helper with the old name.
          removeAllLinksRelateTo(target.uuid);
          target.name = value;
          // update label
          removeLabelFromNode(target);
          addLabelToNode(target);
          // Redraw links
          updateLinks(target);
        }
        break;
      case "pose-x":
        target.position.x = Number(value) * SCALE_FACTOR;
        updateLinks(target);
        break;
      case "pose-y":
        target.position.y = Number(value) * SCALE_FACTOR;
        updateLinks(target);
        break;
      // case "pose-z":
      //   selectedObj.position.z = Number(value);
      //   break;
      case "pose-rz":
        target.rotation.z = Number(value);
        break;
      case "type":
        changeNodeType(target, value);
        break;
      case "info":
        target.userData.info = value;
        break;
      default:
        break;
    }

    // update selected object info
    dispatchChange();

    // selection box update
    const transformedObj = transformControl.object;
    if (!transformedObj) return;
    if (transformedObj.name.includes("goal")) {
      currSelectionBox.setFromObject(transformedObj.children[0]);
    } else {
      currSelectionBox.setFromObject(transformedObj);
    }
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
    transformControl.showZ = false;
    transformControl.addEventListener("change", handleTransformChange);
    transformControl.addEventListener("dragging-changed", (event) => {
      control.enabled = !event.value;
    });
    transformControl.addEventListener("mouseUp", () => {
      // selection box
      if (transformControl.object) {
        const obj: THREE.Object3D | undefined = transformControl.object;
        dispatch(
          updateRobotHelper({
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
    window.addEventListener("keydown", handleKeyDown);

    // mouse & touch handling
    canvasRef.current.addEventListener("mousedown", handleMouseDown);
    canvasRef.current.addEventListener("mousemove", handleMouseMove);
    canvasRef.current.addEventListener("mouseup", handleMouseUp);
    canvasRef.current.addEventListener("touchstart", handleTouchStart);
    canvasRef.current.addEventListener("touchmove", handleTouchMove);
    canvasRef.current.addEventListener("touchend", handleTouchEnd);

    // raycaster
    raycasterRef.current.layers.set(0);
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
      // Delete Helper
      const robotHelper = sceneRef.current?.getObjectByName("robotHelper");
      if (robotHelper) {
        sceneRef.current?.remove(robotHelper);
      }
    }
  };

  const getRaycaster = (event: MouseEvent | TouchEvent) => {
    if (!canvasRef.current || !cameraRef.current) return;
    const raycaster = raycasterRef.current;
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

      showSelectionHelper(topParent.children[0]);
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

  const showSelectionHelper = (obj: THREE.Object3D) => {
    const scene = sceneRef.current;
    const selectedNodesArray = selectedNodesArrayRef.current;
    const currSelectionBox = currSelectionBoxRef.current;
    const prevSelectionBox = prevSelectionBoxRef.current;
    if (!scene || !currSelectionBox || !prevSelectionBox) return;

    hideSelectionHelpers();

    if (obj.name.includes("goal"))
      currSelectionBox.setFromObject(obj.children[0]);
    else currSelectionBox.setFromObject(obj);

    currSelectionBox.visible = true;

    if (selectedNodesArray.length > 1) {
      const prev = selectedNodesArray[0];
      if (prev.name.includes("goal"))
        prevSelectionBox.setFromObject(prev.children[0]);
      else prevSelectionBox.setFromObject(prev);
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

  const createRobotHelper = (event: MouseEvent | TouchEvent) => {
    const raycaster = getRaycaster(event);
    transformControlRef.current?.detach();
    if (!sceneRef.current || !raycaster) return;

    const plane = sceneRef.current.getObjectByName("plane");
    if (!plane) return;
    const intersects = raycaster.intersectObject(plane, true);

    if (intersects.length > 0) {
      // remove prev craeteHelper
      const prevHelper = sceneRef.current.getObjectByName("robotHelper");
      if (prevHelper) {
        sceneRef.current.remove(prevHelper);
      }

      const intersect = intersects[0];

      const loader = new ThreeMFLoader();
      loader.load("amr.3MF", function (group) {
        group.scale.set(0.0315, 0.0315, 0.0315);
        group.position.set(intersect.point.x, intersect.point.y, 0);
        group.name = "robotHelper";

        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.material.color.set(new THREE.Color(0xbdc3c7));
            obj.material.transparent = true;
            obj.material.opacity = 0.4;
          }
        });

        const axesHelper = new THREE.AxesHelper(1);
        axesHelper.scale.set(800, 800, 0);
        group.add(axesHelper);

        sceneRef.current?.add(group);
        // transformControlRef.current?.attach(group);

        dispatch(
          updateRobotHelper({
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
          createRobotHelper(event);
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
        const robotHelper = sceneRef.current?.getObjectByName("robotHelper");
        if (robotHelper) targetObj = robotHelper;
      }
      if (
        targetObj &&
        canvasRef.current &&
        cameraRef.current &&
        sceneRef.current
      ) {
        const raycaster = raycasterRef.current;
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

      // cloud data for http request
      if (cloudRef.current !== null) {
        cloudRef.current.splice(index, 1);
      }
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
          if (isMouseDragged) break;
          if (intersect !== null) {
            selectObject(intersect.object);
          } else {
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
    const robotHelper: THREE.Object3D | undefined =
      sceneRef.current?.getObjectByName("robotHelper");
    if (robotHelper) {
      dispatch(
        updateRobotHelper({
          x: robotHelper.position.x.toString(),
          y: robotHelper.position.y.toString(),
          z: robotHelper.position.z.toString(),
          rz: robotHelper.rotation.z.toString(),
        })
      );
    }
  };

  const handleTouchEnd = (event) => {
    const touchEndTime = new Date().getTime();
    const touchDuration = touchEndTime - touchStartTime;
    if (touchDuration >= LONG_TOUCH_DURATION && !isTouchDragging) {
      if (isMarkingModeRef.current) createRobotHelper(event);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!transformControlRef.current) return;
    switch (e.code) {
      case "KeyW":
        setTransformControlsMode("translate");
        break;
      case "KeyE":
        setTransformControlsMode("rotate");
        break;
      case "KeyR":
        setTransformControlsMode("scale");
        break;
      case "KeyZ":
        if (e.metaKey) {
          undoCommand();
        }
        break;
      case "KeyX":
        // [TEMP]
        if (e.metaKey) {
          redoCommand();
        }
        break;
      default:
        break;
    }
  };

  const undoCommand = (): void => {
    const cmd: Command | undefined = undo.current.pop();
    if (cmd instanceof Command) {
      cmd.undo();
      showToast("success", `Undo ${cmd.type}`, 1500, true);
      redo.current.push(cmd);
    } else if (cmd === undefined) {
      showToast("warn", "Nothing to undo", 5000);
    }
  };

  const redoCommand = (): void => {
    const cmd = redo.current.pop();
    if (cmd) {
      cmd.redo();
      showToast("success", `Redo ${cmd.type}`, 1500, true);
      undo.current.push(cmd);
    } else if (cmd === undefined) {
      showToast("warn", "Already at newest change", 5000);
    }
  };

  const setTransformControlsMode = (mode: TransformControlsMode) => {
    if (!transformControlRef.current) return;
    const tfControl = transformControlRef.current;

    tfControl.setMode(mode);
    if (mode === "rotate") {
      tfControl.showX = false;
      tfControl.showY = false;
      tfControl.showZ = true;
    } else {
      tfControl.showX = true;
      tfControl.showY = true;
      tfControl.showZ = false;
    }
    dispatch(updateTransformControlsMode(mode));
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

    const originGeometry = new THREE.SphereGeometry(0.1);
    const originMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const originPoint = new THREE.Mesh(originGeometry, originMaterial);
    originPoint.name = CANVAS_OBJECT.ORIGIN;

    const axesHelperOrin = new THREE.AxesHelper(1);
    originPoint.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
    originPoint.add(axesHelperOrin);
    sceneRef.current.add(originPoint);

    const loader = new ThreeMFLoader();

    loader.load("amr.3MF", function (group) {
      group.name = CANVAS_OBJECT.ROBOT;
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
      const axesHelper = new THREE.AxesHelper(1);
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

        if (className !== CANVAS_CLASSES.PREVIEW) {
          socketRef.current.on("lidar", (data) => {
            drawLidar(data.data, {
              x: parseFloat(data.pose.x),
              y: parseFloat(data.pose.y),
              rz: (parseFloat(data.pose.rz) * Math.PI) / 180,
            });
          });
        }

        socketRef.current.on("status", (data) => {
          const res = JSON.parse(data);
          // [TEMP]
          robotPose = {
            x: parseFloat(res.pose.x) * SCALE_FACTOR,
            y: parseFloat(res.pose.y) * SCALE_FACTOR,
            rz: (parseFloat(res.pose.rz) * Math.PI) / 180,
          };
          driveRobot(robotPose);
          updateRobotState(res);
        });
      });
    }
  };

  const updateRobotState = (data) => {
    // [TEMP]
    // const parsedX = (Number(data.pose.x) * SCALE_FACTOR).toString().slice(0, 6);
    // const parsedY = (Number(data.pose.y) * SCALE_FACTOR).toString().slice(0, 6);
    const parsedData: RobotState = {
      x: data.pose.x.slice(0, 6),
      y: data.pose.y.slice(0, 6),
      rz: data.pose.rz,
      localization: data.state.localization,
      auto_state: data.condition.auto_state,
      obs_state: data.condition.obs_state,
    };
    setRobotState(parsedData);
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
    points.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
    lidarPoints.current = points.id;

    sceneRef.current?.add(points);
  };

  const drawCloud = (targetCanvas: string, cloud: string[][] | null) => {
    if (!cloud) return;
    if (className !== targetCanvas) return;

    if (className !== CANVAS_CLASSES.MAPPING) resetCamera();

    if (cloud) {
      const geo = new THREE.BufferGeometry();

      const positions: number[] = [];

      cloud.forEach((arr: string[]) => {
        // set positions
        const parsedArr = arr.slice(0, 3).map(parseFloat);

        positions.push(...parsedArr);
      });

      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );

      geo.computeBoundingSphere();

      const material = new THREE.PointsMaterial({
        size: 2.5,
        color: 0x74ff24,
      });

      const points = new THREE.Points(geo, material);
      points.name = "PointCloud";
      points.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);

      mappingPointsArr.current.push(points.id);
      sceneRef.current?.add(points);
    }
  };

  const drawTopo = async () => {
    const scene = sceneRef.current;
    if (!topoData || !scene || !topoData.length) return;

    // repaint all nodes

    const tasks = topoData.map((topo, i) => {
      const poseArr = topo.pose.split(",");

      const nodePose: NodePose = {
        // [TEMP]
        x: Number(poseArr[0]) * SCALE_FACTOR,
        y: Number(poseArr[1]) * SCALE_FACTOR,
        z: Number(poseArr[2]) * SCALE_FACTOR,
        rz: Number(poseArr[5]),
        idx: i,
      };
      if (topo.type === NODE_TYPE.GOAL) {
        return addGoalNode(nodePose);
      } else if (topo.type === NODE_TYPE.ROUTE) {
        return addRouteNode(nodePose);
      }
    });

    await Promise.all(tasks);

    // After repaint all nodes, link nodes
    topoData.forEach((node) => {
      const from = scene.getObjectByName(node.name);

      node.links.forEach((link) => {
        const to = scene.getObjectByName(link);
        if (from && to) linkNodes(from, to);
      });
    });
  };

  const clearMapPoints = (targetCanvas: string) => {
    if (className !== targetCanvas) return;
    if (!mappingPointsArr.current || !sceneRef.current) return;
    for (const i of mappingPointsArr.current) {
      const points = sceneRef.current.getObjectById(i);
      if (points) sceneRef.current.remove(points);
    }
    mappingPointsArr.current = [];
  };

  const addMappingListener = () => {
    if (className === CANVAS_CLASSES.MAPPING) {
      clearMapPoints(CANVAS_CLASSES.MAPPING);
      socketRef.current.on("mapping", (data) => {
        drawCloud(CANVAS_CLASSES.MAPPING, data);
      });
    }
  };

  const removeMappingListener = () => {
    if (socketRef.current) {
      socketRef.current.off("mapping");
    }
  };

  const clearAllNodes = () => {
    const scene = sceneRef.current;
    const nodes = nodesRef.current;
    if (!scene) return;

    const nodeIds = Array.from(nodes.keys());
    for (const id of nodeIds) {
      const node = scene.getObjectByProperty("uuid", id);
      if (node) {
        deleteNode(node);
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

  const addNode = async (category: string, nodePose: NodePose) => {
    let node: null | THREE.Object3D;
    let redoFunction: (object: THREE.Object3D, nodePose: NodePose) => void;
    if (category === NODE_TYPE.GOAL) {
      node = await addGoalNode(nodePose);
      redoFunction = restoreGoalNode;
    } else {
      node = await addRouteNode(nodePose);
      redoFunction = restoreRouteNode;
    }
    if (node === null) return;
    undo.current.push(
      new AddNodeCommand(deleteNode, redoFunction, node, nodePose)
    );
  };

  // Returns "Promise" because it includes a callback method.
  const addGoalNode = (nodePose: NodePose): Promise<THREE.Object3D> | null => {
    const loader = new ThreeMFLoader();
    return new Promise((resolve, reject) => {
      try {
        loader.load("amr.3MF", function (group) {
          group.scale.set(0.02835, 0.02835, 0.02835);

          group.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              obj.material.color.set(new THREE.Color(0xf7ff00));

              obj.material.transparent = true;
              obj.material.opacity = 0.85;

              // Add Edge line
              const edges = new THREE.EdgesGeometry(obj.geometry);
              const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                linewidth: 2,
              });
              const line = new THREE.LineSegments(edges, lineMaterial);
              obj.add(line);
            }
          });

          // axes helper
          const axesHelper = new THREE.AxesHelper(1);
          axesHelper.scale.set(800, 800, 0);
          group.add(axesHelper);

          sceneRef.current?.add(group);
          postProcessAddGoal(group, nodePose);
          resolve(group);
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  const restoreGoalNode = (
    object: THREE.Object3D,
    nodePose: NodePose,
    links: string[] = [],
    links_from: string[] = []
  ) => {
    sceneRef.current?.add(object);
    postProcessAddGoal(object, nodePose);
    // [Note]
    // Bug: userData of the passed object3D is lost ("links" and "links_from" become empty arrays).
    // Temporary solution: added "restoreLinks" due to unidentified cause.
    if (links.length || links_from.length)
      restoreLinks(object, links, links_from);
  };

  const postProcessAddGoal = (object: THREE.Object3D, nodePose: NodePose) => {
    setupNode(object, NODE_TYPE.GOAL, nodePose);
    goalNum.current += 1;
    dispatch(updateGoalNum(goalNum.current));

    addLabelToNode(object);
    raycastTargetsRef.current.push(object);
    selectObject(object);
  };

  const addRouteNode = (nodePose: NodePose): Promise<THREE.Object3D> | null => {
    return new Promise((resolve, reject) => {
      const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
      const material = new THREE.MeshBasicMaterial({ color: 0x76d7c4 });
      const route = new THREE.Mesh(geometry, material);
      route.scale.set(0.38, 0.38, 0.38);

      const geo = new THREE.PlaneGeometry(1, 1);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(geo, mat);
      plane.scale.set(30, 30, 1);
      plane.visible = false;
      plane.name = "plane";
      route.add(plane);

      sceneRef.current?.add(route);

      postProcessAddRoute(route, nodePose);
      resolve(route);
    });
  };

  const restoreRouteNode = (
    object: THREE.Object3D,
    nodePose: NodePose,
    links: string[] = [],
    links_from: string[] = []
  ) => {
    sceneRef.current?.add(object);
    postProcessAddRoute(object, nodePose);
    if (links.length || links_from.length)
      restoreLinks(object, links, links_from);
  };

  const postProcessAddRoute = (route: THREE.Object3D, nodePose: NodePose) => {
    setupNode(route, NODE_TYPE.ROUTE, nodePose);
    routeNum.current += 1;
    dispatch(updateRouteNum(routeNum.current));

    addLabelToNode(route);
    raycastTargetsRef.current.push(route);
    selectObject(route);
  };

  const restoreLinks = (
    object: THREE.Object3D,
    links: string[],
    links_from: string[]
  ): void => {
    const scene = sceneRef.current;
    if (!scene || !object) return;

    if (links.length) {
      for (const link of links) {
        const to = scene.getObjectByProperty("uuid", link);
        if (to) {
          linkNodes(object, to);
        }
      }
    }

    if (links_from.length) {
      for (const link of links_from) {
        const from = scene.getObjectByProperty("uuid", link);
        if (from) {
          linkNodes(from, object);
        }
      }
    }
  };

  const setupNode = (
    node: THREE.Object3D,
    type: string,
    nodePose: NodePose
  ) => {
    // Set node pose
    node.position.set(nodePose.x, nodePose.y, 0);

    node.rotation.z = nodePose.rz;
    const nodeId = node.uuid;
    nodesRef.current.set(nodeId, node);

    const nodes = type === NODE_TYPE.GOAL ? goals.current : routes.current;
    const prefix = type === NODE_TYPE.GOAL ? "goal" : "route";

    const isZeroExist = (element: number) => element === 0;
    const zeroIndex = nodes.findIndex(isZeroExist);

    // If zero index is larger than 0, It means that there is empty slot in nodes.
    if (zeroIndex >= 0) {
      nodes[zeroIndex] = 1;
      node.name = `${prefix}_${zeroIndex + 1}`;
    } else {
      nodes.push(1);
      node.name = `${prefix}_${nodes.length}`;
    }
    node.userData.links = [];
    node.userData.links_from = [];
    node.userData.type = type;
    node.userData.info = "";
    // called from drawTopo
    if (topoData && topoData.length && (nodePose.idx as number) >= 0) {
      const topo = topoData[nodePose.idx as number];
      // update userdata
      node.name = topo.name;
      node.userData.info = topo.info;
      node.rotation.z = nodePose.rz * (Math.PI / 180);
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

  const handleDeleteNode = (target: THREE.Object3D, nodePose: NodePose) => {
    if (target.userData.type === "GOAL") {
      undo.current.push(
        new DeleteNodeCommand(restoreGoalNode, deleteNode, target, nodePose)
      );
    } else if (target.userData.type === "ROUTE") {
      undo.current.push(
        new DeleteNodeCommand(restoreRouteNode, deleteNode, target, nodePose)
      );
    }
    deleteNode(target);
  };

  const deleteNode = (target: THREE.Object3D) => {
    const scene = sceneRef.current;
    const nodes = nodesRef.current;
    if (!scene) return;

    removedNodePose = {
      x: target.position.x,
      y: target.position.y,
      z: target.position.z,
      rz: target.rotation.z,
    };

    // Num update
    if (target.userData.type === NODE_TYPE.GOAL) {
      const match = target.name.match(/_(\d+)$/);
      const index = match ? match[1] : null;
      goals.current[Number(index as string) - 1] = 0;
      goalNum.current -= 1;
      dispatch(updateGoalNum(goalNum.current));
    } else if (target.userData.type === NODE_TYPE.ROUTE) {
      const match = target.name.match(/_(\d+)$/);
      const index = match ? match[1] : null;
      routes.current[Number(index as string) - 1] = 0;
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

  // [TEMP]
  // const undoChangeNodeType = (value: string) => {
  //   const scene = sceneRef.current;
  //   if (!scene) return;
  //   const last = scene.getObjectById(lastObjectId.current);
  //   if (!last) return;
  //   changeNodeType(last, value);
  // };

  const changeNodeType = async (
    target: THREE.Object3D,
    value: string
  ): Promise<void> => {
    if (!target) return;
    if (target.userData.type !== value) {
      const links = [...target?.userData.links];
      const links_from = [...target?.userData.links_from];

      if (target) deleteNode(target);

      let newNode: THREE.Object3D | null = null;
      if (value === NODE_TYPE.GOAL) {
        newNode = await addGoalNode(removedNodePose as NodePose);
      } else if (value === NODE_TYPE.ROUTE) {
        newNode = await addRouteNode(removedNodePose as NodePose);
      }

      if (newNode === null) return;
      // Link node from newNode
      for (const uuid of links) {
        const targetNode = sceneRef.current?.getObjectByProperty("uuid", uuid);
        if (targetNode) linkNodes(newNode, targetNode);
      }
      // Link node to newNode
      for (const uuid of links_from) {
        const targetNode = sceneRef.current?.getObjectByProperty("uuid", uuid);
        if (targetNode) linkNodes(targetNode, newNode);
      }

      // Set last object
      // lastObjectId.current = newNode.id;
    }
  };

  const saveAnnotation = async (filename: string): Promise<any> => {
    const nodeArr = Array.from(nodesRef.current, ([key, node]) => {
      const position = node.position.toArray();
      const parsedPos = position
        // [TEMP]
        .map((pos) => (pos / SCALE_FACTOR).toString().slice(0, 6))
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
      const response = await axios.post(url + `/map/topo/${filename}`, nodeArr);
      return response;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const saveCloud = async (filename: string): Promise<any> => {
    try {
      const response = await axios.post(
        url + `/map/cloud/${filename}`,
        cloudRef.current
      );
      return response;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const saveMap = async (filename: string) => {
    if (cloudRef.current === null) return;
    const annoRes = await saveAnnotation(filename);
    const cloudRes = await saveCloud(filename);

    if (annoRes && cloudRes) {
      showToast("success", "Save Succeed");
    } else if (!annoRes && cloudRes) {
      showToast(
        "warn",
        "The cloud data was saved successfully. However, The annotation data storage failed..."
      );
    } else if (annoRes && !cloudRes) {
      showToast(
        "warn",
        "The annotation data was saved successfully. However, The cloud data storage failed..."
      );
    } else if (!annoRes && !cloudRes) {
      showToast("error", "Save Failed");
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
    // Selection box handling
    const currSelectionBox = currSelectionBoxRef.current;
    const transformControl = transformControlRef.current;
    if (currSelectionBox && transformControl && transformControl.object) {
      if (transformControl.object.name.includes("goal")) {
        currSelectionBox.setFromObject(transformControl.object.children[0]);
      } else {
        currSelectionBox.setFromObject(transformControl.object);
      }
    }

    //
    if (selectedNodeRef.current && visibleStateRef.current.LINK) {
      updateLinks(selectedNodeRef.current);
    } else if (selectedNodeRef.current && !visibleStateRef.current.LINK) {
      updatedNodeIds.current.add(selectedNodeRef.current.id);
    }

    dispatchChange();
    render();
  };

  const linkNodes = (from: THREE.Object3D, to: THREE.Object3D) => {
    // This function should be called before updating the links
    // I mean, before 'Update links' logic...
    if (from === undefined || to === undefined) return;
    createArrow(from, to);

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

    removeAllLinksRelateTo(selectedObj.uuid);

    // let tempLinks = [...selectedObj.userData.links];
    const tempLinks = selectedObj.userData.links.slice();
    const tempLinksFrom = selectedObj.userData.links_from.slice();

    selectedObj.userData.links = [];
    selectedObj.userData.links_from = [];

    for (const link of tempLinks) {
      const to = scene.getObjectByProperty("uuid", link);
      if (to) {
        linkNodes(selectedObj, to);
      }
    }

    for (const link of tempLinksFrom) {
      const from = scene.getObjectByProperty("uuid", link);
      if (from) {
        linkNodes(from, selectedObj);
      }
    }
  };

  // const formatNumber = (num: number): string => {
  //   if (num < 1 || num > 99) {
  //     throw new Error("Input number must be between 1 and 99");
  //   }
  //   return num < 10 ? `0${num}` : `${num}`;
  // };
  //
  const showToast = (
    severity: Severity,
    detail: string,
    life: number = 2500,
    enableRepeat: boolean = false
  ) => {
    if (lastToastMsg === detail && enableRepeat === false) {
      return;
    }
    toast.current?.show({
      severity: severity,
      summary: severity,
      detail: detail,
      life: life,
    });
    lastToastMsg = detail;
  };

  const setVisibleState = (state: string) => {
    visibleStateRef.current[state] = !visibleStateRef.current[state];

    // NOTE:
    // Changing the "All" state afect other states as well.
    if (state === CANVAS_OBJECT.ALL) {
      if (visibleStateRef.current.ALL) {
        visibleStateRef.current.GOAL = true;
        visibleStateRef.current.ROUTE = true;
        visibleStateRef.current.LINK = true;
        visibleStateRef.current.NAME = true;
        visibleStateRef.current.ROBOT = true;
        visibleStateRef.current.ORIGIN = true;
      } else {
        visibleStateRef.current.GOAL = false;
        visibleStateRef.current.ROUTE = false;
        visibleStateRef.current.LINK = false;
        visibleStateRef.current.NAME = false;
        visibleStateRef.current.ROBOT = false;
        visibleStateRef.current.ORIGIN = false;
      }
    }
  };

  const toggleObject = (target: string) => {
    if (!canvasRef.current || !sceneRef.current || !labelRendererRef.current)
      return;
    switch (target) {
      case CANVAS_OBJECT.GOAL:
      case CANVAS_OBJECT.ROUTE:
        toggleNode(target);
        break;
      case CANVAS_OBJECT.NAME:
        visibleStateRef.current.NAME
          ? labelRendererRef.current.setSize(
              canvasRef.current.clientWidth,
              canvasRef.current.clientHeight
            )
          : labelRendererRef.current.setSize(0, 0);
        break;
      case CANVAS_OBJECT.LINK:
        sceneRef.current.traverse((child) => {
          if (child.type === "ArrowHelper") {
            visibleStateRef.current.LINK
              ? (child.visible = true)
              : (child.visible = false);
          }
        });

        if (!visibleStateRef.current.LINK) {
          // Reassign updatedNodeIds to an empty array
          updatedNodeIds.current.clear();
        } else if (
          visibleStateRef.current.LINK &&
          updatedNodeIds.current.size
        ) {
          // Update the link if there is an update on the node
          // while the links is not visible.
          updatedNodeIds.current.forEach((id: number) => {
            const node = sceneRef.current?.getObjectById(id);
            if (node) {
              updateLinks(node);
              render();
            }
          });
        }
        break;
      case CANVAS_OBJECT.ROBOT:
      case CANVAS_OBJECT.ORIGIN:
        toggleObjectByName(target);
        break;
      default:
        break;
    }
  };

  const toggleNode = (target: string) => {
    const scene = sceneRef.current;
    if (!scene) return;
    hideSelectionHelpers();
    transformControlRef.current?.detach();

    scene.traverse((object) => {
      if (object.userData.type === target) {
        const topParent = findTopParent(object);
        topParent.traverse((child) => {
          if (visibleStateRef.current[target]) {
            child.layers.set(0);
            if (child.name !== "plane") child.visible = true;
          } else {
            child.layers.set(1);
            child.visible = false;
          }
        });
      }
    });
  };

  const toggleObjectByName = (name: string) => {
    if (!canvasRef.current || !sceneRef.current) return;
    const object = sceneRef.current.getObjectByName(name);
    if (!object) return;

    visibleStateRef.current[name]
      ? (object.visible = true)
      : (object.visible = false);
  };

  return className === CANVAS_CLASSES.DEFAULT ? (
    <div id="lidar-canvas__container">
      <Toast ref={toast} />
      <canvas className={className} ref={canvasRef} tabIndex={0} />
      <div className="lidar-canvas__robot-info">
        <p>ROBOT STATE</p>
        <p>localization: {robotState.localization}</p>
        <p>
          pose x: {robotState.x} y: {robotState.y} rz: {robotState.rz}
        </p>
        <p>auto state: {robotState.auto_state}</p>
        <p>obs state: {robotState.obs_state}</p>
      </div>
    </div>
  ) : (
    <canvas className={className} ref={canvasRef} />
  );
};

export default LidarCanvas;
