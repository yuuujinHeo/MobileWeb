"use clinet";

import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toggleLocalization } from "@/store/canvasSlice";

import { Panel } from "primereact/panel";
import { SelectButton } from "primereact/selectbutton";
import { ButtonGroup } from "primereact/buttongroup";
import { Button } from "primereact/button";

import axios from "axios";

interface LocReqPayload {
  time: string;
  command: string;
  x?: string;
  y?: string;
  z?: string;
  rz?: string;
}

export default function PropertyPanel() {
  const dispatch = useDispatch();

  // root state
  const selectedPanel = useSelector(
    (state: RootState) => state.propertyPanel.selectedPanel
  );
  const initData = useSelector((state: RootState) => state.canvas.initData);

  // state
  const [selectBtn, setSelectBtn] = useState<string>("Off");

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

  const panelContents = {
    localization: (
      <div id="loc-container">
        <div id="switch-container">
          <span>Marker</span>
          <SelectButton
            value={selectBtn}
            options={["On", "Off"]}
            onChange={(e) => {
              if (e.value !== null) {
                setSelectBtn(e.value);
              }
              const command: string = e.value;
              dispatch(toggleLocalization({ command: command }));
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
    annotation: <div>annotation default</div>,
  };

  return <Panel header={selectedPanel}>{panelContents[selectedPanel]}</Panel>;
}
