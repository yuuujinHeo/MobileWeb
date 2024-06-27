import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

const mappingSlice = createSlice({
  name: 'mapping',
  initialState:[],
  reducers: {
    setCloud(state,action: PayloadAction<string[]>) {
      console.log("setCloud")
      state = action.payload;
    }
  },
})

export const { setCloud } = mappingSlice.actions
export const selectCloud = (state:RootState) => state.cloud;
export default mappingSlice.reducer