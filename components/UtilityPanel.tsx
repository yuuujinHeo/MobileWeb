"use client";

import { useDispatch } from "react-redux";
import { drawCloud } from "@/store/canvasSlice";

import { Button } from "primereact/button";

const UtilityPanel = () => {
  const dispatch = useDispatch();
  return (
    <div className="utility-container">
      {/* [TODO] Need a function for build. */}
      <Button
        label="Build"
        onClick={() => {
          dispatch(drawCloud({ command: "DRAW_CLOUD", category: "not_yet" }));
        }}
      ></Button>
      <Button label="Save" severity="secondary"></Button>
      <Button label="Load" severity="secondary"></Button>
    </div>
  );
};

export default UtilityPanel;
