import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

const loadSlice = createSlice({
  name: 'load',
  initialState:{
    map: 'Test',
    task: ''
  },
  reducers: {
    setMapName(state,action: PayloadAction<string>) {
      state.map = action.payload;
    },
    setTaskName(state,action: PayloadAction<string>) {
      state.task = action.payload;
    }
  },
})

export const { setMapName, setTaskName } = loadSlice.actions
export const selectMapName = (state:RootState) => state.load.map;
export const selectTaskName = (state:RootState) => state.load.task;
export default loadSlice.reducer