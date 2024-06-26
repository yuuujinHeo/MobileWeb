import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface commandData {
  command: string;
  category: string;
}

const initialState = {
  action: {
    command: "",
    category: "",
    timestamp: 0,
  },
};

const canvasSlice = createSlice({
  name: "Canvas",
  initialState: initialState,
  reducers: {
    drawCloud(state, action: PayloadAction<commandData>) {
      state.action.command = action.payload.command;
      state.action.timestamp = Date.now();
    },
  },
});

export const { drawCloud } = canvasSlice.actions;
export default canvasSlice.reducer;
