/* eslint-disable @next/next/no-img-element */
'use client';
import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useEffect, useState, useContext, useImperativeHandle, useRef } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { selectStatus, setStatus, setPose, setVel, setCondition, setMotor0, setMotor1, setLidar0, setLidar1, setIMU, setPower, setTime, setState, StatusState } from '@/store/statusSlice';
import { Chip } from 'primereact/chip';
import { useDispatch, useSelector } from 'react-redux';
import {AppDispatch, RootState} from '../store/store';
import { transStatus } from '@/app/(main)/api/to'
import { io } from "socket.io-client";
import {getMobileAPIURL} from '@/app/(main)/api/url';
import { selectSetting, setRobot, setDebug, setLoc, setControl, setAnnotation, setDefault, setMotor, setMapping, setObs, MotorSetting } from '@/store/settingSlice';
import axios from 'axios';
import { setTaskRunning, setTaskID } from '@/store/taskSlice';
import emitter from '@/lib/eventBus';


const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const dispatch = useDispatch<AppDispatch>();
    const Status = useSelector((state:RootState) => state.status);

    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const [mobileURL, setMobileURL] = useState('');

    const [slamnav, setSlamnav] = useState(false);
    const [task, setTask] = useState(false);
    const [map, setMap] = useState<string>('');
    const [local, setLocal] = useState<string>('none');
    const socketRef = useRef<any>();


    useEffect(() =>{
        setURL();
    },[])

    async function setURL(){
        setMobileURL(await getMobileAPIURL());
    }

    useEffect(()=>{
        if(mobileURL != ''){
            default_setting();

            const interval = setInterval(()=>{
                get_connection();
            },3000);
        
            return () =>{
                clearInterval(interval);
            }
        }
    },[mobileURL])


    const default_setting = async() =>{
        const response = await axios.get(mobileURL+'/setting');
        dispatch(setRobot(response.data.robot));
        dispatch(setDebug(response.data.debug));
        dispatch(setLoc(response.data.loc));
        dispatch(setAnnotation(response.data.annotation));
        dispatch(setDefault(response.data.default));
        dispatch(setMotor(response.data.motor));
        dispatch(setMapping(response.data.mapping));
        dispatch(setObs(response.data.obs));
    }
    const get_connection = async() =>{
        const response = await axios.get(mobileURL+'/connection');
        setSlamnav(response.data.SLAMNAV);
        setTask(response.data.TASK);
    }

    useEffect(() => {
        if (!socketRef.current) {
          fetch("/api/socket").finally(() => {
            socketRef.current = io();
            emitter.emit('socket','connected');
    
            socketRef.current.on("connect", () => {
              console.log("Socket connected ", socketRef.current.id);
            });
        
            socketRef.current.on("status", async(data) => {
                const json = JSON.parse(data);
                const json_re = await transStatus(json);
                dispatch(setPose(json_re.pose));
                dispatch(setVel(json_re.vel));
                dispatch(setCondition(json_re.condition));
                dispatch(setMotor0(json_re.motor0));
                dispatch(setMotor1(json_re.motor1));
                dispatch(setLidar0(json_re.lidar0));
                dispatch(setLidar1(json_re.lidar1));
                dispatch(setIMU(json_re.imu));
                dispatch(setPower(json_re.power));
                dispatch(setState(json_re.state));
                dispatch(setTime(json_re.time));
            });

            socketRef.current.on("task_id", (data) => {
                dispatch(setTaskID(data));
            });
            
            socketRef.current.on("task", (data) => {
                console.log("socket task in",data);
                emitter.emit('task',data);
                if(data == "start"){
                    dispatch(setTaskRunning(true));
                }else{
                    dispatch(setTaskRunning(false));
                }                
            });
    //         socketRef.on("move", (data) =>{
    //             console.log("move response1 : ",data);
    //         })
          return () => {
            console.log("Socket disconnect ", socketRef.current.id);
            emitter.emit('socket','disconnected');
            socketRef.current.disconnect();
          };
        });
      }
    }, []);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const SLAMContent = (
        <>
            <span style={{backgroundColor:slamnav==true?'#12d27c':'#ea594e'}} className={slamnav==true?'bg-good border-circle w-2rem h-2rem flex align-items-center justify-content-center':'bg-error border-circle w-2rem h-2rem flex align-items-center justify-content-center'}>
                <i className='pi pi-compass' style={{color:'white'}}/>
            </span>
            <span className='ml-2 font-medium'>SLAM {slamnav==true?'Con':'Discon'}</span>
        </>
    );

    const TASKContent = (
        <>
            <span style={{backgroundColor:task==true?'#12d27c':'#ea594e'}} className={task==true?'bg-good border-circle w-2rem h-2rem flex align-items-center justify-content-center':'bg-error border-circle w-2rem h-2rem flex align-items-center justify-content-center'}>
                <i className='pi pi-directions' style={{color:'white'}}/>
            </span>
            <span className='ml-2 font-medium'>TASK {task==true?'Con':'Discon'}</span>
        </>
    );
    const MAPContent = (
        <>
            <span style={{backgroundColor:Status.state.map!=''?'#12d27c':'#ea594e'}} className={Status.state.map!=''?'bg-good border-circle w-2rem h-2rem flex align-items-center justify-content-center':'bg-error border-circle w-2rem h-2rem flex align-items-center justify-content-center'}>
                <i className='pi pi-map' style={{color:'white'}}/>
            </span>
            <span className='ml-2 font-medium'>MAP : {Status.state.map}</span>
        </>
    );
    const LocalContent = (
        <>
            <span style={{backgroundColor:Status.state.localization=='good'?'#12d27c':'#ea594e'}} className={Status.state.localization=='good'?'bg-good border-circle w-2rem h-2rem flex align-items-center justify-content-center':'bg-error border-circle w-2rem h-2rem flex align-items-center justify-content-center'}>
                <i className='pi pi-map-marker' style={{color:'white'}}/>
            </span>
            <span className='ml-2 font-medium'>LOCAL : {Status.state.localization}</span>
        </>
    );
    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                {/* <img src={`/layout/images/rainbow_logo.png`} width="100px" height={'50'} alt="logo" /> */}
                <span>MobileWeb</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <Chip className='pl-0 pr-3 mr-2' template={SLAMContent}></Chip>
            <Chip className='pl-0 pr-3 mr-2' template={TASKContent}></Chip>
            <Chip className='pl-0 pr-3 mr-2' template={MAPContent}></Chip>
            <Chip className='pl-0 pr-3 mr-2' template={LocalContent}></Chip>


            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-user"></i>
                    <span>Profile</span>
                </button>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
