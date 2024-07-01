"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
// redux
import { useDispatch } from "react-redux";
import { drawCloud } from "@/store/canvasSlice";

// prime
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import UtilityPanel from "@/components/UtilityPanel";

import "./style.scss";

// components
import LidarCanvas from "@/components/LidarCanvas";
const Joystick = dynamic(() => import("@/components/Joystick"), { ssr: false });

const Map: React.FC = () => {
  const dispatch = useDispatch();
  // state
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div className="map">
      <LidarCanvas className="canvas" />
      <Button
        label="Mapping"
        severity="secondary"
        onClick={() => setVisible(true)}
      ></Button>
      <Button
        label="Draw"
        severity="secondary"
        onClick={() => {
          dispatch(drawCloud({ command: "DRAW_CLOUD" }));
        }}
      ></Button>
      <Sidebar
        visible={visible}
        fullScreen
        onHide={() => setVisible(false)}
        className="joystick-slide"
      >
        <div id="mapping-container">
          <UtilityPanel />
          <LidarCanvas className="canvas-overlay" />
          <Joystick />
        </div>
      </Sidebar>
    </div>
  );
};

export default Map;

