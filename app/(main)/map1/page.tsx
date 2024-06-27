"use client";
import React, { useEffect, useState, useRef } from "react";
import SocketIOCClient from 'socket.io-client';
// import Websocketprovider from "./websocketprovider";
import { openServer } from "./socket1";
import Mapping from "./map";

const MapTest: React.FC = () => {
    openServer();
    return (
        <div>
            <h1>3D Cloud Map</h1>
                <Mapping />
        </div>
    );
};
export default MapTest;
