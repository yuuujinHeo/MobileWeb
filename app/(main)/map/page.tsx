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
      <Sidebar
        visible={visible}
        position="bottom"
        onHide={() => setVisible(false)}
        className="joystick-slide"
      >
        <Joystick></Joystick>
      </Sidebar>
      <Button
        onClick={() => setVisible(true)}
        rounded
        raised
        text
        aria-label="Filter"
      >
        <img alt="joystick" src="/joystick_24dp.svg" />
      </Button>
    </div>
  );
};

export default Map;
