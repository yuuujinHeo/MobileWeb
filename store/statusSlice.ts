import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface StatusState {
  pose: POSState;
  vel: VELState;
  condition: CONDITIONState;
  motor0: MOTORState;
  motor1: MOTORState;
  lidar0: LIDARState;
  lidar1: LIDARState;
  imu: IMUState;
  power: PowerState;
  state: StateState;
  time: string;
}

export interface POSState {
  x: number;
  y: number;
  rz: number;
}
export interface VELState {
  vx: number;
  vy: number;
  wz: number;
}
export interface CONDITIONState {
  inlier_error: number;
  inlier_ratio: number;
  mapping_error: number;
  mapping_ratio: number;
  auto_state: string;
  obs_state: string;
}
export interface MOTORState {
  connection: string;
  status: {
    running: boolean;
    mode: boolean;
    jam: boolean;
    current: boolean;
    big: boolean;
    input: boolean;
    position: boolean;
    collision: boolean;
  };
  temperature: number;
  current: number;
}
export interface LIDARState {
  connection: string;
  port: string;
  serialnumber: string;
}

export interface IMUState {
  gyr_x: number;
  gyr_y: number;
  gyr_z: number;
  acc_x: number;
  acc_y: number;
  acc_z: number;
  imu_rx: number;
  imu_ry: number;
  imu_rz: number;
}

export interface PowerState {
  bat_in: number;
  bat_out: number;
  bat_current: number;
  power: number;
  total_power: number;
}

export interface StateState {
  power: string;
  emo: string;
  charge: string;
  localization: string;
  map: string;
}

// const initState = {
//     pose:{
//         x: 0,
//         y: 0,
//         rz:0
//     },
//     vel:{
//         vx: 0,
//         vy: 0,
//         wz:0
//     },
//     condition:{
//         inlier_error: 0,
//         inlier_ratio: 0,
//         mapping_error: 0,
//         mapping_ratio: 0,
//         auto_state: 'stop',
//         obs_state: 'none'
//     },
//     motor0:{
//         connection: 'false',
//         status: {
//             running: false,
//             mode: false,
//             jam: false,
//             current: false,
//             big: false,
//             input: false,
//             position: false,
//             collision: false
//         },
//         temperature: 0,
//         current:0
//     },
//     motor1:{
//         connection: 'false',
//         status: {
//             running: false,
//             mode: false,
//             jam: false,
//             current: false,
//             big: false,
//             input: false,
//             position: false,
//             collision: false
//         },
//         temperature: 0,
//         current:0
//     },
//     lidar0:{
//         connection: 'false',
//         port: '',
//         serialnumber: ''
//     },
//     lidar1:{
//         connection: 'false',
//         port: '',
//         serialnumber: ''
//     },
//     imu:{
//         gyr_x: 0,
//         gyr_y: 0,
//         gyr_z: 0,
//         acc_x: 0,
//         acc_y: 0,
//         acc_z: 0,
//         imu_rx: 0,
//         imu_ry: 0,
//         imu_rz: 0
//     },
//     power:{
//         bat_in: 0,
//         bat_out: 0,
//         bat_current: 0,
//         power: 0,
//         total_power: 0
//     },
//     state:{
//         power: 'false',
//         emo: 'false',
//         charge: 'false',
//         localization: "none",
//         map: '3'
//     },
//     time:''
//   }

const statusSlice = createSlice({
  name: 'status',
  initialState: {
    pose: {
      x: 0,
      y: 0,
      rz: 0,
    },
    vel: {
      vx: 0,
      vy: 0,
      wz: 0,
    },
    condition: {
      inlier_error: 0,
      inlier_ratio: 0,
      mapping_error: 0,
      mapping_ratio: 0,
      auto_state: 'stop',
      obs_state: 'none',
    },
    motor0: {
      connection: 'false',
      status: {
        running: false,
        mode: false,
        jam: false,
        current: false,
        big: false,
        input: false,
        position: false,
        collision: false,
      },
      temperature: 0,
      current: 0,
    },
    motor1: {
      connection: 'false',
      status: {
        running: false,
        mode: false,
        jam: false,
        current: false,
        big: false,
        input: false,
        position: false,
        collision: false,
      },
      temperature: 0,
      current: 0,
    },
    lidar0: {
      connection: 'false',
      port: '',
      serialnumber: '',
    },
    lidar1: {
      connection: 'false',
      port: '',
      serialnumber: '',
    },
    imu: {
      gyr_x: 0,
      gyr_y: 0,
      gyr_z: 0,
      acc_x: 0,
      acc_y: 0,
      acc_z: 0,
      imu_rx: 0,
      imu_ry: 0,
      imu_rz: 0,
    },
    power: {
      bat_in: 0,
      bat_out: 0,
      bat_current: 0,
      power: 0,
      total_power: 0,
    },
    state: {
      power: 'false',
      emo: 'false',
      charge: 'false',
      localization: 'none',
      map: '',
    },
    time: '',
  },
  reducers: {
    setStatus(state, action: PayloadAction<StatusState>) {
      state = action.payload;
    },
    setPose(state, action: PayloadAction<POSState>) {
      state.pose = action.payload;
    },
    setVel(state, action: PayloadAction<VELState>) {
      state.vel = action.payload;
    },
    setCondition(state, action: PayloadAction<CONDITIONState>) {
      state.condition = action.payload;
    },
    setMotor0(state, action: PayloadAction<MOTORState>) {
      state.motor0 = action.payload;
    },
    setMotor1(state, action: PayloadAction<MOTORState>) {
      state.motor1 = action.payload;
    },
    setLidar0(state, action: PayloadAction<LIDARState>) {
      state.lidar0 = action.payload;
    },
    setLidar1(state, action: PayloadAction<LIDARState>) {
      state.lidar1 = action.payload;
    },
    setIMU(state, action: PayloadAction<IMUState>) {
      state.imu = action.payload;
    },
    setPower(state, action: PayloadAction<PowerState>) {
      state.power = action.payload;
    },
    setState(state, action: PayloadAction<StateState>) {
      state.state = action.payload;
    },
    setTime(state, action: PayloadAction<string>) {
      state.time = action.payload;
    },
  },
});

export const {
  setStatus,
  setPose,
  setVel,
  setCondition,
  setMotor0,
  setMotor1,
  setLidar0,
  setLidar1,
  setIMU,
  setPower,
  setTime,
  setState,
} = statusSlice.actions;
export const selectStatus = (state: RootState) => state.status;
export default statusSlice.reducer;
