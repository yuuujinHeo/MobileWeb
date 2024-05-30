import * as yup from 'yup';

export interface RobotSetting{
    PLATFORM_NAME:string;
    PLATFORM_TYPE:string;
}

export interface SlamSetting{
    ROBOT_SIZE_MAX_X:number;
    ROBOT_SIZE_MAX_Y:number;
    ROBOT_SIZE_MAX_Z:number;
    ROBOT_SIZE_MIN_X:number;
    ROBOT_SIZE_MIN_Y:number;
    ROBOT_SIZE_MIN_Z:number;
    ROBOT_WHEEL_BASE:number;
    ROBOT_WHEEL_RADIUS:number;
    MOTOR_ID_L:number;
    MOTOR_ID_R:number;
    MOTOR_DIR:number;
    MOTOR_GEAR_RATIO:number;
    MOTOR_LIMIT_V:number;
    MOTOR_LIMIT_V_ACC:number;
    MOTOR_LIMIT_W:number;
    MOTOR_LIMIT_W_ACC:number;
    MOTOR_GAIN_KP:number;
    MOTOR_GAIN_KI:number;
    MOTOR_GAIN_KD:number;
}

export const robot=yup.object().shape({
    PLATFORM_NAME: yup.string().required(),
    PLATFORM_TYPE: yup.string().required()
});
export const slam=yup.object().shape({
    ROBOT_SIZE_MAX_X:yup.number().required(),
    ROBOT_SIZE_MAX_Y:yup.number().required(),
    ROBOT_SIZE_MAX_Z:yup.number().required(),
    ROBOT_SIZE_MIN_X:yup.number().required(),
    ROBOT_SIZE_MIN_Y:yup.number().required(),
    ROBOT_SIZE_MIN_Z:yup.number().required(),
    ROBOT_WHEEL_BASE:yup.number().required(),
    ROBOT_WHEEL_RADIUS:yup.number().required(),
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

export const setting=yup.object().shape({
    robot:yup.object().shape({
        PLATFORM_NAME: yup.string().required(),
        PLATFORM_TYPE: yup.string().required()
    }),
    slam:yup.object().shape({
        ROBOT_SIZE_MAX_X:yup.number().required(),
        ROBOT_SIZE_MAX_Y:yup.number().required(),
        ROBOT_SIZE_MAX_Z:yup.number().required(),
        ROBOT_SIZE_MIN_X:yup.number().required(),
        ROBOT_SIZE_MIN_Y:yup.number().required(),
        ROBOT_SIZE_MIN_Z:yup.number().required(),
        ROBOT_WHEEL_BASE:yup.number().required(),
        ROBOT_WHEEL_RADIUS:yup.number().required(),
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
    })
});

export interface SettingState{
    robot:RobotSetting;
    slam:SlamSetting;
}

export const ROBOT_TYPE = [
    "SERVING",
    "CALLING",
    "BOTH",
    "CLEANING"
];
export const ROBOT_TYPE2 = [
    { name: "서빙용", code: "SERVING"},
    { name: "호출용", code: "CALLING"},
    { name: "서빙+호출용", code: "BOTH"},
    { name: "퇴식용", code: "CLEANING"}
];