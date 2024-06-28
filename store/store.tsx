
import { configureStore } from '@reduxjs/toolkit';
import { useMemo } from 'react';
import { createWrapper } from "next-redux-wrapper";
import networkReducer from './networkSlice';
import userReducer from './userSlice';
import settingReducer from './settingSlice';
import statusSlice from './statusSlice';
import stateSlice from './stateSlice'
import canvasReducer from "./canvasSlice";

export const store = configureStore({
  reducer: {
    network: networkReducer,
    setting: settingReducer,
    status: statusSlice,
    state1: stateSlice,
    canvas: canvasReducer,
    user:userReducer,
  }
});

export const useStore = (initialState) => {
  const store = useMemo(() => store(initialState), [initialState]);
  return store;
};
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

