import React, { useRef, useEffect } from 'react';
import Color from '@/public/colors';
import '@/app/(main)/style.scss';

export const ChartCustom = ({ data,className }) => {
    // useRef to reference the canvas element
    const canvasRef = useRef(null);

    const calcWidth = (index, width) =>{
        //1hours
        const timeAll = 3600;//Math.floor(new Date(data[data.length-1].time) - new Date(data[firstindex].time));
        const timeOver = (new Date(data[data.length-1].time) - new Date(data[index].time))/1000;
        const timeOver2 = (new Date(data[data.length-1].time) - new Date(data[index+1].time))/1000;
        const timeIndex = Math.floor((new Date(data[index+1].time) - new Date(data[index].time))/1000);


        // console.log(index, data[index].state, width, timeOver, timeOver2, timeIndex, data[index].time, data[index+1].time, data[data.length-1].time);
        if(timeOver > timeAll){
            if(timeOver2 > timeAll){
                return 0;
            }else{
                // console.log("!!!!!", Math.floor(width - (width*timeOver2/timeAll)));
                return -99;
            }
        }else{
            return Math.floor(width*timeIndex/timeAll)==0?1:Math.floor(width*timeIndex/timeAll);
        }
    }

    const barColor = (state) =>{
        if(state == "Ready"){
            return Color.none;
        }else if(state == "Moving"){
            return Color.good;
        }else if(state == "Charging"){
            return Color.charging;
        }else if(state == "Power Off"){
            return Color.brown;
        }else if(state == "Mapping"){
            return Color.warn;
        }else if(state == "Not Ready"){
            return Color.brown;
        }else if(state == "Obstacle"){
            return Color.error;
        }else if(state == "Paused"){
            return Color.error;
        }else if(state == "?"){
            return Color.black;
        }else if(state == "Discon"){
            return Color.white;
        }
    }

    useEffect(() => {
        // Get the canvas element and its drawing context
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear the canvas to start fresh each render
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Settings for the bar chart
        const barHeight = canvas.height; // The width of each bar
        let x = canvas.width; 

        // // Drawing bars and X-axis labels
        for(let i=data.length - 2; i>=0; i--){
            const barWidth = calcWidth(i,canvas.width);
            if(barWidth > 0){
                ctx.fillStyle = barColor(data[i].state);
                x -= barWidth; 
                ctx.fillRect(x, 0, barWidth, barHeight);
                // console.log("Draw : ", i, data[i].state, barWidth, x);
            }else if(barWidth < -1){
                ctx.fillStyle = barColor(data[i].state);
                // console.log("Final Draw : ", i, data[i].state, x)
                // x -= barWidth; 
                ctx.fillRect(0, 0, x, barHeight);
                break;
            }
            
            // console.log(i, data[i].state, barWidth, data[i].time);

        }
        // data.forEach((value, index) => {
        //     if(index<data.length-1){
        //         ctx.fillStyle = barColor(value.state);
        //         const barWidth = calcWidth(index,canvas.width);
        //         ctx.fillRect(x, 0, barWidth, barHeight);
        //         x += barWidth; 
        //     }
            
        // });
    }, [data]); // Dependencies of useEffect: the component will re-render when data or labels change

    // Return the canvas element with a ref attached
    return <canvas ref={canvasRef}  className={className} />;
};