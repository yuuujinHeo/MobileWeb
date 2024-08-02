export const CANVAS_CLASSES = {
  DEFAULT: "canvas-default",
  OVERLAY: "canvas-overlay",
  SIDEBAR: "canvas-sidebar",
} as const;

export const CANVAS_ACTION = {
  ADD_NODE: "ADD_NODE",
  DELETE_NODE: "DELETE_NODE",
  SAVE_ANNOTATION: "SAVE_ANNOTATION",
  UPDATE_PROPERTY: "UPDATE_PROPERTY",
  ADD_LINK: "ADD_LINK",
  REMOVE_LINK: "REMOVE_LINK",
  DRAW_CLOUD: "DRAW_CLOUD",
  DRAW_CLOUD_TOPO: "DRAW_CLOUD_TOPO",
  MAPPING_STOP: "MAPPING_STOP",
};

export const NODE_TYPE = {
  GOAL: "GOAL",
  ROUTE: "ROUTE",
};

export type CanvasType = (typeof CANVAS_CLASSES)[keyof typeof CANVAS_CLASSES];
