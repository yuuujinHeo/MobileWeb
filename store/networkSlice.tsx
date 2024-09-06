import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

export interface NetworkState {
  monitor: string,
  mobile: string
}


const networkSlice = createSlice({
  name: 'network',
  initialState:{
    monitor: 'http://10.108.1.10:11335',
    mobile: ''
  },
  reducers: {
    setMonitorURL(state,action: PayloadAction<string>) {
      console.log("Monitor---------->",state.mobile, action.payload);
      state.monitor = action.payload;
    },
    setMobileURL(state,action: PayloadAction<string>) {
      console.log("Mobile---------->",state.mobile, action.payload);
      state.mobile = action.payload;
    }
  },
})

export const { setMonitorURL, setMobileURL } = networkSlice.actions
export const selectNetwork = (state:RootState) => state.network;
export default networkSlice.reducer