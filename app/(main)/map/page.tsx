"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

// prime
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";

import "./style.scss";

// components
import LidarCanvas from "@/components/LidarCanvas";
const Joystick = dynamic(() => import("@/components/Joystick"), { ssr: false });

const Map: React.FC = () => {
  // state
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div className="map">
      <LidarCanvas />
      <Button
        label="Mapping"
        severity="secondary"
        onClick={() => setVisible(true)}
      ></Button>
      <Sidebar
        visible={visible}
        fullScreen
        onHide={() => setVisible(false)}
        className="joystick-slide"
      >
        <div id="mapping-container">
          <LidarCanvas />
          <Joystick></Joystick>
        </div>
      </Sidebar>
    </div>
  );
};

export default Map;
