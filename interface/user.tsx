
import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import create from 'zustand';
interface UserState{
    user_id:string;
    user_name:string;
    token:string;
    permission:string[];
}

const defaultUser = {
    user_id:"temp",
    user_name:"",
    token:"",
    permission:[]
}

interface GlobalContextType {
    state: UserState;
    setState: Dispatch<SetStateAction<UserState>>;
}

export const userContext = createContext<GlobalContextType>({
    state: defaultUser,
    setState: () =>defaultUser
});

// Provider 컴포넌트 생성
export const GlobalUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<UserState>(defaultUser);
  
    return (
      <userContext.Provider value={{ state, setState }}>
        {children}
      </userContext.Provider>
    );
};
