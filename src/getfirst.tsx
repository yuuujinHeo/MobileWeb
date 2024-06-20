// import { selectSetting, setRobot, setDebug, setLoc, setControl, setAnnotation, setDefault, setMotor, setMapping, setObs } from '@/store/settingSlice';
// import {SettingState, PresetSetting, ROBOT_TYPE,_robot, _preset, _debug, _loc, _control, _annotation, _default, _motor, _mapping, _obs} from '../../../interface/settings';
// import './style.scss';
// import axios from 'axios';
// import {store,AppDispatch, RootState} from '../store/store';
// import { useDispatch, UseDispatch, useSelector } from 'react-redux';
    
// const dispatch = useDispatch<AppDispatch>();
// const settingState = useSelector((state:RootState) => selectSetting(state));
// var mobileURL ='';


// async function setURL(){
//     if(mobileURL == ''){
//         const currentURL = window.location.href;
//         var mURL;
//         console.log(currentURL);
//         if(currentURL.startsWith('http')){
//             mURL = currentURL.split(':')[0] + ':' + currentURL.split(':')[1]+":11334";
//         }else{
//             mURL = currentURL+":11334";
//         }
//         mobileURL = mURL;
//         // setMobileURL(mURL);
//         console.log("url :",mURL,mobileURL);
//         return mURL;
//     }
// }
// export const default_setting = async(data:SettingState | undefined=undefined) =>{
//     try{
//         setURL();
//         console.log("default_setting!!");
//         if(data == undefined){
//             const response = await axios.get(mobileURL+'/setting');
//             console.log(mobileURL+'/setting', response.data);
//             dispatch(setRobot(response.data.robot));
//             dispatch(setDebug(response.data.debug));
//             dispatch(setLoc(response.data.loc));
//             dispatch(setAnnotation(response.data.annotation));
//             dispatch(setDefault(response.data.default));
//             dispatch(setMotor(response.data.motor));
//             dispatch(setMapping(response.data.mapping));
//             dispatch(setObs(response.data.obs));
//         }else{
//             dispatch(setRobot(data.robot));
//             dispatch(setDebug(data.debug));
//             dispatch(setLoc(data.loc));
//             dispatch(setAnnotation(data.annotation));
//             dispatch(setDefault(data.default));
//             dispatch(setMotor(data.motor));
//             dispatch(setMapping(data.mapping));
//             dispatch(setObs(data.obs));
//         }
//     }catch(error){
//         console.error(error);
//     }
// };
