import { Server } from "socket.io";
import io from "socket.io-client";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import type { NextApiRequest, NextApiResponse } from "next";

async function ioHandler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    // First use, starting socket.io
    const ioServer = new Server((res.socket as any).server);
    const url = process.env.NEXT_PUBLIC_WEB_SOCKET_URL;
    const socket = io(url as string);
    let connectedClients = [];

    socket.on("connect", () => {
      socket.on("mapping", (data: string[][]) => {
        ioServer.emit("mapping", data);
      });
      socket.on("lidar", (data: string[][]) => {
        ioServer.emit("lidar", data);
      });
      socket.on("status", async (data: JSON) => {
        ioServer.emit("status", data);
      });
      socket.on("move", (data: JSON) => {
        ioServer.emit("move", data);
      });
      socket.on("task_id", (data: number) => {
        console.log("taskid", data);
        ioServer.emit("task_id", data);
      });
      socket.on("task", (data: string) => {
        console.log("task", data);
        ioServer.emit("task", data);
      });
    });

    ioServer.on("connection", (newsocket) => {
      console.log(`${newsocket.id} connected`);

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
