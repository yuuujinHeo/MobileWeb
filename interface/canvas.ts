export interface LidarCanvasProps {
  className: string;
  cloudData?: string[][] | null;
  topoData?: UserData[] | null;
}

export interface UserData {
  id: string;
  info: string;
  links: string[];
  links_from?: string[];
  name: string;
  pose: string;
  type: string;
}

export interface NodePose {
  x: number;
  y: number;
  z: number;
  rz: number;
  idx?: number;
}

export interface RobotState {
  x: string;
  y: string;
  rz: string;
  localization: string;
  auto_state: string;
  obs_state: string;
}

export type Severity = 'success' | 'info' | 'warn' | 'error';
