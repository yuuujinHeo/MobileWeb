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
  const mappingPoints = useRef<number>();
  let robotPose:{x:number, y:number, rz:number} = {x:0, y:0, rz:0};

  useEffect(() => {
    switch (action.command) {
      case "DRAW_CLOUD":
        // drawCloud();
        break;
      default:
        break;
    }
  }, [action]);

  // 3D Scene setting when the component is mounted
  useEffect(() => {
    setURL();

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

    control.minDistance = 10;
    control.maxDistance = 100;

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

          socketRef.current.on("mapping", (data) => {
            console.log("get mapping");
            drawCloud(data);
          });
          socketRef.current.on("lidar", (data: string[][]) => {
            drawLidar(data);
          });

          socketRef.current.on("status", (data) => {
            const res = JSON.parse(data);
            console.log(res.pose);
            robotPose = {x:parseFloat(res.pose.x), y: parseFloat(res.pose.y), rz:parseFloat(res.pose.rz)*Math.PI/180}
            // robotPose = {res.pose.x, res.po}
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

    // Parameters are width, height and depth.
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0xc661a8 });
    const robot = new THREE.Mesh(geometry, material);
    robotModel.current = robot;

    robot.rotateX(Math.PI / -2);

    // TEMP
    // This mesh indicate center of the scene
    // const centerGeo = new THREE.OctahedronGeometry(0.1, 0);
    // const centerMaterial = new THREE.MeshBasicMaterial();
    // const center = new THREE.Mesh(centerGeo, centerMaterial);
    // sceneRef.current.add(center);

    // An axes. The X axis is red. The Y axis is green. The Z axis is blue.
    const axesHelper = new THREE.AxesHelper(4);
    robot.add(axesHelper);

    // get Robot position
    const resp = await axios.get(url + "/status");
    const position = resp.data.pose;

    robot.position.set(position.x, position.y, 0);
    const radian = position.rz * (Math.PI / 180);
    robot.rotation.z = radian;

    sceneRef.current.add(robot);
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
    robotModel.current.position.set(data.x, data.y, 0);

    // const radian = data.rz * (Math.PI / 180);
    robotModel.current.rotation.z = data.rz;


    console.log(robotModel.current.position.x, robotModel.current.position.y);
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


  function transformLidarPoints(point) {
    // if(point[0])
    const xL = point[0];
    const yL = point[1];

    // 회전 변환
    const xLPrime = xL * Math.cos(robotPose.rz) - yL * Math.sin(robotPose.rz);
    const yLPrime = xL * Math.sin(robotPose.rz) + yL * Math.cos(robotPose.rz);

    // 평행 이동
    const xM = robotPose.x + xLPrime;
    const yM = (robotPose.y + yLPrime);

    return [xM, yM, point[2]];
}

  const drawLidar = (data: string[][]) => {
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
    const positions2: number[] = [];
    const colors: number[] = [];

    const color = new THREE.Color();

    data.forEach((arr: string[]) => {
      // set positions
      const parsedArr = arr.slice(0, 3).map(parseFloat);

      const newparsedArr = transformLidarPoints(parsedArr);


      positions.push(...newparsedArr);
      color.setRGB(1, 0, 0, THREE.SRGBColorSpace);
      colors.push(color.r, color.g, color.b);
    });

    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    geo.computeBoundingSphere();

    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
    });

    const points = new THREE.Points(geo, material);
    lidarPoints.current = points.id;

    points.rotation.x = -(Math.PI / 2);

    sceneRef.current?.add(points);
  };

  const drawCloud = async (cloud: string[][]) => {
    if (!isInitializedRef.current) return;

    // reset
    if (mappingPoints.current) {
      const mappingPointsObj = sceneRef.current?.getObjectById(
        mappingPoints.current
      );
      if (mappingPointsObj) {
        sceneRef.current?.remove(mappingPointsObj);
      }
    }
    if (cloud) {
      const geo = new THREE.BufferGeometry();

      const positions: number[] = [];
      const colors: number[] = [];

      const color = new THREE.Color();

      cloud.forEach((arr: string[]) => {
        // set positions
        const parsedArr = arr.slice(0, 3).map(parseFloat);
        positions.push(...parsedArr);

        color.setRGB(0, 1, 0, THREE.SRGBColorSpace);

        colors.push(color.r, color.g, color.b);
      });

      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

      geo.computeBoundingSphere();

      const material = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
      });

      const points = new THREE.Points(geo, material);
      mappingPoints.current = points.id;

      points.rotation.x = -(Math.PI / 2);

      sceneRef.current?.add(points);
    }
  };

  return <canvas className={className} ref={canvasRef} />;
};

export default LidarCanvas;
