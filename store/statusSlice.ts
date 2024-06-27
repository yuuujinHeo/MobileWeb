import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store'

interface StatusState {
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
        inlier_ratio: number
    },
    motor0:{
        connection: boolean,
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
        temperature: number
    },
    motor1:{
        connection: boolean,
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
        temperature: number
    },
    power:{
        battery_in: number,
        battery_out: number,
        battery_cur: number,
        power: number,
        total_power: number
    },
    state:{
        power: boolean,
        emo: boolean,
        charge: boolean,
        localization: string
    },
    time:string
}


const statusSlice = createSlice({
  name: 'status',
  initialState:{
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
        inlier_ratio: 0
    },
    motor0:{
        connection: false,
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
        temperature: 0
    },
    motor1:{
        connection: false,
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
        temperature: 0
    },
    power:{
        battery_in: 0,
        battery_out: 0,
        battery_cur: 0,
        power: 0,
        total_power: 0
    },
    state:{
        power: false,
        emo: false,
        charge: false,
        localization: "none"
    },
    time:''
  },
  reducers: {
    setStatus(state, action:PayloadAction<StatusState>){
        state = action.payload;
        console.log("setStatus",action.payload,state);
    }
  },
});

export const { setStatus } = statusSlice.actions;
export const selectStatus = (state:RootState) => state.status;
export default statusSlice.reducer;