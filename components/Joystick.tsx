"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import nipplejs from "nipplejs";

// prime
import { Knob } from "primereact/knob";

import "./style.scss";

const INTERVAL_TIME = 100;

const Joystick = () => {
  const [speedFactor, setSpeedFactor] = useState<number>(0.5);
  const [rotateFactor, setRotateFactor] = useState<number>(20);
  const speedFactorRef = useRef(speedFactor);
  const rotateFactorRef = useRef(rotateFactor);

  useEffect(() => {
    speedFactorRef.current = speedFactor;
  }, [speedFactor]);

  useEffect(() => {
    rotateFactorRef.current = rotateFactor;
  }, [rotateFactor]);

  const createJoystick = useCallback(() => {
    const leftJoy = document.getElementById("left-joystick");
    const rightJoy = document.getElementById("right-joystick");

    const leftJoyManager = nipplejs.create({
      zone: leftJoy,
      color: "blue",
      mode: "static",
      position: { left: "33%", top: "50%" },
      lockY: true,
    });

    const rightJoyManager = nipplejs.create({
      zone: rightJoy,
      color: "red",
      mode: "static",
      position: { left: "66%", top: "50%" },
      lockX: true,
    });

    return { leftJoyManager, rightJoyManager };
  }, []);

  const calculateVelocity = useCallback(
    (data: Record<string, any>) => {
      const vy = 0;
      let vx: number, wz: number;

      if (data.vector.y > 0) {
        vx = speedFactorRef.current * (data.distance / 50);
      } else if (data.vector.y < 0) {
        vx = -1 * speedFactorRef.current * (data.distance / 50);
      } else {
        vx = 0;
      }

      if (data.vector.x > 0) {
        wz = rotateFactorRef.current * (data.distance / 50);
      } else if (data.vector.x < 0) {
        wz = -1 * rotateFactorRef.current * (data.distance / 50);
      } else {
        wz = 0;
      }

      return { vx, vy, wz };
    },
    [speedFactorRef, rotateFactorRef]
  );

  const sendJogRequest = useCallback(
    async (vx: number, vy: number, wz: number) => {
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
    },
    []
  );

  useEffect(() => {
    const { leftJoyManager, rightJoyManager } = createJoystick();

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
        clearInterval(leftInterval);
        leftInterval = null;
      }
    };

    const clearRightInterval = () => {
      if (rightInterval) {
        clearInterval(rightInterval);
        rightInterval = null;
      }
    };

    leftJoyManager.on("start", startLeftInterval);
    leftJoyManager.on("move", (evt, data) => {
      const { vx } = calculateVelocity(data);
      leftValue.vx = vx;
    });
    leftJoyManager.on("end", clearLeftInterval);

    rightJoyManager.on("start", startRightInterval);
    rightJoyManager.on("move", (evt, data) => {
      const { wz } = calculateVelocity(data);
      rightValue.wz = wz;
    });
    rightJoyManager.on("end", (evt) => {
      sendJogRequest(0, 0, 0);
      clearRightInterval();
    });

    return () => {
      leftJoyManager.destroy();
      rightJoyManager.destroy();
      clearLeftInterval();
      clearRightInterval();
    };
  }, [calculateVelocity, sendJogRequest, createJoystick]);

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
