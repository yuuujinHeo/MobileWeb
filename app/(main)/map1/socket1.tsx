import { useEffect, useState } from 'react';
import io from 'socket.io-client';

interface StreamData {
    x: number;
    y: number;
    z: number;
    th: number;
  }

export function openServer(){
    console.log("openServer10334");
    let socket = io('http://localhost:10334');
    var cloud:StreamData[] = [];
  
    socket.on('connect', () =>{
        socket.on('mapping', (data:number[][]) =>{
            console.log("DATA:",data);
            // console.log(Array.isArray(data))
        
            // const formattedData = data.map(item => ({
            //     x: item[0],
            //     y: item[1],
            //     z: item[2],
            //     th: item[3],
            //   }));
            //   console.log('Received stream data:', formattedData);
            //   cloud = formattedData;
        });

    });
}