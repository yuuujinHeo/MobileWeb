"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
// redux
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { drawCloud } from "@/store/canvasSlice";

// prime
import { Sidebar } from "primereact/sidebar";
import { ButtonGroup } from "primereact/buttongroup";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Tooltip } from "primereact/tooltip";
import { Card } from "primereact/card";
import { SelectButton } from "primereact/selectbutton";

import UtilityPanel from "@/components/UtilityPanel";

import { CANVAS_CLASSES } from "@/constants";

import axios from "axios";

interface LocValues {
  x: string;
  y: string;
  z: string;
  rz: string;
}
interface LocReqPayload {
  time: string;
  command: string;
  x?: string;
  y?: string;
  z?: string;
  rz?: string;
}

// components
import LidarCanvas from "@/components/LidarCanvas";
import { SpeedDial } from "primereact/speeddial";
import { Panel } from "primereact/panel";

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
  const initData = useSelector((state: RootState) => state.canvas.initData);

  // state
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [mapList, setMapList] = useState([]);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const [selectedMapCloud, setSelectedMapCloud] = useState<string[][] | null>(
    null
  );
  const [selectBtn, setSelectBtn] = useState<string>("Off");
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
      icon: "pi pi-download",
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
    // Draw cloud points to lidar canvas
    dispatch(
      drawCloud({ command: "DRAW_CLOUD", target: CANVAS_CLASSES.DEFAULT })
    );

    // Hide dialogue
    setIsDialogVisible(false);

    // Send selected map data to slam
    sendSelectedMapToSLAM();
  };

  const handleDialogHide = () => {
    setIsDialogVisible(false);

    // reset
    setSelectedMap(null);
    setSelectedMapCloud(null);
  };

  const sendSelectedMapToSLAM = async () => {
    if (!selectedMap) return;
    try {
      await axios.post(url + "/map/current", {
        name: selectedMap.name,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const sendLOCRequest = async (command: string) => {
    try {
      const payload: LocReqPayload = {
        time: getCurrentTime(),
        command: command,
        x: initData.x,
        y: initData.y,
        z: initData.z,
        rz: initData.rz,
      };

      await axios.post(url + "/localization", payload);
    } catch (e) {
      console.error(e);
    }
  };

  const getCurrentTime = () => {
    const currentTime = new Date()
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");

    return currentTime;
  };

  return (
    <div id="map">
      <LidarCanvas
        className={CANVAS_CLASSES.DEFAULT}
        selectedMapCloud={selectedMapCloud}
        localization={selectBtn}
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

      {/* Loc panel */}
      <div id="loc-container">
        <Card id="loc-panel" title="Localization">
          <div id="switch-container">
            <span>Marker</span>
            <SelectButton
              value={selectBtn}
              options={["On", "Off"]}
              onChange={(e) => {
                if (e.value !== null) setSelectBtn(e.value);
                e.stopPropagation();
              }}
            />
          </div>
          <ButtonGroup>
            <Button
              label="INIT"
              size="small"
              severity="secondary"
              text
              raised
              onClick={(e) => {
                sendLOCRequest("init");
                e.stopPropagation();
              }}
            />
            <Button
              label="AUTO INIT"
              size="small"
              severity="secondary"
              text
              raised
              onClick={(e) => {
                sendLOCRequest("autoinit");
                e.stopPropagation();
              }}
            />
            <Button
              label="LOC START"
              size="small"
              severity="secondary"
              text
              raised
              onClick={(e) => {
                sendLOCRequest("start");
                e.stopPropagation();
              }}
            />
            <Button
              label="LOC STOP"
              size="small"
              severity="secondary"
              text
              raised
              onClick={(e) => {
                sendLOCRequest("stop");
                e.stopPropagation();
              }}
            />
          </ButtonGroup>
        </Card>
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
