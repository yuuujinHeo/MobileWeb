"use client";
import React, { useEffect, useState, useRef } from "react";
import SocketIOCClient from 'socket.io-client';
import Mapping from "./map";

const MapTest: React.FC = () => {
    return (
        <div>
            <Mapping />
        </div>
    );
};
export default MapTest;
