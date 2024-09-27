import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CommandData {
  command: string;
  category?: string;
  target?: string;
  name?: string;
  value?: string;
}
interface RobotHelper {
  x: string;
  y: string;
  z: string;
  rz: string;
}

const initialState = {
  selectedObjectInfo: {
    id: '',
    name: '',
    links: [],
    pose: '',
    type: '',
    info: '',
  },
  sceneInfo: {
    goalNum: 0,
    routeNum: 0,
    linkNum: 0,
  },
  action: {
    command: '',
    category: '',
    target: '',
    name: '',
    value: '',
    timestamp: 0,
  },
  robotHelper: {
    x: '',
    y: '',
    z: '',
    rz: '',
  },
  isMarkingMode: false,
  transformControlMode: 'translate',
};

const canvasSlice = createSlice({
  name: 'Canvas',
  initialState: initialState,
  reducers: {
    createAction(state, action: PayloadAction<CommandData>) {
      state.action.command = action.payload.command;
      if (action.payload.category)
        state.action.category = action.payload.category;
      if (action.payload.target) state.action.target = action.payload.target;
      if (action.payload.name) state.action.name = action.payload.name;
      if (action.payload.value) state.action.value = action.payload.value;
      state.action.timestamp = Date.now();
    },
    handleMapping(state, action: PayloadAction<CommandData>) {
      state.action.command = action.payload.command;
      if (action.payload.target) state.action.target = action.payload.target;
      state.action.timestamp = Date.now();
    },
    updateRobotHelper(state, action: PayloadAction<RobotHelper>) {
      state.robotHelper.x = action.payload.x;
      state.robotHelper.y = action.payload.y;
      state.robotHelper.z = action.payload.z;
      state.robotHelper.rz = action.payload.rz;
    },
    toggleMarkingMode(state, action) {
      state.isMarkingMode = action.payload.isMarkingMode;
    },
    changeSelectedObjectInfo(state, action) {
      state.selectedObjectInfo = action.payload;
    },
    updateGoalNum(state, action) {
      state.sceneInfo.goalNum = action.payload;
    },
    updateRouteNum(state, action) {
      state.sceneInfo.routeNum = action.payload;
    },
    updateTransformControlsMode(state, action) {
      state.transformControlMode = action.payload;
    },
  },
});

export const {
  handleMapping,
  updateRobotHelper,
  toggleMarkingMode,
  createAction,
  changeSelectedObjectInfo,
  updateGoalNum,
  updateRouteNum,
  updateTransformControlsMode,
} = canvasSlice.actions;
export default canvasSlice.reducer;
