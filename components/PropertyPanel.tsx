"use clinet";

import { useState, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toggleMarkingMode, createAction } from "@/store/canvasSlice";

import { Panel } from "primereact/panel";
import { Toast } from "primereact/toast";
import { SelectButton } from "primereact/selectbutton";
import { ButtonGroup } from "primereact/buttongroup";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";

import axios from "axios";

interface LocReqPayload {
  time: string;
  command: string;
  x?: string;
  y?: string;
  z?: string;
  rz?: string;
}

type Severity = "success" | "info" | "warn" | "error";

export default function PropertyPanel() {
  const dispatch = useDispatch();

  // root state
  const selectedPanel = useSelector(
    (state: RootState) => state.propertyPanel.selectedPanel
  );
  const initData = useSelector((state: RootState) => state.canvas.initData);

  // state
  const [selectBtn, setSelectBtn] = useState<string>("Off");

  const toast = useRef<Toast>(null);
  const filenameRef = useRef<string>("");

  const url = process.env.NEXT_PUBLIC_WEB_API_URL;

  const sendLOCRequest = async (command: string) => {
    try {
      const r2d = (Number(initData.rz) * (180 / Math.PI)).toString();
      const payload: LocReqPayload = {
        time: getCurrentTime(),
        command: command,
        x: initData.x,
        y: initData.y,
        z: initData.z,
        rz: r2d,
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

  const showToast = (severity: Severity, summary: string, detail: string) => {
    toast.current?.show({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 3000,
    });
  };
  const saveAnnotation = () => {
    // dialog for save button
    const accept = async () => {
      try {
        dispatch(
          createAction({
            command: "SAVE_ANNOTATION",
            name: filenameRef.current,
          })
        );
        showToast("info", "Save", "Save succeed");
      } catch (e) {
        showToast("error", "Error", `Save failed: ${e.message}`);
      }
    };

    const reject = () => {
      showToast("warn", "Rejected", "You have rejected");
    };

    confirmDialog({
      message: (
        <div>
          <FloatLabel>
            <InputText
              id="filename"
              onChange={(e) => {
                filenameRef.current = e.target.value;
              }}
            />
            <label htmlFor="filename">Filename</label>
          </FloatLabel>
        </div>
      ),
      header: "Save",
      icon: "pi pi-save",
      accept,
      reject,
    });
  };

  const panelContents = {
    localization: (
      <div id="loc-container">
        <div id="switch-container">
          <span>Marking Mode</span>
          <SelectButton
            value={selectBtn}
            options={["On", "Off"]}
            onChange={(e) => {
              if (e.value !== null) {
                setSelectBtn(e.value);
                let isMarkingMode: boolean = false;
                if (e.value === "On") isMarkingMode = true;
                else if (e.value === "Off") isMarkingMode = false;
                dispatch(toggleMarkingMode({ isMarkingMode: isMarkingMode }));
              }
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
      </div>
    ),
    annotation: (
      <div id="annotation-container">
        <ConfirmDialog />
        <Toast ref={toast} />
        <div id="switch-container">
          <span>Marking Mode</span>
          <SelectButton
            value={selectBtn}
            options={["On", "Off"]}
            onChange={(e) => {
              if (e.value !== null) {
                setSelectBtn(e.value);
                let isMarkingMode: boolean = false;
                if (e.value === "On") isMarkingMode = true;
                else if (e.value === "Off") isMarkingMode = false;
                dispatch(toggleMarkingMode({ isMarkingMode: isMarkingMode }));
              }
            }}
          />
        </div>
        <Button
          label="Add Route"
          size="small"
          severity="secondary"
          text
          raised
          onClick={() => {
            dispatch(createAction({ command: "ADD_NODE", category: "ROUTE" }));
          }}
        />
        <Button
          label="Add Goal"
          size="small"
          severity="secondary"
          text
          raised
          onClick={() => {
            dispatch(createAction({ command: "ADD_NODE", category: "GOAL" }));
          }}
        />
        <Button
          label="Save"
          size="small"
          severity="secondary"
          text
          raised
          onClick={() => {
            saveAnnotation();
          }}
        />
      </div>
    ),
  };

  return <Panel header={selectedPanel}>{panelContents[selectedPanel]}</Panel>;
}
