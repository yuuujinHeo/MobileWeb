export const CANVAS_CLASSES = {
  DEFAULT: "canvas-default",
  OVERLAY: "canvas-overlay",
  SIDEBAR: "canvas-sidebar",
} as const;

export type CanvasType = (typeof CANVAS_CLASSES)[keyof typeof CANVAS_CLASSES];
