export const CANVAS_CLASSES = {
  DEFAULT: "canvas-default",
  PREVIEW: "canvas-preview",
  MAPPING: "canvas-mapping",
} as const;

export const CANVAS_ACTION = {
  ADD_NODE: "ADD_NODE",
  DELETE_NODE: "DELETE_NODE",
  // SAVE_ANNOTATION: "SAVE_ANNOTATION",
  UPDATE_PROPERTY: "UPDATE_PROPERTY",
  ADD_LINK: "ADD_LINK",
  ADD_BIDIRECTIONAL_LINK: "ADD_BIDIRECTIONAL_LINK",
  REMOVE_LINK: "REMOVE_LINK",
  DRAW_CLOUD: "DRAW_CLOUD",
  DRAW_CLOUD_TOPO: "DRAW_CLOUD_TOPO",
  MAPPING_START: "MAPPING_START",
  MAPPING_STOP: "MAPPING_STOP",
  SAVE_MAP: "SAVE_MAP",
  TFC_SET_MODE: "TFC_SET_MODE",
  TOGGLE_OBJECT: "TOGGLE_OBJECT",
  TOGGLE_ALL: "TOGGLE_ALL",
  CHANGE_ERASER_RADIUS: "CHANGE_ERASER_RADIUS",
  TOGGLE_ERASER_MODE: "TOGGLE_ERASER_MODE",
};

export const NODE_TYPE = {
  GOAL: "GOAL",
  ROUTE: "ROUTE",
};

export const CANVAS_OBJECT = {
  GOAL: "GOAL",
  ROUTE: "ROUTE",
  NAME: "NAME",
  LINK: "LINK",
  ROBOT: "ROBOT",
  ORIGIN: "ORIGIN",
  ALL: "ALL",
};

export const COMMAND_TYPE = {
  ADD_NODE: "ADD_NODE",
  DELETE_NODE: "DELETE_NODE",
  LINK_NODES: "LINK_NODES",
  REMOVE_LINK: "REMOVE_LINK",
  CHANGE_NAME: "CHANGE_NAME",
  TRANSFROM_CHANGE: "TRANSFROM_CHANGE",
  CHANGE_NODE_TYPE: "CHANGE_NODE_TYPE",
};

export type CanvasType = (typeof CANVAS_CLASSES)[keyof typeof CANVAS_CLASSES];

export const SCALE_FACTOR = 31.5;
