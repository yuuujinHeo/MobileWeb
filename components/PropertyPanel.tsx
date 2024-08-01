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
import { Dropdown } from "primereact/dropdown";
import { Divider } from "primereact/divider";

import { CANVAS_ACTION, NODE_TYPE } from "@/constants";

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
  const { createHelper, selectedObjectInfo } = useSelector(
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
      setDisplayInfo({
        name: selectedObjectInfo.name,
        x: selectedObjectInfo.pose.split(",")[0],
        y: selectedObjectInfo.pose.split(",")[1],
        z: selectedObjectInfo.pose.split(",")[2],
        rz: selectedObjectInfo.pose.split(",")[5],
      });
    }
  }, [selectedObjectInfo]);

  const sendLOCRequest = async (command: string) => {
    try {
      const r2d = (Number(createHelper.rz) * (180 / Math.PI)).toString();
      const payload: LocReqPayload = {
        time: getCurrentTime(),
        command: command,
        x: createHelper.x,
        y: createHelper.y,
        z: createHelper.z,
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
            command: CANVAS_ACTION.SAVE_ANNOTATION,
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
          <InputText
            id="filename"
            placeholder="File name"
            onChange={(e) => {
              filenameRef.current = e.target.value;
            }}
          />
        </div>
      ),
      header: "Save",
      icon: "pi pi-save",
      accept,
      reject,
    });
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

  return (
    <Panel>
      <TabView>
        {/* TODO General Scene Info */}
        <TabPanel header="Information" leftIcon="pi pi-info-circle">
          {selectedObjectInfo.name && (
            <>
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
            </>
          )}
        </TabPanel>
        <TabPanel header="Control" leftIcon="pi pi-arrows-alt">
          <Accordion multiple activeIndex={[0]}>
            <AccordionTab header="Localization">
              <div id="loc-container">
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
          </Accordion>
        </TabPanel>
        {/* <TabPanel header="Localization" leftIcon="pi pi-compass"></TabPanel> */}
        <TabPanel header="Edit" leftIcon="pi pi-map-marker">
          <Accordion multiple activeIndex={[0]}>
            <AccordionTab header="Annotation">
              <div id="annotation-container">
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
                  label="Save"
                  size="small"
                  severity="secondary"
                  text
                  raised
                  onClick={() => {
                    saveAnnotation();
                  }}
                />
                <Button
                  label="Add Link"
                  size="small"
                  severity="secondary"
                  text
                  raised
                  onClick={() => {
                    dispatch(createAction({ command: CANVAS_ACTION.ADD_LINK }));
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
