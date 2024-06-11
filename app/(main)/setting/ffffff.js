'use client';
import React, { useEffect, useState } from 'react';
import { SplitButton } from 'primereact/splitbutton';
import { Button } from 'primereact/button';
import axios from 'axios';
import {Formik, useFormik, Form, Field, FormikValues} from 'formik';
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
// import styles from './index.module.scss';
import { classNames } from 'primereact/utils';
import {SettingState, setting} from '../../../interface/settings';
import { forEachChild } from 'typescript';


const Setting = () =>{
    const [settingState, setSettingState] = useState([]);
    
    useEffect(() =>{
        setSettingState(values);
        console.log("-------------------------------------");
        console.log(formik.values);
        // setSettingState(initvalue);
        init();
    },[])

    const values={
        robot:{
            PLATFORM_NAME: "",
            PLATFORM_TYPE: ""
        },
        slam:{
            ROBOT_SIZE_MAX_X:0,
            ROBOT_SIZE_MAX_Y:0,
            ROBOT_SIZE_MAX_Z:0,
            ROBOT_SIZE_MIN_X:0,
            ROBOT_SIZE_MIN_Y:0,
            ROBOT_SIZE_MIN_Z:0,
            ROBOT_WHEEL_BASE:0,
            ROBOT_WHEEL_RADIUS:0,
            MOTOR_ID_L:0,
            MOTOR_ID_R:0,
            MOTOR_DIR:0,
            MOTOR_GEAR_RATIO:0,
            MOTOR_LIMIT_V:0,
            MOTOR_LIMIT_V_ACC:0,
            MOTOR_LIMIT_W:0,
            MOTOR_LIMIT_W_ACC:0,
            MOTOR_GAIN_KP:0,
            MOTOR_GAIN_KI:0,
            MOTOR_GAIN_KD:0
        }
    };

    const formik = useFormik({
        initialValues: settingState?settingState:{
            robot:{
                PLATFORM_NAME: "",
                PLATFORM_TYPE: ""
            },
            slam:{
                ROBOT_SIZE_MAX_X:0,
                ROBOT_SIZE_MAX_Y:0,
                ROBOT_SIZE_MAX_Z:0,
                ROBOT_SIZE_MIN_X:0,
                ROBOT_SIZE_MIN_Y:0,
                ROBOT_SIZE_MIN_Z:0,
                ROBOT_WHEEL_BASE:0,
                ROBOT_WHEEL_RADIUS:0,
                MOTOR_ID_L:0,
                MOTOR_ID_R:0,
                MOTOR_DIR:0,
                MOTOR_GEAR_RATIO:0,
                MOTOR_LIMIT_V:0,
                MOTOR_LIMIT_V_ACC:0,
                MOTOR_LIMIT_W:0,
                MOTOR_LIMIT_W_ACC:0,
                MOTOR_GAIN_KP:0,
                MOTOR_GAIN_KI:0,
                MOTOR_GAIN_KD:0
            }},
        enableReinitialize: true,
        validate: (data) => {
            let errors = {};
            return errors;
        },
        onSubmit: (data) => {
            console.log("SAVE : ",data);
            setSettingState(data);
            
            formik.resetForm();
        },
        onChange:(data) => {
            console.log("change",data);
        }
    });

    async function init(){
        try{
            const response = await axios.get('http://10.108.1.10:11334/setting');
            console.log("--------------",response.data);   
            setSettingState({
                robot:response.data.robot,
                slam:response.data.slam
            });
            formik.values = response.data;
            formik.initialValues = response.data;
        }catch(error){
            console.error(error);
        }
    }

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    function setRobotBasicTab(){
        if(formik.values.robot){
            return(
                <div className="card">
                    <h5>플랫폼 이름</h5>
                    <span className="p-float-label">
                        <InputText
                            name="robot.PLATFORM_NAME"
                            id="username"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.robot.PLATFORM_NAME}
                            style = {{width:500}}
                            className={formik.errors.PLATFORM_NAME?"p-invalid":""}
                        />
                        <small id="username-help" style={{color:"red", fontSize: '1em',marginLeft: '1em' }}>
                            {formik.errors.PLATFORM_NAME}
                        </small> 
                    </span>
                    <h5>플랫폼 타입</h5>
                    <Dropdown
                        name="PLATFORM_TYPE"
                        value={formik.values.robot.PLATFORM_TYPE}
                        onChange={formik.handleChange}
                        options= {["SERVING","CALLING","BOTH","CLEANING"]}
                        style = {{width:500}}
                    /> 
                </div>
            );
        }else{
            return(
                <></>
            )
        }
    }
    function setMotorTab(){
        if(formik.values.robot){
            return(
                <>
                    <div className="card">
                        <h5>0번 모터</h5>
                        <SelectButton
                            id="here"
                            value={formik.values.slam.MOTOR_ID_L}
                            onChange={(e) =>{
                                if(e.value == 0){
                                    formik.setFieldValue("slam.MOTOR_ID_L", 0);
                                    formik.setFieldValue("slam.MOTOR_ID_R", 1);
                                }else{
                                    formik.setFieldValue("slam.MOTOR_ID_L", 1);
                                    formik.setFieldValue("slam.MOTOR_ID_R", 0);
                                }                            
                            }}
                            options={[{value:0,name:"LEFT"},{value:1,name:"RIGHT"}]}
                            optionLabel="name"
                        />
                        <h5>1번 모터</h5>
                        <SelectButton
                            value={formik.values.slam.MOTOR_ID_R==0?0:1}
                            onChange={(e) =>{
                                if(e.value == 0){
                                    formik.setFieldValue("slam.MOTOR_ID_L", 1);
                                    formik.setFieldValue("slam.MOTOR_ID_R", 0);
                                }else{
                                    formik.setFieldValue("slam.MOTOR_ID_L", 0);
                                    formik.setFieldValue("slam.MOTOR_ID_R", 1);
                                }                   
                            }}
                            options={[{value:0,name:"LEFT"},{value:1,name:"RIGHT"}]}
                            optionLabel="name"
                        />
                        <h5>모터 방향</h5>
                        <SelectButton
                            value={formik.values.slam.MOTOR_DIR}
                            onChange={(e) =>{
                                if(e.value == -1){
                                    formik.setFieldValue("slam.MOTOR_DIR", -1);
                                }else{
                                    formik.setFieldValue("slam.MOTOR_DIR", 1);
                                }                   
                            }}
                            options={[{value:-1,name:"-1 방향"},{value:1,name:"+1 방향"}]}
                            optionLabel="name"
                        />
                        <h5>모터 기어비</h5>
                        <InputNumber
                            name = "values.MOTOR_GEAR_RATIO"
                            value={formik.values.slam.MOTOR_GEAR_RATIO}
                            onValueChange={formik.handleChange}
                            showButtons
                            mode="decimal"
                        ></InputNumber>
                    </div>
                    <div className="card">
                        <div className="grid formgrid">
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <h5>선속도 제한 [m/s]</h5>
                                <InputNumber
                                    name = "MOTOR_LIMIT_V"
                                    value={formik.values.slam.MOTOR_LIMIT_V}
                                    onValueChange={formik.handleChange}
                                    showButtons
                                    step={0.1}
                                    max={3.0}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <h5>선 가속도 제한 [m/s^2]</h5>
                                <InputNumber
                                    name = "MOTOR_LIMIT_V_ACC"
                                    value={formik.values.slam.MOTOR_LIMIT_V_ACC}
                                    onValueChange={formik.handleChange}
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
                                <h5>각속도 제한 [m/s]</h5>
                                <InputNumber
                                    name = "values.MOTOR_LIMIT_W"
                                    value={formik.values.slam.MOTOR_LIMIT_W}
                                    onValueChange={formik.handleChange}
                                    showButtons
                                    step={0.1}
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <h5>각 가속도 제한 [m/s^2]</h5>
                                <InputNumber
                                    name = "values.MOTOR_LIMIT_W_ACC"
                                    value={formik.values.slam.MOTOR_LIMIT_W_ACC}
                                    onValueChange={formik.handleChange}
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
                                <h5>모터 P 게인</h5>
                                <InputNumber
                                    name = "values.MOTOR_GAIN_KP"
                                    value={formik.values.slam.MOTOR_GAIN_KP}
                                    onValueChange={formik.handleChange}
                                    showButtons
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <h5>모터 I 게인</h5>
                                <InputNumber
                                    name = "values.MOTOR_GAIN_KI"
                                    value={formik.values.slam.MOTOR_GAIN_KI}
                                    onValueChange={formik.handleChange}
                                    showButtons
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                            <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                <h5>모터 D 게인</h5>
                                <InputNumber
                                    name = "values.MOTOR_GAIN_KD"
                                    value={formik.values.slam.MOTOR_GAIN_KD}
                                    onValueChange={formik.handleChange}
                                    showButtons
                                    mode="decimal"
                                ></InputNumber>
                            </div>
                        </div>
                    </div>
                </>
            );
        }else{
            return(<></>);
        }
    }

    return (
        <main>
            <Toolbar start={<Button label="Init" icon="pi pi-refresh" style={{ marginRight: '.5em' }} severity="secondary" onClick={init}/>} end={<Button type="submit" label="저장" icon="pi pi-save" style={{ width: '10rem' }}></Button>}></Toolbar>
            <div className="card" style={{marginTop: '2em'}}>
                <Panel header = "로봇 기본 정보" id="setRobotBasicTab" > 
                    {setRobotBasicTab()}
                </Panel>
            </div>
            <div className="card" style={{marginTop: '2em'}}>
                <Panel header = "모터 정보" id="setMotorTab" > 
                    {setMotorTab()}
                </Panel>
            </div>
                    {/* <button type="submit" disabled={isSubmitting}>Submit</button> */}
        </main>
    );

}

export default Setting;