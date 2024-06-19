import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

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

const settingSlice = createSlice({
  name: 'setting',
  initialState:{
    robot:{
        PLATFORM_NAME:'test',
        PLATFORM_TYPE:''
    },
    debug:{
        SIM_MODE:0
    },
    loc:{
        LOC_CHECK_DIST:0,
        LOC_CHECK_IE:0,
        LOC_CHECK_IR:0,
        LOC_FUSION_RATIO:0,
        LOC_ICP_COST_THRESHOLD:0,
        LOC_ICP_ERROR_THRESHOLD:0,
        LOC_ICP_MAX_FEATURE_NUM:0
    },
    control:{
        DRIVE_EXTENDED_CONTROL_TIME:0,
        DRIVE_GOAL_D:0,
        DRIVE_GOAL_TH:0
    },
    annotation:{
        ANNOT_QA_STEP:0
    },
    default:{
        ROBOT_SIZE_MAX_X:0,
        ROBOT_SIZE_MAX_Y:0,
        ROBOT_SIZE_MAX_Z:0,
        ROBOT_SIZE_MIN_X:0,
        ROBOT_SIZE_MIN_Y:0,
        ROBOT_SIZE_MIN_Z:0,
        ROBOT_RADIUS:0,
        ROBOT_WHEEL_BASE:0,
        ROBOT_WHEEL_RADIUS:0,
        LIDAR_MAX_RANGE:0,
        LIDAR_TF_B_X:0,
        LIDAR_TF_B_Y:0,
        LIDAR_TF_B_Z:0,
        LIDAR_TF_B_RX:0,
        LIDAR_TF_B_RY:0,
        LIDAR_TF_B_RZ:0,
        LIDAR_TF_F_X:0,
        LIDAR_TF_F_Y:0,
        LIDAR_TF_F_Z:0,
        LIDAR_TF_F_RX:0,
        LIDAR_TF_F_RY:0,
        LIDAR_TF_F_RZ:0
    },
    motor:{
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
    },
    mapping:{
        SLAM_ICP_COST_THRESHOLD:0,
        SLAM_ICP_DO_ACCUM_NUM:0,
        SLAM_ICP_DO_ERASE_GAP:0,
        SLAM_ICP_ERROR_THRESHOLD:0,
        SLAM_ICP_MAX_FEATURE_NUM:0,
        SLAM_ICP_VIEW_THRESHOLD:0,
        SLAM_KFRM_LC_TRY_DIST:0,
        SLAM_KFRM_LC_TRY_OVERLAP:0,
        SLAM_KFRM_UPDATE_NUM:0,
        SLAM_VOXEL_SIZE:0,
        SLAM_WINDOW_SIZE:0
    },
    obs:{
        OBS_AVOID_DIST:0,
        OBS_MAP_GRID_SIZE:0,
        OBS_MAP_MARGIN:0,
        OBS_MAP_RANGE:0,
        OBS_SIZE_THRESHOLD:0,
        OBS_TARGET_DIST:0
    }
  },
  reducers: {
    setRobot(state,action: PayloadAction<RobotSetting>) {
      state.robot = action.payload;
    },
    setDebug(state,action: PayloadAction<DebugSetting>) {
      state.debug = action.payload;
    },
    setLoc(state,action: PayloadAction<LocSetting>) {
      state.loc = action.payload;
    },
    setControl(state,action: PayloadAction<ControlSetting>) {
      state.control = action.payload;
    },
    setAnnotation(state,action: PayloadAction<AnnotationSetting>) {
      state.annotation = action.payload;
    },
    setDefault(state,action: PayloadAction<DefaultSetting>) {
      state.default = action.payload;
    },
    setMotor(state,action: PayloadAction<MotorSetting>) {
      state.motor = action.payload;
    },
    setMapping(state,action: PayloadAction<MappingSetting>) {
      state.mapping = action.payload;
    },
    setObs(state,action: PayloadAction<ObsSetting>) {
      state.obs = action.payload;
    },
  },
})

export const { setRobot, setDebug, setLoc, setControl, setAnnotation, setDefault, setMotor, setMapping, setObs } = settingSlice.actions
export const selectSetting = (state:RootState) => state.setting;
export default settingSlice.reducer