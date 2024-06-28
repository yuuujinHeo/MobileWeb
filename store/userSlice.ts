import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

interface UserState {
    user_id:string;
    user_name:string;
    token:string;
    permission:[];    
}
const defaultUser = {
    user_id:"temp",
    user_name:"",
    token:"",
    permission:[]
}

const userSlice = createSlice({
  name: 'user',
  initialState:{
    user_id:"temp",
    user_name:"",
    token:"",
    permission:[]
    },
  reducers: {
    setUser(state,action: PayloadAction<UserState>){
        state.user_id = action.payload.user_id;
        state.user_name = action.payload.user_name;
        state.token = action.payload.token;
        state.permission = action.payload.permission;
    },
    setUserPermission(state,action: PayloadAction<[]>){
        state.permission = action.payload;
    }
  },
})

export const { setUser } = userSlice.actions
export const selectUser = (state:RootState) => state.user;
export const selectUserPermission = (state:RootState) => state.user.permission;
export const selectUserId = (state:RootState) => state.user.user_id;
export const selectUserName = (state:RootState) => state.user.user_name;
export const selectUserToken = (state:RootState) => state.user.token;
export default userSlice.reducer