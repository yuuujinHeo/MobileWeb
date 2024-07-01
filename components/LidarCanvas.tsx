"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

// three
import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls";

import { io } from "socket.io-client";
import axios from "axios";

const LidarCanvas = ({ className }) => {
  const canvas = useSelector((state: RootState) => state.canvas);
  const { action } = useSelector((state: RootState) => state.canvas);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<any>();

  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlRef = useRef<MapControls | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const robotModel = useRef<THREE.Object3D>();
  const [mobileURL, setMobileURL] = useState("");

  const lidarPoints = useRef<number>();
  const mappingPointsArr = useRef<number[]>([]);
  let robotPose: { x: number; y: number; rz: number } = { x: 0, y: 0, rz: 0 };

  useEffect(() => {
    switch (action.command) {
      case "MAPPING_START":
        handleMappingStop();
        if (className === "canvas-overlay" && socketRef.current) {
          socketRef.current.on("mapping", (data) => {
            drawCloud(data);
          });
        }
        break;
      case "MAPPING_STOP":
        handleMappingStop();
        break;
      default:
        break;
    }
  }, [action]);

  // 3D Scene setting when the component is mounted
  useEffect(() => {
    if (!canvasRef.current) return;

    // scene
    const scene = new THREE.Scene();

    const color = new THREE.Color(0xffffff);
    scene.background = color;
    sceneRef.current = scene;

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

    const onWindowResize = () => {
      if (!canvasRef.current) return;
      camera.aspect =
        canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      control.update();

      renderer.setSize(
        canvasRef.current.clientWidth,
        canvasRef.current.clientHeight
      );
    };

    isInitializedRef.current = true;

    // resize handling
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      renderer.setAnimationLoop(null);
    };
  }, []);

  useEffect(() => {
    const connectSocket = () => {
      if (!socketRef.current) {
        fetch("/api/socket").finally(() => {
          socketRef.current = io();

          socketRef.current.on("connect", () => {
            console.log("Socket connected ", socketRef.current.id);
          });

          socketRef.current.on("lidar", (data) => {
            drawLidar(data.data, {
              x: parseFloat(data.pose.x),
              y: parseFloat(data.pose.y),
              rz: (parseFloat(data.pose.rz) * Math.PI) / 180,
            });
          });

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
    connectSocket();

    return () => {
      console.log("Socket disconnect ", socketRef.current.id);
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isInitializedRef.current) {
      // drawCloud();
      initRobot();
    }
  }, [isInitializedRef]);

  const initRobot = async () => {
    if (!isInitializedRef.current) return;
    if (!sceneRef.current) return;

    const originGeometry = new THREE.SphereGeometry(0.1); // 점의 모양을 구형으로 정의
    const originMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // 빨간색으로 재질 정의
    const originPoint = new THREE.Mesh(originGeometry, originMaterial); // 메쉬 생성

    const axesHelperOrin = new THREE.AxesHelper(2); // 길이 5의 축 생성
    axesHelperOrin.rotateX(-Math.PI / 2);
    sceneRef.current.add(axesHelperOrin); // scene에 추가
    sceneRef.current.add(originPoint);

    // Parameters are width, height and depth.
    const geometry = new THREE.BoxGeometry(0.41, 0.285, 0.22);
    const material = new THREE.MeshBasicMaterial({ color: 0xc661a8 });
    const robot = new THREE.Mesh(geometry, material);
    robotModel.current = robot;

    robot.rotateX(-Math.PI / 2);

    // TEMP
    // This mesh indicate center of the scene
    // const centerGeo = new THREE.OctahedronGeometry(0.1, 0);
    // const centerMaterial = new THREE.MeshBasicMaterial();
    // const center = new THREE.Mesh(centerGeo, centerMaterial);
    // sceneRef.current.add(center);

    // An axes. The X axis is red. The Y axis is green. The Z axis is blue.
    const axesHelper = new THREE.AxesHelper(2);
    robot.add(axesHelper);

    // get Robot position
    try {
      const resp = await axios.get(url + "/status");
      const position = resp.data.pose;

      robot.position.set(position.x, position.y, 0);
      const radian = position.rz * (Math.PI / 180);
      robot.rotation.z = radian;

      sceneRef.current.add(robot);
    } catch (e) {
      console.error(e);
    }
  };

  const url = process.env.NEXT_PUBLIC_WEB_API_URL;
  async function setURL() {
    if (mobileURL == "") {
      const currentURL = window.location.href;
      console.log(currentURL);
      if (currentURL.startsWith("http")) {
        console.log(
          currentURL.split(":")[0] + ":" + currentURL.split(":")[1] + ":11334"
        );
        setMobileURL(
          currentURL.split(":")[0] + ":" + currentURL.split(":")[1] + ":11334"
        );
      } else {
        console.log("->", currentURL + ":11334");
        setMobileURL(currentURL + ":11334");
      }
    }
  }

  const driveRobot = (data) => {
    if (!robotModel.current) return;
    // robotModel.current.position.set(data.x, data.y, 0);
    robotModel.current.position.set(data.x, 0, -data.y);

    // const radian = data.rz * (Math.PI / 180);
    robotModel.current.rotation.z = data.rz;
  };

  // Get data from lidar
  const getCloud = async () => {
    try {
      const resp = await axios.get(url + "/map/cloud/2024_06_14_19_06_41_443");
      // const resp = await axios.get(mobileURL + "/map/cloud/test");
      return resp.data;
    } catch (e) {
      console.error(
        "An error Occured while getting cloud data. The error is:",
        e
      );
    }
  };

  function transformLidarPoints(point, pose) {
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
  }

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

  const drawCloud = async (cloud: string[][]) => {
    if (!isInitializedRef.current) return;

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

  const handleMappingStop = () => {
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

  return <canvas className={className} ref={canvasRef} />;
};

export default LidarCanvas;
