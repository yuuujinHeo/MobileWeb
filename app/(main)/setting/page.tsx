'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import axios from 'axios';
import {useFormik} from 'formik';
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Panel } from 'primereact/panel';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { SelectButton } from "primereact/selectbutton";
import { TabView, TabPanel } from 'primereact/tabview';
import { ContextMenu } from 'primereact/contextmenu';
import { Toast } from 'primereact/toast';
import { BlockUI } from 'primereact/blockui';
import {SettingState, PresetSetting, ROBOT_TYPE,_robot, _preset, _debug, _loc, _control, _annotation, _default, _motor, _mapping, _obs} from '../../../interface/settings';
import './style.scss';
import { useDispatch, UseDispatch, useSelector } from 'react-redux';
import { setMonitorURL, setMobileURL, selectMonitor, selectMobile } from '@/store/networkSlice';
import {store,AppDispatch, RootState} from '../../../store/store';
import { selectSetting, setRobot, setDebug, setLoc, setControl, setAnnotation, setDefault, setMotor, setMapping, setObs, MotorSetting } from '@/store/settingSlice';
import {getMobileAPIURL} from '../api/url';
import { selectStatus, setStatus } from '@/store/statusSlice';
import { selectState, setState } from '@/store/stateSlice';
import { io } from "socket.io-client";
import { transStatus } from '../api/to';
import { TabMenu } from 'primereact/tabmenu';

