import { configureStore } from '@reduxjs/toolkit';
import networkReducer from './networkSlice';

export const store = configureStore({
  reducer: {
    network: networkReducer,
    // 필요에 따라 추가적인 리듀서를 여기에 추가할 수 있습니다.
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;