import { Server } from "socket.io";
import io from "socket.io-client";
import type { NextApiRequest, NextApiResponse } from "next";
// import { getMobileSocketURL } from "@/app/(main)/api/url";

async function ioHandler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    console.log("*First use, starting socket.io");

    const io2 = new Server((res.socket as any).server);
    let url = "http://10.108.1.40:10334"
    let socket = io(url);

    socket.on("connect", () => {
      socket.on("mapping", (data: string[][]) => {
        console.log('mapping in');
        io2.emit("mapping", data);
      });
      socket.on("lidar", (data: string[][]) => {
        io2.emit("lidar", data);
      });
      socket.on("status", (data: JSON) => {
        io2.emit("status", data);
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
