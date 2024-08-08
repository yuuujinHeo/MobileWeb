'use client';
import React, { useEffect, useContext, useRef, useState } from 'react';
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
import { Slider } from "primereact/slider";
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
import { selectStatus } from '@/store/statusSlice';
import { io } from "socket.io-client";
import { selectSetting, setRobot, setDebug, setLoc, setControl, setAnnotation, setDefault, setMotor, setMapping, setObs, MotorSetting } from '@/store/settingSlice';
import './style.scss';
import {getMobileAPIURL} from '../api/url';
import { transStatus } from '../api/to';

const State: React.FC = () =>{
    const dispatch = useDispatch<AppDispatch>();
    const settingState = useSelector((state:RootState) => selectSetting(state));
    const userState = useSelector((state:RootState) => selectUser(state));    
    // const Status = useSelector((state:RootState) => selectStatus(state));
    const [mobileURL, setMobileURL] = useState('');
    const Status = useSelector((state:RootState) => selectStatus(state));

    // const [Status, setStatus] = useState<StatusState>(initState);

    useEffect(()=>{
        setURL();
        console.log(Status);
    },[])

          
    async function setURL(){
        setMobileURL(await getMobileAPIURL());
    }



    return(
        <main>
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
        </main>
    );
}

export default State;