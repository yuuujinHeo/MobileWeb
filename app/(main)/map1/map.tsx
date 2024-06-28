"use client";
import React, { useEffect, useContext,  useState, useRef } from "react"
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// import { GetServerSideProps, GetServerSideProps } from "next";
// prime
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";

// three
import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls";
// etc
import "../map/style.scss";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import {store,AppDispatch, RootState} from '../../../store/store';
import { GetStaticProps, GetStaticPropsContext, GetStaticPropsResult } from 'next';
 

const Mapping: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<any>();

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlRef = useRef<MapControls | null>(null);
  const router = useRouter();

  // var Cloud:String[][]=[];
  // var Lidar:String[][]=[];

  const [Lidar, setLidar] = useState<String[][]>();
  const [Cloud, setCloud] = useState<String[][]>();

  // 3D Scene setting when the component is mounted
  useEffect(() => {
    if (!canvasRef.current) return;

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

    // resize handling
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      renderer.setAnimationLoop(null);
    };
  }, []);

  setInterval(()=>{
    drawCloud();
  });

  useEffect(() =>{
    if(!socketRef.current){
      fetch('/api/socket').finally(() => {
          socketRef.current = io();
  
          socketRef.current.on("connect", () => {
              console.log("Socket connected ",socketRef.current.id);
          });
  
          socketRef.current.on("mapping", (data) => {
            console.log("get mapping");
            // Cloud = data;
            setCloud(data);
          });
  
          socketRef.current.on("lidar", (data) => {
            console.log("get lidar");
            // Lidar = data;
            setLidar(data);
          });
      }); 
      return () => {
          console.log("Socket disconnect ",socketRef.current.id);
          socketRef.current.disconnect();
      };
    }
  },[]);

  const drawCloud = async () => {
    if (
      !canvasRef.current ||
      !sceneRef.current ||
      !rendererRef.current ||
      !cameraRef.current ||
      !controlRef.current
    )
      return;
      // console.log("??",Cloud);

    // const cloud = await getCloud();

    if (Cloud) {
      const geo = new THREE.BufferGeometry();

      const positions: number[] = [];
      const colors: number[] = [];

      const color = new THREE.Color();

      Cloud.forEach((arr: string[]) => {
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

      const animate = () => {
        if (
          rendererRef.current !== null &&
          sceneRef.current !== null &&
          cameraRef.current !== null
        ) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };

      rendererRef.current.setAnimationLoop(animate);
    }

    if (Lidar) {
      const geo = new THREE.BufferGeometry();

      const positions: number[] = [];
      const colors: number[] = [];

      const color = new THREE.Color();

      Lidar.forEach((arr: string[]) => {
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

      const animate = () => {
        if (
          rendererRef.current !== null &&
          sceneRef.current !== null &&
          cameraRef.current !== null
        ) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };

      rendererRef.current.setAnimationLoop(animate);
    }


  };

  return (
    <main>
      <canvas className="map" ref={canvasRef} />
    </main>
  );
};

export default Mapping;
