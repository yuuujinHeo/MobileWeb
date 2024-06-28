import { Server } from "socket.io";
import io from "socket.io-client";
import type { NextApiRequest, NextApiResponse } from "next";

function ioHandler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    console.log("*First use, starting socket.io");

    const io2 = new Server((res.socket as any).server);
    let socket = io("http://10.108.1.40:10334");

    socket.on("connect", () => {
      socket.on("mapping", (data: string[][]) => {
        io2.emit("mapping", data);
      });
      socket.on("lidar", (data: string[][]) => {
        io2.emit("lidar", data);
      });
      socket.on("status", (data1: JSON) => {
        io2.emit("status", data1);
      });
    });

    io2.on("connection", (socket) => {
      console.log(`${socket.id} connected`);

      io2.on("disconnect", () => {
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
