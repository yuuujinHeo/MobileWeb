"use client";

import { useRef } from "react";
import { useDispatch } from "react-redux";
import { handleMapping } from "@/store/canvasSlice";

import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";

import axios from "axios";

type Severity = "success" | "info" | "warn" | "error";

const UtilityPanel = () => {
  const dispatch = useDispatch();
  const filenameRef = useRef<string>("");
  const toast = useRef<Toast>(null);
  const url = process.env.NEXT_PUBLIC_WEB_API_URL;

  // menu items
  const items = [
    {
      label: "Build",
      icon: "pi pi-spinner",
      command: () => {
        getBuildResponse();
        dispatch(
          handleMapping({ command: "MAPPING_START", target: "canvas-sidebar" })
        );
      },
    },
    {
      label: "Stop",
      icon: "pi pi-stop-circle",
      command: () => {
        getStopResponse();
        dispatch(
          handleMapping({ command: "MAPPING_STOP", target: "canvas-sidebar" })
        );
      },
    },
    {
      label: "Save",
      icon: "pi pi-save",
      command: () => {
        saveMappingData();
      },
    },
  ];

  const showToast = (severity: Severity, summary: string, detail: string) => {
    toast.current?.show({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 3000,
    });
  };

  const saveMappingData = () => {
    // dialog for save button
    const accept = async () => {
      try {
        await axios.get(url + `/mapping/save/${filenameRef.current}`);

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

  const getBuildResponse = async () => {
    try {
      await axios.get(url + "/mapping/start");
      showToast("success", "Success", "Build started successfully");
    } catch (e) {
      showToast("error", "Error", `Build failed: ${e.message}`);
      console.error(e);
    }
  };

  const getStopResponse = async () => {
    try {
      await axios.get(url + "/mapping/stop");
      showToast("success", "Success", "Build stopeed successfully");
    } catch (e) {
      showToast("error", "Error", `Failed: ${e.message}`);
      console.error(e);
    }
  };

  return (
    <div className="utility-container">
      <ConfirmDialog />
      <Menu model={items} />
      <Toast ref={toast} />
    </div>
  );
};

export default UtilityPanel;
