"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
// redux
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { createAction, toggleMarkingMode } from "@/store/canvasSlice";

// prime
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Tooltip } from "primereact/tooltip";
import { Menubar } from "primereact/menubar";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";

import UtilityPanel from "@/components/UtilityPanel";
import PropertyPanel from "@/components/PropertyPanel";

import { CANVAS_CLASSES, CANVAS_ACTION } from "@/constants";

import axios from "axios";

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
  const { transformControlMode } = useSelector(
    (state: RootState) => state.canvas
  );
  // state
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [mapList, setMapList] = useState([]);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const [cloudData, setCloudData] = useState<string[][] | null>(null);
  const [topoData, setTopoData] = useState<UserData[] | null>(null);

  const [isMarkingMode, setIsMarkingMode] = useState<boolean>(false);

  const fileNameRef = useRef<string | null>(null);
  const toast = useRef<Toast>(null);

  const url = process.env.NEXT_PUBLIC_WEB_API_URL;

  const menuItems = [
    {
      label: "File",
      icon: "pi pi-folder",
      items: [
        {
          label: "Open",
          icon: "pi pi-download",
          command: () => {
            setIsDialogVisible(true);
            getMapList();
          },
        },
        {
          label: "Save",
          icon: "pi pi-save",
          command: () => {
            saveMap();
          },
        },
      ],
    },
    {
      label: "Mapping",
      icon: "pi pi-map",
      command: () => {
        setIsSidebarVisible(true);
      },
    },
  ];

  const saveMap = () => {
    if (fileNameRef.current === null) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Save failed. No files selected.",
      });
    } else {
      dispatch(
        createAction({
          command: CANVAS_ACTION.SAVE_MAP,
          value: fileNameRef.current,
        })
      );
    }
  };

  const handleMarkingModeChange = (isMarkingMode: boolean) => {
    setIsMarkingMode(isMarkingMode);
    dispatch(toggleMarkingMode({ isMarkingMode: isMarkingMode }));
  };

  const end = (
    <div id="switch-container">
      <i className="pi pi-map-marker "></i>
      <div>Marker</div>
      <InputSwitch
        checked={isMarkingMode}
        onChange={(e) => handleMarkingModeChange(e.value)}
      ></InputSwitch>
      <Tooltip target=".marking-mode" />
    </div>
  );

  useEffect(() => {
    handleTransformModeChange(transformControlMode);
  }, [transformControlMode]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    getMapList();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (selectedMap) {
      getMapData(selectedMap.name);
      getTopoData(selectedMap.name);
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
        createAction({
          command: CANVAS_ACTION.DRAW_CLOUD,
          target: CANVAS_CLASSES.PREVIEW,
        })
      );
    } catch (e) {
      console.error(e);
    }
  };

  const getTopoData = async (name: string) => {
    try {
      const res = await axios.get(url + `/map/topo/${name}`);
      setTopoData(res.data);
    } catch (e) {
      setTopoData(null);
      console.error("Failed to get topo data...", e);
    }
  };

  const handleSelectMap = (e) => {
    setSelectedMap(e.value as MapData);
    fileNameRef.current = e.value.name;
  };

  const handleLoadMap = () => {
    // Draw cloud points to lidar canvas
    dispatch(createAction({ command: CANVAS_ACTION.DRAW_CLOUD_TOPO }));
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

  const handleTransformModeChange = (selectedBtn: string) => {
    const buttons = document.querySelectorAll("#transform-toolbar button");
    buttons.forEach((button) => {
      button.classList.remove("selected");
    });

    const button = document.querySelector(
      `.transform-toolbar__${selectedBtn}_button`
    );
    button?.classList.add("selected");
    dispatch(
      createAction({ command: CANVAS_ACTION.TFC_SET_MODE, name: selectedBtn })
    );
  };

  return (
    <div id="map">
      <Toast ref={toast} />
      <div style={{ position: "absolute" }}>
        <Menubar model={menuItems} end={end} />
      </div>
      <div id="transform-toolbar">
        <button
          className="transform-toolbar__translate_button selected"
          onClick={() => {
            handleTransformModeChange("translate");
          }}
        >
          <img title="Translate" src="translate.svg" />
        </button>
        <button
          className="transform-toolbar__rotate_button"
          onClick={() => {
            handleTransformModeChange("rotate");
          }}
        >
          <img title="Rotate" src="rotate.svg" />
        </button>
        <button
          className="transform-toolbar__scale_button"
          onClick={() => {
            handleTransformModeChange("scale");
          }}
        >
          <img title="Scale" src="scale.svg" />
        </button>
      </div>
      <LidarCanvas
        className={CANVAS_CLASSES.DEFAULT}
        cloudData={cloudData}
        topoData={topoData}
      />
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
              className={CANVAS_CLASSES.PREVIEW}
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
          <LidarCanvas className="canvas-mapping" />
          <Joystick />
        </div>
      </Sidebar>
    </div>
  );
};

export default Map;
