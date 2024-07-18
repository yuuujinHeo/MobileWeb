import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store'

export interface StatusState {
    pose:{
        x: number,
        y: number,
        rz:number
    },
    vel:{
        vx:number,
        vy: number,
        wz:number
    },
    condition:{
        inlier_error: number,
        inlier_ratio: number,
        mapping_error: number,
        mapping_ratio: number,
        auto_state: string,
        obs_state: string
    },
    motor0:{
        connection: string,
        status: {
            running: boolean,
            mode: boolean,
            jam: boolean,
            current: boolean,
            big: boolean,
            input: boolean,
            position: boolean,
            collision: boolean
        },
        temperature: number,
        current: number
    },
    motor1:{
        connection: string,
        status: {
            running: boolean,
            mode: boolean,
            jam: boolean,
            current: boolean,
            big: boolean,
            input: boolean,
            position: boolean,
            collision: boolean
        },
        temperature: number,
        current:number
    },
    lidar0:{
        connection: string,
        port: string,
        serialnumber: string
    },
    lidar1:{
        connection: string,
        port: string,
        serialnumber: string
    },
    imu:{
        gyr_x: number,
        gyr_y: number,
        gyr_z: number,
        acc_x: number,
        acc_y: number,
        acc_z: number,
        imu_rx: number,
        imu_ry: number,
        imu_rz: number
    },
    power:{
        bat_in: number,
        bat_out: number,
        bat_current: number,
        power: number,
        total_power: number
    },
    state:{
        power: string,
        emo: string,
        charge: string,
        localization: string
    },
    time:string
}

export const initState = {
    pose:{
        x: 0,
        y: 0,
        rz:0
    },
    vel:{
        vx: 0,
        vy: 0,
        wz:0
    },
    condition:{
        inlier_error: 0,
        inlier_ratio: 0,
        mapping_error: 0,
        mapping_ratio: 0,
        auto_state: 'stop',
        obs_state: 'none'
    },
    motor0:{
        connection: 'false',
        status: {
            running: false,
            mode: false,
            jam: false,
            current: false,
            big: false,
            input: false,
            position: false,
            collision: false
        },
        temperature: 0,
        current:0
    },
    motor1:{
        connection: 'false',
        status: {
            running: false,
            mode: false,
            jam: false,
            current: false,
            big: false,
            input: false,
            position: false,
            collision: false
        },
        temperature: 0,
        current:0
    },
    lidar0:{
        connection: 'false',
        port: '',
        serialnumber: ''
    },
    lidar1:{
        connection: 'false',
        port: '',
        serialnumber: ''
    },
    imu:{
        gyr_x: 0,
        gyr_y: 0,
        gyr_z: 0,
        acc_x: 0,
        acc_y: 0,
        acc_z: 0,
        imu_rx: 0,
        imu_ry: 0,
        imu_rz: 0
    },
    power:{
        bat_in: 0,
        bat_out: 0,
        bat_current: 0,
        power: 0,
        total_power: 0
    },
    state:{
        power: 'false',
        emo: 'false',
        charge: 'false',
        localization: "none"
    },
    time:''
  }

const statusSlice = createSlice({
  name: 'status',
  initialState:initState,
  reducers: {
    setStatus(state, action:PayloadAction<StatusState>){
        state = action.payload;
        console.log("setStatus",state);
    }
  },
});

export const { setStatus } = statusSlice.actions;
export const selectStatus = (state:RootState) => state.status;
export default statusSlice.reducer;