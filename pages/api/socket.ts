import { Server } from "socket.io";
import io from "socket.io-client";
import type { NextApiRequest, NextApiResponse } from "next";

async function ioHandler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    // First use, starting socket.io


    const ioServer = new Server((res.socket as any).server);
    const url = "http://10.108.1.131:10334/";
    const socket = io(url);
    let connectedClients = [];

    socket.on("connect", () => {
      socket.on("mapping", (data: string[][]) => {
        ioServer.emit("mapping", data);
      });
      socket.on("lidar", (data: string[][]) => {
        ioServer.emit("lidar", data);
      });
      socket.on("status", (data: JSON) => {
        ioServer.emit("status", data);
      });
      socket.on("move",(data:JSON) =>{
        io2.emit("move", data);
      });
      socket.on("task_id",(data:number) =>{
        console.log("taskid", data);
        io2.emit("task_id", data);
      })
      socket.on("task",(data:string) =>{
        console.log("task",data);
        io2.emit("task",data);
      })
    });

    ioServer.on("connection", (newsocket) => {
      console.log(`${newsocket.id} connected`);
      console.log("count : ", ioServer.engine.clientsCount);

      newsocket.on("disconnect", () => {
        console.log(`${newsocket.id} disconnected`);
      });
    });
    (res.socket as any).server.io = ioServer;
  } else {
    console.warn("socket.io already running");
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
