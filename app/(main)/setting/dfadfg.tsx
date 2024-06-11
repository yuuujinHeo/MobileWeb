'use client';
import React, { useEffect, useState } from 'react';
import { SplitButton } from 'primereact/splitbutton';
import { Button } from 'primereact/button';
import axios from 'axios';
import {Formik, Form, Field, FormikValues} from 'formik';
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
import {SettingState, setting} from '../../../interface/settings';
import { forEachChild } from 'typescript';

const Setting = () =>{
    const [settingState, setSettingState] = useState<SettingState>();
    
    useEffect(() =>{
        init();
    },[])


    async function init(){
        try{
            const response = await axios.get('http://10.108.1.10:11334/setting');
            console.log("--------------",response.data.slam);   
            setSettingState({
                robot:response.data.robot,
                slam:response.data.slam
            });
            console.log("set:",response.data)
        }catch(error){
            console.error(error);
        }
    }

    function saveForm(value: FormikValues){
        console.log("SAVE:",value);
    }
    function saveForm2(){
        console.log("???????????????????????")
    }

    if(settingState){
        return (
            <Formik
                validationSchema={setting}
                onSubmit={saveForm}
                initialValues={settingState}
                handleSubmit={saveForm2}
                validate={values=>{
                    const errors = {};
                    if(!values.robot.PLATFORM_NAME){
                        errors.PLATFORM_NAME = '입력이 필요합니다';
                    }else if(!/^[A-Z0-9]{2,10}$/i.test(values.robot.PLATFORM_NAME)){
                        errors.PLATFORM_NAME = '영어와 숫자로만 입력해주세요';
                    }
                    return errors;
                }}
            >
            {({handleSubmit, handleChange, setFieldValue, isSubmitting, values, touched, errors }) => (
                <main>
                    <Toolbar start={<Button label="Init" icon="pi pi-refresh" style={{ marginRight: '.5em' }} severity="secondary" onClick={init}/>} end={<Button type="submit" label="저장" onClick={saveForm} icon="pi pi-save" style={{ width: '10rem' }}></Button>}></Toolbar>
                    <div className="card" style={{marginTop: '2em'}}>
                        <Panel header = "로봇 기본 정보" id="TabRobotBasic" > 
                            <div className="card">
                                <h5>플랫폼 이름</h5>
                                <span className="p-float-label">
                                    <InputText
                                        name="robot.PLATFORM_NAME"
                                        id="username"
                                        type="text"
                                        onChange={handleChange}
                                        value={values.robot.PLATFORM_NAME}
                                        style = {{width:500}}
                                        className={errors.PLATFORM_NAME?"p-invalid":""}
                                    />
                                    <small id="username-help" style={{color:"red", fontSize: '1em',marginLeft: '1em' }}>
                                        {errors.PLATFORM_NAME}
                                    </small> 
                                </span>
                                <h5>플랫폼 타입</h5>
                                <Dropdown
                                    name="PLATFORM_TYPE"
                                    value={values.robot.PLATFORM_TYPE}
                                    onChange={handleChange}
                                    options= {["SERVING","CALLING","BOTH","CLEANING"]}
                                    style = {{width:500}}
                                />
                            </div>
                        </Panel>
                        <Panel header = "모터 정보" style={{ marginTop: '1em' }}  >
                            <div className="card">
                                <h5>0번 모터</h5>
                                <SelectButton
                                    id="here"
                                    value={values.slam.MOTOR_ID_L}
                                    onChange={(e) =>{
                                        if(e.value == 0){
                                            setFieldValue("slam.MOTOR_ID_L", 0);
                                            setFieldValue("slam.MOTOR_ID_R", 1);
                                        }else{
                                            setFieldValue("slam.MOTOR_ID_L", 1);
                                            setFieldValue("slam.MOTOR_ID_R", 0);
                                        }                            
                                    }}
                                    options={[{value:0,name:"LEFT"},{value:1,name:"RIGHT"}]}
                                    optionLabel="name"
                                />
                                <h5>1번 모터</h5>
                                <SelectButton
                                    value={values.slam.MOTOR_ID_R==0?0:1}
                                    onChange={(e) =>{
                                        if(e.value == 0){
                                            setFieldValue("slam.MOTOR_ID_L", 1);
                                            setFieldValue("slam.MOTOR_ID_R", 0);
                                        }else{
                                            setFieldValue("slam.MOTOR_ID_L", 0);
                                            setFieldValue("slam.MOTOR_ID_R", 1);
                                        }                   
                                    }}
                                    options={[{value:0,name:"LEFT"},{value:1,name:"RIGHT"}]}
                                    optionLabel="name"
                                />
                                <h5>모터 방향</h5>
                                <SelectButton
                                    value={values.slam.MOTOR_DIR}
                                    onChange={(e) =>{
                                        if(e.value == -1){
                                            setFieldValue("slam.MOTOR_DIR", -1);
                                        }else{
                                            setFieldValue("slam.MOTOR_DIR", 1);
                                        }                   
                                    }}
                                    options={[{value:-1,name:"-1 방향"},{value:1,name:"+1 방향"}]}
                                    optionLabel="name"
                                />
                                <h5>모터 기어비</h5>
                                <InputNumber
                                    name = "values.MOTOR_GEAR_RATIO"
                                    value={values.slam.MOTOR_GEAR_RATIO}
                                    onValueChange={handleChange}
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
                                            value={values.slam.MOTOR_LIMIT_V}
                                            onValueChange={handleChange}
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
                                            value={values.slam.MOTOR_LIMIT_V_ACC}
                                            onValueChange={handleChange}
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
                                            value={values.slam.MOTOR_LIMIT_W}
                                            onValueChange={handleChange}
                                            showButtons
                                            step={0.1}
                                            mode="decimal"
                                        ></InputNumber>
                                    </div>
                                    <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                        <h5>각 가속도 제한 [m/s^2]</h5>
                                        <InputNumber
                                            name = "values.MOTOR_LIMIT_W_ACC"
                                            value={values.slam.MOTOR_LIMIT_W_ACC}
                                            onValueChange={handleChange}
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
                                            value={values.slam.MOTOR_GAIN_KP}
                                            onValueChange={handleChange}
                                            showButtons
                                            mode="decimal"
                                        ></InputNumber>
                                    </div>
                                    <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                        <h5>모터 I 게인</h5>
                                        <InputNumber
                                            name = "values.MOTOR_GAIN_KI"
                                            value={values.slam.MOTOR_GAIN_KI}
                                            onValueChange={handleChange}
                                            showButtons
                                            mode="decimal"
                                        ></InputNumber>
                                    </div>
                                    <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                        <h5>모터 D 게인</h5>
                                        <InputNumber
                                            name = "values.MOTOR_GAIN_KD"
                                            value={values.slam.MOTOR_GAIN_KD}
                                            onValueChange={handleChange}
                                            showButtons
                                            mode="decimal"
                                        ></InputNumber>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>
                    <button type="submit" disabled={isSubmitting}>Submit</button>
                </main>
            )}
            </Formik>
        );
    }else{
        return(<></>);
    }
}

export default Setting;