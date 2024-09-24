/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
// import { ProductService } from '../../demo/service/ProductService';
import { LayoutContext } from '../../layout/context/layoutcontext';
import Link from 'next/link';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Demo } from '@/types';
import { ChartData, ChartOptions } from 'chart.js';
import {userContext} from '../../interface/user'
import { io } from "socket.io-client";
import {AppDispatch, RootState} from '@/store/store';
import { selectSetting } from '@/store/settingSlice';
import { Chip } from 'primereact/chip';
import { selectStatus,  setStatus, StatusState } from '@/store/statusSlice';
import { transStatus } from '@/app/(main)/api/to'
import { useMemo } from 'react';
import './style.scss'
import LidarCanvas from '@/components/LidarCanvas';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { GoSmiley, GoFlame, GoAlert, GoUnlink, GoQuestion } from 'react-icons/go';
import { CiPlay1, CiPause1, CiStop1 } from 'react-icons/ci';
import { IoLocation, IoPlay, IoPause, IoStop, IoPower, IoWalk } from 'react-icons/io5';
import { IoIosSwitch } from 'react-icons/io';
import { PiBatteryChargingFill } from 'react-icons/pi';
import { Divider } from 'primereact/divider';
import axios from 'axios';
import TaskView from '@/components/TaskView';
import { Chart } from 'primereact/chart';
// import { Chart, registerables } from 'chart.js';
// import { Bar } from 'react-chartjs-2';
import ChartLive from '@/components/Chart';
import disconIcon from '@/public/icon/discon.svg'
import ChartEx, {Datainfo} from '@/components/Chartmin';
import ChartGoogle from "react-google-charts";
import Color from '@/public/colors';
import {ChartCustom} from '@/components/ChartCanvas';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Avatar } from 'primereact/avatar';
import { ShowChartOutlined } from '@mui/icons-material';
import { damp } from 'three/src/math/MathUtils';
import Network from './network/page';

interface LogStateData {
    time: Date;
    state: string;
    auto_state: string;
    localization: string;
    power: boolean;
    emo: boolean;
    obs_state: string;
    charging: boolean;
    inlier_ratio: number;
    inlier_error: number;
}
interface LogPowerData {
    time: Date;
    battery_in: number;
    battery_out: number;
    battery_current: number;
    power: number;
    total_power: number;
    motor0_temp: number;
    motor0_current: number;
    motor0_status: number;
    motor1_temp: number;
    motor1_current: number;
    motor1_status: number;
}
  


