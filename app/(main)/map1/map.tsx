"use client";
import React, { useEffect, useContext, useState, useRef } from "react";
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
import { WebSocketContext } from './websocketprovider';
import { useDispatch, useSelector } from 'react-redux';
import {store,AppDispatch, RootState} from '../../../store/store';
import { selectCloud, setCloud } from '@/store/mappingSlice';

// export const getServerSideProps = async (context) => {
//     // const st = store();
  
//     // 서버에서 데이터를 가져옵니다.
//     const res = await fetch('https://api.example.com/cloud');
//     const data = await res.json();
  
//     // Redux 상태를 설정합니다.
//     // st.dispatch(setCloud(data));
  
//     return {
//       props: {
//         // initialReduxState: st.getState(),
//       },
//     };
//   };

const Mapping: React.FC = () => {
  // state
  const dispatch = useDispatch<AppDispatch>();
  const Cloud = useSelector((state:RootState) => selectCloud(state));   
  const [visible, setVisible] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlRef = useRef<MapControls | null>(null);
  const ws = useContext(WebSocketContext);

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

  // Draw the points cloud
  useEffect(() => {
    drawCloud();
  }, [
    sceneRef.current,
    rendererRef.current,
    cameraRef.current,
    controlRef.current,
  ]);

  useEffect(()=>{
    console.log("cloud");
    // drawCloud();
  },[Cloud])

  setInterval(()=>{
    drawCloud();
  },1000);

  useEffect(()=>{

  })



  const drawCloud = async () => {
    console.log("drawCloud");
    if (
      !canvasRef.current ||
      !sceneRef.current ||
      !rendererRef.current ||
      !cameraRef.current ||
      !controlRef.current
    )
      return;
      console.log("??",Cloud);

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
  };

  return (
    <main>
      <canvas className="canvas" ref={canvasRef} />
    </main>
  );
};

export default Mapping;
