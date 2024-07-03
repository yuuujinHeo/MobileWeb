"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
// redux
import { useDispatch } from "react-redux";
import { drawCloud } from "@/store/canvasSlice";

// prime
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";

import UtilityPanel from "@/components/UtilityPanel";

import { CANVAS_CLASSES } from "@/constants";

import axios from "axios";

import "./style.scss";

// components
import LidarCanvas from "@/components/LidarCanvas";

interface ListData {
  name: string;
  modifiedDate: string;
}

interface MapData {
  name: string;
  modifiedDate: string;
  list: ListData[];
}

const Joystick = dynamic(() => import("@/components/Joystick"), { ssr: false });

const Map: React.FC = () => {
  const dispatch = useDispatch();
  // state
  const [visible, setVisible] = useState<boolean>(false);
  const [mapList, setMapList] = useState([]);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const [selectedMapCloud, setSelectedMapCloud] = useState<string[][] | null>(
    null
  );
  const op = useRef<OverlayPanel>(null);
  const url = process.env.NEXT_PUBLIC_WEB_API_URL;

  useEffect(() => {
    getMapList();
  }, []);

  useEffect(() => {
    if (selectedMap) {
      getMapCloud(selectedMap.name);
    }
  }, [selectedMap]);

  const getMapList = async () => {
    try {
      const res = await axios.get(url + "/map/list");
      setMapList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const getMapCloud = async (name: string) => {
    try {
      const res = await axios.get(url + `/map/cloud/${name}`);
      setSelectedMapCloud(res.data);
      dispatch(
        drawCloud({ command: "DRAW_CLOUD", target: CANVAS_CLASSES.OVERLAY })
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectMap = (e) => {
    setSelectedMap(e.value as MapData);
  };

  const handleLoadMap = () => {
    dispatch(
      drawCloud({ command: "DRAW_CLOUD", target: CANVAS_CLASSES.DEFAULT })
    );
    if (op.current) {
      op.current.hide();
    }
  };

  const handleOverlayHide = () => {
    setSelectedMap(null);
    setSelectedMapCloud(null);
  };

  return (
    <div className="map">
      <LidarCanvas
        className={CANVAS_CLASSES.DEFAULT}
        selectedMapCloud={selectedMapCloud}
      />
      <Button
        label="Mapping"
        severity="secondary"
        onClick={() => setVisible(true)}
      ></Button>
      <Button
        label="Load"
        severity="secondary"
        onClick={(e) => {
          if (op.current) op.current.toggle(e);
        }}
      ></Button>
      <OverlayPanel ref={op} showCloseIcon onHide={handleOverlayHide}>
        <div className="flex ">
          <DataTable
            value={mapList}
            stripedRows
            paginator
            rows={6}
            selectionMode={"single"}
            selection={selectedMap}
            onSelectionChange={(e) => handleSelectMap(e)}
          >
            <Column field="name" header="Name" />
            <Column field="modifiedDate" header="Modifed Date" />
          </DataTable>
          <div className="preview flex flex-column flex-wrap  align-items-center">
            <div className="flex flex-wrap align-items-center justify-content-between gap-2">
              <span className="text-xl text-900 font-bold">Preview</span>
            </div>
            <LidarCanvas
              className={CANVAS_CLASSES.OVERLAY}
              selectedMapCloud={selectedMapCloud}
            />
            <Button
              label="Load"
              icon="pi pi-download"
              onClick={handleLoadMap}
            />
          </div>
        </div>
      </OverlayPanel>

      {/* Mapping */}
      <Sidebar
        visible={visible}
        fullScreen
        onHide={() => setVisible(false)}
        className="joystick-slide"
      >
        <div id="mapping-container">
          <UtilityPanel />
          <LidarCanvas className="canvas-sidebar" />
          <Joystick />
        </div>
      </Sidebar>
    </div>
  );
};

export default Map;
