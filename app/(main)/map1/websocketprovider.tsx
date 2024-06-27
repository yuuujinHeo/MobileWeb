import React, { useRef } from 'react';

const WebSocketContext = React.createContext<any>(null);
export { WebSocketContext };
import { useDispatch, useSelector } from 'react-redux';
import {store,AppDispatch, RootState} from '../../../store/store';
import { selectCloud, setCloud } from '@/store/mappingSlice';

export default ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const webSocketUrl = `ws://localhost:10334/`
  let ws = useRef<WebSocket | null>(null);

  try{
    if (!ws.current) {
      ws.current = new WebSocket(webSocketUrl);
  
      ws.current.onopen = () => {
        console.log("connected to " + webSocketUrl);
      }
      ws.current.onclose = error => {
        console.log("disconnect from " + webSocketUrl);
        console.log(error);
      };
      ws.current.onerror = error => {
        console.log("connection error " + webSocketUrl);
        console.log(error);
      };
      ws.current.onmessage = message =>{
        console.log("message in 1")
          // console.log("message:",message.data);
          dispatch(setCloud(message.data));
      }
    }
  }catch(error){
    console.error(error);
  }

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
}