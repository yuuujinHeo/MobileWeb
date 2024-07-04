"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
// redux
import { useDispatch } from "react-redux";
import { drawCloud } from "@/store/canvasSlice";

// prime
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Tooltip } from "primereact/tooltip";

import UtilityPanel from "@/components/UtilityPanel";

import { CANVAS_CLASSES } from "@/constants";

import axios from "axios";

// components
import LidarCanvas from "@/components/LidarCanvas";
import { SpeedDial } from "primereact/speeddial";

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
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [mapList, setMapList] = useState([]);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const [selectedMapCloud, setSelectedMapCloud] = useState<string[][] | null>(
    null
  );
  const url = process.env.NEXT_PUBLIC_WEB_API_URL;

  const dialItems = [
    {
      label: "Mapping",
      icon: "pi pi-map",
      command: () => {
        setIsSidebarVisible(true);
      },
    },
    {
      label: "Load",
      icon: "pi pi-upload",
      command: () => {
        setIsDialogVisible(true);
      },
    },
  ];

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

    setIsDialogVisible(false);
  };

  const handleDialogHide = () => {
    // reset
    setSelectedMap(null);
    setSelectedMapCloud(null);
  };

  return (
    <div id="map">
      <LidarCanvas
        className={CANVAS_CLASSES.DEFAULT}
        selectedMapCloud={selectedMapCloud}
      />
      <div style={{ position: "absolute" }}>
        <Tooltip target={".speeddial-top-right .p-speeddial-action"} />
        <SpeedDial
          model={dialItems}
          direction="down"
          className="speeddial-top-right"
          showIcon="pi pi-bars"
          hideIcon="pi pi-times"
          style={{ left: 15, top: 15 }}
        ></SpeedDial>
      </div>

      {/* Load Dialog */}
      <Dialog
        header="Load saved mapping data"
        visible={isDialogVisible}
        onHide={handleDialogHide}
      >
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
      </Dialog>

      {/* Mapping */}
      <Sidebar
        visible={isSidebarVisible}
        fullScreen
        onHide={() => setIsSidebarVisible(false)}
        className="joystick-slide"
      >
        <div id="sidebar-container">
          <UtilityPanel />
          <LidarCanvas className="canvas-sidebar" />
          <Joystick />
        </div>
      </Sidebar>
    </div>
  );
};

export default Map;
