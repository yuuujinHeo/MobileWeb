
"use client";
import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls";

import "../../../styles/canvas.scss";
import axios from "axios";

const Map: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);

  const url = "http://10.108.1.10";

  // Get data from lidar
  const getCloud = async () => {
    try {
      const resp = await axios.get(url + ":11334/map/cloud/test");
      return resp.data;
    } catch (e) {
      console.error(e);
    }
  };

  // 3D Scene setting
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene3d = new THREE.Scene();
    setScene(scene3d);

    const camera3d = new THREE.PerspectiveCamera(
      60,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      1,
      1000
    );
    setCamera(camera3d);
    // camera3d.position.z = 50;
    camera3d.position.set(0, 45, 0);

    const rd = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    rd.setPixelRatio(window.devicePixelRatio);
    rd.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    setRenderer(rd);

    // controls
    const controls = new MapControls(camera3d, rd.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 10;
    controls.maxDistance = 100;

    controls.maxPolarAngle = Math.PI / 2;

    // resize handling
    window.addEventListener("resize", onWindowResize);

    function animate() {
      controls.update();

      rd.render(scene3d, camera3d);
    }

    function onWindowResize() {
      if (canvasRef.current) {
        camera3d.aspect =
          canvasRef.current.clientWidth / canvasRef.current.clientHeight;
        camera3d.updateProjectionMatrix();

        rd.setSize(
          canvasRef.current.clientWidth,
          canvasRef.current.clientHeight
        );
      }
    }

    rd.setAnimationLoop(animate);

    return () => {
      rd.setAnimationLoop(null);
    };
  }, []);

  // Draw the points cloud
  useEffect(() => {
    const drawCloud = async () => {
      if (!canvasRef.current || !scene || !renderer || !camera) return;

      const cloud = await getCloud();
      const geo = new THREE.BufferGeometry();

      const positions: number[] = [];
      const colors: number[] = [];

      const color = new THREE.Color();

      cloud.forEach((arr: string[]) => {
        // set positions
        positions.push(...arr.slice(0, 3).map(Number));

        // set color
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        const z = Math.random() * 1000;

        const vx = x / 1000 + 0.5;
        const vy = y / 1000 + 0.5;
        const vz = z / 1000 + 0.5;

        color.setRGB(vx, vy, vz, THREE.SRGBColorSpace);

        colors.push(color.r, color.g, color.b);
      });

      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

      geo.computeBoundingSphere();

      const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
      });

      const points = new THREE.Points(geo, material);
      points.rotation.x = Math.PI / 2;
      scene.add(points);

      const animate = () => {
        renderer.render(scene, camera);
      };

      renderer.setAnimationLoop(animate);
    };

    drawCloud();
  }, [scene, renderer, camera]);

  return <canvas className="canvas" ref={canvasRef} />;
};

export default Map;
