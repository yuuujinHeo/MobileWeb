import { CommandProps } from "@/types/layout";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommandData {
  command: string;
  target?: string;
  name?: string;
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
    name: "",
    timestamp: 0,
  },
  initData: {
    x: "",
    y: "",
    z: "",
    rz: "",
  },
  isMarkingMode: false,
};

const canvasSlice = createSlice({
  name: "Canvas",
  initialState: initialState,
  reducers: {
    createAction(state, action: PayloadAction<CommandData>) {
      state.action.command = action.payload.command;
      if (action.payload.target) state.action.target = action.payload.target;
      if (action.payload.name) state.action.name = action.payload.name;
      state.action.timestamp = Date.now();
    },
    handleMapping(state, action: PayloadAction<CommandData>) {
      state.action.command = action.payload.command;
      if (action.payload.target) state.action.target = action.payload.target;
      state.action.timestamp = Date.now();
    },
    updateInitData(state, action: PayloadAction<Init>) {
      state.initData.x = action.payload.x;
      state.initData.y = action.payload.y;
      state.initData.z = action.payload.z;
      state.initData.rz = action.payload.rz;
    },
    toggleMarkingMode(state, action) {
      state.isMarkingMode = action.payload.isMarkingMode;
    },
  },
});

export const {
  handleMapping,
  updateInitData,
  toggleMarkingMode,
  createAction,
} = canvasSlice.actions;
export default canvasSlice.reducer;
