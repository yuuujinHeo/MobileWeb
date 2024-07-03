import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface commandData {
  command: string;
  target: string;
}

const initialState = {
  action: {
    command: "",
    target: "",
    timestamp: 0,
  },
};

const canvasSlice = createSlice({
  name: "Canvas",
  initialState: initialState,
  reducers: {
    drawCloud(state, action: PayloadAction<commandData>) {
      state.action.command = action.payload.command;
      state.action.target = action.payload.target;
      state.action.timestamp = Date.now();
    },
    handleMapping(state, action: PayloadAction<commandData>) {
      state.action.command = action.payload.command;
      state.action.target = action.payload.target;
      state.action.timestamp = Date.now();
    },
  },
});

export const { drawCloud, handleMapping } = canvasSlice.actions;
export default canvasSlice.reducer;
