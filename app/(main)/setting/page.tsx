'use client';
import React, { useEffect, useState } from 'react';
import { SplitButton } from 'primereact/splitbutton';
import { Button } from 'primereact/button';
import axios from 'axios';
import {Formik, useFormik, Form, Field, FormikProps} from 'formik';
import { Dropdown } from "primereact/dropdown";
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
import { SelectButton } from "primereact/selectbutton";
import { Slider } from "primereact/slider";
import { Accordion , AccordionTab} from 'primereact/accordion';
import { ToggleButton } from "primereact/togglebutton";
import styles from './index.module.scss';
import { classNames } from 'primereact/utils';
import {SettingState, ROBOT_TYPE, slam, robot, setting} from '../../../interface/settings';
import { forEachChild } from 'typescript';

const Setting: React.FC = () => {
    const [settingState, setSettingState] = useState<SettingState>();

    const default_setting = async() =>{
        try{
            const response = await axios.get('http://192.168.1.88:11334/setting');
            console.log("--------------",response.data.slam);   
            setSettingState({
                robot:response.data.robot,
                slam:response.data.slam
            });
            formik_robot.handleReset(response.data.robot);
            formik_slam.handleReset(response.data.slam);
            
            console.log(settingState,response.data.robot,formik_robot.values,formik_robot.initialValues)
        }catch(error){
            alert(error);
        }
    };

    const send_setting = async() =>{
        try{
            const json = JSON.stringify({"robot":formik_robot.values,"slam":formik_slam.values});
            const response = await axios.post('http://192.168.1.88:11334/setting',json,{
                headers:{
                    'Content-Type':'application/json'
                }
            });
            console.log("--------------",json,response);   
        }catch(error){
            console.error(error);
        }
    };

    useEffect(() =>{
        default_setting();
    },[])
  
    function initForm(){
        if(settingState){
            console.log(settingState.slam);
            formik_robot.handleReset(settingState.robot);
            formik_slam.handleReset(settingState.slam);
            console.log(formik_slam.values, formik_slam.initialValues);
        }
    }   

    function saveForm(){
        console.log("save  : ",formik_robot.values,formik_slam.values);
        send_setting();
        // const json = JSON.stringify({"robot":formik_robot.values,"slam":formik_slam.values});

        // alert(json);
    }

    
    const formik_slam = useFormik({
        initialValues:{
            ROBOT_SIZE_MAX_X:settingState?.slam.ROBOT_SIZE_MAX_X,
            ROBOT_SIZE_MAX_Y:settingState?.slam.ROBOT_SIZE_MAX_Y,
            ROBOT_SIZE_MAX_Z:settingState?.slam.ROBOT_SIZE_MAX_Z,
            ROBOT_SIZE_MIN_X:settingState?.slam.ROBOT_SIZE_MIN_X,
            ROBOT_SIZE_MIN_Y:settingState?.slam.ROBOT_SIZE_MIN_Y,
            ROBOT_SIZE_MIN_Z:settingState?.slam.ROBOT_SIZE_MIN_Z,
            ROBOT_WHEEL_BASE:settingState?.slam.ROBOT_WHEEL_BASE,
            ROBOT_WHEEL_RADIUS:settingState?.slam.ROBOT_WHEEL_RADIUS,
            MOTOR_ID_L:settingState?.slam.MOTOR_ID_L,
            MOTOR_ID_R:settingState?.slam.MOTOR_ID_R,
            MOTOR_DIR:settingState?.slam.MOTOR_DIR,
            MOTOR_GEAR_RATIO:settingState?.slam.MOTOR_GEAR_RATIO,
            MOTOR_LIMIT_V:settingState?.slam.MOTOR_LIMIT_V,
            MOTOR_LIMIT_V_ACC:settingState?.slam.MOTOR_LIMIT_V_ACC,
            MOTOR_LIMIT_W:settingState?.slam.MOTOR_LIMIT_W,
            MOTOR_LIMIT_W_ACC:settingState?.slam.MOTOR_LIMIT_W_ACC,
            MOTOR_GAIN_KP:settingState?.slam.MOTOR_GAIN_KP,
            MOTOR_GAIN_KI:settingState?.slam.MOTOR_GAIN_KI,
            MOTOR_GAIN_KD:settingState?.slam.MOTOR_GAIN_KD
        },
        initialErrors:{
            ROBOT_SIZE_MAX_X:"",
            ROBOT_SIZE_MAX_Y:"",
            ROBOT_SIZE_MAX_Z:"",
            ROBOT_SIZE_MIN_X:"",
            ROBOT_SIZE_MIN_Y:"",
            ROBOT_SIZE_MIN_Z:"",
            ROBOT_WHEEL_BASE:"",
            ROBOT_WHEEL_RADIUS:"",
            MOTOR_ID_L:"",
            MOTOR_ID_R:"",
            MOTOR_DIR:"",
            MOTOR_GEAR_RATIO:"",
            MOTOR_LIMIT_V:"",
            MOTOR_LIMIT_V_ACC:"",
            MOTOR_LIMIT_W:"",
            MOTOR_LIMIT_W_ACC:"",
            MOTOR_GAIN_KP:"",
            MOTOR_GAIN_KI:"",
            MOTOR_GAIN_KD:""
        },
        enableReinitialize: true,
        // validate: (values) => {
        //     const errors = {};
        //     if(!values.PLATFORM_NAME){
        //         errors.PLATFORM_NAME = '입력이 필요합니다';
        //     }else if(!/^[A-Z0-9]{2,10}$/i.test(values.PLATFORM_NAME)){
        //         errors.PLATFORM_NAME = '영어와 숫자로만 입력해주세요';
        //     }
        //     console.log(values,errors);
        //     return errors;
        // },
        onSubmit: (data) => {
            console.log("SAVE : ",data);
        }
    });

    const formik_robot = useFormik({
        initialValues:{
            PLATFORM_NAME: settingState?settingState.robot.PLATFORM_NAME:'',
            PLATFORM_TYPE: settingState?.robot.PLATFORM_TYPE
        },
        initialErrors:{
            PLATFORM_NAME: '',
            PLATFORM_TYPE: ''
        },
        enableReinitialize: true,
        validate: (values) => {
            const errors = {
                PLATFORM_NAME: '',
                PLATFORM_TYPE: ''
            };
            if(!values.PLATFORM_NAME){
                errors.PLATFORM_NAME = '입력이 필요합니다';
            }else if(!/^[A-Z0-9]{2,10}$/i.test(values.PLATFORM_NAME)){
                errors.PLATFORM_NAME = '영어와 숫자로만 입력해주세요';
            }
            console.log(values,errors);
            return errors;
        },
        onSubmit: (data) => {
            console.log("SAVE : ",data);
        }
    });
    
    return(
        <main>
            <Toolbar start={<Button label="초기화" icon="pi pi-refresh" style={{ marginRight: '.5em' }} severity="secondary" onClick={initForm}/>} end={<Button onClick={saveForm} label="Save" icon="pi pi-save" style={{ width: '10rem' }}></Button>}></Toolbar>
            <div className="card" style={{marginTop: '2em'}}> 
                <Panel header = "로봇 기본 정보" id="TabRobotBasic" > 
                    <div className="card">
                        <p><span style={{fontSize:18,fontWeight: 700}}>플랫폼 이름</span>
                        <span style={{display:formik_robot.values.PLATFORM_NAME!==formik_robot.initialValues.PLATFORM_NAME?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                        <span className="p-float-label">
                            <InputText
                                name="PLATFORM_NAME"
                                type="text"
                                onChange={formik_robot.handleChange}
                                value={formik_robot.values.PLATFORM_NAME}
                                style = {{width:500}}
                                className={formik_robot.errors.PLATFORM_NAME?"p-invalid":""}
                            />
                            <small id="username-help" style={{color:"red", fontSize: '1em',marginLeft: '1em' }}>
                                {formik_robot.errors.PLATFORM_NAME}
                            </small>
                        </span>
                        <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>플랫폼 타입</span>
                        <span style={{display:formik_robot.values.PLATFORM_TYPE!==formik_robot.initialValues.PLATFORM_TYPE?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                        <Dropdown
                            name="PLATFORM_TYPE"
                            value={formik_robot.values.PLATFORM_TYPE}
                            onChange={formik_robot.handleChange}
                            options= {ROBOT_TYPE}
                            style = {{width:500}}
                        />
                    </div>
                </Panel>
                <Panel header = "모터 정보" style={{ marginTop: '1em' }}  >
                    <div className="card">
                        <p><span style={{fontSize:18,fontWeight: 700}}>0번 모터</span>
                        <span style={{display:formik_slam.values.MOTOR_ID_L!==formik_slam.initialValues.MOTOR_ID_L?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                        <SelectButton
                            id="here"
                            value={formik_slam.values.MOTOR_ID_L}
                            onChange={(e) =>{
                                if(e.value == 0){
                                    formik_slam.setFieldValue("MOTOR_ID_L", 0);
                                    formik_slam.setFieldValue("MOTOR_ID_R", 1);
                                }else{
                                    formik_slam.setFieldValue("MOTOR_ID_L", 1);
                                    formik_slam.setFieldValue("MOTOR_ID_R", 0);
                                }                            
                            }}
                            options={[{value:0,name:"LEFT"},{value:1,name:"RIGHT"}]}
                            optionLabel="name"
                        />
                        <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>1번 모터</span>
                        <span style={{display:formik_slam.values.MOTOR_ID_R!==formik_slam.initialValues.MOTOR_ID_R?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                        <SelectButton
                            value={formik_slam.values.MOTOR_ID_R==0?0:1}
                            onChange={(e) =>{
                                if(e.value == 0){
                                    formik_slam.setFieldValue("MOTOR_ID_L", 1);
                                    formik_slam.setFieldValue("MOTOR_ID_R", 0);
                                }else{
                                    formik_slam.setFieldValue("MOTOR_ID_L", 0);
                                    formik_slam.setFieldValue("MOTOR_ID_R", 1);
                                }                   
                            }}
                            options={[{value:0,name:"LEFT"},{value:1,name:"RIGHT"}]}
                            optionLabel="name"
                        />
                        <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>모터 방향</span>
                        <span style={{display:formik_slam.values.MOTOR_DIR!==formik_slam.initialValues.MOTOR_DIR?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                        <SelectButton
                            value={formik_slam.values.MOTOR_DIR}
                            onChange={(e) =>{
                                if(e.value == -1){
                                    formik_slam.setFieldValue("MOTOR_DIR", -1);
                                }else{
                                    formik_slam.setFieldValue("MOTOR_DIR", 1);
                                }                   
                            }}
                            options={[{value:-1,name:"-1 방향"},{value:1,name:"+1 방향"}]}
                            optionLabel="name"
                        />
                        <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>모터 기어비</span>
                        <span style={{display:formik_slam.values.MOTOR_GEAR_RATIO!==formik_slam.initialValues.MOTOR_GEAR_RATIO?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                        <InputNumber
                            name = "MOTOR_GEAR_RATIO"
                            value={formik_slam.values.MOTOR_GEAR_RATIO}
                            onValueChange={formik_slam.handleChange}
                            showButtons
                            mode="decimal"
                        ></InputNumber>
                    </div>
                    <div className="card">
                        <div className="grid formgrid">
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p><span style={{fontSize:18,fontWeight: 700}}>선속도 제한 [m/s]</span>
                                <span style={{display:formik_slam.values.MOTOR_LIMIT_V!==formik_slam.initialValues.MOTOR_LIMIT_V?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "MOTOR_LIMIT_V"
                                    value={formik_slam.values.MOTOR_LIMIT_V}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    step={0.1}
                                    max={3.0}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p><span style={{fontSize:18,fontWeight: 700}}>선 가속도 제한 [m/s^2]</span>
                                <span style={{display:formik_slam.values.MOTOR_LIMIT_V_ACC!==formik_slam.initialValues.MOTOR_LIMIT_V_ACC?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "MOTOR_LIMIT_V_ACC"
                                    value={formik_slam.values.MOTOR_LIMIT_V_ACC}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    step={0.1}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="grid formgrid">
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p><span style={{fontSize:18,fontWeight: 700}}>각속도 제한 [m/s]</span>
                                <span style={{display:formik_slam.values.MOTOR_LIMIT_W!==formik_slam.initialValues.MOTOR_LIMIT_W?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "MOTOR_LIMIT_W"
                                    value={formik_slam.values.MOTOR_LIMIT_W}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    step={0.1}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p><span style={{fontSize:18,fontWeight: 700}}>각 가속도 제한 [m/s^2]</span>
                                <span style={{display:formik_slam.values.MOTOR_LIMIT_W_ACC!==formik_slam.initialValues.MOTOR_LIMIT_W_ACC?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "MOTOR_LIMIT_W_ACC"
                                    value={formik_slam.values.MOTOR_LIMIT_W_ACC}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    step={0.1}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="grid formgrid">
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p><span style={{fontSize:18,fontWeight: 700}}>모터 P 게인</span>
                                <span style={{display:formik_slam.values.MOTOR_GAIN_KP!==formik_slam.initialValues.MOTOR_GAIN_KP?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "MOTOR_GAIN_KP"
                                    value={formik_slam.values.MOTOR_GAIN_KP}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p><span style={{fontSize:18,fontWeight: 700}}>모터 I 게인</span>
                                <span style={{display:formik_slam.values.MOTOR_GAIN_KI!==formik_slam.initialValues.MOTOR_GAIN_KI?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "MOTOR_GAIN_KI"
                                    value={formik_slam.values.MOTOR_GAIN_KI}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p><span style={{fontSize:18,fontWeight: 700}}>모터 D 게인</span>
                                <span style={{display:formik_slam.values.MOTOR_GAIN_KD!==formik_slam.initialValues.MOTOR_GAIN_KD?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "MOTOR_GAIN_KD"
                                    value={formik_slam.values.MOTOR_GAIN_KD}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                        </div>
                    </div>
                </Panel>
                <Panel header = "로봇 사이즈 정보" style={{ marginTop: '1em' }}  >
                    <div className="card">
                        <p><span style={{fontSize:18,fontWeight: 700}}>로봇 최대 사이즈</span></p>
                        <div className="grid formgrid">
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>X</span>
                                <span style={{display:formik_slam.values.ROBOT_SIZE_MAX_X!==formik_slam.initialValues.ROBOT_SIZE_MAX_X?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_SIZE_MAX_X"
                                    value={formik_slam.values.ROBOT_SIZE_MAX_X}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    step={0.1}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>Y</span>
                                <span style={{display:formik_slam.values.ROBOT_SIZE_MAX_Y!==formik_slam.initialValues.ROBOT_SIZE_MAX_Y?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_SIZE_MAX_Y"
                                    value={formik_slam.values.ROBOT_SIZE_MAX_Y}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    step={0.1}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>Z</span>
                                <span style={{display:formik_slam.values.ROBOT_SIZE_MAX_Z!==formik_slam.initialValues.ROBOT_SIZE_MAX_Z?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_SIZE_MAX_Z"
                                    value={formik_slam.values.ROBOT_SIZE_MAX_Z}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    step={0.1}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <p><span style={{fontSize:18,fontWeight: 700}}>로봇 최소 사이즈</span></p>
                        <div className="grid formgrid">
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>X</span>
                                <span style={{display:formik_slam.values.ROBOT_SIZE_MIN_X!==formik_slam.initialValues.ROBOT_SIZE_MIN_X?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_SIZE_MIN_X"
                                    value={formik_slam.values.ROBOT_SIZE_MIN_X}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    step={0.1}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>Y</span>
                                <span style={{display:formik_slam.values.ROBOT_SIZE_MIN_Y!==formik_slam.initialValues.ROBOT_SIZE_MIN_Y?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_SIZE_MIN_Y"
                                    value={formik_slam.values.ROBOT_SIZE_MIN_Y}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    step={0.1}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>Z</span>
                                <span style={{display:formik_slam.values.ROBOT_SIZE_MIN_Z!==formik_slam.initialValues.ROBOT_SIZE_MIN_Z?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_SIZE_MIN_Z"
                                    value={formik_slam.values.ROBOT_SIZE_MIN_Z}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    step={0.1}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="grid formgrid">
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>휠 베이스 사이즈</span>
                                <span style={{display:formik_slam.values.ROBOT_WHEEL_BASE!==formik_slam.initialValues.ROBOT_WHEEL_BASE?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_WHEEL_BASE"
                                    value={formik_slam.values.ROBOT_WHEEL_BASE}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    step={0.1}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>휠 반지름</span>
                                <span style={{display:formik_slam.values.ROBOT_WHEEL_RADIUS!==formik_slam.initialValues.ROBOT_WHEEL_RADIUS?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_WHEEL_RADIUS"
                                    value={formik_slam.values.ROBOT_WHEEL_RADIUS}
                                    onValueChange={formik_slam.handleChange}
                                    showButtons
                                    step={0.1}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>
        </main>
    );
}

export default Setting;