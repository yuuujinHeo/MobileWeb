import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommandData {
  command: string;
  target: string;
}
interface Init {
  x: string;
  y: string;
  z: string;
  rz: string;
}

const initialState = {
  action: {
    command: "",
    target: "",
    timestamp: 0,
  },
  initData: {
    x: "",
    y: "",
    z: "",
    rz: "",
  },
  localization: "Off",
};

const canvasSlice = createSlice({
  name: "Canvas",
  initialState: initialState,
  reducers: {
    drawCloud(state, action: PayloadAction<CommandData>) {
      state.action.command = action.payload.command;
      state.action.target = action.payload.target;
      state.action.timestamp = Date.now();
    },
    handleMapping(state, action: PayloadAction<CommandData>) {
      state.action.command = action.payload.command;
      state.action.target = action.payload.target;
      state.action.timestamp = Date.now();
    },
    updateInitData(state, action: PayloadAction<Init>) {
      state.initData.x = action.payload.x;
      state.initData.y = action.payload.y;
      state.initData.z = action.payload.z;
      state.initData.rz = action.payload.rz;
    },
    toggleLocalization(state, action) {
      state.localization = action.payload.command;
    },
  },
});

export const { drawCloud, handleMapping, updateInitData, toggleLocalization } =
  canvasSlice.actions;
export default canvasSlice.reducer;
