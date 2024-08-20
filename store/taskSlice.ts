import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

const taskSlice = createSlice({
  name: "task",
  initialState: {
    running: false,
    taskID: "",
    // [TEMP]
    name: "",
    runningTaskName: "",
  },
  reducers: {
    setTaskRunning(state, action: PayloadAction<boolean>) {
      state.running = action.payload;
    },
    setTaskID(state, action: PayloadAction<string>) {
      state.taskID = action.payload;
    },
    // [TEMP]
    updateTaskName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    updateRunningTaskName(state, action: PayloadAction<string>) {
      state.runningTaskName = action.payload;
    },
  },
});

export const {
  setTaskRunning,
  setTaskID,
  updateTaskName,
  updateRunningTaskName,
} = taskSlice.actions;
export const selectTask = (state: RootState) => state.task;
export default taskSlice.reducer;
