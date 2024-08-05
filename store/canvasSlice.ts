import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommandData {
  command: string;
  category?: string;
  target?: string;
  name?: string;
  value?: string;
}
interface CreateHelperData {
  x: string;
  y: string;
  z: string;
  rz: string;
}

const initialState = {
  selectedObjectInfo: {
    id: "",
    name: "",
    links: [],
    pose: "",
    type: "",
    info: "",
  },
  sceneInfo: {
    goalNum: 0,
    routeNum: 0,
    linkNum: 0,
  },
  action: {
    command: "",
    category: "",
    target: "",
    name: "",
    value: "",
    timestamp: 0,
  },
  createHelper: {
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
    updateCreateHelper(state, action: PayloadAction<CreateHelperData>) {
      state.createHelper.x = action.payload.x;
      state.createHelper.y = action.payload.y;
      state.createHelper.z = action.payload.z;
      state.createHelper.rz = action.payload.rz;
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
  },
});

export const {
  handleMapping,
  updateCreateHelper,
  toggleMarkingMode,
  createAction,
  changeSelectedObjectInfo,
  updateGoalNum,
  updateRouteNum,
} = canvasSlice.actions;
export default canvasSlice.reducer;
