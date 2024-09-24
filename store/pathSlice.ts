import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

const pathSlice = createSlice({
  name: 'path',
  initialState:{
    global: [],
    local: []
  },
  reducers: {
    setGlobalPath(state,action: PayloadAction<[]>) {
      state.global = action.payload;
    },
    setLocalPath(state,action: PayloadAction<[]>) {
      state.local = action.payload;
    }
  },
})

export const { setGlobalPath,setLocalPath } = pathSlice.actions
export const selectPath = (state:RootState) => state.path;
export default pathSlice.reducer