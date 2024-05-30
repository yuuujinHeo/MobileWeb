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
import { FileUpload,  FileUploadState, FileUploadHandlerEvent, FileUploadSelectEvent, FileUploadUploadEvent } from 'primereact/fileupload';
import {SettingState, ROBOT_TYPE, slam, robot, setting} from '../../../interface/settings';
import { forEachChild } from 'typescript';
import { encode } from 'punycode';
import {userContext} from '../../../interface/user'
import {version, defaultVersion, newversion, defaultNewVersion,versions, defaultNewVersions,defaultVersions} from '../../../interface/update';
const Update: React.FC = () =>{
    const [runningTest, setRunningTest] = useState(false);
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

    const [newVersionTest, setNewVersionTest] = useState<newversion>(defaultNewVersion);
    const [curVersionTest, setCurVersionTest] = useState<version>(defaultVersion);
    const [newVersionText, setNewVersionText] = useState<newversion>(defaultNewVersion);
    const [curVersionText, setCurVersionText] = useState<version>(defaultVersion);

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
        axios.post("http://192.168.1.88:11335/upload/files", formData, config)
          .then(response => {
            console.log('File uploaded successfully:', response.data);
            uploader.current?.clear();
            uploader.current?.setUploadedFiles(event.files);  
          })
          .catch(error => {
            console.log("?>")
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
        try{
            console.log("newVersion = ",newVersionText);
            const response = await axios.get('http://192.168.1.88:11335/versions/text.txt');
            console.log("text(new):",response.data)
            setNewVersionText(response.data);
            console.log("?????");
        }catch(error){
            alert(error);
        }
        try{
            const response = await axios.get('http://192.168.1.88:11335/versions/test');
            console.log("test(new):",newVersionTest)
            setNewVersionTest(response.data);
        }catch(error){
            alert(error);
        }
    }

    const readVersion = async() =>{
        try{
            console.log("newVersion = ",newVersionText);
            const response = await axios.get('http://192.168.1.88:11334/versions/text.txt');
            console.log("text:",response.data.data);
            setCurVersionText(response.data.data);
        }catch(error){
            alert(error);
        }
        try{
            const response = await axios.get('http://192.168.1.88:11334/versions/test');
            console.log("test:",response.data.data);
            setCurVersionTest(response.data.data);
        }catch(error){
            console.error(error);
            alert(error);
        }

    }

    useEffect(()=>{
        readUpdate();
        readVersion();
    },[])

    function update(_program:string, _version:string){
        if(_program==="text.txt"){
            updateText(_version);
        }else if(_program === "test"){
            updateTest(_version);
        }
    }


    async function updateText(_version:string){
        try{
            if(_version==undefined){
                toast_main.current?.show({
                    severity: 'error',
                    summary: 'Update',
                    detail: 'Version is undefined',
                    life: 3000
                })
            }else if(_version==curVersionText.version){
                toast_main.current?.show({
                    severity: 'warn',
                    summary: 'Update',
                    detail: 'Already updated',
                    life: 3000
                })
            }else{
                const body = {
                    program: "text.txt",
                    new_version: _version,
                    cur_version: curVersionText.version,
                    path:'/home/rainbow/Desktop/Program/text.txt',
                    auth:state
                }

                const url = 'http://192.168.1.88:11334/update/'

                console.log(body);
                const response = await axios.post(url,body);
    

                toast_main.current?.show({
                    severity: 'success',
                    summary: 'Update',
                    detail: 'Update successfully finished\r\n'+response.data.log.date,
                    life: 3000
                })

                setCurVersionText({prev_version:response.data.log.prev_version,version:response.data.log.new_version,date:response.data.log.date});
                setDisplayRollback(false);
            }
        }catch(error){
            console.error(error);
            toast_main.current?.show({
                severity: 'error',
                summary: 'Update',
                detail: 'Update Failed',
                life: 3000
            })
        }
    }
    async function updateTest(_version:string){
        try{
            console.log(curVersionTest);
            if(_version==undefined){
                toast_main.current?.show({
                    severity: 'error',
                    summary: 'Update',
                    detail: 'Version is undefined',
                    life: 3000
                })
            }else if(_version==curVersionTest.version){
                toast_main.current?.show({
                    severity: 'warn',
                    summary: 'Update',
                    detail: 'Already updated',
                    life: 3000
                })
            }else{
                const body = {
                    program: "test",
                    new_version: _version,
                    cur_version: curVersionTest.version,
                    path:'/home/rainbow/Desktop/Program/test',
                    auth:state
                }

                const url = 'http://192.168.1.88:11334/update/'
                const response = await axios.post(url,body);
    

                toast_main.current?.show({
                    severity: 'success',
                    summary: 'Update',
                    detail: 'Update successfully finished\r\n'+response.data.log.date,
                    life: 3000
                })

                setCurVersionTest({prev_version:response.data.log.prev_version,version:response.data.log.new_version,date:response.data.log.date});
                setDisplayRollback(false);
            }
        }catch(error){
            toast_main.current?.show({
                severity: 'error',
                summary: 'Update',
                detail: 'Update Failed',
                life: 3000
            })
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
                    const response = await axios.get('http://192.168.1.88:11335/versions/all/'+programRollback);
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
                <Button style={{marginLeft:10}} onClick={() =>update(programRollback, rollbackVersion.version )}>Rollback</Button> 
            </Dialog>
        )
    }

    async function startTest(){
        try{
            const response = await axios.get('http://192.168.1.88:11334/start/test');
            toast_main.current?.show({
                severity: 'success',
                summary: 'Program',
                detail: 'Program successfully started',
                life: 3000
            })
            setRunningTest(response.data);
        }catch(error){
            console.log(error.response);
            toast_main.current?.show({
                severity: 'error',
                summary: 'Program',
                detail: 'Start Failed : '+error.response,
                life: 3000
            })
        }
    }
    async function restartTest(){
        try{
            const response = await axios.get('http://192.168.1.88:11334/restart/test');
            toast_main.current?.show({
                severity: 'success',
                summary: 'Program',
                detail: 'Program successfully re-started',
                life: 3000
            })
            setRunningTest(response.data);
        }catch(error){
            toast_main.current?.show({
                severity: 'error',
                summary: 'Program',
                detail: 'Restart Failed',
                life: 3000
            })

        }
    }
    async function stopTest(){
        try{
            const response = await axios.get('http://192.168.1.88:11334/stop/test');
            toast_main.current?.show({
                severity: 'success',
                summary: 'Program',
                detail: 'Program successfully stopped',
                life: 3000
            })
            setRunningTest(response.data);
        }catch(error){
            toast_main.current?.show({
                severity: 'error',
                summary: 'Program',
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
            <Panel style={{marginTop:'2em'}} header = "프로그램 버전" id="TabRobotBasic" > 
                <div className="card" >
                    <h3>text.txt</h3>
                    <div className="field grid">
                        <label htmlFor="name3" className="col-12 mb-2 md:col-2 md:mb-0">
                            현재 버전
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText  value={curVersionText.version} type="text" style={{width: '20vw'}} readOnly/>
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="name3" className="col-12 mb-2 md:col-2 md:mb-0">
                            최신 버전
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText type="text" value={newVersionText.version} style={{width: '20vw'}} readOnly/>
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="name3" className='md:col-2 md:mb-0 col-12 mb-2'>
                            마지막 업데이트 날짜
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText  value={curVersionText.date} type="text" style={{width: '20vw'}} readOnly/>
                        </div>
                    </div> 
                <Button onClick={() => update("text.txt",newVersionText.version)}>Update</Button>
                <Button style={{marginLeft:10}} onClick={() => {setProgramRollback('text.txt');setDisplayRollback(true)}}>Rollback</Button>
                </div>
            </Panel>
            <Panel style={{marginTop:'2em'}} header = "프로그램 버전" id="TabRobotBasic" > 
                <div className="card" >
                    <h3>Test</h3>
                    <div className="field grid">
                        <label htmlFor="name3" className="col-12 mb-2 md:col-2 md:mb-0">
                            현재 버전
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText  value={curVersionTest.version} type="text" style={{width: '20vw'}} readOnly/>
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="name3" className="col-12 mb-2 md:col-2 md:mb-0">
                            최신 버전
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText type="text" value={newVersionTest.version} style={{width: '20vw'}} readOnly/>
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="name3" className='md:col-2 md:mb-0 col-12 mb-2'>
                            마지막 업데이트 날짜
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText  value={curVersionTest.date} type="text" style={{width: '20vw'}} readOnly/>
                        </div>
                    </div> 
                <Button onClick={() => update("test",newVersionTest.version)}>Update</Button>
                <Button style={{marginLeft:10}} onClick={() => {setProgramRollback('test');setDisplayRollback(true)}}>Rollback</Button>
                <Button style={{marginLeft:10}} onClick={startTest}>Start</Button>
                <Button style={{marginLeft:10}} onClick={stopTest}>Stop</Button>
                <Button style={{marginLeft:10}} onClick={restartTest}>ReStart</Button>
                </div>
            </Panel>
            {/* <Panel style={{marginTop:'2em'}} header = "프로그램 버전" id="TabRobotBasic" > 
                <div className="card" >
                    <h3>SLAMNAV</h3>
                    <div className="field grid">
                        <label htmlFor="name3" className="col-12 mb-2 md:col-2 md:mb-0">
                            현재 버전
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText  id="SLAMNAV_CUR_VERSION" type="text" style={{width: '20vw'}} readOnly/>
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="name3" className="col-12 mb-2 md:col-2 md:mb-0">
                            최신 버전
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText  id="SLAMNAV_CUR_VERSION" type="text" style={{width: '20vw'}} readOnly/>
                        </div>
                    </div>
                </div>
            </Panel> */}
        </main>
    );
}

export default Update;