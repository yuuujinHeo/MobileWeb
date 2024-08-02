'use client';
import React, { useEffect,  useContext, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { SplitButton } from 'primereact/splitbutton';
import { Button } from 'primereact/button';
import axios from 'axios';
import {Formik, useFormik, Form, Field, FormikProps} from 'formik';
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Knob } from "primereact/knob";
import { ListBox } from "primereact/listbox";
import { MultiSelect } from "primereact/multiselect";
import { RadioButton } from "primereact/radiobutton";
import { Rating } from "primereact/rating";
import { Panel } from 'primereact/panel';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import { SelectButton } from "primereact/selectbutton";
import { Tree,TreeDragDropEvent } from 'primereact/tree';
import { TreeTable } from 'primereact/treetable';
import { Slider, SliderChangeEvent } from "primereact/slider";
import { Accordion , AccordionTab} from 'primereact/accordion';
import { ToggleButton } from "primereact/togglebutton";
import styles from './index.module.scss';
import { classNames } from 'primereact/utils';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import fs from 'fs';
import { Dialog } from 'primereact/dialog';
// import { ListBox } from 'primereact/listbox';
import { FileUpload,  FileUploadState, FileUploadHandlerEvent, FileUploadSelectEvent, FileUploadUploadEvent } from 'primereact/fileupload';
import { forEachChild } from 'typescript';
import { encode } from 'punycode';
import {userContext} from '../../../interface/user'
// import { selectMonitor } from '@/store/networkSlice';
import {version, defaultVersion, newversion, defaultNewVersion,versions, defaultNewVersions,defaultVersions} from '../../../interface/update';
import { start } from 'repl';
import { useDispatch, useSelector } from 'react-redux';
import {store,AppDispatch, RootState} from '../../../store/store';
// import ChartTemp from '@/components/Chart'
import { selectUser, setUser } from '@/store/userSlice';
import { selectStatus, initState, setStatus, StatusState } from '@/store/statusSlice';
import { io } from "socket.io-client";
import { selectSetting, setRobot, setDebug, setLoc, setControl, setAnnotation, setDefault, setMotor, setMapping, setObs, MotorSetting } from '@/store/settingSlice';
import {getMobileAPIURL} from '../api/url';
import './style.scss'
import { transStatus } from '../api/to';

