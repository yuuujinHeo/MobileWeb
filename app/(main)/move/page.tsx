"use client";
import React, { useEffect, useContext, useRef, useState } from "react";
// import { useRouter } from 'next/router';
import { SplitButton } from "primereact/splitbutton";
import { Button } from "primereact/button";
import axios from "axios";
import { Formik, useFormik, Form, Field, FormikProps } from "formik";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Knob } from "primereact/knob";
import { ListBox } from "primereact/listbox";
import { MultiSelect } from "primereact/multiselect";
import { RadioButton } from "primereact/radiobutton";
import { Rating } from "primereact/rating";
import { Panel } from "primereact/panel";
import { DataView } from "primereact/dataview";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import { SelectButton } from "primereact/selectbutton";
import { Tree, TreeDragDropEvent } from "primereact/tree";
import { TreeTable } from "primereact/treetable";
import { Slider, SliderChangeEvent } from "primereact/slider";
import { Accordion, AccordionTab } from "primereact/accordion";
import { ToggleButton } from "primereact/togglebutton";
import styles from "./index.module.scss";
import { classNames } from "primereact/utils";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import fs from "fs";
import { Dialog } from "primereact/dialog";
import PopupGoal from "./popupgoal";
// import { ListBox } from 'primereact/listbox';
import {
  FileUpload,
  FileUploadState,
  FileUploadHandlerEvent,
  FileUploadSelectEvent,
  FileUploadUploadEvent,
} from "primereact/fileupload";
import { forEachChild } from "typescript";
import { encode } from "punycode";
import { userContext } from "../../../interface/user";
// import { selectMonitor } from '@/store/networkSlice';
import {
  version,
  defaultVersion,
  newversion,
  defaultNewVersion,
  versions,
  defaultNewVersions,
  defaultVersions,
} from "../../../interface/update";
import { start } from "repl";
import { useDispatch, useSelector } from "react-redux";
import { store, AppDispatch, RootState } from "../../../store/store";
// import ChartTemp from '@/components/Chart'
import { OverlayPanel } from "primereact/overlaypanel";
import { selectUser, setUser } from "@/store/userSlice";
import { selectStatus } from "@/store/statusSlice";
import { io } from "socket.io-client";
import {
  selectSetting,
  setRobot,
  setDebug,
  setLoc,
  setControl,
  setAnnotation,
  setDefault,
  setMotor,
  setMapping,
  setObs,
  MotorSetting,
} from "@/store/settingSlice";
import { getMobileAPIURL } from "../api/url";
import "./style.scss";
import { transStatus } from "../api/to";
import { StatusState } from "@/store/statusSlice";
import { shallowEqual, useStore } from "react-redux";


