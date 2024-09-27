import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface ConnectionState {
  slamnav: boolean;
  task: boolean;
}

const connectionSlice = createSlice({
  name: 'connection',
  initialState: {
    time: '',
    slamnav: false,
    task: false,
  },
  reducers: {
    setSlamnavConnection(state, action: PayloadAction<boolean>) {
      state.slamnav = action.payload;
    },
    setTaskConnection(state, action: PayloadAction<boolean>) {
      state.task = action.payload;
    },
  },
});

export const { setSlamnavConnection, setTaskConnection } =
  connectionSlice.actions;
export const selectConnection = (state: RootState) => state.connection;
export default connectionSlice.reducer;
