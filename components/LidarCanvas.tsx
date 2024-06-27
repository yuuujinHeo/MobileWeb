"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

// three
import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls";

import axios from "axios";

const LidarCanvas = ({ className }) => {
  const canvas = useSelector((state: RootState) => state.canvas);
  const { action } = useSelector((state: RootState) => state.canvas);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlRef = useRef<MapControls | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const [mobileURL, setMobileURL] = useState("");

  useEffect(() => {
    switch (action.command) {
      case "DRAW_CLOUD":
        drawCloud();
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
    camera.position.set(0, 45, 0);

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
      rendererRef.current.render(sceneRef.current, cameraRef.current);
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

  // Draw the points cloud
  useEffect(() => {
    if (isInitializedRef) {
      // drawCloud();
      initRobot();
    }
  }, [isInitializedRef, mobileURL]);

  const initRobot = () => {
    if (!isInitializedRef.current) return;

    // Parameters are width, height and depth.
    const geometry = new THREE.BoxGeometry(3, 1, 1.5);
    const material = new THREE.MeshBasicMaterial({ color: 0xc661a8 });
    const robot = new THREE.Mesh(geometry, material);

    // An axes. The X axis is red. The Y axis is green. The Z axis is blue.
    const axesHelper = new THREE.AxesHelper(4);
    robot.add(axesHelper);
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

  const drawCloud = async () => {
    if (!isInitializedRef.current) return;

    const cloud = await getCloud();

    if (cloud) {
      const geo = new THREE.BufferGeometry();

      const positions: number[] = [];
      const colors: number[] = [];

      const color = new THREE.Color();

      cloud.forEach((arr: string[]) => {
        // set positions
        const parsedArr = arr.slice(0, 3).map(parseFloat);
        positions.push(...parsedArr);

        if (colors.length) {
          color.setRGB(0, 1, 0, THREE.SRGBColorSpace);
        } else {
          color.setRGB(1, 0, 0, THREE.SRGBColorSpace);
        }

        colors.push(color.r, color.g, color.b);
      });

      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

      geo.computeBoundingSphere();

      const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
      });

      const points = new THREE.Points(geo, material);
      points.rotation.x = -(Math.PI / 2);

      sceneRef.current.add(points);
    }
  };

  return <canvas className={className} ref={canvasRef} />;
};

export default LidarCanvas;