const Dashboard = () => {
    const taskState = useSelector((state: RootState) => state.task);
    const Status = useSelector((state: RootState) => state.status);
    const Network = useSelector((state:RootState) => state.network);
    const Path = useSelector((state:RootState) => state.path);
    
    const [logState, setLogState] = useState<LogStateData[]>([]);
    const [logPower, setLogPower] = useState<LogPowerData[]>([]);
    const [logBattery, setLogBattery] = useState<Datainfo[]>([]);
    const batteryData :Datainfo[] = useMemo(()=> logBattery.map(item=>({time:item.time,value:item.value})), [logBattery])
    const stateData = useMemo(() => logState, [logState])
    const warn_temp = 50;

    // const batteryData: Datainfo[] = [
    //     { time: '2024-09-13T10:00:00', battery: 75 },
    //     { time: '2024-09-13T10:05:00', battery: 70 },
    //     { time: '2024-09-13T10:10:00', battery: 65 }
    // ];
    const getLog = async() =>{
        const response = await axios.get(Network.mobile + "/log/state/state");
        setLogState(response.data);
        const response2 = await axios.get(Network.mobile + "/log/power/battery");
        // setLogPower(response2.data);
        setLogBattery(response2.data);
    }

    useEffect(() => {
        if(Network.mobile != ''){
            getLog();
            const logTimer = setInterval(() => {
                getLog();
                return () => {
                    clearInterval(logTimer);
                }
            },10000);
        }
    },[Network])

    useEffect(()=>{
        console.log("Path Changed : ", Path);
    },[Path])

    const autoStateIcon = () => {
        if(Status.condition.auto_state == 'pause'){
            return <Avatar icon={<IoPause/>} style={{backgroundColor:Color.warn, color:'white'}} shape='circle'></Avatar>;
        }else if(Status.condition.auto_state == 'move'){
            return <Avatar icon={<IoPlay/>} style={{backgroundColor:Color.good, color:'white'}}  shape='circle'></Avatar>;
        }else{//stop
            return <Avatar icon={<IoStop/>} style={{backgroundColor:Color.none, color:'white'}} shape='circle'></Avatar>;
        }
    }
    const localizationIcon = () => {
        if(Status.state.localization == 'fail'){
            return <Avatar icon={<IoLocation/>} style={{backgroundColor:Color.error, color:'white'}} shape='circle'></Avatar>;
        }else if(Status.state.localization == 'good'){
            return <Avatar icon={<IoLocation/>} style={{backgroundColor:Color.good, color:'white'}}  shape='circle'></Avatar>;
        }else{//none
            return <Avatar icon={<IoLocation/>} style={{backgroundColor:Color.error, color:'white'}} shape='circle'></Avatar>;
        }
    }
    const chargingIcon = () =>{
        if(Status.state.charge == "true"){
            return <Avatar icon={<PiBatteryChargingFill/>} style={{backgroundColor:Color.good, color:'white'}} shape='circle'></Avatar>;
        }else{
            return <Avatar icon={<PiBatteryChargingFill/>} style={{backgroundColor:Color.none, color:'white'}} shape='circle'></Avatar>;
        }
    }
    const powerIcon = () =>{
        if(Status.state.power == "true"){
            return <Avatar icon={<IoPower/>} style={{backgroundColor:Color.good, color:'white'}} shape='circle'></Avatar>;
        }else{
            return <Avatar icon={<IoPower/>} style={{backgroundColor:Color.error, color:'white'}} shape='circle'></Avatar>;
        }
    }
    const emoIcon = () =>{
        if(Status.state.emo == "true"){
            return <Avatar icon={<IoIosSwitch/>} style={{backgroundColor:Color.none, color:'white'}} shape='circle'></Avatar>;
        }else{
            return <Avatar icon={<IoIosSwitch/>} style={{backgroundColor:Color.error, color:'white'}} shape='circle'></Avatar>;
        }
    }
    const obsIcon = () =>{
        if(Status.condition.obs_state == "none"){
            return <Avatar icon={<IoWalk/>} style={{backgroundColor:Color.none, color:'white'}} shape='circle'></Avatar>;
        }else if(Status.condition.obs_state == "far"){
            return <Avatar icon={<IoWalk/>} style={{backgroundColor:Color.warn, color:'white'}} shape='circle'></Avatar>;
        }else{
            return <Avatar icon={<IoWalk/>} style={{backgroundColor:Color.error, color:'white'}} shape='circle'></Avatar>;
        }
    }


    const motorIcon = (id:number) => {
        if(id == 0){
            if(Status.motor0.connection){
                if(Status.motor0.status.big || Status.motor0.status.collision || Status.motor0.status.current || Status.motor0.status.input 
                    || Status.motor0.status.jam || Status.motor0.status.mode || Status.motor0.status.position){
                        //error
                        return <GoAlert/>;
                }else if(Status.motor0.status.running){
                    if(Status.motor0.temperature > warn_temp){
                        //hot
                        return <GoFlame/>;
                    }else{
                        //good
                        return <GoSmiley/>;
                    }
                }else{
                    //not ready
                        return <GoQuestion/>;
                }
            }else{
                //discon
                return <GoUnlink/>;
            }
        }else{
            if(Status.motor1.connection){
                if(Status.motor1.status.big || Status.motor1.status.collision || Status.motor1.status.current || Status.motor1.status.input 
                    || Status.motor1.status.jam || Status.motor1.status.mode || Status.motor1.status.position){
                        //error
                        return <GoAlert/>;
                }else if(Status.motor1.status.running){
                    if(Status.motor1.temperature > warn_temp){
                        //hot
                        return <GoFlame/>;
                    }else{
                        //good
                        return <GoSmiley/>;
                    }
                }else{
                    //not ready
                    return <GoQuestion/>;
                }
            }else{
                //discon
                return <GoUnlink/>;
            }
        }
    }
    const motorColor = (id:number) =>{
        if(id == 0){
            if(Status.motor0.connection){
                if(Status.motor0.status.big || Status.motor0.status.collision || Status.motor0.status.current || Status.motor0.status.input 
                    || Status.motor0.status.jam || Status.motor0.status.mode || Status.motor0.status.position){
                        //error
                        return Color.error;
                }else if(Status.motor0.status.running){
                    if(Status.motor0.temperature > warn_temp){
                        //hot
                        return Color.warn;
                    }else{
                        //good
                        return Color.good;
                    }
                }else{
                    //not ready
                        return Color.error;
                }
            }else{
                //discon
                return Color.discon;
            }
        }else{
            if(Status.motor1.connection){
                if(Status.motor1.status.big || Status.motor1.status.collision || Status.motor1.status.current || Status.motor1.status.input 
                    || Status.motor1.status.jam || Status.motor1.status.mode || Status.motor1.status.position){
                        //error
                        return Color.error;
                }else if(Status.motor1.status.running){
                    if(Status.motor1.temperature > warn_temp){
                        //hot
                        return Color.warn;
                    }else{
                        //good
                        return Color.good;
                    }
                }else{
                    //not ready
                        return Color.error;
                }
            }else{
                //discon
                return Color.discon;
            }
        }
    }
    const stateChip = () =>{
        if(Status.state.charge == "true"){
            return <Chip label="Charging" style={{backgroundColor:Color.charging, color:'white'}}/>;
        }else{
            if(Status.state.power == "false"){
                return <Chip label="Power Off" style={{backgroundColor:Color.brown, color:'white'}}/>;
            }else if(Status.condition.mapping_ratio! > 1){
                return <Chip label="Mapping" style={{backgroundColor:Color.warn, color:'white'}}/>;
            }else{
                if(Status.state.map == "" || Status.state.localization != "good" || !Status.motor0.status.running
                    || !Status.motor1.status.running)
                {
                    return <Chip label="Not Ready" style={{backgroundColor:Color.brown, color:'white'}}/>;
                }else if(Status.condition.obs_state != 'none'){
                    return <Chip label="Obstacle" style={{backgroundColor:Color.error, color:'white'}}/>;
                }else if(Status.condition.auto_state == 'move'){
                    return <Chip label="Moving" style={{backgroundColor:Color.good, color:'white'}}/>;
                }else if(Status.condition.auto_state == 'pause'){
                    return <Chip label="Puased" style={{backgroundColor:Color.error, color:'white'}}/>;
                }else if(Status.condition.auto_state == 'stop'){
                    return <Chip label="Ready" style={{backgroundColor:Color.none}}/>;
                }else{
                    console.log("WHAT???????????????!!!!!!!!!!!!!!!!!!!!!!");
                }
            }
        }
    }

    return(
    <main >
        <div className = 'layout-main'>
        <div className = 'layout-top'>
            <div className='card state-box'>
                <h4 className='state-text2'>
                    {Status.power.bat_out} V
                </h4>
                <h3 className='state-text'>
                    Battery
                </h3>
                <div className='chart-box'>
                    <ChartEx data={batteryData} />
                </div>
            </div>
            <div className='card state-box'>
                <h3 className='state-text'>
                    Motor
                </h3>
                <div className='state-box-2'>
                    <div className='motor-box'>
                        <h5 >
                            RIGHT
                        </h5>
                        {/* DISCON GOOD NOT_INIT HOT*/}
                        <Avatar size="xlarge" icon={motorIcon(0)} style={{backgroundColor:motorColor(0), color:'#ffffff'}} shape="circle"/>
                    </div>
                    <Divider layout='vertical'/>

                    <div className='motor-box'>
                        <h5 >
                            LEFT
                        </h5>
                        <Avatar size="xlarge" icon={motorIcon(1)} style={{backgroundColor:motorColor(0), color:'#ffffff'}} shape="circle"/>
                    </div>
                </div>
                
            </div>
            <div className='card state-box'>
                <h3 className='state-text'>
                    State
                </h3>
                <h4 className='state-text2'>
                    {stateChip()}
                </h4>
                <div className='state-box-3'>
                    {autoStateIcon()} 
                    {localizationIcon()}
                    {chargingIcon()}
                    {powerIcon()}
                    {emoIcon()}
                    {obsIcon()}
                </div>
                <div className='chart-box2'>
                    <ChartCustom data={stateData} className='state-chart'/>
                </div>
            </div>
            <div className='card state-box'>
                <h3 className='state-text'>
                    Program
                </h3>
                <div className='state-box-4'>
                    <div className='ty'>
                        <h5 >
                            SLAMNAV2
                        </h5>
                        <Chip label="v0.0.1"></Chip>
                    </div>
                    <div className='ty'>
                        <h5 >
                            Server
                        </h5>
                        <Chip label="v0.2.0"></Chip>
                    </div>
                    <div className='ty'>
                        <h5 >
                            Web
                        </h5>
                        <Chip label="v0.2.0"></Chip>
                    </div>
                </div>

            </div>
        </div>
        <div className='layout-under'>
            <div className='card box-map'>
                <LidarCanvas 
                    className="canvas-default"
                    cloudData={null}
                    topoData={null}
                />
            </div>
            <div className='card box-task'>
                <TaskView></TaskView>
            </div>
        </div>

        </div>
    </main>
);
}

export default Dashboard;
