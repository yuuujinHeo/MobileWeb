import { Server } from "socket.io";
import io from "socket.io-client";
import type { NextApiRequest, NextApiResponse } from "next";
// import { getMobileSocketURL } from "@/app/(main)/api/url";

async function ioHandler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    console.log("*First use, starting socket.io");

    const io2 = new Server((res.socket as any).server);
    // let url = await getMobileSocketURL();
    const url = "http://10.108.1.131:10334/";
    let socket = io(url);

    let connectedClients = [];

    socket.on("connect", () => {
      console.log("??????????????????????????????");
      socket.on("mapping", (data: string[][]) => {
        console.log('mapping in');
        io2.emit("mapping", data);
      });
      socket.on("lidar", (data: string[][]) => {
        io2.emit("lidar", data);
      });
      socket.on("status", (data: JSON) => {
        // console.log("status get ",data.condition.auto_state);
        io2.emit("status", data);
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

    io2.on("connection", (newsocket) => {
      console.log(`${newsocket.id} connected`);
      console.log("count : ", io2.engine.clientsCount);

      io2.on("disconnect", (socket) => {
        console.log(`${socket.id} disconnected`);
        // io.leave();
      });
    });
    (res.socket as any).server.io = io2;
  } else {
    console.log("socket.io already running");
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