const Move: React.FC = () => {
  //**************************************Redux
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();
  const Status = useSelector((state: RootState) => state.status);
  const Network = useSelector((state:RootState) => state.network);
  const Connection = useSelector((state:RootState) => state.connection);

  //**************************************Ref
  const toast = useRef<Toast | null>(null);

  //**************************************State
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);
  const [targetRZ, setTargetRZ] = useState(0);
  const [goalID, setGoalID] = useState("");
  const [preset, setPreset] = useState<number>(3);
  const [goals, setGoals] = useState<string[]>([]);

  const [goalVisible, setGoalVisible] = useState(false);

  async function moveTarget() {
    console.log("moveTarget");

    const currentTime = new Date()
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");
    const json = JSON.stringify({
      command: "target",
      x: targetX,
      y: targetY,
      z: 0,
      rz: targetRZ,
      preset: preset,
      method: "pp",
      time: currentTime,
    });

    console.log("PUSH", targetRZ);

    const response = await axios.post(Network?.mobile + "/control/move", json, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("response : ", response);

    if (response.data.result == "accept") {
      toast.current?.show({
        severity: "success",
        summary: "Move Start",
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Move Failed",
        detail: response.data.message,
        life: 3000,
      });
    }
  }

  const openGoalList = () => {
    getGoals();
    setGoalVisible(true);
  };

  const getGoals = async () => {
    try {
      const response = await axios.get(
        Network?.mobile + "/map/goal/" + Status?.state.map
      );
      console.log("getgoals:", response.data);
      setGoals(response.data);
    } catch (e) {
      console.error(e);
    }
  };



  async function moveGoal() {
    console.log("moveGoal");

    const currentTime = new Date()
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");

    const json = JSON.stringify({
      command: "goal",
      id: goalID,
      preset: preset,
      method: "pp",
      time: currentTime,
    });

    const response = await axios.post(Network?.mobile + "/control/move", json, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("response : ", response);

    if (response.data.result == "accept") {
      toast.current?.show({
        severity: "success",
        summary: "Move Start",
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Move Failed",
        detail: response.data.message,
        life: 3000,
      });
    }
  }

  async function movePause() {
    console.log("movePause");

    const currentTime = new Date()
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");

    const json = JSON.stringify({ command: "pause", time: currentTime });
    const response = await axios.post(Network?.mobile + "/control/move", json, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.result == "accept") {
      toast.current?.show({
        severity: "success",
        summary: "Move Paused",
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Move Paused Fail",
        detail: response.data.message,
        life: 3000,
      });
    }
  }

  async function moveResume() {
    console.log("moveResume");

    const currentTime = new Date()
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");

    const json = JSON.stringify({ command: "resume", time: currentTime });
    const response = await axios.post(Network?.mobile + "/control/move", json, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.result == "accept") {
      toast.current?.show({
        severity: "success",
        summary: "Move Resumed",
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Move Resumed Fail",
        detail: response.data.message,
        life: 3000,
      });
    }
  }

  async function moveStop() {
    console.log("movePause");

    const currentTime = new Date()
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");

    const json = JSON.stringify({ command: "stop", time: currentTime });
    const response = await axios.post(Network?.mobile + "/control/move", json, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.result == "accept") {
      toast.current?.show({
        severity: "success",
        summary: "Move Stopped",
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Move Stopped Fail",
        detail: response.data.message,
        life: 3000,
      });
    }
  }

  return (
    <main>
      <Toast ref={toast}></Toast>
      <PopupGoal 
        goalVisible={goalVisible}
        goals={goals}
        setGoalID={setGoalID}
        setGoalVisible={setGoalVisible}
      />
      <div className="card">
        <h5 className="font-bold">Move State</h5>
        <div className="card p-fluid">
          <div className="field grid gap-5">
            <label
              htmlFor="name3"
              className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0"
            >
              auto_state
            </label>
            <div className="col-12 w-8 md:col-10">
              <SelectButton
                value={Status?.condition.auto_state}
                readOnly
                options={[
                  { label: "Stop", value: "stop" },
                  { label: "Move", value: "move" },
                  { label: "Pause", value: "pause" },
                ]}
              >
                {" "}
              </SelectButton>
            </div>
          </div>
          <div className="field grid gap-5">
            <label
              htmlFor="name3"
              className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0"
            >
              obs_state
            </label>
            <div className="col-12 w-8  md:col-10">
              <SelectButton
                value={Status?.condition.obs_state}
                readOnly
                options={[
                  { label: "None", value: "none" },
                  { label: "Far", value: "far" },
                  { label: "Near", value: "near" },
                  { label: "Stuck", value: "stuck" },
                  { label: "Eband", value: "eband" },
                ]}
              >
                {" "}
              </SelectButton>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="card p-fluid">
              <h5 className="font-bold">Target Move</h5>
              <div className="field grid gap-5">
                <label
                  htmlFor="name3"
                  className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0"
                >
                  X
                </label>
                <div className="col-12 w-8 md:col-10">
                  <InputNumber
                    value={targetX}
                    onValueChange={(e) => setTargetX(e.value as number)}
                    minFractionDigits={3}
                  ></InputNumber>
                </div>
              </div>

              <div className="field grid gap-5">
                <label
                  htmlFor="name3"
                  className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0"
                >
                  Y
                </label>
                <div className="col-12 w-8 md:col-10">
                  <InputNumber
                    value={targetY}
                    onValueChange={(e) => setTargetY(e.value as number)}
                    minFractionDigits={3}
                  ></InputNumber>
                </div>
              </div>
              <div className="field grid gap-5">
                <label
                  htmlFor="name3"
                  className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0"
                >
                  RZ
                </label>
                <div className="col-12 w-8 md:col-10">
                  <InputNumber
                    value={targetRZ}
                    onValueChange={(e) => setTargetRZ(e.value as number)}
                    minFractionDigits={3}
                  ></InputNumber>
                </div>
              </div>
              <div className="field grid gap-5">
                <label
                  htmlFor="name3"
                  className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0"
                >
                  PRESET
                </label>
                <div className="col-12 w-8 md:col-10">
                  <InputNumber value={preset} readOnly className="w-full" />
                  <Slider
                    value={preset}
                    min={0}
                    max={5}
                    onChange={(e: SliderChangeEvent) =>
                      setPreset(e.value as number)
                    }
                    step={1}
                  ></Slider>
                </div>
              </div>
              <Button onClick={moveTarget}>GO</Button>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="card ">
              <h5 className="font-bold">Goal Move</h5>
              <div className="field grid gap-5">
                <label
                  htmlFor="name3"
                  className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0"
                >
                  GOAL
                </label>
                <div className="col-12 w-8 md:col-10">
                  <div className="grid gap-3">
                    <InputText
                      value={goalID}
                      onChange={(e) => setGoalID(e.target.value)}
                    ></InputText>
                    <Button label="list" disabled={Status?.state.map==""} onClick={openGoalList}></Button>
                  </div>
                </div>
              </div>
              <div className="field grid p-fluid gap-5">
                <label
                  htmlFor="name3"
                  className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0"
                >
                  PRESET
                </label>
                <div className="col-12 w-8 md:col-10">
                  <InputNumber value={preset} readOnly className="w-full" />
                  <Slider
                    value={preset}
                    min={0}
                    max={5}
                    onChange={(e: SliderChangeEvent) =>
                      setPreset(e.value as number)
                    }
                    step={1}
                  ></Slider>
                </div>
              </div>
              <Button className="w-full" disabled={goalID==""} onClick={moveGoal}>
                GO
              </Button>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="card">
              <h5 className="font-bold">Command</h5>
              <div className="field grid gap-5">
                <Button onClick={movePause}>Pause</Button>
                <Button onClick={moveResume}>Resume</Button>
                <Button onClick={moveStop}>Stop</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Move;

