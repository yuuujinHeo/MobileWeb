"use clinet";

import { useState, useRef, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { createAction } from "@/store/canvasSlice";

import { TabView } from "primereact/tabview";
import { TabPanel } from "primereact/tabview";
import { Panel } from "primereact/panel";
import { Toast } from "primereact/toast";
import { Accordion } from "primereact/accordion";
import { AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Divider } from "primereact/divider";
import { Slider } from "primereact/slider";

import { CANVAS_ACTION, NODE_TYPE, SCALE_FACTOR } from "@/constants";

import axios from "axios";

interface LocReqPayload {
  time: string;
  command: string;
  x?: string;
  y?: string;
  z?: string;
  rz?: string;
}

interface DisplayInfo {
  id: string;
  name: string;
  links: [];
  pose: string;
  type: string;
  info: string;
}

type Severity = "success" | "info" | "warn" | "error";

export default function PropertyPanel() {
  const dispatch = useDispatch();

  // root state
  const { sceneInfo, robotHelper, selectedObjectInfo } = useSelector(
    (state: RootState) => state.canvas
  );
  // state
  const [displayInfo, setDisplayInfo] = useState({
    name: "",
    x: "0",
    y: "0",
    z: "0",
    rz: "0",
  });

  const [targetX, setTargetX] = useState<number>(0);
  const [targetY, setTargetY] = useState<number>(0);
  const [targetRZ, setTargetRZ] = useState<number>(0);
  const [goalID, setGoalID] = useState("");

  const [targetPreset, setTargetPreset] = useState<number>(3);
  const [goalPreset, setGoalPreset] = useState<number>(3);

  const toast = useRef<Toast>(null);
  const filenameRef = useRef<string>("");

  const url = process.env.NEXT_PUBLIC_WEB_API_URL;

  const [selectedType, setSelectedType] = useState<string>("");
  const nodeTypes = [
    { name: NODE_TYPE.GOAL, code: "G" },
    { name: NODE_TYPE.ROUTE, code: "R" },
  ];

  useEffect(() => {
    if (selectedObjectInfo && selectedObjectInfo.pose) {
      const { x, y, z } = getParsedPose(selectedObjectInfo.pose);
      setDisplayInfo({
        name: selectedObjectInfo.name,
        x: x,
        y: y,
        z: z,
        rz: selectedObjectInfo.pose.split(",")[5],
      });
    }
  }, [selectedObjectInfo]);

  const getParsedPose = (pose: string) => {
    const x = (Number(pose.split(",")[0]) / SCALE_FACTOR)
      .toString()
      .slice(0, 6);
    const y = (Number(pose.split(",")[1]) / SCALE_FACTOR)
      .toString()
      .slice(0, 6);
    const z = (Number(pose.split(",")[2]) / SCALE_FACTOR)
      .toString()
      .slice(0, 6);
    const parsedPose = {
      x: x,
      y: y,
      z: z,
    };
    return parsedPose;
  };

  const sendLOCRequest = async (command: string) => {
    try {
      const r2d = (Number(robotHelper.rz) * (180 / Math.PI)).toString();
      // [TEMP]
      const scaledX = Number(robotHelper.x) / SCALE_FACTOR;
      const scaledY = Number(robotHelper.y) / SCALE_FACTOR;
      const scaledZ = Number(robotHelper.z) / SCALE_FACTOR;
      const payload: LocReqPayload = {
        time: getCurrentTime(),
        command: command,
        x: scaledX.toString(),
        y: scaledY.toString(),
        z: scaledZ.toString(),
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

  const deleteNode = () => {
    dispatch(
      createAction({
        command: CANVAS_ACTION.DELETE_NODE,
      })
    );
  };

  const handleInputChange = (input: string, target: string) => {
    const updatedInfo = { ...displayInfo, [target]: input };
    setDisplayInfo(updatedInfo);

    let isInputValidate: boolean = false;
    isInputValidate =
      target === "name"
        ? getIsStrInputValidate(input)
        : getIsNumInputValidate(input);
    if (isInputValidate) {
      dispatch(
        createAction({
          command: CANVAS_ACTION.UPDATE_PROPERTY,
          category: target === "name" ? target : `pose-${target}`,
          value: input,
        })
      );
    }
  };
  const getIsStrInputValidate = (input: string) => {
    if (
      input === "" ||
      input.endsWith(".") ||
      input.endsWith(" " || input.includes(" "))
    )
      return false;
    return true;
  };

  const getIsNumInputValidate = (input: string) => {
    // Do not dispatch when the input value is "" or ends with "."
    // This allows InputText to display a value such as "" or "1."
    if (input === "" || input.endsWith(".")) return false;
    return !isNaN(Number(input));
  };

  async function requestMove(command: string) {
    try {
      const currentTime = getCurrentTime();
      let requestBody = {
        command: command,
        time: currentTime,
      };
      if (command === "goal") {
        requestBody["id"] = goalID;
        requestBody["preset"] = goalPreset;
        requestBody["method"] = "pp";
      } else if (command === "target") {
        requestBody["x"] = targetX;
        requestBody["y"] = targetY;
        requestBody["z"] = 0;
        requestBody["rz"] = targetRZ;
        requestBody["preset"] = targetPreset;
        requestBody["method"] = "pp";
      }
      const requestJson = JSON.stringify(requestBody);

      const response = await axios.post(url + "/control/move", requestJson, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.result == "accept") {
        toast.current?.show({
          severity: "success",
          summary: "Move Start",
          life: 3000,
        });

        const response = await axios.get(url + "/control/move");

        if (response.data.result == "success") {
          toast.current?.show({
            severity: "success",
            summary: "Move Done",
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
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Move Failed",
          detail: response.data.message,
          life: 3000,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const getTargetFromRobotHelper = () => {
    setTargetX(Number(robotHelper.x) / SCALE_FACTOR);
    setTargetY(Number(robotHelper.y) / SCALE_FACTOR);
    setTargetRZ(Number(robotHelper.rz) * (180 / Math.PI));
  };

  async function movePause() {
    try {
      const currentTime = getCurrentTime();
      const json = JSON.stringify({ command: "pause", time: currentTime });
      const response = await axios.post(url + "/control/move", json, {
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
    } catch (e) {
      console.error(e);
    }
  }

  async function moveResume() {
    try {
      const currentTime = getCurrentTime();
      const json = JSON.stringify({ command: "resume", time: currentTime });
      const response = await axios.post(url + "/control/move", json, {
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
    } catch (e) {
      console.error(e);
    }
  }

  async function moveStop() {
    try {
      const currentTime = getCurrentTime();
      const json = JSON.stringify({ command: "stop", time: currentTime });
      const response = await axios.post(url + "/control/move", json, {
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
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Panel>
      <TabView>
        {/* TODO General Scene Info */}
        <TabPanel header="Information" leftIcon="pi pi-info-circle">
          {/* TODO */}

          <h5>Scene Info</h5>
          <div id="scene-info-container">
            <p>{sceneInfo.goalNum} Goal Nodes</p>
            <p>{sceneInfo.routeNum} Route Nodes</p>
          </div>
          {selectedObjectInfo.name && (
            <div id="selected-container">
              <Divider />
              <h5>{selectedObjectInfo.name}</h5>
              <Accordion multiple activeIndex={[0]}>
                <AccordionTab header="Data">
                  <div className="accordion-item">
                    ID
                    <InputText
                      value={selectedObjectInfo.id}
                      className="p-inputtext-sm"
                    />
                  </div>
                  <div className="accordion-item">
                    NAME
                    <InputText
                      value={displayInfo.name}
                      className="p-inputtext-sm"
                      onChange={(e) => {
                        handleInputChange(e.target.value, "name");
                      }}
                    />
                  </div>
                  <div className="accordion-item">
                    Type
                    <Dropdown
                      value={selectedType}
                      onChange={(e) => {
                        setSelectedType(e.value.name);
                        dispatch(
                          createAction({
                            command: CANVAS_ACTION.UPDATE_PROPERTY,
                            category: "type",
                            value: e.value.name,
                          })
                        );
                      }}
                      options={nodeTypes}
                      optionLabel="name"
                      placeholder={selectedObjectInfo.type}
                    />
                  </div>
                  <div className="accordion-item">
                    Links{" "}
                    {selectedObjectInfo.links.map((link, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          padding: "0.5rem",
                        }}
                      >
                        <p style={{ textAlign: "center", margin: 0 }}>{link}</p>
                        <i
                          className="pi pi-times"
                          style={{ cursor: "pointer", marginLeft: "5px" }}
                          onClick={() => {
                            dispatch(
                              createAction({
                                command: CANVAS_ACTION.REMOVE_LINK,
                                target: selectedObjectInfo.id,
                                value: link,
                              })
                            );
                          }}
                        ></i>
                      </div>
                    ))}
                  </div>
                  <div className="accordion-item">
                    Info{" "}
                    <InputText
                      value={selectedObjectInfo.info}
                      className="p-inputtext-sm"
                      onChange={(e) => {
                        dispatch(
                          createAction({
                            command: CANVAS_ACTION.UPDATE_PROPERTY,
                            category: "info",
                            value: e.target.value,
                          })
                        );
                      }}
                    />
                  </div>
                </AccordionTab>
                <Divider />
                <AccordionTab header="Transformation">
                  <p style={{ fontWeight: "bold" }}>Position</p>
                  <div className="accordion-item">
                    X
                    <InputText
                      value={displayInfo.x}
                      className="p-inputtext-sm"
                      keyfilter={"num"}
                      onChange={(e) => {
                        handleInputChange(e.target.value, "x");
                      }}
                    />
                  </div>

                  <div className="accordion-item">
                    Y{" "}
                    <InputText
                      value={displayInfo.y}
                      className="p-inputtext-sm"
                      keyfilter={"num"}
                      onChange={(e) => {
                        handleInputChange(e.target.value, "y");
                      }}
                    />
                  </div>
                  <div className="accordion-item">
                    Z{" "}
                    <InputText
                      value={displayInfo.z}
                      className="p-inputtext-sm"
                      keyfilter={"num"}
                      disabled
                      onChange={(e) => {
                        handleInputChange(e.target.value, "z");
                      }}
                    />
                  </div>
                  <p style={{ fontWeight: "bold" }}>Rotation</p>
                  <div className="accordion-item">
                    RZ{" "}
                    <InputText
                      value={displayInfo.rz}
                      className="p-inputtext-sm"
                      keyfilter={"num"}
                      onChange={(e) => {
                        handleInputChange(e.target.value, "rz");
                      }}
                    />
                  </div>
                </AccordionTab>
              </Accordion>
              <Button
                className="node-delete-button"
                label="Delete Node"
                size="small"
                severity="danger"
                rounded
                onClick={deleteNode}
              />
            </div>
          )}
        </TabPanel>
        <TabPanel header="Control" leftIcon="pi pi-arrows-alt">
          <Accordion multiple activeIndex={[0]}>
            <AccordionTab header="Localization">
              <div className="button-container">
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
                {/* <Button */}
                {/*   label="AUTO INIT" */}
                {/*   size="small" */}
                {/*   severity="secondary" */}
                {/*   text */}
                {/*   raised */}
                {/*   onClick={(e) => { */}
                {/*     sendLOCRequest("autoinit"); */}
                {/*     e.stopPropagation(); */}
                {/*   }} */}
                {/* /> */}
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
              </div>
            </AccordionTab>
            <AccordionTab header="Move">
              <h5>Target Move</h5>
              <div className="accordion-item">
                X
                <InputNumber
                  className="p-inputtext-sm"
                  value={targetX}
                  minFractionDigits={2}
                  maxFractionDigits={5}
                  onChange={(e) => {
                    setTargetX(e.value as number);
                  }}
                />
              </div>
              <div className="accordion-item">
                Y
                <InputNumber
                  className="p-inputtext-sm"
                  value={targetY}
                  minFractionDigits={2}
                  maxFractionDigits={5}
                  onChange={(e) => {
                    setTargetY(e.value as number);
                  }}
                />
              </div>
              <div className="accordion-item">
                RZ
                <InputNumber
                  className="p-inputtext-sm"
                  value={targetRZ}
                  minFractionDigits={2}
                  maxFractionDigits={5}
                  onChange={(e) => {
                    setTargetRZ(e.value as number);
                  }}
                />
              </div>
              <div className="accordion-item ">
                Preset
                <div>
                  <InputNumber value={targetPreset} readOnly></InputNumber>
                  <Slider
                    value={targetPreset}
                    min={0}
                    max={5}
                    step={1}
                    onChange={(e) => setTargetPreset(e.value as number)}
                  ></Slider>
                </div>
              </div>
              <Button
                label="Get target from marker"
                className="w-full move-button__goal"
                onClick={getTargetFromRobotHelper}
              />
              <Button
                label="GO"
                icon="pi pi-play"
                className="w-full move-button__goal"
                onClick={() => {
                  requestMove("target");
                }}
              />
              <Divider />
              <h5>Goal Move</h5>
              <div className="accordion-item">
                Goal
                <InputText
                  // value={selectedObjectInfo.id}
                  value={goalID}
                  onChange={(e) => setGoalID(e.target.value)}
                  className="p-inputtext-sm"
                />
              </div>
              <div className="accordion-item ">
                Preset
                <div>
                  <InputNumber value={goalPreset} readOnly></InputNumber>
                  <Slider
                    value={goalPreset}
                    min={0}
                    max={5}
                    step={1}
                    onChange={(e) => setGoalPreset(e.value as number)}
                  ></Slider>
                </div>
              </div>
              <Button
                label="GO"
                icon="pi pi-play"
                className="w-full move-button__goal"
                onClick={() => {
                  requestMove("goal");
                }}
              />
              <Divider />
              <h5>Command</h5>
              <Button
                label="PAUSE"
                icon="pi pi-pause"
                className="w-full move-button__goal"
                onClick={movePause}
              />
              <Button
                label="RESUME"
                icon="pi pi-reply"
                className="w-full move-button__goal"
                onClick={moveResume}
              />
              <Button
                label="STOP"
                icon="pi pi-stop"
                severity="danger"
                className="w-full move-button__goal"
                onClick={moveStop}
              />
            </AccordionTab>
          </Accordion>
        </TabPanel>
        <TabPanel header="Edit" leftIcon="pi pi-map-marker">
          <Accordion multiple activeIndex={[0]}>
            <AccordionTab header="Annotation">
              <div className="button-container">
                <ConfirmDialog />
                <Toast ref={toast} />
                <Button
                  label="Add Route"
                  size="small"
                  severity="secondary"
                  text
                  raised
                  onClick={() => {
                    dispatch(
                      createAction({
                        command: CANVAS_ACTION.ADD_NODE,
                        category: NODE_TYPE.ROUTE,
                      })
                    );
                  }}
                />
                <Button
                  label="Add Goal"
                  size="small"
                  severity="secondary"
                  text
                  raised
                  onClick={() => {
                    dispatch(
                      createAction({
                        command: CANVAS_ACTION.ADD_NODE,
                        category: NODE_TYPE.GOAL,
                      })
                    );
                  }}
                />
                <Button
                  label="Link Nodes(one way)"
                  size="small"
                  severity="secondary"
                  text
                  raised
                  onClick={() => {
                    dispatch(createAction({ command: CANVAS_ACTION.ADD_LINK }));
                  }}
                />
                <Button
                  label="Link Nodes(round trip)"
                  size="small"
                  severity="secondary"
                  text
                  raised
                  onClick={() => {
                    dispatch(
                      createAction({
                        command: CANVAS_ACTION.ADD_BIDIRECTIONAL_LINK,
                      })
                    );
                  }}
                />
              </div>
            </AccordionTab>
            <AccordionTab header="Tools">
              <Button
                label="Eraser"
                size="small"
                severity="secondary"
                text
                raised
                onClick={() => {
                  // TODO
                  document.body.classList.toggle("eraser-cursor");
                }}
              />
            </AccordionTab>
          </Accordion>
        </TabPanel>
      </TabView>
    </Panel>
  );
}
