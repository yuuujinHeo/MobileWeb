"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import nipplejs from "nipplejs";

// prime
import { Knob } from "primereact/knob";

import "./style.scss";

const INTERVAL_TIME = 100;

const Joystick = () => {
  const [speedFactor, setSpeedFactor] = useState<number>(0.5);
  const [rotateFactor, setRotateFactor] = useState<number>(20);
  const leftJoyManagerRef = useRef(null);
  const rightJoyManagerRef = useRef(null);

  useEffect(() => {
    const createJoystick = () => {
      const leftJoy = document.getElementById("left-joystick");
      const rightJoy = document.getElementById("right-joystick");

      const leftJoyManager = nipplejs.create({
        zone: leftJoy,
        color: "blue",
        mode: "static",
        position: { left: "15%", top: "70%" },
        lockY: true,
      });

      const rightJoyManager = nipplejs.create({
        zone: rightJoy,
        color: "red",
        mode: "static",
        position: { left: "85%", top: "70%" },
        lockX: true,
      });

      leftJoyManagerRef.current = leftJoyManager;
      rightJoyManagerRef.current = rightJoyManager;
    };
    createJoystick();
  }, []);

  const calculateVelocity = (data: Record<string, any>) => {
    const vy = 0;
    let vx: number, wz: number;

    if (data.vector.y > 0) {
      vx = speedFactor * (data.distance / 50);
    } else if (data.vector.y < 0) {
      vx = -1 * speedFactor * (data.distance / 50);
    } else {
      vx = 0;
    }

    if (data.vector.x > 0) {
      wz = rotateFactor * (data.distance / 50);
    } else if (data.vector.x < 0) {
      wz = -1 * rotateFactor * (data.distance / 50);
    } else {
      wz = 0;
    }

    return { vx, vy, wz };
  };

  const sendJogRequest = async (vx: number, vy: number, wz: number) => {
    try {
      const url = process.env.NEXT_PUBLIC_WEB_API_URL;

      const currentTime = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");

      await axios.post(url + "/jog/manual", {
        command: "move",
        vx: vx,
        vy: vy,
        wz: wz,
        time: currentTime,
      });
    } catch (error) {
      console.error("Error sending jog request:", error);
    }
  };

  useEffect(() => {
    let leftInterval: ReturnType<typeof setInterval> | null = null;
    let rightInterval: ReturnType<typeof setInterval> | null = null;
    let leftValue = { vx: 0 };
    let rightValue = { wz: 0 };

    const startLeftInterval = () => {
      leftInterval = setInterval(() => {
        sendJogRequest(leftValue.vx, 0, 0);
      }, INTERVAL_TIME);
    };

    const startRightInterval = () => {
      rightInterval = setInterval(() => {
        sendJogRequest(0, 0, rightValue.wz);
      }, INTERVAL_TIME);
    };

    const clearLeftInterval = () => {
      if (leftInterval) {
        sendJogRequest(0, 0, 0);
        clearInterval(leftInterval);
        leftInterval = null;
      }
    };

    const clearRightInterval = () => {
      if (rightInterval) {
        sendJogRequest(0, 0, 0);
        clearInterval(rightInterval);
        rightInterval = null;
      }
    };

    leftJoyManagerRef.current.on("start", startLeftInterval);
    leftJoyManagerRef.current.on("move", (evt, data) => {
      const { vx } = calculateVelocity(data);
      leftValue.vx = vx;
    });
    leftJoyManagerRef.current.on("end", (evt) => {
      clearLeftInterval();
    });

    rightJoyManagerRef.current.on("start", startRightInterval);
    rightJoyManagerRef.current.on("move", (evt, data) => {
      const { wz } = calculateVelocity(data);
      rightValue.wz = wz;
    });
    rightJoyManagerRef.current.on("end", (evt) => {
      clearRightInterval();
    });

    return () => {
      clearLeftInterval();
      clearRightInterval();
    };
  }, [speedFactor, rotateFactor]);

  return (
    <div id="joystick-container">
      <div className="speed-container">
        <span>Speed</span>
        <Knob
          value={speedFactor}
          step={0.01}
          min={0}
          max={2}
          onChange={(e) => setSpeedFactor(e.value)}
        />
      </div>
      <div className="rotation-container">
        <span>Rotation</span>
        <Knob
          value={rotateFactor}
          step={1}
          min={0}
          max={60}
          onChange={(e) => setRotateFactor(e.value)}
        />
      </div>
      <div id="left-joystick"></div>
      <div id="right-joystick"></div>
    </div>
  );
};

export default Joystick;
