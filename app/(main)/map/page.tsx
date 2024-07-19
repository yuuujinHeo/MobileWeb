"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
// redux
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { createAction } from "@/store/canvasSlice";
import { selectPanel } from "@/store/propertyPanelSlices";

// prime
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Tooltip } from "primereact/tooltip";

import UtilityPanel from "@/components/UtilityPanel";
import PropertyPanel from "@/components/PropertyPanel";

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

interface UserData {
  id: string;
  name: string;
  pose: string;
  info: string;
  links: string[];
  type: string;
}

const Joystick = dynamic(() => import("@/components/Joystick"), { ssr: false });

const Map: React.FC = () => {
  const dispatch = useDispatch();

  // root state
  const selectedPanel = useSelector(
    (state: RootState) => state.propertyPanel.selectedPanel
  );

  // state
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [mapList, setMapList] = useState([]);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const [cloudData, setCloudData] = useState<string[][] | null>(null);
  const [topoData, setTopoData] = useState<UserData[] | null>(null);

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
      label: "Localization",
      icon: "pi pi-compass",
      command: () => {
        dispatch(selectPanel({ selectedPanel: "localization" }));
      },
    },
    {
      label: "Annotation",
      icon: "pi pi-flag",
      command: () => {
        dispatch(selectPanel({ selectedPanel: "annotation" }));
      },
    },
    {
      label: "Load",
      icon: "pi pi-download",
      command: () => {
        setIsDialogVisible(true);
        getMapList();
      },
    },
  ];

  useEffect(() => {
    getMapList();
  }, []);

  useEffect(() => {
    if (selectedMap) {
      getMapData(selectedMap.name);
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

  const getMapData = async (name: string) => {
    try {
      const res = await axios.get(url + `/map/cloud/${name}`);
      setCloudData(res.data);
      dispatch(
        createAction({ command: "DRAW_CLOUD", target: CANVAS_CLASSES.OVERLAY })
      );

      const topo = await axios.get(url + `/map/topo/${name}`);
      setTopoData(topo.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectMap = (e) => {
    setSelectedMap(e.value as MapData);
  };

  const handleLoadMap = () => {
    // Draw cloud points to lidar canvas
    dispatch(createAction({ command: "DRAW_CLOUD_TOPO" }));
    // Hide dialogue
    setIsDialogVisible(false);

    // Send selected map data to slam
    sendSelectedMapToSLAM();
  };

  const handleDialogHide = () => {
    setIsDialogVisible(false);

    // reset
    setSelectedMap(null);
    setCloudData(null);
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

  return (
    <div id="map">
      <LidarCanvas
        className={CANVAS_CLASSES.DEFAULT}
        cloudData={cloudData}
        topoData={topoData}
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

      <div id="property-container">
        <PropertyPanel />
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
              cloudData={cloudData}
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
