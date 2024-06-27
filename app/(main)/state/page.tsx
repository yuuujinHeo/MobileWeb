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
import { selectUser, setUser } from '@/store/userSlice';
import { selectStatus, setStatus } from '@/store/statusSlice';


const State: React.FC = () =>{
    const dispatch = useDispatch<AppDispatch>();
    const userState = useSelector((state:RootState) => selectUser(state));    
    const Status = useSelector((state:RootState) =>selectStatus(state));
    const [mobileURL, setMobileURL] = useState('');
    const toast_main = useRef('');

    useEffect(()=>{
        if(mobileURL == ''){
            const currentURL = window.location.href;
            var mURL = '';
            if(currentURL.startsWith('http')){
                mURL = currentURL.split(':')[0] + ':' + currentURL.split(':')[1]+":11334";
            }else{
                mURL = currentURL+":11334";
            }
            setMobileURL(mURL);
            console.log("set mobileURL : ",mobileURL, mURL);
        }
    },[])

    useEffect(() =>{
        if(mobileURL != ''){
            getStatus();
        }
    },[mobileURL])

    useEffect(() =>{
        console.log("Status:",Status);
    },[Status])

    
    function getBit(number, bitPosition) {
        return (number & (1 << bitPosition)) !== 0 ? 1 : 0;
    }
    
    function getBits(number) {
        let bits = [];
        // for (let i = 7; i >= 0; i--) { // 8비트 숫자이므로 7부터 0까지 반복
        for (let i = 0; i <8; i++) { // 8비트 숫자이므로 7부터 0까지 반복
            // console.log(i,bits);
            bits.push(getBit(number, i));
        }
        return bits;
    }
    async function getStatus(){
        const response = await axios.get(mobileURL+"/status");

        // const temp = response.data.motor[0].status;
        // console.log(temp, getBits(16))
        console.log(getBits(response.data.motor[0].status)[2]);
        dispatch(setStatus({
            condition:response.data.condition,
            pose:response.data.pose,
            vel:response.data.vel,
            power:response.data.power,
            state:response.data.state,
            time: response.data.time,
            motor0:{
                connection:response.data.motor[0].connection,
                temperature:response.data.motor[0].temperature,
                status:{
                    running:getBits(response.data.motor[0].status)[0]?true:false,
                    mode:getBits(response.data.motor[0].status)[1]?true:false,
                    jam:getBits(response.data.motor[0].status)[2]?true:false,
                    current:getBits(response.data.motor[0].status)[3]?true:false,
                    big:getBits(response.data.motor[0].status)[4]?true:false,
                    input:getBits(response.data.motor[0].status)[5]?true:false,
                    position:getBits(response.data.motor[0].status)[6]?true:false,
                    collision:getBits(response.data.motor[0].status)[7]?true:false
                }
            },
            motor1:{
                connection:response.data.motor[1].connection,
                temperature:response.data.motor[1].temperature,
                status:{
                    running:getBits(response.data.motor[1].status)[0]?true:false,
                    mode:getBits(response.data.motor[1].status)[1]?true:false,
                    jam:getBits(response.data.motor[1].status)[2]?true:false,
                    current:getBits(response.data.motor[1].status)[3]?true:false,
                    big:getBits(response.data.motor[1].status)[4]?true:false,
                    input:getBits(response.data.motor[1].status)[5]?true:false,
                    position:getBits(response.data.motor[1].status)[6]?true:false,
                    collision:getBits(response.data.motor[1].status)[7]?true:false
                }
            }
        }));
    }
    return(
        <main>
        <div className='card'>
            <div className='card'>
                <p>State</p>
                <ToggleButton checked={Status.motor0.connection} readOnly onLabel="Connected" offLabel="Disconnected" > </ToggleButton>

            </div>
        </div>
        </main>
    );
}

export default State;