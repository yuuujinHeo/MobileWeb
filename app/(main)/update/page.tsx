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
import {store,AppDispatch, RootState} from '../../../store/store';
import { useDispatch, UseDispatch, useSelector } from 'react-redux';
import { setMonitorURL, setMobileURL, selectMonitor, selectMobile } from '@/store/networkSlice';
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
import { selectSetting } from '@/store/settingSlice';
import {getMobileAPIURL} from '../api/url';


const Update: React.FC = () =>{
    const [displayUpload, setDisplayUpload] = useState(false);
    const [displayRollback, setDisplayRollback] = useState(false);
    const [programRollback, setProgramRollback] = useState('');
    const basicDialogFooter = <Button type="button" label="OK" onClick={() => setDisplayUpload(false)} icon="pi pi-check" outlined />;
    
    const {state,setState} = useContext(userContext);
    const [files, setFiles] = useState([]);
    const toast = useRef<Toast | null>(null);
    const toast_main = useRef<Toast | null>(null);
    const uploader = useRef<FileUpload | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const [newVersionUI, setNewVersionUI] = useState<newversion>(defaultNewVersion);
    const [curVersionUI, setCurVersionUI] = useState<version>(defaultVersion);
    const [newVersionSLAMNAV, setNewVersionSLAMNAV] = useState<newversion>(defaultNewVersion);
    const [curVersionSLAMNAV, setCurVersionSLAMNAV] = useState<version>(defaultVersion);
    const [newVersionSLAMNAV2, setNewVersionSLAMNAV2] = useState<newversion>(defaultNewVersion);
    const [curVersionSLAMNAV2, setCurVersionSLAMNAV2] = useState<version>(defaultVersion);
    const [runningUI, setRunningUI] = useState(false);
    const [waitingUI, setWatingUI] = useState(false);
    const [runningSLAMNAV, setRunningSLAMNAV] = useState(false);
    const [waitingSLAMNAV, setWaitingSLAMNAV] = useState(false);
    const [runningSLAMNAV2, setRunningSLAMNAV2] = useState(false);
    const [waitingSLAMNAV2, setWaitingSLAMNAV2] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const monitorURL = useSelector((state:RootState) => selectMonitor(state));
    const [type, setType] = useState('');
    const settingState = useSelector((state:RootState) => selectSetting(state));
    
    const [mobileURL, setMobileURL] = useState('');

    useEffect(()=>{
        console.log("useEffect");
        setURL();
    },[])

    useEffect(()=>{
        if(mobileURL != ''){
            getType();
        }
    },[mobileURL])

    useEffect(()=>{
        if(type != ''){
            readVersion();
            readUpdate();
        }
    },[type])

    async function getType(){
        try{
            const response = await axios.get(mobileURL+'/setting');
            console.log("set Type : ",response.data.robot.PLATFORM_TYPE)
            setType(response.data.robot.PLATFORM_TYPE);
        }catch(err){
            console.error(err);
        }
    }

    async function setURL(){
        setMobileURL(await getMobileAPIURL());
    }
    const onFileUpload = () => {
        console.log("onupload");
        toast.current?.show({
            severity: 'info',
            summary: 'Success',
            detail: 'File Uploaded',
            life: 3000
        });
    };

    function refresh(){
        readVersion();
        readUpdate();
    }
    
    const onUpload = (event:FileUploadHandlerEvent) => {
        const formData = new FormData();
        // const encodedFilename = Buffer.from(event.files[0].name,'ascii').toString('utf8' );
        // const file = event.files[0];
        formData.append('file', event.files[0]);
        formData.append('token',state.token);

        // console.log(event.options.props.pro);
        // console.log("hello? " ,formData,file,encodedFilename);
            
        const config = {
            headers: {
            'content-type': 'multipart/form-data; charset=utf-8',
            'authorization': state.token
        }
        };
        axios.post(monitorURL+"/upload/files", formData, config)
          .then(response => {
            console.log('File uploaded successfully:', response.data);
            uploader.current?.clear();
            uploader.current?.setUploadedFiles(event.files);  
          })
          .catch(error => {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed',
                detail: 'File Upload Failed',
                life: 3000
            })

            uploader.current?.clear();
            console.error('Error uploading file:', error);
          });
      };
      


    const readUpdate = async() =>{
        
        if(settingState.robot.PLATFORM_TYPE == "AMR"){
            try{
                const response = await axios.get(monitorURL+'/versions/SLAMNAV2');
                console.log("slamnav2(new):",newVersionUI)
                setNewVersionSLAMNAV2(response.data);
            }catch(error){
                // alert(error);
            }
        }else{
            try{
                const response = await axios.get(monitorURL+'/versions/MAIN_MOBILE');
                console.log("main_mobile(new):",newVersionUI)
                setNewVersionUI(response.data);
            }catch(error){
                // alert(error);
            }
            try{
                const response = await axios.get(monitorURL+'/versions/SLAMNAV');
                console.log("slamnav(new):",newVersionUI)
                setNewVersionSLAMNAV(response.data);
            }catch(error){
                // alert(error);
            }

        }
    }

    const readVersion = async() =>{

        if(settingState.robot.PLATFORM_TYPE == "AMR"){
            try{
                const response = await axios.get(mobileURL+'/versions/SLAMNAV2');
                console.log("slamnav2:",response.data.data);
                if(response.data.data != undefined){
                    setCurVersionSLAMNAV2(response.data.data);
                }   
            }catch(error){
                console.error("slamnav2 = ",error);
            }
        }else{
            try{
                const response = await axios.get(mobileURL+'/versions/MAIN_MOBILE');
                console.log("ui:",response.data.data);
                if(response.data.data != undefined){
                    setCurVersionUI(response.data.data);
                }   
            }catch(error){
                console.error("ui = ",error);
            }
            try{
                const response = await axios.get(mobileURL+'/versions/SLAMNAV');
                console.log("slamnav:",response.data.data);
                if(response.data.data != undefined){
                    setCurVersionSLAMNAV(response.data.data);
                }   
            }catch(error){
                console.error("slamnav = ",error);
            }
        }

    }


    function update(_program:string, _version:string){
        if(_program === "MAIN_MOBILE"){
            updateUI(_version);
        }else if(_program === "SLAMNAV2"){
            updateSLAMNAV2(_version);
        }else if(_program === "SLAMNAV"){
            updateUI(_version);
        }else{

        }
    }
    async function updateSLAMNAV2(_version:string){
        try{
            setWaitingSLAMNAV2(true); 
            console.log(curVersionSLAMNAV2);
            if(_version==undefined){
                toast_main.current?.show({
                    severity: 'error',
                    summary: 'Update',
                    detail: 'Version is undefined',
                    life: 3000
                })
                setWaitingSLAMNAV2(false); 
            }else if(_version==curVersionSLAMNAV2.version){
                toast_main.current?.show({
                    severity: 'warn',
                    summary: 'Update',
                    detail: 'Already updated',
                    life: 3000
                })
                setWaitingSLAMNAV2(false); 
            }else{
                const body = {
                    program: "SLAMNAV2",
                    new_version: _version,
                    cur_version: curVersionSLAMNAV2.version,
                    path: '/code/build-SLAMNAV2-Desktop-Release/SLAMNAV2',
                    auth:state
                }
                const _url =mobileURL+'/update/'
                const response = await axios.post(_url,body);
    
                console.log(response);

                toast_main.current?.show({
                    severity: 'success',
                    summary: 'Update',
                    detail: 'Update successfully finished\r\n'+response.data.log.date,
                    life: 3000
                })

                setCurVersionSLAMNAV2({prev_version:response.data.log.prev_version,version:response.data.log.new_version,date:response.data.log.date});
                setDisplayRollback(false);
                setWaitingSLAMNAV2(false); 
            }
        }catch(error){
            console.log(error);
            toast_main.current?.show({
                severity: 'error',
                summary: 'Update',
                detail: 'Update Failed',
                life: 3000
            })
            setWaitingSLAMNAV2(false); 
        }
    }
    async function updateSLAMNAV(_version:string){
        try{
            setWaitingSLAMNAV(true); 
            console.log(curVersionSLAMNAV);
            if(_version==undefined){
                toast_main.current?.show({
                    severity: 'error',
                    summary: 'Update',
                    detail: 'Version is undefined',
                    life: 3000
                })
                setWaitingSLAMNAV(false); 
            }else if(_version==curVersionSLAMNAV.version){
                toast_main.current?.show({
                    severity: 'warn',
                    summary: 'Update',
                    detail: 'Already updated',
                    life: 3000
                })
                setWaitingSLAMNAV(false); 
            }else{
                const body = {
                    program: "SLAMNAV",
                    new_version: _version,
                    cur_version: curVersionSLAMNAV.version,
                    path: '/RB_MOBILE/release/SLAMNAV',
                    auth:state
                }
                const _url =mobileURL+'/update/'
                const response = await axios.post(_url,body);
    
                console.log(response);

                toast_main.current?.show({
                    severity: 'success',
                    summary: 'Update',
                    detail: 'Update successfully finished\r\n'+response.data.log.date,
                    life: 3000
                })

                setCurVersionSLAMNAV({prev_version:response.data.log.prev_version,version:response.data.log.new_version,date:response.data.log.date});
                setDisplayRollback(false);
                setWaitingSLAMNAV(false); 
            }
        }catch(error){
            console.log(error);
            toast_main.current?.show({
                severity: 'error',
                summary: 'Update',
                detail: 'Update Failed',
                life: 3000
            })
            setWaitingSLAMNAV(false); 
        }
    }

    async function updateUI(_version:string){
        try{
            setWatingUI(true); 
            console.log(curVersionUI);
            if(_version==undefined){
                toast_main.current?.show({
                    severity: 'error',
                    summary: 'Update',
                    detail: 'Version is undefined',
                    life: 3000
                })
                setWatingUI(false); 
            }else if(_version==curVersionUI.version){
                toast_main.current?.show({
                    severity: 'warn',
                    summary: 'Update',
                    detail: 'Already updated',
                    life: 3000
                })
                setWatingUI(false); 
            }else{
                const body = {
                    program: "MAIN_MOBILE",
                    new_version: _version,
                    cur_version: curVersionUI.version,
                    path: '/RB_MOBILE/release/MAIN_MOBILE',
                    auth:state
                }
                console.log("??????????");
                const _url =mobileURL+'/update/'
                const response = await axios.post(_url,body);
    
                console.log(response);

                toast_main.current?.show({
                    severity: 'success',
                    summary: 'Update',
                    detail: 'Update successfully finished\r\n'+response.data.log.date,
                    life: 3000
                })

                setCurVersionUI({prev_version:response.data.log.prev_version,version:response.data.log.new_version,date:response.data.log.date});
                setDisplayRollback(false);
                setWatingUI(false); 
            }
        }catch(error){
            console.log(error);
            toast_main.current?.show({
                severity: 'error',
                summary: 'Update',
                detail: 'Update Failed',
                life: 3000
            })
            setWatingUI(false); 
        }
    }

    const UploadDialog = () => {
        return(
            <Dialog header="Dialog" visible={displayUpload} style={{ width: '60vw' }} modal footer={basicDialogFooter} onHide={() => setDisplayUpload(false)}>
                <Toast ref={toast}></Toast>
                <FileUpload ref={uploader} name="file" customUpload accept="*" multiple uploadHandler={onUpload} onUpload={onFileUpload} />
            </Dialog>
        )
    }

    const RollbackDialog = () => {
        const [rollbackVersion,setRollbackVersion] = useState<newversion>(defaultNewVersion);
        const [rollbackVersions,setRollbackVersions] = useState<newversion[]>([defaultNewVersion]);
        
        const readVersions = async() =>{
            if(programRollback != ''){
                console.log("?????????????",programRollback);
                try{
                    const response = await axios.get(monitorURL+'/versions/all/'+programRollback);
                    setRollbackVersions(response.data);
                }catch(error){
                    console.error("readVersion : ",error);
                }
            }
        }
        useEffect(()=>{
            readVersions();
        },[])

        const selectedVersionTemplate = (option:any, props:DropdownProps) => {
            if (option) {
                return (
                    <div className="flex align-items-center">
                        <div>{option.version}</div>
                    </div>
                );
            }
    
            return <span>{props.placeholder}</span>;
        };
    
        const versionTemplate = (option:any) => {
            return (
                <div className="card p-1 flex justify-content-center">
                    <div className="col-12">
                        <div className="flex flex-column md:flex-row align-items-center p-1 w-full">
                            <Chip label={option.version} className="justify-content-center md:w-10rem shadow-2 font-bold"/>
                            <div className="flex-1 flex flex-column align-items-center text-center md:text-left">
                                <div className="">message : {option.message}</div>
                                <div className="mb-2">date : {option.date}</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        return(
            <Dialog header="롤백" visible={displayRollback} style={{ width: '60vw' }} modal onHide={() => {setProgramRollback('');setDisplayRollback(false)}}>
                <div className="card flex justify-content-center">
                    <Dropdown value={rollbackVersion} onChange={(e) => setRollbackVersion(e.value)} options={rollbackVersions} optionLabel="version" placeholder="Select a Rollback Version" 
                        valueTemplate={selectedVersionTemplate} itemTemplate={versionTemplate} className="border w-full" />
                </div>   
                <Button disabled={waitingUI} style={{marginLeft:10}} onClick={() =>{update(programRollback, rollbackVersion.version );
                                                                                    setDisplayRollback(false);}}>Rollback</Button> 
            </Dialog>
        )
    }

    async function startProgram(filename:string){
        try{
            console.log("startProgram",mobileURL);
            const response = await axios.get(mobileURL+'/start/'+filename);

            if(response.data.message){
                toast_main.current?.show({
                    severity: 'warn',
                    summary: filename,
                    detail: 'Already started',
                    life: 3000
                })
            }else{
                toast_main.current?.show({
                    severity: 'success',
                    summary: filename,
                    detail: 'Program successfully started',
                    life: 3000
                })
                if(filename == "MAIN_MOBILE"){
                    setRunningUI(response.data);
                }else if(filename == "SLAMNAV"){
                    setRunningSLAMNAV(response.data);
                }else if(filename == "SLAMNAV2"){
                    setRunningSLAMNAV2(response.data);
                }
            }
        }catch(error){
            toast_main.current?.show({
                severity: 'error',
                summary: filename,
                detail: 'Start Failed',
                life: 3000
            })
        }
    }
    async function restartProgram(filename:string){
        try{
            const response = await axios.get(mobileURL+'/restart/'+filename);
            toast_main.current?.show({
                severity: 'success',
                summary: filename,
                detail: 'Program successfully re-started',
                life: 3000
            })
            if(filename == "MAIN_MOBILE"){
                setRunningUI(response.data);
            }else if(filename == "SLAMNAV"){
                setRunningSLAMNAV(response.data);
            }else if(filename == "SLAMNAV2"){
                setRunningSLAMNAV2(response.data);
            }
        }catch(error){
            toast_main.current?.show({
                severity: 'error',
                summary: filename,
                detail: 'Restart Failed',
                life: 3000
            })

        }
    }
    async function stopProgram(filename:string){
        try{
            const response = await axios.get(mobileURL+'/stop/'+filename);
            toast_main.current?.show({
                severity: 'success',
                summary: filename,
                detail: 'Program successfully stopped',
                life: 3000
            })
            if(filename == "MAIN_MOBILE"){
                setRunningUI(response.data);
            }else if(filename == "SLAMNAV"){
                setRunningSLAMNAV(response.data);
            }else if(filename == "SLAMNAV2"){
                setRunningSLAMNAV2(response.data);
            }
        }catch(error){
            toast_main.current?.show({
                severity: 'error',
                summary: filename,
                detail: 'Stop Failed',
                life: 3000
            })
        }
    }

    return(
        <main>
            <UploadDialog />
            <RollbackDialog/>
            <Toast ref={toast_main}></Toast>
            <Toolbar start={<Button label="새로고침" icon="pi pi-refresh" onClick={refresh} style={{ marginRight: '.5em' }} severity="secondary"/>} end={<Button label="업로드" onClick={() => setDisplayUpload(true)} icon="pi pi-upload" style={{ width: '10rem' }}></Button>}></Toolbar>
            {type== "AMR" &&
            <Panel style={{marginTop:'2em'}} header = "프로그램 버전" id="TabRobotBasic" > 
                <div className="card" >
                    <h3>SLAMNAV2</h3>
                    <div className="field grid">
                        <label className="col-12 mb-2 md:col-2 md:mb-0">
                            현재 버전
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText  value={curVersionSLAMNAV2.version} type="text" style={{width: '20vw'}} readOnly/>
                        </div>
                    </div>
                    <div className="field grid">
                        <label className="col-12 mb-2 md:col-2 md:mb-0">
                            최신 버전
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText type="text" value={newVersionSLAMNAV2.version} style={{width: '20vw'}} readOnly/>
                        </div>
                    </div>
                    <div className="field grid">
                        <label className='md:col-2 md:mb-0 col-12 mb-2'>
                            마지막 업데이트 날짜
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText  value={curVersionSLAMNAV2.date} type="text" style={{width: '20vw'}} readOnly/>
                        </div>
                    </div> 
                <Button onClick={() => update("SLAMNAV2",newVersionSLAMNAV2.version)}>Update</Button>
                <Button style={{marginLeft:10}} onClick={() => {setProgramRollback('SLAMNAV2');setDisplayRollback(true)}}>Rollback</Button>
                <Button style={{marginLeft:10}} disabled={waitingSLAMNAV2} onClick={() =>{startProgram("SLAMNAV2")}}>Start</Button>
                <Button style={{marginLeft:10}} disabled={waitingSLAMNAV2} onClick={() => stopProgram("SLAMNAV2")}>Stop</Button>
                <Button style={{marginLeft:10}} disabled={waitingSLAMNAV2} onClick={() => restartProgram("SLAMNAV2")}>ReStart</Button> 
                </div>
            </Panel>
            }
            {(type != "AMR" && type != '') &&
            <Panel style={{marginTop:'2em'}} header = "프로그램 버전" id="TabRobotBasic" > 
                <div className="card" >
                    <h3>MAIN_MOBILE</h3>
                    <div className="field grid">
                        <label className="col-12 mb-2 md:col-2 md:mb-0">
                            현재 버전
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText  value={curVersionUI.version} type="text" style={{width: '20vw'}} readOnly/>
                        </div>
                    </div>
                    <div className="field grid">
                        <label className="col-12 mb-2 md:col-2 md:mb-0">
                            최신 버전
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText type="text" value={newVersionUI.version} style={{width: '20vw'}} readOnly/>
                        </div>
                    </div>
                    <div className="field grid">
                        <label className='md:col-2 md:mb-0 col-12 mb-2'>
                            마지막 업데이트 날짜
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText  value={curVersionUI.date} type="text" style={{width: '20vw'}} readOnly/>
                        </div>
                    </div> 
                <Button disabled={waitingUI} onClick={() => {update("MAIN_MOBILE",newVersionUI.version)}}>Update</Button>
                <Button style={{marginLeft:10}} disabled={waitingUI} onClick={() => {setProgramRollback('MAIN_MOBILE');setDisplayRollback(true)}}>Rollback</Button>
                <Button style={{marginLeft:10}} disabled={waitingUI} onClick={() =>{startProgram("MAIN_MOBILE")}}>Start</Button>
                <Button style={{marginLeft:10}} disabled={waitingUI} onClick={() => stopProgram("MAIN_MOBILE")}>Stop</Button>
                <Button style={{marginLeft:10}} disabled={waitingUI} onClick={() => restartProgram("MAIN_MOBILE")}>ReStart</Button> 
                </div>
            </Panel>
            }
        </main>
    );
}

export default Update;