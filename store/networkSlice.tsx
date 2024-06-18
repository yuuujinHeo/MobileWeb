import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

interface CounterState {
  value: number
}

const initialState = { value: 0 } as CounterState

const networkSlice = createSlice({
  name: 'network',
  initialState:{
    monitor: 'http://10.108.1.10:11335',
    mobile: 'http://10.108.1.10:11334'
  },
  reducers: {
    setMonitorURL(state,action: PayloadAction<string>) {
      state.monitor = action.payload;
    },
    setMobileURL(state,action: PayloadAction<string>) {
      state.mobile = action.payload;
    }
  },
})

export const { setMonitorURL, setMobileURL } = networkSlice.actions
export const selectMonitor = (state:RootState) => state.network.monitor;
export const selectMobile = (state:RootState) => state.network.mobile;
export default networkSlice.reducer