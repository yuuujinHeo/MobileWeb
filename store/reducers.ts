import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import sessionStorage from 'redux-persist/es/storage/session';

import networkReducer from './networkSlice';
import userReducer from './userSlice';
import settingReducer from './settingSlice';
import statusReducer from './statusSlice';
import connectionSlice from './connectionSlice';
import taskSlice from './taskSlice';
import pathSlice from './pathSlice';
import canvasReducer from './canvasSlice';
import propertyPanelReducer from './propertyPanelSlices';

const rootReducer = combineReducers({
  network: networkReducer,
  setting: settingReducer,
  status: statusReducer,
  path: pathSlice,
  connection: connectionSlice,
  canvas: canvasReducer,
  propertyPanel: propertyPanelReducer,
  user: userReducer,
  task: taskSlice,
});

const persistConfig = {
  key: 'root',
  // storage:LocalStorage, sessionStorage: SessionStorage
  storage: sessionStorage,
  // auth, board, studio 3개의 reducer 중에 auth reducer만 localstorage에 저장합니다.
  whitelist: ['user'],
  // blacklist -> 그것만 제외합니다
};

export default persistReducer(persistConfig, rootReducer) as typeof rootReducer;