const Move: React.FC = () =>{
    const dispatch = useDispatch<AppDispatch>();
    const settingState = useSelector((state:RootState) => selectSetting(state));
    const userState = useSelector((state:RootState) => selectUser(state));    
    const [mobileURL, setMobileURL] = useState('');
    const toast_main = useRef('');
    let socketRef;
    const toast = useRef<Toast | null>(null);

    const [Status, setStatus] = useState<StatusState>(initState);

    const [targetX, setTargetX] = useState(0);
    const [targetY, setTargetY] = useState(0);
    const [targetRZ, setTargetRZ] = useState(0);
    const [goalID, setGoalID] = useState('');
    const [preset, setPreset] = useState<number>(3);

    useEffect(()=>{
        setURL();
    },[])
          
    useEffect(() => {
        if (!socketRef) {
          fetch("/api/socket").finally(() => {

            socketRef = io();
    
            socketRef.on("connect", () => {
              console.log("Socket connected ", socketRef.id);
            });

            socketRef.on("status", async(data) => {
                const json = JSON.parse(data);
                // console.log(json.condition.auto_state);
                setStatus(await transStatus(json));
            });

            socketRef.on("move", (data) =>{
                console.log("move response1 : ",data);
            })

          return () => {
            console.log("Socket disconnect ", socketRef.id);
            if(socketRef)
                socketRef.disconnect();
          };
        });
      }
    }, []);

    useEffect(()=>{
        return () =>{
            console.log("move page unmount");
            socketRef.disconnect();
        };
    },[])


    async function setURL(){
        setMobileURL(await getMobileAPIURL());
    }

    async function moveTarget(){
        console.log("moveTarget");

        const currentTime = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");
        const json = JSON.stringify({"command":"target",
            "x":targetX,
            "y":targetY,
            "z":0,
            "rz":targetRZ,
            "preset":preset,
            "method":"pp",
            "time":currentTime
        });

        console.log("PUSH",targetRZ);
                
        const response = await axios.post(mobileURL+'/control/move',json,{
            headers:{
            'Content-Type':'application/json'
            }
        });
        console.log("response : ",response);

        if(response.data.result == "accept"){
            toast.current?.show({
                severity: 'success',
                summary: 'Move Start',
                life: 3000
            })

            // const response = await axios.get(mobileURL+'/control/move');

            // console.log("response : ",response);

            // if(response.data.result == 'success'){
            //     toast.current?.show({
            //         severity: 'success',
            //         summary: 'Move Done',
            //         life: 3000
            //     })
            // }else{
            //     toast.current?.show({
            //         severity: 'error',
            //         summary: 'Move Failed',
            //         detail: response.data.message,
            //         life: 3000
            //     })
            // }
        }else{
            toast.current?.show({
                severity: 'error',
                summary: 'Move Failed',
                detail: response.data.message,
                life: 3000
            })
        }
    }

    const handleNodeSelect = (event) =>{

    }

    async function moveGoal(){
        console.log("moveGoal");

        const currentTime = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");

        const json = JSON.stringify({"command":"goal",
            "id":goalID,
            "preset":preset,
            "method":"pp",
            "time":currentTime
        });
                
        const response = await axios.post(mobileURL+'/control/move',json,{
            headers:{
            'Content-Type':'application/json'
            }
        });
        console.log("response : ",response);

        if(response.data.result == "accept"){
            toast.current?.show({
                severity: 'success',
                summary: 'Move Start',
                life: 3000
            })

            // const response = await axios.get(mobileURL+'/control/move');

            // console.log("response : ",response);

            // if(response.data.result == 'success'){
            //     toast.current?.show({
            //         severity: 'success',
            //         summary: 'Move Done',
            //         life: 3000
            //     })
            // }else{
            //     toast.current?.show({
            //         severity: 'error',
            //         summary: 'Move Failed',
            //         detail: response.data.message,
            //         life: 3000
            //     })
            // }
        }else{
            toast.current?.show({
                severity: 'error',
                summary: 'Move Failed',
                detail: response.data.message,
                life: 3000
            })
        }
    }

    async function movePause(){
        console.log("movePause")

        const currentTime = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");

        const json = JSON.stringify({"command":"pause",
            "time":currentTime
        });
        const response = await axios.post(mobileURL+'/control/move',json,{
            headers:{
            'Content-Type':'application/json'
            }
        });

        if(response.data.result == "accept"){
            toast.current?.show({
                severity: 'success',
                summary: 'Move Paused',
                life: 3000
            })
        }else{
            toast.current?.show({
                severity: 'error',
                summary: 'Move Paused Fail',
                detail: response.data.message,
                life: 3000
            })
        }
    }


    async function moveResume(){
        console.log("movePause")

        const currentTime = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");

        const json = JSON.stringify({"command":"resume",
            "time":currentTime
        });
        const response = await axios.post(mobileURL+'/control/move',json,{
            headers:{
            'Content-Type':'application/json'
            }
        });

        if(response.data.result == "accept"){
            toast.current?.show({
                severity: 'success',
                summary: 'Move Resumed',
                life: 3000
            })
        }else{
            toast.current?.show({
                severity: 'error',
                summary: 'Move Resumed Fail',
                detail: response.data.message,
                life: 3000
            })
        }
    }

    async function moveStop(){
        console.log("movePause")

        const currentTime = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");

        const json = JSON.stringify({"command":"stop",
            "time":currentTime
        });
        const response = await axios.post(mobileURL+'/control/move',json,{
            headers:{
            'Content-Type':'application/json'
            }
        });

        if(response.data.result == "accept"){
            toast.current?.show({
                severity: 'success',
                summary: 'Move Stopped',
                life: 3000
            })
        }else{
            toast.current?.show({
                severity: 'error',
                summary: 'Move Stopped Fail',
                detail: response.data.message,
                life: 3000
            })
        }
    }

    return(
        <main>
        <Toast ref={toast}></Toast>
            <div className='card'>
                <div className='grid'>

                <div className='col-12 md:col-6'>
                        <div className='card p-fluid' >
                            <h5 className='font-bold'>Motor 0</h5>
                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0">
                                Connection
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                    <SelectButton value={Status.motor0.connection} className={Status.motor0.connection==='true'?'con':'discon'} readOnly options={[{label:'Disconnect', value:'false'}, {label:'Connect', value:'true'}]}> </SelectButton>
                                </div>
                            </div>

                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0">
                                Status
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                {Status.motor0.connection && 
                                    <div className="flex gap-2 ">
                                        {!Status.motor0.status.running && <Tag value="Motor Off"/>}
                                        {Status.motor0.status.running && <Tag severity="success" value="Motor On" />}
                                        {Status.motor0.status.mode && <Tag severity="danger" value="Mod" />}
                                        {Status.motor0.status.jam && <Tag severity="danger" value="Jam" />}
                                        {Status.motor0.status.current && <Tag severity="danger" value="Cur" />}
                                        {Status.motor0.status.big && <Tag severity="danger" value="Big" />}
                                        {Status.motor0.status.input && <Tag severity="danger" value="Inp" />}
                                        {Status.motor0.status.position && <Tag severity="danger" value="Pos" />}
                                        {Status.motor0.status.collision && <Tag severity="danger" value="Col" />}
                                    </div>}
                                </div>
                            </div>

                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0">
                                Temperature
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                <InputNumber value={Status.motor0.temperature} readOnly suffix="℃"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-12 md:col-6'>
                        <div className='card p-fluid' >
                            <h5 className='font-bold'>Motor 1</h5>

                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0">
                                Connection
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                    <SelectButton value={Status.motor1.connection} className={Status.motor1.connection==='true'?'con':'discon'} readOnly options={[{label:'Disconnect', value:'false'}, {label:'Connect', value:'true'}]}> </SelectButton>
                                </div>
                            </div>

                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0">
                                Status
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                {Status.motor1.connection && 
                                    <div className="flex gap-2 ">
                                        {!Status.motor1.status.running && <Tag value="Motor Off"/>}
                                        {Status.motor1.status.running && <Tag severity="success" value="Motor On" />}
                                        {Status.motor1.status.mode && <Tag severity="danger" value="Mod" />}
                                        {Status.motor1.status.jam && <Tag severity="danger" value="Jam" />}
                                        {Status.motor1.status.current && <Tag severity="danger" value="Cur" />}
                                        {Status.motor1.status.big && <Tag severity="danger" value="Big" />}
                                        {Status.motor1.status.input && <Tag severity="danger" value="Inp" />}
                                        {Status.motor1.status.position && <Tag severity="danger" value="Pos" />}
                                        {Status.motor1.status.collision && <Tag severity="danger" value="Col" />}
                                    </div>}
                                </div>
                            </div>

                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0">
                                Temperature
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                <InputNumber value={Status.motor1.temperature} readOnly suffix="℃"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-12 md:col-6'>
                        <div className='card p-fluid' >
                            <h5 className='font-bold'>Power</h5>

                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                                Battery In
                                </label>
                                <div className="col-12  w-8 md:col-10">
                                <InputNumber value={Status.power.bat_in} readOnly suffix="V"/>
                                </div>
                            </div>

                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold  w-3 col-12 mb-2 md:col-2 md:mb-0">
                                Battery Out
                                </label>
                                <div className="col-12  w-8 md:col-10">
                                <InputNumber value={Status.power.bat_out} readOnly suffix="V"/>
                                </div>
                            </div>

                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                                Battery Current
                                </label>
                                <div className="col-12 w-8  md:col-10">
                                <InputNumber value={Status.power.bat_current} readOnly suffix="A"/>
                                </div>
                            </div>

                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                                Power
                                </label>
                                <div className="col-12 w-8  md:col-10">
                                <InputNumber value={Status.power.power} readOnly suffix="W"/>
                                </div>
                            </div>
                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold  w-3 col-12 mb-2 md:col-2 md:mb-0">
                                Power(Total)
                                </label>
                                {/* <ChartTemp cur={Status.power.power}></ChartTemp> */}
                                <div className="col-12  w-8 md:col-10">
                                <InputNumber value={Status.power.total_power} readOnly suffix="Wh"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-12 md:col-6'>
                        <div className='card p-fluid' >
                            <h5 className='font-bold'>State</h5>

                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                                하부 전원
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                    <SelectButton value={Status.state.power} className={Status.state.power==='true'?'con':'discon'} readOnly options={[{label:'Off', value:'false'}, {label:'On', value:'true'}]}> </SelectButton>
                                </div>
                            </div>
                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                                비상스위치(EMO)
                                </label>
                                <div className="col-12 w-8  md:col-10">
                                    <SelectButton value={Status.state.emo} className={Status.state.emo==='true'?'con':'discon'} readOnly options={[{label:'push', value:'false'}, {label:'release', value:'true'}]}> </SelectButton>
                                </div>
                            </div>
                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                                충전 선 연결
                                </label>
                                <div className="col-12  w-8 md:col-10">
                                    <SelectButton value={Status.state.emo} className={Status.state.emo==='true'?'con':'discon'} readOnly options={[{label:'Disconnect', value:'false'}, {label:'Connect', value:'true'}]}> </SelectButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card'>
                <h5 className='font-bold'>Move State</h5>
                <div className='card p-fluid' >
                    <div className="field grid gap-5">
                        <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                        auto_state
                        </label>
                        <div className="col-12 w-8 md:col-10">
                            <SelectButton value={Status.condition.auto_state} readOnly options={[{label:'Stop', value:'stop'}, {label:'Move', value:'move'}, {label:'Pause', value:'pause'}]}> </SelectButton>
                        </div>
                    </div>
                    <div className="field grid gap-5">
                        <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                        obs_state
                        </label>
                        <div className="col-12 w-8  md:col-10">
                            <SelectButton value={Status.condition.obs_state} readOnly options={[{label:'None', value:'none'}, {label:'Far', value:'far'}, {label:'Near', value:'near'}, {label:'Stuck', value:'stuck'}, {label:'Eband', value:'eband'}]}> </SelectButton>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card'>
                <div className='grid'>
                    <div className='col-12 md:col-6'>
                        <div className='card p-fluid'>
                        <h5 className='font-bold'>Target Move</h5>
                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                                X
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                    <InputNumber
                                        value={targetX}
                                        onValueChange={(e)=>setTargetX(e.value as number)}
                                        minFractionDigits={3}
                                    ></InputNumber>
                                </div>
                            </div>
                        
                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                                Y
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                    <InputNumber
                                        value={targetY}
                                        onValueChange={(e)=>setTargetY(e.value as number)}
                                        minFractionDigits={3}
                                    ></InputNumber>
                                </div>
                            </div>
                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                                RZ
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                    <InputNumber
                                        value={targetRZ}
                                        onValueChange={(e)=>setTargetRZ(e.value as number)}
                                        minFractionDigits={3}
                                    ></InputNumber>
                                </div>
                            </div>
                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                                PRESET
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                    <InputNumber value={preset} readOnly className="w-full" />
                                    <Slider
                                        value={preset}
                                        min={0}
                                        max={5}
                                        onChange={(e:SliderChangeEvent) => setPreset(e.value as number)} step={1}
                                    ></Slider>
                                </div>
                            </div>
                            <Button onClick={moveTarget}>GO</Button>
                            </div>
                    </div>
                    <div className='col-12 md:col-6'>
                        <div className='card p-fluid'>
                        <h5 className='font-bold'>Goal Move</h5>
                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                                GOAL
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                    <InputText
                                        value={goalID}
                                        onChange={(e)=>setGoalID(e.target.value)}
                                    ></InputText>
                                </div>
                            </div>
                            <div className="field grid gap-5">
                                <label htmlFor="name3" className="font-bold w-3  col-12 mb-2 md:col-2 md:mb-0">
                                PRESET
                                </label>
                                <div className="col-12 w-8 md:col-10">
                                    <InputNumber value={preset} readOnly className="w-full" />
                                    <Slider
                                        value={preset}
                                        min={0}
                                        max={5}
                                        onChange={(e:SliderChangeEvent) => setPreset(e.value as number)} step={1}
                                    ></Slider>
                                </div>
                            </div>
                            <Button onClick={moveGoal}>GO</Button>
                        </div>
                    </div>
                    <div className='col-12 md:col-6'>
                        <div className='card'>
                        <h5 className='font-bold'>Command</h5>
                        <div className="field grid gap-5">
                            <Button onClick={movePause}>Pause</Button>
                            <Button onClick={moveResume}>Resume</Button>
                            <Button onClick={moveStop}>Stop</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Move;