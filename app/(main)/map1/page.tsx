"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SocketIOCClient from 'socket.io-client';
import Mapping from "./map";

const MapTest = () => {
    const router = useRouter();
    
    return (
        <div>
            <Mapping />
        </div>
    );
};
export default MapTest;
