"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import nipplejs, { JoystickManager } from "nipplejs";

// prime
import { Knob } from "primereact/knob";

const INTERVAL_TIME = 100;

// TEMP
const getJoystickSize = () => {
  if (!window) return { joySize: 100 };
  if (window.matchMedia("(max-width: 576px").matches) {
    // Mobile
    return { joySize: 80 };
  } else if (window.matchMedia("(max-width: 768px").matches) {
    // Tablet
    return { joySize: 100 };
  } else if (window.matchMedia("(max-width: 992px").matches) {
    // Notebook
    return { joySize: 120 };
  } else {
    return { joySize: 150 };
  }
};

const Joystick = () => {
  const [speedFactor, setSpeedFactor] = useState<number>(0.5);
  const [rotateFactor, setRotateFactor] = useState<number>(20);
  const leftJoyManagerRef = useRef<JoystickManager | null>(null);
  const rightJoyManagerRef = useRef<JoystickManager | null>(null);


  // for joystick
  const joyIntervalRef = useRef<number | null>(null);
  const leftIntervalRef = useRef<number | null>(null);
  const rightIntervalRef = useRef<number | null>(null);
  const leftValueRef = useRef({ vx: 0 });
  const rightValueRef = useRef({ wz: 0 });
  const leftControlRef = useRef(false);
  const rightControlRef = useRef(false);

  let leftStartPosition = {x:0, y:0};
  let rightStartPosition = {x:0, y:0};

  useEffect(() => {
    const createJoystick = () => {
      const leftJoy = document.getElementById("left-joystick") as
        | HTMLElement
        | undefined;
      const rightJoy = document.getElementById("right-joystick") as
        | HTMLElement
        | undefined;

      const { joySize } = getJoystickSize();

      const leftJoyManager = nipplejs.create({
        zone: leftJoy,
        color: "blue",
        // size: joySize,
        mode: "dynamic",
        dynamicPage: true,
        // position: { left: "50%", top: "50%" },
        lockY: true,
      });

      const rightJoyManager = nipplejs.create({
        zone: rightJoy,
        color: "red",
        // size: joySize,
        mode: "dynamic",
        dynamicPage: true,
        // position: { left: "50%", top: "50%" },
        lockX: true,
      });

      leftJoyManagerRef.current = leftJoyManager;
      rightJoyManagerRef.current = rightJoyManager;
    };

    createJoystick();
  }, []);

  const calculateVelocity = (data: Record<string, any>) => {
    const vy = 0;
    const maxDistance = data.instance.options.size / 2;
    let vx: number, wz: number;

    if (data.vector.y > 0) {
      vx = speedFactor * (data.distance / maxDistance);
    } else if (data.vector.y < 0) {
      vx = -1 * speedFactor * (data.distance / maxDistance);
    } else {
      vx = 0;
    }

    if (data.vector.x > 0) {
      wz = rotateFactor * (data.distance / maxDistance);
    } else if (data.vector.x < 0) {
      wz = -1 * rotateFactor * (data.distance / maxDistance);
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
    const startLeftInterval = () => {
      leftControlRef.current = true;
      if (joyIntervalRef.current === null) {
        joyIntervalRef.current = window.setInterval(() => {
          sendJogRequest(leftValueRef.current.vx, 0, rightValueRef.current.wz);
        }, INTERVAL_TIME);
      }
    };

    const startRightInterval = () => {
      rightControlRef.current = true;
      if (joyIntervalRef.current === null) {
        joyIntervalRef.current = window.setInterval(() => {
          sendJogRequest(leftValueRef.current.vx, 0, rightValueRef.current.wz);
        }, INTERVAL_TIME);
      }
    };

    const clearLeftInterval = () => {
      if(joyIntervalRef.current){
        leftControlRef.current = false;
        leftValueRef.current.vx = 0;

        sendJogRequest(0, 0, rightValueRef.current.wz);

        if(!rightControlRef.current){
          clearInterval(joyIntervalRef.current);
          joyIntervalRef.current = null;
        }
      }
    };

    const clearRightInterval = () => {
      if(joyIntervalRef.current){
        rightControlRef.current = false;
        rightValueRef.current.wz = 0;

        sendJogRequest(leftValueRef.current.vx, 0, 0);

        if(!leftControlRef.current){
          clearInterval(joyIntervalRef.current);
          joyIntervalRef.current = null;
        }
      }
    };

    if (leftJoyManagerRef.current && rightJoyManagerRef.current) {
      leftJoyManagerRef.current.on("start", (evt,data) =>{
        leftStartPosition = {
          x: data.position.x,
          y: data.position.y
        }
        startLeftInterval();
      });
      leftJoyManagerRef.current.on("move", (evt, data) => {
        const { vx } = calculateVelocity(data);
        leftValueRef.current.vx = vx;
      });
      leftJoyManagerRef.current.on("end", (evt) => {
        clearLeftInterval();
      });

      rightJoyManagerRef.current.on("start", (evt,data) =>{
        rightStartPosition = {
          x: data.position.x,
          y: data.position.y
        }
        startRightInterval();
      });
      rightJoyManagerRef.current.on("move", (evt, data) => {
        const { wz } = calculateVelocity(data);
        rightValueRef.current.wz = -wz;
      });
      rightJoyManagerRef.current.on("end", (evt) => {
        clearRightInterval();
      });
    }

    return () => {
      clearLeftInterval();
      clearRightInterval();
    };
  }, [speedFactor, rotateFactor]);

  return (
    <div id="joystick-container">
      <div id="left-joystick">touch</div>
      <div id="control-parameter-container">
        <div id="speed-container">
          <span>Speed</span>
          <Knob
            value={speedFactor}
            step={0.01}
            min={0}
            max={2}
            onChange={(e) => setSpeedFactor(e.value)}
          />
        </div>
        <div id="rotation-container">
          <span>Rotation</span>
          <Knob
            value={rotateFactor}
            step={1}
            min={0}
            max={60}
            onChange={(e) => setRotateFactor(e.value)}
          />
        </div>
      </div>
      <div id="right-joystick">touch</div>
    </div>
  );
};

export default Joystick;