import { configureStore } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { createWrapper } from "next-redux-wrapper";
import networkReducer from "./networkSlice";
import userReducer from "./userSlice";
import settingReducer from "./settingSlice";
import loadSlice from "./loadSlice";
import statusReducer from "./statusSlice";
import stateSlice from "./stateSlice";
import taskSlice from "./taskSlice";
import canvasReducer from "./canvasSlice";
import propertyPanelReducer from "./propertyPanelSlices";

export const store = configureStore({
  reducer: {
    network: networkReducer,
    setting: settingReducer,
    status: statusReducer,
    state1: stateSlice,
    canvas: canvasReducer,
    propertyPanel: propertyPanelReducer,
    user: userReducer,
    load: loadSlice,
    task: taskSlice
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
