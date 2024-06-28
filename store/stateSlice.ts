import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'


export interface StateState {
    time:string
}


const stateSlice = createSlice({
    name: 'state1',
    initialState:{
      time:''
    },
    reducers: {
      setState(state, action:PayloadAction<StateState>){
        console.log("setState, ", action.payload)
          state = action.payload;
      }
    },
  });
  
  export const { setState } = stateSlice.actions;
  export const selectState = (state:RootState) => state.state1;
  export default stateSlice.reducer;