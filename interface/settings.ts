import { Defaults } from 'chart.js/dist/core/core.defaults';
import * as yup from 'yup';

export interface RobotSetting{
    PLATFORM_NAME:string;
    PLATFORM_TYPE:string;
}
export interface DebugSetting{
    SIM_MODE:number;
}
export interface LocSetting{
    LOC_CHECK_DIST:number;
    LOC_CHECK_IE:number;
    LOC_CHECK_IR:number;
    LOC_FUSION_RATIO:number;
    LOC_ICP_COST_THRESHOLD:number;
    LOC_ICP_ERROR_THRESHOLD:number;
    LOC_ICP_MAX_FEATURE_NUM:number;
}
export interface ControlSetting{
    DRIVE_EXTENDED_CONTROL_TIME:number;
    DRIVE_GOAL_D:number;
    DRIVE_GOAL_TH:number;
}
export interface AnnotationSetting{
    ANNOT_QA_STEP:number;
}
export interface DefaultSetting{
    ROBOT_SIZE_MAX_X:number;
    ROBOT_SIZE_MAX_Y:number;
    ROBOT_SIZE_MAX_Z:number;
    ROBOT_SIZE_MIN_X:number;
    ROBOT_SIZE_MIN_Y:number;
    ROBOT_SIZE_MIN_Z:number;
    ROBOT_RADIUS:number;
    ROBOT_WHEEL_BASE:number;
    ROBOT_WHEEL_RADIUS:number;
    LIDAR_MAX_RANGE:number;
    LIDAR_TF_B_X:number;
    LIDAR_TF_B_Y:number;
    LIDAR_TF_B_Z:number;
    LIDAR_TF_B_RX:number;
    LIDAR_TF_B_RY:number;
    LIDAR_TF_B_RZ:number;
    LIDAR_TF_F_X:number;
    LIDAR_TF_F_Y:number;
    LIDAR_TF_F_Z:number;
    LIDAR_TF_F_RX:number;
    LIDAR_TF_F_RY:number;
    LIDAR_TF_F_RZ:number;
}
export interface MotorSetting{
    MOTOR_ID_L:string;
    MOTOR_ID_R:string;
    MOTOR_DIR:string;
    MOTOR_GEAR_RATIO:number;
    MOTOR_LIMIT_V:number;
    MOTOR_LIMIT_V_ACC:number;
    MOTOR_LIMIT_W:number;
    MOTOR_LIMIT_W_ACC:number;
    MOTOR_GAIN_KP:number;
    MOTOR_GAIN_KI:number;
    MOTOR_GAIN_KD:number;
}
export interface MappingSetting{
    SLAM_ICP_COST_THRESHOLD:number;
    SLAM_ICP_DO_ACCUM_NUM:number;
    SLAM_ICP_DO_ERASE_GAP:number;
    SLAM_ICP_ERROR_THRESHOLD:number;
    SLAM_ICP_MAX_FEATURE_NUM:number;
    SLAM_ICP_VIEW_THRESHOLD:number;
    SLAM_KFRM_LC_TRY_DIST:number;
    SLAM_KFRM_LC_TRY_OVERLAP:number;
    SLAM_KFRM_UPDATE_NUM:number;
    SLAM_VOXEL_SIZE:number;
    SLAM_WINDOW_SIZE:number;
}
export interface ObsSetting{
    OBS_AVOID_DIST:number;
    OBS_MAP_GRID_SIZE:number;
    OBS_MAP_MARGIN:number;
    OBS_MAP_RANGE:number;
    OBS_SIZE_THRESHOLD:number;
    OBS_TARGET_DIST:number;
}
export interface PresetSetting{
    LIMIT_V:        number;
    LIMIT_W:        number;
    LIMIT_V_ACC:    number;
    LIMIT_W_ACC:    number;
    LIMIT_PIVOT_W:  number;
    PP_MIN_LD:      number;
    PP_MAX_LD:      number;
    PP_ST_V:        number;
    PP_ED_V:        number;
}

