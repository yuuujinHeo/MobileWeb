import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface UserState {
  user_id: string;
  user_name: string;
  token: string;
  permission: string[];
  state: string;
  avatar: string;
  source: string;
}
const defaultUser = {
  user_id: 'temp',
  user_name: '',
  token: '',
  permission: [],
  state: '',
  avatar: 'icon',
  source: 'pi pi-user',
};

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user_id: 'temp',
    user_name: '',
    token: '',
    permission: [],
    state: '',
    avatar: 'icon',
    source: 'pi pi-user',
  },
  reducers: {
    setUser(state: UserState, action: PayloadAction<UserState>) {
      console.log('setUser : ', action.payload.user_id);
      state.user_id = action.payload.user_id;
      state.user_name = action.payload.user_name;
      state.token = action.payload.token;
      state.permission = action.payload.permission;
      state.state = action.payload.state;
      state.avatar = action.payload.avatar;
      state.source = action.payload.source;
    },
    setUserDefault(state: UserState, action: PayloadAction<UserState>) {
      console.log('setUserDefault : ', action.payload.user_id);
      state.user_id = action.payload.user_id;
      state.user_name = action.payload.user_name;
      state.token = action.payload.token;
      state.permission = action.payload.permission;
      state.state = action.payload.state;
    },
    setUserProfile(
      state: UserState,
      action: PayloadAction<{
        user_name: string;
        avatar: string;
        source: string;
      }>
    ) {
      console.log('setUserProfile : ', action.payload.user_name);
      state.user_name = action.payload.user_name;
      state.avatar = action.payload.avatar;
      state.source = action.payload.source;
    },
    setUserPermission(state: UserState, action: PayloadAction<[]>) {
      state.permission = action.payload;
    },
  },
});

export const { setUser, setUserDefault, setUserProfile } = userSlice.actions;
export const selectUser = (state: RootState) => state.user;
export const selectUserPermission = (state: RootState) =>
  state.user?.permission;
export default userSlice.reducer;