const Setting: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const settingState = useSelector((state:RootState) => selectSetting(state));
    const [mobileURL, setMobileURL] = useState('');
    const [curCategory, setCurCategory] = useState(0);
    const [visiblePreset, setVisiblePreset] = useState(false);
    const [presets, setPresets] = useState([]);
    const toast = useRef<Toast | null>(null);

    useEffect(() =>{
        setURL();
    },[])

    async function setURL(){
        setMobileURL(await getMobileAPIURL());
    }

    const default_setting = async(data:SettingState) =>{
        try{
            dispatch(setRobot(data.robot));
            dispatch(setDebug(data.debug));
            dispatch(setLoc(data.loc));
            dispatch(setAnnotation(data.annotation));
            dispatch(setDefault(data.default));
            dispatch(setMotor(data.motor));
            dispatch(setMapping(data.mapping));
            dispatch(setObs(data.obs));
            formik_robot.handleReset(data.robot);
            formik_debug.handleReset(data.debug);
            formik_loc.handleReset(data.loc);
            formik_control.handleReset(data.control);
            formik_annotation.handleReset(data.annotation);
            formik_default.handleReset(data.default);
            formik_motor.handleReset(data.motor);
            formik_mapping.handleReset(data.mapping);
            formik_obs.handleReset(data.obs);
        }catch(error){
            console.error(error);
        }
    };

    const send_setting = async() =>{
        try{
            const json = JSON.stringify({"robot":formik_robot.values,
                                            "debug":formik_debug.values,
                                            "loc":formik_loc.values,
                                            "control":formik_control.values,
                                            "annotation":formik_annotation.values,
                                            "default":formik_default.values,
                                            "motor":formik_motor.values,
                                            "mapping":formik_mapping.values,
                                            "obs":formik_obs.values,
                                        });
                                        console.log("mobileURL?????",mobileURL);
            const response = await axios.post(mobileURL+'/setting',json,{
                headers:{
                    'Content-Type':'application/json'
                }
            });
            toast.current?.show({
                severity: 'success',
                summary: '저장 성공',
                detail: '',
                life: 3000
            });

            default_setting(response.data);

            console.log("--------------",json,response.data);   
        }catch(error){
            toast.current?.show({
                severity: 'error',
                summary: '저장 실패',
                detail: '',
                life: 3000
            });
            console.error(error);
        }
    };
  
    function initForm(){
        if(settingState){
            formik_robot.handleReset(settingState.robot);
            formik_debug.handleReset(settingState.debug);
            formik_loc.handleReset(settingState.loc);
            formik_control.handleReset(settingState.control);
            formik_annotation.handleReset(settingState.annotation);
            formik_default.handleReset(settingState.default);
            formik_motor.handleReset(settingState.motor);
            formik_mapping.handleReset(settingState.mapping);
            formik_obs.handleReset(settingState.obs);
        }
    }   

    function saveForm(){
        //check errors
        if(Object.values(formik_robot.errors).every(value => value == ''))
            if(Object.values(formik_debug.errors).every(value => value == ''))
                if(Object.values(formik_loc.errors).every(value => value == ''))
                    if(Object.values(formik_control.errors).every(value => value == ''))
                        if(Object.values(formik_annotation.errors).every(value => value == ''))
                            if(Object.values(formik_default.errors).every(value => value == ''))
                                if(Object.values(formik_motor.errors).every(value => value == ''))
                                    if(Object.values(formik_mapping.errors).every(value => value == ''))
                                        if(Object.values(formik_obs.errors).every(value => value == '')){
                                            send_setting();
                                            return;
                                        }
       
        toast.current?.show({
            severity: 'error',
            summary: '저장 실패',
            detail: '정상범위가 아닌 값이 존재합니다',
            life: 3000
        });
                                    
    }

    const formik_robot = useFormik({
        initialValues:{
            PLATFORM_NAME: settingState.robot.PLATFORM_NAME,
            PLATFORM_TYPE: settingState.robot.PLATFORM_TYPE
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
    const formik_debug = useFormik({
        initialValues:{
            SIM_MODE:settingState?.debug.SIM_MODE
        },
        enableReinitialize: true,
        validate: (values) => {
            var errors = {
                SIM_MODE:''
            }
            if(values.SIM_MODE != 0 && values.SIM_MODE != 1 && values.SIM_MODE){
                console.log(values.SIM_MODE);
                errors.SIM_MODE = "0이나 1의 값이어야 합니다";
            }
            return errors;
        },
        onSubmit: (data) => {
        }
    });
    const formik_loc = useFormik({
        initialValues:{
            LOC_CHECK_DIST:         settingState.loc.LOC_CHECK_DIST,
            LOC_CHECK_IE:           settingState.loc.LOC_CHECK_IE,
            LOC_CHECK_IR:           settingState.loc.LOC_CHECK_IR,
            LOC_FUSION_RATIO:       settingState.loc.LOC_FUSION_RATIO,
            LOC_ICP_COST_THRESHOLD: settingState.loc.LOC_ICP_COST_THRESHOLD,
            LOC_ICP_ERROR_THRESHOLD:settingState.loc.LOC_ICP_ERROR_THRESHOLD,
            LOC_ICP_MAX_FEATURE_NUM:settingState.loc.LOC_ICP_MAX_FEATURE_NUM
        },
        enableReinitialize: true,
        validate: (values) => {
            const errors = {
                LOC_CHECK_DIST:         "",
                LOC_CHECK_IE:           "",
                LOC_CHECK_IR:           "",
                LOC_FUSION_RATIO:       "",
                LOC_ICP_COST_THRESHOLD: "",
                LOC_ICP_ERROR_THRESHOLD:"",
                LOC_ICP_MAX_FEATURE_NUM:""
            }
            return errors;
        },
        onSubmit: (data) => {
            console.log("SAVE : ",data);
        }
    });
    const formik_control = useFormik({
        initialValues:{
            DRIVE_EXTENDED_CONTROL_TIME:settingState?.control.DRIVE_EXTENDED_CONTROL_TIME,
            DRIVE_GOAL_D:settingState?.control.DRIVE_GOAL_D,
            DRIVE_GOAL_TH:settingState?.control.DRIVE_GOAL_TH
        },
        enableReinitialize: true,
        validate: (values) => {
            const errors = {
                DRIVE_EXTENDED_CONTROL_TIME:"",
                DRIVE_GOAL_D:"",
                DRIVE_GOAL_TH:""
            };
            return errors;
        },
        onSubmit: (data) => {
            console.log("SAVE : ",data);
        }
    });
    const formik_annotation = useFormik({
        initialValues:{
            ANNOT_QA_STEP:settingState?.annotation.ANNOT_QA_STEP
        },
        enableReinitialize: true,
        validate: (values) => {
            const errors = {
                ANNOT_QA_STEP:""
            };
            return errors;
        },
        onSubmit: (data) => {
            console.log("SAVE : ",data);
        }
    });
    const formik_default = useFormik({
        initialValues:{
            ROBOT_SIZE_MAX_X:settingState?.default.ROBOT_SIZE_MAX_X,
            ROBOT_SIZE_MAX_Y:settingState?.default.ROBOT_SIZE_MAX_Y,
            ROBOT_SIZE_MAX_Z:settingState?.default.ROBOT_SIZE_MAX_Z,
            ROBOT_SIZE_MIN_X:settingState?.default.ROBOT_SIZE_MIN_X,
            ROBOT_SIZE_MIN_Y:settingState?.default.ROBOT_SIZE_MIN_Y,
            ROBOT_SIZE_MIN_Z:settingState?.default.ROBOT_SIZE_MIN_Z,
            ROBOT_RADIUS: settingState.default.ROBOT_RADIUS,
            ROBOT_WHEEL_BASE:settingState?.default.ROBOT_WHEEL_BASE,
            ROBOT_WHEEL_RADIUS:settingState?.default.ROBOT_WHEEL_RADIUS,
            LIDAR_MAX_RANGE:settingState?.default.LIDAR_MAX_RANGE,
            LIDAR_TF_B_X:settingState?.default.LIDAR_TF_B_X,
            LIDAR_TF_B_Y:settingState?.default.LIDAR_TF_B_Y,
            LIDAR_TF_B_Z:settingState?.default.LIDAR_TF_B_Z,
            LIDAR_TF_B_RX:settingState?.default.LIDAR_TF_B_RX,
            LIDAR_TF_B_RY:settingState?.default.LIDAR_TF_B_RY,
            LIDAR_TF_B_RZ:settingState?.default.LIDAR_TF_B_RZ,
            LIDAR_TF_F_X:settingState?.default.LIDAR_TF_F_X,
            LIDAR_TF_F_Y:settingState?.default.LIDAR_TF_F_Y,
            LIDAR_TF_F_Z:settingState?.default.LIDAR_TF_F_Z,
            LIDAR_TF_F_RX:settingState?.default.LIDAR_TF_F_RX,
            LIDAR_TF_F_RY:settingState?.default.LIDAR_TF_F_RY,
            LIDAR_TF_F_RZ:settingState?.default.LIDAR_TF_F_RZ
        },
        enableReinitialize: true,
        validate: (values) => {
            const errors = {
                ROBOT_SIZE_MAX_X:"",
                ROBOT_SIZE_MAX_Y:"",
                ROBOT_SIZE_MAX_Z:"",
                ROBOT_SIZE_MIN_X:"",
                ROBOT_SIZE_MIN_Y:"",
                ROBOT_SIZE_MIN_Z:"",
                ROBOT_RADIUS:"",
                ROBOT_WHEEL_BASE:"",
                ROBOT_WHEEL_RADIUS:"",
                LIDAR_MAX_RANGE:"",
                LIDAR_TF_B_X:"",
                LIDAR_TF_B_Y:"",
                LIDAR_TF_B_Z:"",
                LIDAR_TF_B_RX:"",
                LIDAR_TF_B_RY:"",
                LIDAR_TF_B_RZ:"",
                LIDAR_TF_F_X:"",
                LIDAR_TF_F_Y:"",
                LIDAR_TF_F_Z:"",
                LIDAR_TF_F_RX:"",
                LIDAR_TF_F_RY:"",
                LIDAR_TF_F_RZ:""
            };
            return errors;
        },
        onSubmit: (data) => {
            console.log("SAVE : ",data);
        }
    });
    const formik_motor = useFormik({
        initialValues:{
            MOTOR_ID_L:settingState?.motor.MOTOR_ID_L,
            MOTOR_ID_R:settingState?.motor.MOTOR_ID_R,
            MOTOR_DIR:settingState?.motor.MOTOR_DIR,
            MOTOR_GEAR_RATIO:settingState?.motor.MOTOR_GEAR_RATIO,
            MOTOR_LIMIT_V:settingState?.motor.MOTOR_LIMIT_V,
            MOTOR_LIMIT_V_ACC:settingState?.motor.MOTOR_LIMIT_V_ACC,
            MOTOR_LIMIT_W:settingState?.motor.MOTOR_LIMIT_W,
            MOTOR_LIMIT_W_ACC:settingState?.motor.MOTOR_LIMIT_W_ACC,
            MOTOR_GAIN_KP:settingState?.motor.MOTOR_GAIN_KP,
            MOTOR_GAIN_KI:settingState?.motor.MOTOR_GAIN_KI,
            MOTOR_GAIN_KD:settingState?.motor.MOTOR_GAIN_KD
        },
        enableReinitialize: true,
        validate: (values) => {
            const errors = {
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
            };
            return errors;
        },
        onSubmit: (data) => {
            console.log("SAVE : ",data);
        }
    });
    const formik_mapping = useFormik({
        initialValues:{
            SLAM_ICP_COST_THRESHOLD:settingState?.mapping.SLAM_ICP_COST_THRESHOLD,
            SLAM_ICP_DO_ACCUM_NUM:settingState?.mapping.SLAM_ICP_DO_ACCUM_NUM,
            SLAM_ICP_DO_ERASE_GAP:settingState?.mapping.SLAM_ICP_DO_ERASE_GAP,
            SLAM_ICP_ERROR_THRESHOLD:settingState?.mapping.SLAM_ICP_ERROR_THRESHOLD,
            SLAM_ICP_MAX_FEATURE_NUM:settingState?.mapping.SLAM_ICP_MAX_FEATURE_NUM,
            SLAM_ICP_VIEW_THRESHOLD:settingState?.mapping.SLAM_ICP_VIEW_THRESHOLD,
            SLAM_KFRM_LC_TRY_DIST:settingState?.mapping.SLAM_KFRM_LC_TRY_DIST,
            SLAM_KFRM_LC_TRY_OVERLAP:settingState?.mapping.SLAM_KFRM_LC_TRY_OVERLAP,
            SLAM_KFRM_UPDATE_NUM:settingState?.mapping.SLAM_KFRM_UPDATE_NUM,
            SLAM_VOXEL_SIZE:settingState?.mapping.SLAM_VOXEL_SIZE,
            SLAM_WINDOW_SIZE:settingState?.mapping.SLAM_WINDOW_SIZE
        },
        enableReinitialize: true,
        validate: (values) => {
            const errors = {
                SLAM_ICP_COST_THRESHOLD:"",
                SLAM_ICP_DO_ACCUM_NUM:"",
                SLAM_ICP_DO_ERASE_GAP:"",
                SLAM_ICP_ERROR_THRESHOLD:"",
                SLAM_ICP_MAX_FEATURE_NUM:"",
                SLAM_ICP_VIEW_THRESHOLD:"",
                SLAM_KFRM_LC_TRY_DIST:"",
                SLAM_KFRM_LC_TRY_OVERLAP:"",
                SLAM_KFRM_UPDATE_NUM:"",
                SLAM_VOXEL_SIZE:"",
                SLAM_WINDOW_SIZE:""
            };
            return errors;
        },
        onSubmit: (data) => {
            console.log("SAVE : ",data);
        }
    });
    const formik_obs = useFormik({
        initialValues:{
            OBS_AVOID_DIST:settingState?.obs.OBS_AVOID_DIST,
            OBS_MAP_GRID_SIZE:settingState?.obs.OBS_MAP_GRID_SIZE,
            OBS_MAP_MARGIN:settingState?.obs.OBS_MAP_MARGIN,
            OBS_MAP_RANGE:settingState?.obs.OBS_MAP_RANGE,
            OBS_SIZE_THRESHOLD:settingState?.obs.OBS_SIZE_THRESHOLD,
            OBS_TARGET_DIST:settingState?.obs.OBS_TARGET_DIST,
        },
        enableReinitialize: true,
        validate: (values) => {
            const errors = {
                OBS_AVOID_DIST:"",
                OBS_MAP_GRID_SIZE:"",
                OBS_MAP_MARGIN:"",
                OBS_MAP_RANGE:"",
                OBS_SIZE_THRESHOLD:"",
                OBS_TARGET_DIST:""
            };
            return errors;
        },
        onSubmit: (data) => {
            console.log("SAVE : ",data);
        }
    });
    

    const loadPresetList = async() =>{
        try{
            const response = await axios.get(mobileURL+'/setting/preset');
            console.log(response.data);
            setPresets(response.data);
        }catch(error){
            console.error(error);
        }
    }

    async function openPresetPopup(){
        await loadPresetList();
        setVisiblePreset(true);
    }
    const i_size= 300;
    
    const PopupPreset = () =>{
        const cm = useRef<ContextMenu>(null);
        const [selectPreset, setSelectPreset] = useState<number | null>(null);
        const [cur, setCur] = useState<PresetSetting>();
        const [blocked, setBlocked] = useState(false);
        const menus = [
            // {label: '번호변경', icon: 'pi pi-file-edit', command:()=>{
            //     if(selectPreset!=null){
            //         changeNumber
            // }}},
            {label: '삭제', icon: 'pi pi-trash', command:()=>{
                console.log("delete",selectPreset)
                if(selectPreset!=null){
                    deletePreset();
            }}},
            {label: '복사', icon: 'pi pi-clone', command:()=>{
                if(selectPreset!=null){
                    copyPreset();
                }
            }},
        ];

        const formik_preset = useFormik({
            initialValues:{
                LIMIT_V:        cur?.LIMIT_V,
                LIMIT_W:        cur?.LIMIT_W,
                LIMIT_V_ACC:    cur?.LIMIT_V_ACC,
                LIMIT_W_ACC:    cur?.LIMIT_W_ACC,
                LIMIT_PIVOT_W:  cur?.LIMIT_PIVOT_W,
                PP_MIN_LD:      cur?.PP_MIN_LD,
                PP_MAX_LD:      cur?.PP_MAX_LD,
                PP_ST_V:        cur?.PP_ST_V,
                PP_ED_V:        cur?.PP_ED_V
            },
            enableReinitialize: true,
            validate: (values) => {
                const errors = {
                    LIMIT_V:        "",
                    LIMIT_W:        "",
                    LIMIT_V_ACC:    "",
                    LIMIT_W_ACC:    "",
                    LIMIT_PIVOT_W:  "",
                    PP_MIN_LD:      "",
                    PP_MAX_LD:      "",
                    PP_ST_V:        "",
                    PP_ED_V:        ""
                };
                return errors;
            },
            onSubmit: (data) => {
                console.log("SAVE : ",data);
            }
        });

        const loadPreset = async(num:number|undefined=undefined) =>{
            try{
                if(num!= undefined){

                }else if(selectPreset != null){
                    num = selectPreset;
                }else{
                    return;
                }

                const response = await axios.get(mobileURL+'/setting/preset/'+num);
                console.log(response.data);
                setCur(response.data);
                formik_preset.handleReset(response.data);
                
            }catch(error){
                console.error(error);
            }
        }
        
        async function deletePreset(){
            try{
                console.log("delete")
                const response = await axios.delete(mobileURL+'/setting/preset/'+selectPreset);
                setPresets(response.data);
                setSelectPreset(null);
                setCur(undefined);
            }catch(error){
                console.error(error);
            }
        }
        async function changeNumber(){

        }
        async function copyPreset(){
            const num = getNextNumber();
            try{
                console.log(selectPreset);
                const response = await axios.post(mobileURL+'/setting/preset/'+num,cur);
                setSelectPreset(num);
                setCur(response.data);
                formik_preset.handleReset(response.data);
                loadPresetList();
            }catch(error){
                console.error(error);
            }

        }
        async function savePreset(){
            try{
                const response = await axios.put(mobileURL+'/setting/preset/'+selectPreset,formik_preset.values);
                console.log(response);
                setCur(response.data);
                formik_preset.handleReset(response.data);
            }catch(error){
                console.error(error);
            }
        }

        function getNextNumber(){
            var max = -1;
            for(const p of presets){
                console.log(p);
                if(max < p){
                    max = p;
                }
            }
            return max+1;
        }

        async function addPreset(){
            const num = getNextNumber();
            try{
                const response = await axios.post(mobileURL+'/setting/preset/'+num);
                console.log(response);
                setSelectPreset(num);
                setCur(response.data);
                formik_preset.handleReset(response.data);
                loadPresetList();
            }catch(error){
                console.error(error);
            }
        }

        const onRightClick = (event: React.MouseEvent, preset: any) => {
            if (cm.current) {
                loadPreset(preset);
                setSelectPreset(preset);
                cm.current.show(event);
            }
        };

        function refresh(){
            loadPresetList();
            formik_preset.handleReset(cur);
        }

        async function changePreset(nn:any){
            setSelectPreset(nn)
            loadPreset(nn);
        }
        return(
            <Dialog header="속도 프리셋 설정" visible={visiblePreset} onHide={()=>setVisiblePreset(false)}>
                <div className='column'>
                <Toolbar start={
                    <React.Fragment>
                        <Button onClick={refresh} icon="pi pi-refresh" className='mr-2'></Button>
                        <Button onClick={addPreset} icon="pi pi-plus" className='mr-2'></Button>
                        <Button disabled={cur==undefined} onClick={deletePreset} icon="pi pi-trash" className='mr-2'></Button>
                    </React.Fragment>
                    } end={
                        <Button onClick={savePreset} disabled={cur==undefined} label="저 장" icon="pi pi-check"></Button>
                    }>
                </Toolbar>
                <div className='card grid'>
                    <ul className="m-0 p-0 list-none border-1 surface-border border-round flex flex-column gap-3 w-full md:w-15rem " >
                        {presets.map((p) => (
                            <li
                                key={p}
                                className={`p-2 hover:surface-hover border-round border-1 border-transparent transition-all transition-duration-200 flex align-items-center justify-content-between ${selectPreset === p && 'border-primary'}`}
                                onContextMenu={(event) => onRightClick(event, p)}
                                onClick={(e) => changePreset(p)}
                            >
                            <div className="flex text-center items-center justify-center p-2 font-bold text-900 ">
                                Preset {p}
                            </div>
                            </li>
                        ))}
                    </ul>
                    <ContextMenu ref={cm} model={menus} onHide={() => setSelectPreset(null)} />
                    <BlockUI blocked={cur==undefined} template={<i className="pi pi-lock" style={{ fontSize: '3rem' }}></i>}>
                    <div className="card">
                        <div className="column"> 
                        <div className="grid gap-5"> 
                            <div>
                                <p ><span style={{fontSize:18,fontWeight: 700}}>LIMIT_V</span>
                                <span style={{display:cur!==undefined&&formik_preset.values.LIMIT_V!==formik_preset.initialValues.LIMIT_V?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "LIMIT_V"
                                    value={formik_preset.values.LIMIT_V}
                                    onValueChange={formik_preset.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div> 
                                <p ><span style={{fontSize:18,fontWeight: 700}}>LIMIT_W</span>
                                <span style={{display:cur!==undefined&&formik_preset.values.LIMIT_W!==formik_preset.initialValues.LIMIT_W?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "LIMIT_W"
                                    value={formik_preset.values.LIMIT_W}
                                    onValueChange={formik_preset.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                        </div>
                        <div className="grid gap-5"> 
                            <div> 
                                <p ><span style={{fontSize:18,fontWeight: 700}}>LIMIT_V_ACC</span>
                                <span style={{display:cur!==undefined&&formik_preset.values.LIMIT_V_ACC!==formik_preset.initialValues.LIMIT_V_ACC?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "LIMIT_V_ACC"
                                    value={formik_preset.values.LIMIT_V_ACC}
                                    onValueChange={formik_preset.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div> 
                                <p ><span style={{fontSize:18,fontWeight: 700}}>LIMIT_W_ACC</span>
                                <span style={{display:cur!==undefined&&formik_preset.values.LIMIT_W_ACC!==formik_preset.initialValues.LIMIT_W_ACC?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "LIMIT_W_ACC"
                                    value={formik_preset.values.LIMIT_W_ACC}
                                    onValueChange={formik_preset.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                        </div>
                        <div className="grid gap-5"> 
                            <div> 
                                <p ><span style={{fontSize:18,fontWeight: 700}}>LIMIT_PIVOT_W</span>
                                <span style={{display:cur!==undefined&&formik_preset.values.LIMIT_PIVOT_W!==formik_preset.initialValues.LIMIT_PIVOT_W?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "LIMIT_PIVOT_W"
                                    value={formik_preset.values.LIMIT_PIVOT_W}
                                    onValueChange={formik_preset.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div> 
                                <p ><span style={{fontSize:18,fontWeight: 700}}>PP_MIN_LD</span>
                                <span style={{display:cur!==undefined&&formik_preset.values.PP_MIN_LD!==formik_preset.initialValues.PP_MIN_LD?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "PP_MIN_LD"
                                    value={formik_preset.values.PP_MIN_LD}
                                    onValueChange={formik_preset.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                        </div>
                        <div className="grid gap-5"> 
                            <div> 
                                <p ><span style={{fontSize:18,fontWeight: 700}}>PP_MAX_LD</span>
                                <span style={{display:cur!==undefined&&formik_preset.values.PP_MAX_LD!==formik_preset.initialValues.PP_MAX_LD?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "PP_MAX_LD"
                                    value={formik_preset.values.PP_MAX_LD}
                                    onValueChange={formik_preset.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div> 
                                <p ><span style={{fontSize:18,fontWeight: 700}}>PP_ST_V</span>
                                <span style={{display:cur!==undefined&&formik_preset.values.PP_ST_V!==formik_preset.initialValues.PP_ST_V?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "PP_ST_V"
                                    value={formik_preset.values.PP_ST_V}
                                    onValueChange={formik_preset.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                        </div>
                        <div className="grid gap-5"> 
                            <div> 
                                <p ><span style={{fontSize:18,fontWeight: 700}}>PP_ED_V</span>
                                <span style={{display:cur!==undefined&&formik_preset.values.PP_ED_V!==formik_preset.initialValues.PP_ED_V?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "PP_ED_V"
                                    value={formik_preset.values.PP_ED_V}
                                    onValueChange={formik_preset.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                        </div>
                    </div>
                    </div>
                    </BlockUI>
                </div></div>
            </Dialog>
        );
    }
    
    return(
        <main>
            <Toast ref={toast}></Toast>
            <PopupPreset/>
            <div className="card fixed-toolbar">
                <Button label="초기화" icon="pi pi-refresh" style={{ marginRight: '.5em' }} severity="secondary" onClick={initForm}/>
                <Button onClick={saveForm} label="Save" icon="pi pi-save" style={{ width: '10rem' }}></Button>
            </div>

            <div className='card mt-3'>
            <TabMenu model={[
                { 
                    label: '로봇 기본 정보', 
                    icon: 'pi pi-android mr-2 ml-2', 
                    command: () =>{
                        setCurCategory(0);
                    }
                },
                { 
                    label: '매핑 / 정확도', 
                    icon: 'pi pi-map mr-2 ml-2' ,
                    command: () =>{
                        setCurCategory(1);
                    }
                },
                { 
                    label: '주행 / 감지', 
                    icon: 'pi pi-car mr-2 ml-2' ,
                    command: () =>{
                        setCurCategory(2);
                    }
                },
                { 
                    label: '로봇 특성', 
                    icon: 'pi pi-cog mr-2 ml-2' ,
                    command: () =>{
                        setCurCategory(3);
                    }
                }
            ]}/>
            </div>


            <div className='card mt-3'>
                {curCategory==0 && 
                    <div  className=" column" > 
                        <Panel header = "로봇 기본 정보" id="TabRobotBasic" > 
                            <p><span style={{fontSize:18,fontWeight: 700}}>플랫폼 이름</span>
                            <span style={{display:formik_robot.values.PLATFORM_NAME!==formik_robot.initialValues.PLATFORM_NAME?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <span className="p-float-label">
                                <InputText
                                    name="PLATFORM_NAME"
                                    type="text"
                                    onChange={formik_robot.handleChange}
                                    value={formik_robot.values.PLATFORM_NAME}
                                    className={ formik_robot.errors.PLATFORM_NAME?"p-invalid" + " p-inputtext-long":"" + "p-inputtext-long"}
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
                                // style = {{width:500}}
                            />
                        </Panel>
                        <Panel header = "디버그 모드" id="TabRobotBasic" > 
                            <p><span style={{fontSize:18,fontWeight: 700}}>시뮬레이션 모드</span>
                            <span style={{display:formik_debug.values.SIM_MODE!==formik_debug.initialValues.SIM_MODE?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <span className="p-float-label">
                                <InputNumber
                                    name="SIM_MODE"
                                    showButtons
                                    maxFractionDigits={3}
                                    step={1}
                                    onValueChange={formik_debug.handleChange}
                                    value={formik_debug.values.SIM_MODE}
                                    className={formik_debug.errors.SIM_MODE?"p-invalid":""}
                                />
                                <small id="username-help" style={{color:"red", fontSize: '1em',marginLeft: '1em' }}>
                                    {formik_debug.errors.SIM_MODE as string}
                                </small>
                            </span>
                        </Panel>
                        <Panel header = "모터 정보" style={{ marginTop: '1em' }}  >
                            <div className="card">
                                <p><span style={{fontSize:18,fontWeight: 700}}>0번 모터</span>
                                <span style={{display:formik_motor.values.MOTOR_ID_L!==formik_motor.initialValues.MOTOR_ID_L?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <SelectButton
                                    value={formik_motor.values.MOTOR_ID_L}
                                    onChange={(e) =>{
                                        if(e.value){
                                            if(e.value == '0'){
                                                formik_motor.setFieldValue("MOTOR_ID_L", "0");
                                                formik_motor.setFieldValue("MOTOR_ID_R", "1");
                                            }else{
                                                formik_motor.setFieldValue("MOTOR_ID_L", "1");
                                                formik_motor.setFieldValue("MOTOR_ID_R", "0");
                                            }                            
                                        }
                                    }}
                                    options={[{value:'0',name:"LEFT"},{value:'1',name:"RIGHT"}]}
                                    optionLabel="name"
                                />
                                <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>1번 모터</span>
                                <span style={{display:formik_motor.values.MOTOR_ID_R!==formik_motor.initialValues.MOTOR_ID_R?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <SelectButton
                                    value={formik_motor.values.MOTOR_ID_R=="0"?"0":"1"}
                                    onChange={(e) =>{
                                        if(e.value){
                                            if(e.value == '0'){
                                                formik_motor.setFieldValue("MOTOR_ID_L", "1");
                                                formik_motor.setFieldValue("MOTOR_ID_R", "0");
                                            }else{
                                                formik_motor.setFieldValue("MOTOR_ID_L", "0");
                                                formik_motor.setFieldValue("MOTOR_ID_R", "1");
                                            }                            
                                        }
                                    }}
                                    options={[{value:"0",name:"LEFT"},{value:"1",name:"RIGHT"}]}
                                    optionLabel="name"
                                />
                                <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>모터 방향</span>
                                <span style={{display:formik_motor.values.MOTOR_DIR!==formik_motor.initialValues.MOTOR_DIR?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <SelectButton
                                    value={formik_motor.values.MOTOR_DIR}
                                    onChange={(e) =>{
                                        if(e.value == "-1"){
                                            formik_motor.setFieldValue("MOTOR_DIR", "-1");
                                        }else if(e.value == "1"){
                                            formik_motor.setFieldValue("MOTOR_DIR", "1");
                                        }                   
                                    }}
                                    options={[{value:"-1",name:"-1 방향"},{value:"1",name:"+1 방향"}]}
                                    optionLabel="name"
                                />
                                <p style={{marginTop:15}}><span style={{fontSize:18,fontWeight: 700}}>모터 기어비</span>
                                <span style={{display:formik_motor.values.MOTOR_GEAR_RATIO!==formik_motor.initialValues.MOTOR_GEAR_RATIO?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "MOTOR_GEAR_RATIO"
                                    value={formik_motor.values.MOTOR_GEAR_RATIO}
                                    onValueChange={formik_motor.handleChange}
                                    showButtons
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div className="card">
                                <div className="grid formgrid">
                                    <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                        <p><span style={{fontSize:18,fontWeight: 700}}>선속도 제한 [m/s]</span>
                                        <span style={{display:formik_motor.values.MOTOR_LIMIT_V!==formik_motor.initialValues.MOTOR_LIMIT_V?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "MOTOR_LIMIT_V"
                                            value={formik_motor.values.MOTOR_LIMIT_V}
                                            onValueChange={formik_motor.handleChange}
                                            showButtons
                                            step={0.1}
                                            max={3.0}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                        <p><span style={{fontSize:18,fontWeight: 700}}>선 가속도 제한 [m/s^2]</span>
                                        <span style={{display:formik_motor.values.MOTOR_LIMIT_V_ACC!==formik_motor.initialValues.MOTOR_LIMIT_V_ACC?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "MOTOR_LIMIT_V_ACC"
                                            value={formik_motor.values.MOTOR_LIMIT_V_ACC}
                                            onValueChange={formik_motor.handleChange}
                                            showButtons
                                            step={0.1}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="grid formgrid">
                                    <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                        <p><span style={{fontSize:18,fontWeight: 700}}>각속도 제한 [m/s]</span>
                                        <span style={{display:formik_motor.values.MOTOR_LIMIT_W!==formik_motor.initialValues.MOTOR_LIMIT_W?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "MOTOR_LIMIT_W"
                                            value={formik_motor.values.MOTOR_LIMIT_W}
                                            onValueChange={formik_motor.handleChange}
                                            showButtons
                                            step={0.1}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                        <p><span style={{fontSize:18,fontWeight: 700}}>각 가속도 제한 [m/s^2]</span>
                                        <span style={{display:formik_motor.values.MOTOR_LIMIT_W_ACC!==formik_motor.initialValues.MOTOR_LIMIT_W_ACC?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "MOTOR_LIMIT_W_ACC"
                                            value={formik_motor.values.MOTOR_LIMIT_W_ACC}
                                            onValueChange={formik_motor.handleChange}
                                            showButtons
                                            step={0.1}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="grid formgrid">
                                    <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                        <p><span style={{fontSize:18,fontWeight: 700}}>모터 P 게인</span>
                                        <span style={{display:formik_motor.values.MOTOR_GAIN_KP!==formik_motor.initialValues.MOTOR_GAIN_KP?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "MOTOR_GAIN_KP"
                                            value={formik_motor.values.MOTOR_GAIN_KP}
                                            onValueChange={formik_motor.handleChange}
                                            showButtons
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                        <p><span style={{fontSize:18,fontWeight: 700}}>모터 I 게인</span>
                                        <span style={{display:formik_motor.values.MOTOR_GAIN_KI!==formik_motor.initialValues.MOTOR_GAIN_KI?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "MOTOR_GAIN_KI"
                                            value={formik_motor.values.MOTOR_GAIN_KI}
                                            onValueChange={formik_motor.handleChange}
                                            showButtons
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div className="col-12 mb-2 lg:col-4 lg:mb-0">
                                        <p><span style={{fontSize:18,fontWeight: 700}}>모터 D 게인</span>
                                        <span style={{display:formik_motor.values.MOTOR_GAIN_KD!==formik_motor.initialValues.MOTOR_GAIN_KD?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "MOTOR_GAIN_KD"
                                            value={formik_motor.values.MOTOR_GAIN_KD}
                                            onValueChange={formik_motor.handleChange}
                                            showButtons
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                </div>
                            </div> 
                        </Panel>
                    </div>
                }

                {curCategory==1 &&
                    <div className="column" > 
                    <Panel header = "위치 정확도"  >
                        <div className="grid gap-5 mr-3 ml-3 mt-3 mb-3"> 
                        <div> 
                            <p style={{width: i_size}}>
                                <span style={{fontSize:18,fontWeight: 700}}>LOC_CHECK_DIST</span>
                                <span style={{display:formik_loc.values.LOC_CHECK_DIST!==formik_loc.initialValues.LOC_CHECK_DIST?"inline":"none", color:"red"}}>    (수정됨)</span>
                            </p>
                            <InputNumber
                                name = "LOC_CHECK_DIST"
                                value={formik_loc.values.LOC_CHECK_DIST}
                                onValueChange={formik_loc.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>LOC_CHECK_IE</span>
                            <span style={{display:formik_loc.values.LOC_CHECK_IE!==formik_loc.initialValues.LOC_CHECK_IE?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "LOC_CHECK_IE"
                                value={formik_loc.values.LOC_CHECK_IE}
                                onValueChange={formik_loc.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>LOC_CHECK_IR</span>
                            <span style={{display:formik_loc.values.LOC_CHECK_IR!==formik_loc.initialValues.LOC_CHECK_IR?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "LOC_CHECK_IR"
                                value={formik_loc.values.LOC_CHECK_IR}
                                onValueChange={formik_loc.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>LOC_FUSION_RATIO</span>
                            <span style={{display:formik_loc.values.LOC_FUSION_RATIO!==formik_loc.initialValues.LOC_FUSION_RATIO?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "LOC_FUSION_RATIO"
                                value={formik_loc.values.LOC_FUSION_RATIO}
                                onValueChange={formik_loc.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>LOC_ICP_COST_THRESHOLD</span>
                            <span style={{display:formik_loc.values.LOC_ICP_COST_THRESHOLD!==formik_loc.initialValues.LOC_ICP_COST_THRESHOLD?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "LOC_ICP_COST_THRESHOLD"
                                value={formik_loc.values.LOC_ICP_COST_THRESHOLD}
                                onValueChange={formik_loc.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>LOC_ICP_ERROR_THRESHOLD</span>
                            <span style={{display:formik_loc.values.LOC_ICP_ERROR_THRESHOLD!==formik_loc.initialValues.LOC_ICP_ERROR_THRESHOLD?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "LOC_ICP_ERROR_THRESHOLD"
                                value={formik_loc.values.LOC_ICP_ERROR_THRESHOLD}
                                onValueChange={formik_loc.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>LOC_ICP_MAX_FEATURE_NUM</span>
                            <span style={{display:formik_loc.values.LOC_ICP_MAX_FEATURE_NUM!==formik_loc.initialValues.LOC_ICP_MAX_FEATURE_NUM?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "LOC_ICP_MAX_FEATURE_NUM"
                                value={formik_loc.values.LOC_ICP_MAX_FEATURE_NUM}
                                onValueChange={formik_loc.handleChange}
                                showButtons
                                step={1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        </div>
                    </Panel>
                    <Panel header = "매핑"  >
                        <div className="grid gap-5 mr-3 ml-3 mt-3 mb-3"> 
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>SLAM_ICP_COST_THRESHOLD</span>
                            <span style={{display:formik_mapping.values.SLAM_ICP_COST_THRESHOLD!==formik_mapping.initialValues.SLAM_ICP_COST_THRESHOLD?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "SLAM_ICP_COST_THRESHOLD"
                                value={formik_mapping.values.SLAM_ICP_COST_THRESHOLD}
                                onValueChange={formik_mapping.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>SLAM_ICP_DO_ACCUM_NUM</span>
                            <span style={{display:formik_mapping.values.SLAM_ICP_DO_ACCUM_NUM!==formik_mapping.initialValues.SLAM_ICP_DO_ACCUM_NUM?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "SLAM_ICP_DO_ACCUM_NUM"
                                value={formik_mapping.values.SLAM_ICP_DO_ACCUM_NUM}
                                onValueChange={formik_mapping.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>SLAM_ICP_DO_ERASE_GAP</span>
                            <span style={{display:formik_mapping.values.SLAM_ICP_DO_ERASE_GAP!==formik_mapping.initialValues.SLAM_ICP_DO_ERASE_GAP?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "SLAM_ICP_DO_ERASE_GAP"
                                value={formik_mapping.values.SLAM_ICP_DO_ERASE_GAP}
                                onValueChange={formik_mapping.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>SLAM_ICP_ERROR_THRESHOLD</span>
                            <span style={{display:formik_mapping.values.SLAM_ICP_ERROR_THRESHOLD!==formik_mapping.initialValues.SLAM_ICP_ERROR_THRESHOLD?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "SLAM_ICP_ERROR_THRESHOLD"
                                value={formik_mapping.values.SLAM_ICP_ERROR_THRESHOLD}
                                onValueChange={formik_mapping.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>SLAM_ICP_MAX_FEATURE_NUM</span>
                            <span style={{display:formik_mapping.values.SLAM_ICP_MAX_FEATURE_NUM!==formik_mapping.initialValues.SLAM_ICP_MAX_FEATURE_NUM?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "SLAM_ICP_MAX_FEATURE_NUM"
                                value={formik_mapping.values.SLAM_ICP_MAX_FEATURE_NUM}
                                onValueChange={formik_mapping.handleChange}
                                showButtons
                                step={1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>SLAM_ICP_VIEW_THRESHOLD</span>
                            <span style={{display:formik_mapping.values.SLAM_ICP_VIEW_THRESHOLD!==formik_mapping.initialValues.SLAM_ICP_VIEW_THRESHOLD?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "SLAM_ICP_VIEW_THRESHOLD"
                                value={formik_mapping.values.SLAM_ICP_VIEW_THRESHOLD}
                                onValueChange={formik_mapping.handleChange}
                                showButtons
                                step={1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>SLAM_KFRM_LC_TRY_DIST</span>
                            <span style={{display:formik_mapping.values.SLAM_KFRM_LC_TRY_DIST!==formik_mapping.initialValues.SLAM_KFRM_LC_TRY_DIST?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "SLAM_KFRM_LC_TRY_DIST"
                                value={formik_mapping.values.SLAM_KFRM_LC_TRY_DIST}
                                onValueChange={formik_mapping.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>SLAM_KFRM_LC_TRY_OVERLAP</span>
                            <span style={{display:formik_mapping.values.SLAM_KFRM_LC_TRY_OVERLAP!==formik_mapping.initialValues.SLAM_KFRM_LC_TRY_OVERLAP?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "SLAM_KFRM_LC_TRY_OVERLAP"
                                value={formik_mapping.values.SLAM_KFRM_LC_TRY_OVERLAP}
                                onValueChange={formik_mapping.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>SLAM_KFRM_UPDATE_NUM</span>
                            <span style={{display:formik_mapping.values.SLAM_KFRM_UPDATE_NUM!==formik_mapping.initialValues.SLAM_KFRM_UPDATE_NUM?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "SLAM_KFRM_UPDATE_NUM"
                                value={formik_mapping.values.SLAM_KFRM_UPDATE_NUM}
                                onValueChange={formik_mapping.handleChange}
                                showButtons
                                step={1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>SLAM_VOXEL_SIZE</span>
                            <span style={{display:formik_mapping.values.SLAM_VOXEL_SIZE!==formik_mapping.initialValues.SLAM_VOXEL_SIZE?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "SLAM_VOXEL_SIZE"
                                value={formik_mapping.values.SLAM_VOXEL_SIZE}
                                onValueChange={formik_mapping.handleChange}
                                showButtons
                                step={0.01}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>SLAM_WINDOW_SIZE</span>
                            <span style={{display:formik_mapping.values.SLAM_WINDOW_SIZE!==formik_mapping.initialValues.SLAM_WINDOW_SIZE?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "SLAM_WINDOW_SIZE"
                                value={formik_mapping.values.SLAM_WINDOW_SIZE}
                                onValueChange={formik_mapping.handleChange}
                                showButtons
                                step={1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        </div>
                    </Panel>
                    <Panel header = "어노테이션"  >
                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>ANNOT_QA_STEP</span>
                        <span style={{display:formik_annotation.values.ANNOT_QA_STEP!==formik_annotation.initialValues.ANNOT_QA_STEP?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                        <InputNumber
                            name = "ANNOT_QA_STEP"
                            value={formik_annotation.values.ANNOT_QA_STEP}
                            onValueChange={formik_annotation.handleChange}
                            showButtons
                            step={0.1}
                            maxFractionDigits={3}
                        ></InputNumber>
                    </Panel>
                    </div>
                }


                {curCategory==2 &&
                    <div className="column">
                    <Panel header = "주행 속도"  >
                        <Button onClick={() => openPresetPopup()}>프리셋 설정</Button>
                    </Panel>
                    <Panel header = "주행 컨트롤"  >
                            <div className="grid gap-5 mr-3 ml-3 mt-3 mb-3"> 
                            <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>DRIVE_EXTENDED_CONTROL_TIME</span>
                                <span style={{display:formik_control.values.DRIVE_EXTENDED_CONTROL_TIME!==formik_control.initialValues.DRIVE_EXTENDED_CONTROL_TIME?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "DRIVE_EXTENDED_CONTROL_TIME"
                                    value={formik_control.values.DRIVE_EXTENDED_CONTROL_TIME}
                                    onValueChange={formik_control.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>DRIVE_GOAL_D</span>
                                <span style={{display:formik_control.values.DRIVE_GOAL_D!==formik_control.initialValues.DRIVE_GOAL_D?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "DRIVE_GOAL_D"
                                    value={formik_control.values.DRIVE_GOAL_D}
                                    onValueChange={formik_control.handleChange}
                                    showButtons
                                    step={0.01}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>DRIVE_GOAL_TH</span>
                                <span style={{display:formik_control.values.DRIVE_GOAL_TH!==formik_control.initialValues.DRIVE_GOAL_TH?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "DRIVE_GOAL_TH"
                                    value={formik_control.values.DRIVE_GOAL_TH}
                                    onValueChange={formik_control.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            </div>
                    </Panel>
                    <Panel header = "장애물 감지"  >
                            <div className="grid gap-5 mr-3 ml-3 mt-3 mb-3"> 
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>OBS_AVOID_DIST</span>
                            <span style={{display:formik_obs.values.OBS_AVOID_DIST!==formik_obs.initialValues.OBS_AVOID_DIST?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "OBS_AVOID_DIST"
                                value={formik_obs.values.OBS_AVOID_DIST}
                                onValueChange={formik_obs.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>OBS_MAP_GRID_SIZE</span>
                            <span style={{display:formik_obs.values.OBS_MAP_GRID_SIZE!==formik_obs.initialValues.OBS_MAP_GRID_SIZE?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "OBS_MAP_GRID_SIZE"
                                value={formik_obs.values.OBS_MAP_GRID_SIZE}
                                onValueChange={formik_obs.handleChange}
                                showButtons
                                step={0.01}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>OBS_MAP_MARGIN</span>
                            <span style={{display:formik_obs.values.OBS_MAP_MARGIN!==formik_obs.initialValues.OBS_MAP_MARGIN?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "OBS_MAP_MARGIN"
                                value={formik_obs.values.OBS_MAP_MARGIN}
                                onValueChange={formik_obs.handleChange}
                                showButtons
                                step={0.01}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>OBS_MAP_RANGE</span>
                            <span style={{display:formik_obs.values.OBS_MAP_RANGE!==formik_obs.initialValues.OBS_MAP_RANGE?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "OBS_MAP_RANGE"
                                value={formik_obs.values.OBS_MAP_RANGE}
                                onValueChange={formik_obs.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>OBS_SIZE_THRESHOLD</span>
                            <span style={{display:formik_obs.values.OBS_SIZE_THRESHOLD!==formik_obs.initialValues.OBS_SIZE_THRESHOLD?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "OBS_SIZE_THRESHOLD"
                                value={formik_obs.values.OBS_SIZE_THRESHOLD}
                                onValueChange={formik_obs.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        <div> 
                            <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>OBS_TARGET_DIST</span>
                            <span style={{display:formik_obs.values.OBS_TARGET_DIST!==formik_obs.initialValues.OBS_TARGET_DIST?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                            <InputNumber
                                name = "OBS_TARGET_DIST"
                                value={formik_obs.values.OBS_TARGET_DIST}
                                onValueChange={formik_obs.handleChange}
                                showButtons
                                step={0.1}
                                maxFractionDigits={3}
                            ></InputNumber>
                        </div>
                        </div>
                    </Panel>
                    </div>          
                }

                {curCategory==3 &&
                    <div className="column" > 
                    <Panel header = "로봇 최대 사이즈">
                        <div className="grid gap-5 mr-3 ml-3 mt-3 mb-3"> 
                            <div>
                                <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>X</span>
                                <span style={{display:formik_default.values.ROBOT_SIZE_MAX_X!==formik_default.initialValues.ROBOT_SIZE_MAX_X?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_SIZE_MAX_X"
                                    value={formik_default.values.ROBOT_SIZE_MAX_X}
                                    onValueChange={formik_default.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div>
                                <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>Y</span>
                                <span style={{display:formik_default.values.ROBOT_SIZE_MAX_Y!==formik_default.initialValues.ROBOT_SIZE_MAX_Y?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_SIZE_MAX_Y"
                                    value={formik_default.values.ROBOT_SIZE_MAX_Y}
                                    onValueChange={formik_default.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div>
                                <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>Z</span>
                                <span style={{display:formik_default.values.ROBOT_SIZE_MAX_Z!==formik_default.initialValues.ROBOT_SIZE_MAX_Z?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_SIZE_MAX_Z"
                                    value={formik_default.values.ROBOT_SIZE_MAX_Z}
                                    onValueChange={formik_default.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                        </div>
                    </Panel>
                    <Panel header = "로봇 최소 사이즈">
                        <div className="grid gap-5 mr-3 ml-3 mt-3 mb-3"> 
                            <div>
                                <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>X</span>
                                <span style={{display:formik_default.values.ROBOT_SIZE_MIN_X!==formik_default.initialValues.ROBOT_SIZE_MIN_X?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_SIZE_MIN_X"
                                    value={formik_default.values.ROBOT_SIZE_MIN_X}
                                    onValueChange={formik_default.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div>
                                <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>Y</span>
                                <span style={{display:formik_default.values.ROBOT_SIZE_MIN_Y!==formik_default.initialValues.ROBOT_SIZE_MIN_Y?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_SIZE_MIN_Y"
                                    value={formik_default.values.ROBOT_SIZE_MIN_Y}
                                    onValueChange={formik_default.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div>
                                <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>Z</span>
                                <span style={{display:formik_default.values.ROBOT_SIZE_MIN_Z!==formik_default.initialValues.ROBOT_SIZE_MIN_Z?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_SIZE_MIN_Z"
                                    value={formik_default.values.ROBOT_SIZE_MIN_Z}
                                    onValueChange={formik_default.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                        </div>
                    </Panel>
                    <Panel header = "기타 사이즈">
                        <div className="grid gap-5 mr-3 ml-3 mt-3 mb-3"> 
                            <div>
                                <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>로봇 반지름</span>
                                <span style={{display:formik_default.values.ROBOT_RADIUS!==formik_default.initialValues.ROBOT_RADIUS?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_RADIUS"
                                    value={formik_default.values.ROBOT_RADIUS}
                                    onValueChange={formik_default.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div>
                                <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>휠 베이스 사이즈</span>
                                <span style={{display:formik_default.values.ROBOT_WHEEL_BASE!==formik_default.initialValues.ROBOT_WHEEL_BASE?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_WHEEL_BASE"
                                    value={formik_default.values.ROBOT_WHEEL_BASE}
                                    onValueChange={formik_default.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div>
                                <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>휠 반지름</span>
                                <span style={{display:formik_default.values.ROBOT_WHEEL_RADIUS!==formik_default.initialValues.ROBOT_WHEEL_RADIUS?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "ROBOT_WHEEL_RADIUS"
                                    value={formik_default.values.ROBOT_WHEEL_RADIUS}
                                    onValueChange={formik_default.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                        </div>
                    </Panel>
                    <Panel header = "라이다">
                        <div className="column gap-5 mr-3 ml-3 mt-3 mb-3"> 
                            <div>
                                <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>라이다 최대 거리</span>
                                <span style={{display:formik_default.values.LIDAR_MAX_RANGE!==formik_default.initialValues.LIDAR_MAX_RANGE?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                <InputNumber
                                    name = "LIDAR_MAX_RANGE"
                                    value={formik_default.values.LIDAR_MAX_RANGE}
                                    onValueChange={formik_default.handleChange}
                                    showButtons
                                    step={0.1}
                                    maxFractionDigits={3}
                                ></InputNumber>
                            </div>
                            <div>
                                <p><span style={{fontSize:18,fontWeight: 700}}>백 라이다 TF</span></p>
                                <div className="grid gap-5 mr-3 ml-3 mt-3 mb-3"> 
                                    <div >
                                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>X</span>
                                        <span style={{display:formik_default.values.LIDAR_TF_B_X!==formik_default.initialValues.LIDAR_TF_B_X?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "LIDAR_TF_B_X"
                                            value={formik_default.values.LIDAR_TF_B_X}
                                            onValueChange={formik_default.handleChange}
                                            showButtons
                                            step={0.01}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div>
                                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>Y</span>
                                        <span style={{display:formik_default.values.LIDAR_TF_B_Y!==formik_default.initialValues.LIDAR_TF_B_Y?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "LIDAR_TF_B_Y"
                                            value={formik_default.values.LIDAR_TF_B_Y}
                                            onValueChange={formik_default.handleChange}
                                            showButtons
                                            step={0.01}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div>
                                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>Z</span>
                                        <span style={{display:formik_default.values.LIDAR_TF_B_Z!==formik_default.initialValues.LIDAR_TF_B_Z?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "LIDAR_TF_B_Z"
                                            value={formik_default.values.LIDAR_TF_B_Z}
                                            onValueChange={formik_default.handleChange}
                                            showButtons
                                            step={0.01}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div>
                                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>RX</span>
                                        <span style={{display:formik_default.values.LIDAR_TF_B_RX!==formik_default.initialValues.LIDAR_TF_B_RX?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "LIDAR_TF_B_RX"
                                            value={formik_default.values.LIDAR_TF_B_RX}
                                            onValueChange={formik_default.handleChange}
                                            showButtons
                                            step={1}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div>
                                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>RY</span>
                                        <span style={{display:formik_default.values.LIDAR_TF_B_RY!==formik_default.initialValues.LIDAR_TF_B_RY?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "LIDAR_TF_B_RY"
                                            value={formik_default.values.LIDAR_TF_B_RY}
                                            onValueChange={formik_default.handleChange}
                                            showButtons
                                            step={1}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div>
                                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>RZ</span>
                                        <span style={{display:formik_default.values.LIDAR_TF_B_RZ!==formik_default.initialValues.LIDAR_TF_B_RZ?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "LIDAR_TF_B_RZ"
                                            value={formik_default.values.LIDAR_TF_B_RZ}
                                            onValueChange={formik_default.handleChange}
                                            showButtons
                                            step={1}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p><span style={{fontSize:18,fontWeight: 700}}>프론트 라이다 TF</span></p>
                                <div className="grid gap-5 mr-3 ml-3 mt-3 mb-3"> 
                                    <div>
                                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>X</span>
                                        <span style={{display:formik_default.values.LIDAR_TF_F_X!==formik_default.initialValues.LIDAR_TF_F_X?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "LIDAR_TF_F_X"
                                            value={formik_default.values.LIDAR_TF_F_X}
                                            onValueChange={formik_default.handleChange}
                                            showButtons
                                            step={0.01}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div>
                                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>Y</span>
                                        <span style={{display:formik_default.values.LIDAR_TF_F_Y!==formik_default.initialValues.LIDAR_TF_F_Y?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "LIDAR_TF_F_Y"
                                            value={formik_default.values.LIDAR_TF_F_Y}
                                            onValueChange={formik_default.handleChange}
                                            showButtons
                                            step={0.01}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div>
                                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>Z</span>
                                        <span style={{display:formik_default.values.LIDAR_TF_F_Z!==formik_default.initialValues.LIDAR_TF_F_Z?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "LIDAR_TF_F_Z"
                                            value={formik_default.values.LIDAR_TF_F_Z}
                                            onValueChange={formik_default.handleChange}
                                            showButtons
                                            step={0.01}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div>
                                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>RX</span>
                                        <span style={{display:formik_default.values.LIDAR_TF_F_RX!==formik_default.initialValues.LIDAR_TF_F_RX?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "LIDAR_TF_F_RX"
                                            value={formik_default.values.LIDAR_TF_F_RX}
                                            onValueChange={formik_default.handleChange}
                                            showButtons
                                            step={1}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div>
                                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>RY</span>
                                        <span style={{display:formik_default.values.LIDAR_TF_F_RY!==formik_default.initialValues.LIDAR_TF_F_RY?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "LIDAR_TF_F_RY"
                                            value={formik_default.values.LIDAR_TF_F_RY}
                                            onValueChange={formik_default.handleChange}
                                            showButtons
                                            step={1}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                    <div>
                                        <p style={{width: i_size}}><span style={{fontSize:18,fontWeight: 700}}>RZ</span>
                                        <span style={{display:formik_default.values.LIDAR_TF_F_RZ!==formik_default.initialValues.LIDAR_TF_F_RZ?"inline":"none", color:"red"}}>    (수정됨)</span></p>
                                        <InputNumber
                                            name = "LIDAR_TF_F_RZ"
                                            value={formik_default.values.LIDAR_TF_F_RZ}
                                            onValueChange={formik_default.handleChange}
                                            showButtons
                                            step={1}
                                            maxFractionDigits={3}
                                        ></InputNumber>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                    </div>
                }
            </div>  
        </main>
    );
}

export default Setting;