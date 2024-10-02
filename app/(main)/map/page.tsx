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
import { InputSwitch, InputSwitchChangeEvent } from "primereact/inputswitch";
import { Toast } from "primereact/toast";

import UtilityPanel from "@/components/UtilityPanel";
import PropertyPanel from "@/components/PropertyPanel";

import {
  CANVAS_CLASSES,
  CANVAS_ACTION,
  NODE_TYPE,
  CANVAS_OBJECT,
} from "@/constants";

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
  const { transformControlMode, isMarkingMode } = useSelector(
    (state: RootState) => state.canvas
  );
  const { map } = useSelector(
    (state: RootState) => state.status.state,
    (prev, next) => prev.map === next.map
  );

  // state
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [mapList, setMapList] = useState([]);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const [cloudData, setCloudData] = useState<string[][] | null>(null);
  const [topoData, setTopoData] = useState<UserData[] | null>(null);

  const fileNameRef = useRef<string | null>(null);
  const toast = useRef<Toast>(null);
  const toggleAllStateRef = useRef<boolean>(true);

  const url = process.env.NEXT_PUBLIC_WEB_API_URL;

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
      drawPreview(selectedMap.name);
    }
  }, [selectedMap]);

  useEffect(() => {
    syncCanvasWithSlamNav();
    fileNameRef.current = map;
  }, [map]);

  useEffect(() => {
    handleMarkingModeChange(isMarkingMode);
  }, [isMarkingMode]);

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
      label: "View",
      icon: "pi",
      items: [
        {
          label: "Goal",
          icon: "pi pi-check view-toggle check-goal",
          command: () => {
            handleToggleObject(NODE_TYPE.GOAL);
          },
        },
        {
          label: "Route",
          icon: "pi pi-check view-toggle check-route",
          command: () => {
            handleToggleObject(NODE_TYPE.ROUTE);
          },
        },
        {
          label: "Name",
          icon: "pi pi-check view-toggle check-name",
          command: () => {
            handleToggleObject(CANVAS_OBJECT.NAME);
          },
        },
        {
          label: "Link",
          icon: "pi pi-check view-toggle check-link",
          command: () => {
            handleToggleObject(CANVAS_OBJECT.LINK);
          },
        },
        {
          label: "Robot",
          icon: "pi pi-check view-toggle check-robot",
          command: () => {
            handleToggleObject(CANVAS_OBJECT.ROBOT);
          },
        },
        {
          label: "Origin",
          icon: "pi pi-check view-toggle check-origin",
          command: () => {
            handleToggleObject(CANVAS_OBJECT.ORIGIN);
          },
        },
        {
          label: "All",
          icon: "pi pi-check view-toggle",
          command: () => {
            toggleToggleAll();
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

  const handleToggleObject = (type: string) => {
    const iconClassMap: Record<string, string> = {
      [CANVAS_OBJECT.GOAL]: "check-goal",
      [CANVAS_OBJECT.ROUTE]: "check-route",
      [CANVAS_OBJECT.NAME]: "check-name",
      [CANVAS_OBJECT.LINK]: "check-link",
      [CANVAS_OBJECT.ROBOT]: "check-robot",
      [CANVAS_OBJECT.ORIGIN]: "check-origin",
    };

    const iconClass = iconClassMap[type];

    if (iconClass) {
      const toggleIcon = document.querySelector(`.${iconClass}`);
      toggleIcon?.classList.toggle("pi-check");
    }

    dispatch(
      createAction({ command: CANVAS_ACTION.TOGGLE_OBJECT, target: type })
    );
  };

  const toggleToggleAll = () => {
    const toggleIcons = document.querySelectorAll(".view-toggle");
    toggleAllStateRef.current = !toggleAllStateRef.current;

    toggleIcons.forEach((node) => {
      // check icon handling
      if (toggleAllStateRef.current) {
        node.classList.add("pi-check");
      } else {
        node.classList.remove("pi-check");
      }
    });

    dispatch(
      createAction({
        command: CANVAS_ACTION.TOGGLE_ALL,
        target: CANVAS_OBJECT.ALL,
      })
    );
  };

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
    dispatch(toggleMarkingMode({ isMarkingMode: isMarkingMode }));
  };

  const end = (
    <div id="switch-container">
      <i className="pi pi-map-marker "></i>
      <div>Marker</div>
      <InputSwitch
        checked={isMarkingMode}
        onChange={(e: InputSwitchChangeEvent): void =>
          handleMarkingModeChange(e.value)
        }
      ></InputSwitch>
      <Tooltip target=".marking-mode" />
    </div>
  );

  const getMapList = async () => {
    try {
      const res = await axios.get(url + "/map/list");
      setMapList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const drawPreview = async (name: string) => {
    await getMapData(name);
    dispatch(
      createAction({
        command: CANVAS_ACTION.DRAW_CLOUD,
        target: CANVAS_CLASSES.PREVIEW,
      })
    );
  };

  const getMapData = async (name: string) => {
    try {
      const res = await axios.get(url + `/map/cloud/${name}`);
      setCloudData(res.data);
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

  const handleLoadMap = async () => {
    if (selectedMap === null) return;
    // Draw cloud points to lidar canvas
    await getTopoData(selectedMap.name);
    dispatch(createAction({ command: CANVAS_ACTION.DRAW_CLOUD_TOPO }));
    // Hide dialogue
    setIsDialogVisible(false);

    // Before loading a new map, should send "stop localization" message to SLAMNAV.
    await sendLOCStopMsgToSlam();
    // Send the selected map data to SLAM.
    sendSelectedMapToSLAM();
  };

  const handleDialogHide = () => {
    setIsDialogVisible(false);

    // reset
    setSelectedMap(null);
    setCloudData(null);
  };

  const sendLOCStopMsgToSlam = async () => {
    const currentTime = new Date()
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");
    try {
      const payload = {
        time: currentTime,
        command: "stop",
        x: "0",
        y: "0",
        z: "0",
        rz: "0",
      };

      await axios.post(url + "/localization", payload);
    } catch (e) {
      console.error(e);
    }
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

  const syncCanvasWithSlamNav = async () => {
    if (map !== "" && cloudData === null && topoData === null) {
      await getMapData(map);
      await getTopoData(map);
      dispatch(createAction({ command: CANVAS_ACTION.DRAW_CLOUD_TOPO }));
    }
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
