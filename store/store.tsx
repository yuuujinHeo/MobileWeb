import { configureStore } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { createWrapper } from "next-redux-wrapper";
import networkReducer from "./networkSlice";
import userReducer from "./userSlice";
import settingReducer from "./settingSlice";
import statusReducer from "./statusSlice";
import connectionSlice from "./connectionSlice";
import taskSlice from "./taskSlice";
import canvasReducer from "./canvasSlice";
import propertyPanelReducer from "./propertyPanelSlices";
import { rootReducer } from "./reducers";
import { PersistGate } from "redux-persist/integration/react";
import thunk from 'redux-thunk';

import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage를 사용할 경우
const persistConfig = {
  key: 'root',
  // version: 1,
  storage: storage
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer:persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: false
        // {
        //     ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        // },
    }),
});
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