export const _robot=yup.object().shape({
    PLATFORM_NAME: yup.string().required(),
    PLATFORM_TYPE: yup.string().required()
});
export const _debug=yup.object().shape({
    SIM_MODE: yup.number().required()
});
export const _loc=yup.object().shape({
    LOC_CHECK_DIST:yup.number().required(),
    LOC_CHECK_IE:yup.number().required(),
    LOC_CHECK_IR:yup.number().required(),
    LOC_FUSION_RATIO:yup.number().required(),
    LOC_ICP_COST_THRESHOLD:yup.number().required(),
    LOC_ICP_ERROR_THRESHOLD:yup.number().required(),
    LOC_ICP_MAX_FEATURE_NUM:yup.number().required()
});
export const _control=yup.object().shape({
    DRIVE_EXTENDED_CONTROL_TIME:yup.number().required(),
    DRIVE_GOAL_D:yup.number().required(),
    DRIVE_GOAL_TH:yup.number().required()
});
export const _annotation=yup.object().shape({
    LIMIT_V:yup.number().required(),
    LIMIT_W:yup.number().required(),
    LIMIT_V_ACC:yup.number().required(),
    LIMIT_W_ACC:yup.number().required(),
    LIMIT_PIVOT_W:yup.number().required(),
    PP_MIN_LD:yup.number().required(),
    PP_MAX_LD:yup.number().required(),
    PP_ST_V:yup.number().required(),
    PP_ED_V:yup.number().required()
});
export const _default=yup.object().shape({
    ROBOT_SIZE_MAX_X:yup.number().required(),
    ROBOT_SIZE_MAX_Y:yup.number().required(),
    ROBOT_SIZE_MAX_Z:yup.number().required(),
    ROBOT_SIZE_MIN_X:yup.number().required(),
    ROBOT_SIZE_MIN_Y:yup.number().required(),
    ROBOT_SIZE_MIN_Z:yup.number().required(),
    ROBOT_RADIUS:yup.number().required(),
    ROBOT_WHEEL_BASE:yup.number().required(),
    ROBOT_WHEEL_RADIUS:yup.number().required(),
    LIDAR_MAX_RANGE:yup.number().required(),
    LIDAR_TF_B_X:yup.number().required(),
    LIDAR_TF_B_Y:yup.number().required(),
    LIDAR_TF_B_Z:yup.number().required(),
    LIDAR_TF_B_RX:yup.number().required(),
    LIDAR_TF_B_RY:yup.number().required(),
    LIDAR_TF_B_RZ:yup.number().required(),
    LIDAR_TF_F_X:yup.number().required(),
    LIDAR_TF_F_Y:yup.number().required(),
    LIDAR_TF_F_Z:yup.number().required(),
    LIDAR_TF_F_RX:yup.number().required(),
    LIDAR_TF_F_RY:yup.number().required(),
    LIDAR_TF_F_RZ:yup.number().required()
});
export const _motor=yup.object().shape({
    MOTOR_ID_L:yup.number().required(),
    MOTOR_ID_R:yup.number().required(),
    MOTOR_DIR:yup.number().required(),
    MOTOR_GEAR_RATIO:yup.number().required(),
    MOTOR_LIMIT_V:yup.number().required(),
    MOTOR_LIMIT_V_ACC:yup.number().required(),
    MOTOR_LIMIT_W:yup.number().required(),
    MOTOR_LIMIT_W_ACC:yup.number().required(),
    MOTOR_GAIN_KP:yup.number().required(),
    MOTOR_GAIN_KI:yup.number().required(),
    MOTOR_GAIN_KD:yup.number().required()
});
export const _mapping=yup.object().shape({
    SLAM_ICP_COST_THRESHOLD:yup.number().required(),
    SLAM_ICP_DO_ACCUM_NUM:yup.number().required(),
    SLAM_ICP_DO_ERASE_GAP:yup.number().required(),
    SLAM_ICP_ERROR_THRESHOLD:yup.number().required(),
    SLAM_ICP_MAX_FEATURE_NUM:yup.number().required(),
    SLAM_ICP_VIEW_THRESHOLD:yup.number().required(),
    SLAM_KFRM_LC_TRY_DIST:yup.number().required(),
    MOTOR_LIMIT_W_ACC:yup.number().required(),
    SLAM_KFRM_LC_TRY_OVERLAP:yup.number().required(),
    SLAM_KFRM_UPDATE_NUM:yup.number().required(),
    SLAM_VOXEL_SIZE:yup.number().required(),
    SLAM_WINDOW_SIZE:yup.number().required()
});
export const _obs=yup.object().shape({
    OBS_AVOID_DIST:yup.number().required(),
    OBS_MAP_GRID_SIZE:yup.number().required(),
    OBS_MAP_MARGIN:yup.number().required(),
    OBS_MAP_RANGE:yup.number().required(),
    OBS_SIZE_THRESHOLD:yup.number().required(),
    OBS_TARGET_DIST:yup.number().required()
});
export const _preset=yup.object().shape({
    ANNOT_QA_STEP:yup.number().required()
});



// export const setting=yup.object().shape({
//     robot:yup.object().shape({
//         PLATFORM_NAME: yup.string().required(),
//         PLATFORM_TYPE: yup.string().required()
//     }),
//     slam:yup.object().shape({
//         ROBOT_SIZE_MAX_X:yup.number().required(),
//         ROBOT_SIZE_MAX_Y:yup.number().required(),
//         ROBOT_SIZE_MAX_Z:yup.number().required(),
//         ROBOT_SIZE_MIN_X:yup.number().required(),
//         ROBOT_SIZE_MIN_Y:yup.number().required(),
//         ROBOT_SIZE_MIN_Z:yup.number().required(),
//         ROBOT_WHEEL_BASE:yup.number().required(),
//         ROBOT_WHEEL_RADIUS:yup.number().required(),
//         MOTOR_ID_L:yup.number().required(),
//         MOTOR_ID_R:yup.number().required(),
//         MOTOR_DIR:yup.number().required(),
//         MOTOR_GEAR_RATIO:yup.number().required(),
//         MOTOR_LIMIT_V:yup.number().required(),
//         MOTOR_LIMIT_V_ACC:yup.number().required(),
//         MOTOR_LIMIT_W:yup.number().required(),
//         MOTOR_LIMIT_W_ACC:yup.number().required(),
//         MOTOR_GAIN_KP:yup.number().required(),
//         MOTOR_GAIN_KI:yup.number().required(),
//         MOTOR_GAIN_KD:yup.number().required()
//     })
// });

export interface SettingState{
    robot:RobotSetting;
    debug:DebugSetting;
    loc:LocSetting;
    control:ControlSetting;
    annotation:AnnotationSetting;
    default:DefaultSetting;
    motor:MotorSetting;
    mapping:MappingSetting;
    obs:ObsSetting;
}

export const ROBOT_TYPE = [
    "SERVING",
    "CALLING",
    "BOTH",
    "CLEANING",
    "AMR"
];
export const ROBOT_TYPE2 = [
    { name: "서빙용", code: "SERVING"},
    { name: "호출용", code: "CALLING"},
    { name: "서빙+호출용", code: "BOTH"},
    { name: "퇴식용", code: "CLEANING"},
    { name: "AMR", code: "AMR"}
];