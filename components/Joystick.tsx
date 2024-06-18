"use client";
import { useEffect } from "react";
import axios from "axios";
import nipplejs from "nipplejs";
import "./style.scss";

const Joystick = () => {
  useEffect(() => {
    // Main logic
    const { joystick, manager } = createJoystick();
    const els = initDebugElements();

    manager.on("start", (evt, data) => {
      // Handle start events if needed
    });

    manager.on("move", (evt, data) => {
      dump(evt.type);
      debug(data, els);
      const { vx, vy, wz } = calculateVelocity(data);
      sendJogRequest(vx, vy, wz);
    });

    manager.on("end", (evt, data) => {
      // Handle end events if needed
    });

    // Cleanup function
    return () => {
      manager.destroy();
      if (joystick.parentNode) {
        joystick.parentNode.removeChild(joystick);
      }
    };
  }, []);

  // [TEMP] Need to be seperated to constants
  const url = "http://10.108.1.10";

  // Function to create joystick element and initialize nipplejs
  const createJoystick = () => {
    const joystick = document.createElement("div");
    joystick.id = "joystick";

    const joyContainer = document.getElementById("joystick-container");
    joyContainer.appendChild(joystick);

    const manager = nipplejs.create({
      zone: joyContainer,
      color: "blue",
      mode: "static",
      position: { left: "50%", top: "50%" },
    });

    return { joystick, manager };
  };

  // Function to initialize debug elements
  const initDebugElements = () => {
    const elDebug = document.getElementById("debug");
    return {
      position: {
        x: elDebug.querySelector(".position .x .data"),
        y: elDebug.querySelector(".position .y .data"),
      },
      force: elDebug.querySelector(".force .data"),
      pressure: elDebug.querySelector(".pressure .data"),
      distance: elDebug.querySelector(".distance .data"),
      angle: {
        radian: elDebug.querySelector(".angle .radian .data"),
        degree: elDebug.querySelector(".angle .degree .data"),
      },
      direction: {
        x: elDebug.querySelector(".direction .x .data"),
        y: elDebug.querySelector(".direction .y .data"),
        angle: elDebug.querySelector(".direction .angle .data"),
      },
    };
  };

  // Function to update debug information
  const debug = (obj: Record<string, any>, els: Record<string, any>) => {
    const parseObj = (sub: Record<string, any>, el: Record<string, any>) => {
      for (const i in sub) {
        if (typeof sub[i] === "object" && el) {
          parseObj(sub[i], el[i]);
        } else if (el && el[i]) {
          el[i].innerHTML = sub[i];
        }
      }
    };
    setTimeout(() => parseObj(obj, els), 0);
  };

  let nbEvents = 0;
  const dump = (evt: string) => {
    const elDebug = document.getElementById("debug");
    const elDump = elDebug.querySelector(".dump");
    setTimeout(function () {
      if (elDump.children.length > 4) {
        elDump.removeChild(elDump.firstChild);
      }
      var newEvent = document.createElement("div");
      newEvent.innerHTML =
        "#" + nbEvents + ' : <span class="data">' + evt + "</span>";
      elDump.appendChild(newEvent);
      nbEvents += 1;
    }, 0);
  };

  const calculateVelocity = (data: Record<string, any>) => {
    const maxSpeed = 1; // Adjust this value as needed
    const vx = maxSpeed * data.vector.x;
    const vy = maxSpeed * data.vector.y;
    const wz = maxSpeed * data.force;
    return { vx, vy, wz };
  };

  const sendJogRequest = async (vx: number, vy: number, wz: number) => {
    try {
      const currentTime = new Date()
        .toISOString()
        .replace("T", " ")
        .split(".")[0];

      // await axios.post(url + "/jog/manual", {
      //   command: "move",
      //   vx: vx,
      //   vy: vy,
      //   wz: wz,
      //   time: currentTime,
      // });
    } catch (error) {
      console.error("Error sending jog request:", error);
    }
  };
  return (
    <div id="joystick-container">
      <div id="debug">
        <ul>
          <li className="position">
            position:
            <ul>
              <li className="x">
                x: <span className="data"></span>
              </li>
              <li className="y">
                y: <span className="data"></span>
              </li>
            </ul>
          </li>
          <li className="force">
            force: <span className="data"></span>
          </li>
          <li className="pressure">
            pressure: <span className="data"></span>
          </li>
          <li className="distance">
            distance: <span className="data"></span>
          </li>
          <li className="angle">
            angle:
            <ul>
              <li className="radian">
                radian: <span className="data"></span>
              </li>
              <li className="degree">
                degree: <span className="data"></span>
              </li>
            </ul>
          </li>
          <li className="direction">
            direction:
            <ul>
              <li className="x">
                x: <span className="data"></span>
              </li>
              <li className="y">
                y: <span className="data"></span>
              </li>
              <li className="angle">
                angle: <span className="data"></span>
              </li>
            </ul>
          </li>
        </ul>
        <div className="dump"></div>
      </div>
    </div>
  );
};

export default Joystick;
