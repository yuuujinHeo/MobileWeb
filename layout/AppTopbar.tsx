/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { classNames } from "primereact/utils";
import React, {
  forwardRef,
  useEffect,
  useState,
  useContext,
  useImperativeHandle,
  useRef,
  useCallback,
} from "react";
import { AppTopbarRef } from "@/types";
import { LayoutContext } from "./context/layoutcontext";
import {
  selectStatus,
  setStatus,
  setPose,
  setVel,
  setCondition,
  setMotor0,
  setMotor1,
  setLidar0,
  setLidar1,
  setIMU,
  setPower,
  setTime,
  setState,
  StatusState,
} from "@/store/statusSlice";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { OverlayPanel } from "primereact/overlaypanel";
import { useRouter } from 'next/navigation';
import { Dialog } from "primereact/dialog";
import Color from '@/public/colors';
import { Chip } from "primereact/chip";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { transStatus } from "@/app/(main)/api/to";
import { io } from "socket.io-client";
import { getMobileAPIURL } from "@/app/(main)/api/url";
import {
  selectSetting,
  setRobot,
  setDebug,
  setLoc,
  setControl,
  setAnnotation,
  setDefault,
  setMotor,
  setMapping,
  setObs,
  MotorSetting,
} from "@/store/settingSlice";
import { selectUser, setUser } from '@/store/userSlice';
import axios from "axios";
import { setTaskRunning, setTaskID, updateRunningTaskName } from "@/store/taskSlice";
import emitter from "@/lib/eventBus";
import { setSlamnavConnection, setTaskConnection } from "@/store/connectionSlice";
import { Avatar } from "primereact/avatar";
import { setMobileURL, setMonitorURL, selectNetwork } from "@/store/networkSlice";
import './style.scss'
import PopupLogout from "./popuplogout";
import { Router } from "next/router";
import { Before } from "v8";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { prependListener } from "process";
// import { Dialog } from "@mui/material";

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const Status = useSelector((state: RootState) => state.status);
  const Connection = useSelector((state: RootState) => state.connection);
  const taskState = useSelector((state: RootState) => state.task);
  const User = useSelector((state:RootState) => state.user);
  const Network = useSelector((state:RootState) => state.network);
  
  const [loginTime, setLoginTime] = useState<number>(0);
  const [visibleLogout, setVisibleLogout] = useState(false);
  const [visibleRouter, setVisibleRouter] = useState(false);

  const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } =
    useContext(LayoutContext);
  const menubuttonRef = useRef(null);
  const topbarmenuRef = useRef(null);
  const topbarmenubuttonRef = useRef(null);
  // const [mobileURL, setMobileURL] = useState("");
  const profile = useRef<OverlayPanel | null>(null);
  const router = useRouter();

  const [pendingNav, setPendingNav] = useState<{href:string, options:NavigateOptions| undefined}>({href:'', options:undefined});
  const socketRef = useRef<any>();

  useEffect(() => {
    console.log("hi")
    if(Network?.mobile == ""){
      setURL();
    }
  }, []);

  useEffect(()=>{
    console.log("User : ", User);
  },[User])

  useEffect(() => {
    console.log("Network : ", Network);
  },[Network])

  const BeforeUnloadHandler = useCallback(
    (event: BeforeUnloadEvent) =>{
      console.log("before!!!!!!!!!!!!");
      event.preventDefault();
      event.returnValue = true;
    },[]
  )

  useEffect(()=>{
    const originalPush = router.push;
    const newPush = (
      href: string,
      options: NavigateOptions | undefined,
    ): void =>{
      if(window.location.pathname == "/task" || window.location.pathname == "/map"){
        if(href != "/login"){
          if(!confirm("페이지를 이동하시면 저장되지 않은 내용이 사라집니다. 계속 진행하시겠습니까?")){
            return;
          }
        }
        // setPendingNav({href, options});
        // setVisibleRouter(true);
      }

      originalPush(href, options);
      return;
    };

    console.log(originalPush, 
      window.location, newPush);
    
    router.push = newPush;
    window.onbeforeunload = BeforeUnloadHandler;
    return () =>{
      router.push = originalPush;
      window.onbeforeunload = null;
    }
  },[router, BeforeUnloadHandler]);



  async function setURL() {
    const url = await getMobileAPIURL();
    console.log("setURL TopBar : ",url, Network?.monitor);
    dispatch(setMobileURL(url));
  }

  var interval_timer;

  useEffect(() => {
    if (Network?.mobile != "") {
      default_setting();

        interval_timer = setInterval(() => {
          get_connection();
          get_user();
        }, 1000);

      return () => {
        clearInterval(interval_timer);
      };
    }
  }, [Network?.mobile]);

  const default_setting = async () => {
    try {
      const response = await axios.get(Network?.mobile + "/setting");
      dispatch(setRobot(response.data.robot));
      dispatch(setDebug(response.data.debug));
      dispatch(setLoc(response.data.loc));
      dispatch(setAnnotation(response.data.annotation));
      dispatch(setDefault(response.data.default));
      dispatch(setMotor(response.data.motor));
      dispatch(setMapping(response.data.mapping));
      dispatch(setObs(response.data.obs));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() =>{
    console.log("useEffect Topbar : ", User)
    if(User?.state=="guest" || User?.state=="master"){
      clearInterval(interval_timer);
    }else if(User?.token == ""){
      if(User?.state == ""){
        console.log("page go to login");
        router.push('/login');
        clearInterval(interval_timer);
      }else if(User?.state == "force"){
        setVisibleLogout(true);
      }else if(User?.state == "timeout"){
        setVisibleLogout(true);
      }
    }
  },[User])

  const logout = async(_state:string) =>{
    console.log("logout : ",_state);
    if(User?.state != "guest" && User?.state != "master"){
      const response = await axios.post(Network?.monitor + "/logout", {user_id:User?.user_id, token:User?.token});
      console.log("Response : ", response.data);
    }

    dispatch(setUser({
      user_id:"temp",
      user_name:"",
      permission:[],
      token:"",
      state:_state
    }));
  }

  const renewLogin = async() =>{
    try{
      const json = JSON.stringify({ user_id: User?.user_id, token: User?.token });
      const response = await axios.post(Network?.monitor + "/login/renew",json, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("renewLogin : ", response.data);
    }catch(e){
      console.error(e);
    }
  }

  const get_user = async() =>{
    try{
      if(User?.state == "" || User?.state == "user"){
        const response = await axios.get(Network?.monitor + "/user/login/"+User?.user_id);
        // console.log("get user : ", response.data);
        if(response.data.error){
          console.log("login nothing");
          logout("");
        }else{
          if(response.data.token != User?.token){
            clearInterval(interval_timer);
            console.log("강제 로그아웃");
            logout("force");
          }else{
            setLoginTime(response.data.time);
            if(response.data.time > 0){
    
            }else{
              clearInterval(interval_timer);
              console.log("login over");
              logout("timeout");
            }
          }
        }
      }
    }catch(e) {
      console.error("getUser error : ", e);
    }
  }

  const get_connection = async () => {
    try {
      const response = await axios.get(Network?.mobile + "/connection");
      dispatch(setSlamnavConnection(response.data.SLAMNAV));
      dispatch(setTaskConnection(response.data.TASK));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!socketRef.current) {
      fetch("/api/socket").finally(() => {

        socketRef.current = io();

        emitter.emit("socket", "connected");
        socketRef.current.emit("init");

        socketRef.current.on("connect", () => {
          console.log("Topbar Socket connected ", socketRef.current.id);
        });

        socketRef.current.on("status", async (data) => {
          const json = JSON.parse(data);
          const json_re = await transStatus(json);
          dispatch(setPose(json_re.pose));
          dispatch(setVel(json_re.vel));
          dispatch(setCondition(json_re.condition));
          dispatch(setMotor0(json_re.motor0));
          dispatch(setMotor1(json_re.motor1));
          dispatch(setLidar0(json_re.lidar0));
          dispatch(setLidar1(json_re.lidar1));
          dispatch(setIMU(json_re.imu));
          dispatch(setPower(json_re.power));
          dispatch(setState(json_re.state));
          dispatch(setTime(json_re.time));
        });

        socketRef.current.on("init", (data) =>{
          console.log("TopBar get Init : ", data);
          dispatch(setTaskRunning(data.task.running));
          dispatch(setTaskID(data.task.id));
          dispatch(updateRunningTaskName(data.task.file));
        });

        socketRef.current.on("task_id", (data) => {
          dispatch(setTaskID(data));
        });

        socketRef.current.on("task_start", (data) => {
          emitter.emit("task_start", data);
          console.log("???????????????",data);
          dispatch(setTaskRunning(data.running));
          dispatch(setTaskID(data.id));
          dispatch(updateRunningTaskName(data.file));
        });

      socketRef.current.on("task_done", (data) => {
        emitter.emit("task_done", data);
        dispatch(setTaskRunning(false));
        dispatch(setTaskID('0'));
      });

      socketRef.current.on("task_error", (data) => {
        emitter.emit("task_error", data);
        dispatch(setTaskRunning(false));
      });

      // 컴포넌트 언마운트 시 소켓 연결 해제
      return () => {
        if (socketRef.current) {
          console.log("Socket disconnect ", socketRef.current.id);
          emitter.emit("socket", "disconnected");
          socketRef.current.disconnect();
          socketRef.current = null; // 소켓을 null로 설정하여 재연결 방지
        }
      };
      return () => {
        console.log("Socket disconnect ", socketRef.current.id);
        emitter.emit("socket", "disconnected");
        socketRef.current.disconnect();
      };
    });
    }
  }, [dispatch]);

  useImperativeHandle(ref, () => ({
    menubutton: menubuttonRef.current,
    topbarmenu: topbarmenuRef.current,
    topbarmenubutton: topbarmenubuttonRef.current,
  }));

  const SLAMContent = (
    <>
      <span
        style={{ backgroundColor: Connection?.slamnav == true ? Color.good : Color.error }}
        
        className= "border-circle w-2rem h-2rem flex align-items-center justify-content-center"
      >
        <i className="pi pi-compass" style={{ color: "white" }} />
      </span>
      <span className="ml-2 font-medium">
        SLAM {Connection?.slamnav == true ? "Con" : "Discon"}
      </span>
    </>
  );

  const TASKContent = (
    <>
      <span
        style={{ backgroundColor: Connection?.task == true ? taskState?.running == true ?  Color.good :  Color.none :  Color.error }}
        className="border-circle w-2rem h-2rem flex align-items-center justify-content-center"
      >
        <i className={taskState?.running == true
          ? "pi pi-spin pi-spinner"
          : "pi pi-spinner"} style={{ color: "white" }} />
      </span>
      <span className="ml-2 font-medium">
        TASK : {Connection?.task == true ? taskState?.runningTaskName : "Discon"}
      </span>
    </>
  );

  const TASKRunContent = (
    <>
      <span
        style={{ backgroundColor: taskState?.running == true ?  Color.good :  Color.none }}
        
        className= "border-circle w-2rem h-2rem flex align-items-center justify-content-center"
      >
        
      </span>
      <span className="ml-2 font-medium">
        TASK : {taskState?.runningTaskName}
      </span>
    </>
  );

  const MAPContent = (
    <>
      <span
        style={{
          backgroundColor: Status?.state.map != "" ?  Color.good :  Color.error,
        }}
        className= "border-circle w-2rem h-2rem flex align-items-center justify-content-center"
      >
        <i className="pi pi-map" style={{ color: "white" }} />
      </span>
      <span className="ml-2 font-medium">MAP : {Status?.state.map}</span>
    </>
  );
  const LocalContent = (
    <>
      <span
        style={{
          backgroundColor:
            Status?.state.localization == "good" ?  Color.good :  Color.error,
        }}
        className= "border-circle w-2rem h-2rem flex align-items-center justify-content-center"
      >
        <i className="pi pi-map-marker" style={{ color: "white" }} />
      </span>
      <span className="ml-2 font-medium">
        LOCAL : {Status?.state.localization}
      </span>
    </>
  );
  const RobotContent = (
    <>
      <span
        style={{
          backgroundColor:
            Status?.condition.auto_state == "stop" ?  Color.none :  Color.good
        }}
        className="border-circle w-2rem h-2rem flex align-items-center justify-content-center"
      >
      <i className={Status?.condition.auto_state == "move"
        ? "pi pi-spin pi-spinner"
        : "pi pi-spinner"} style={{ color: "white" }} />
      </span>
      <span className="ml-2 font-medium">
        Move : {Status?.condition.auto_state}
      </span>
    </>
  );

  const handleRouter = () =>{
    setVisibleRouter(false);
    console.log("??");
    if(pendingNav.href.startsWith('/')){
      console.log("??", pendingNav.href, pendingNav.options);
      router.push(pendingNav.href);
      router.push('/');
    }

  }
  return (
    <div className="layout-topbar">
      <PopupLogout 
      visibleLogout = {visibleLogout}
      setVisibleLogout={setVisibleLogout}
      state={User!.state}
      logout={logout}
      />
      <Dialog 
        header="페이지 이동"
        visible={visibleRouter}
        modal
        onHide={()=>setVisibleRouter(false)}
        position="top"
      >
        <p>페이지를 이동하시면 저장되지 않은 내용이 사라집니다. 계속 진행하시겠습니까?</p>
        <div className="p-d-flex p-jc-end">
          <Button label="확인" icon="pi pi-check" 
          onClick={handleRouter}
            className="p-mr-2"
          />
          <Button label="취소" icon="pi pi-times" onClick={(e) =>{
            setVisibleRouter(false);
          }}
          />
        </div>
      </Dialog>


      <Link href="/" className="layout-topbar-logo">
        <img src={`rb_logo_black.png`} alt="logo" />
      </Link>

      <button
        ref={menubuttonRef}
        type="button"
        className="p-link layout-menu-button layout-topbar-button"
        onClick={onMenuToggle}
      >
        <i className="pi pi-bars" />
      </button>

      <button
        ref={topbarmenubuttonRef}
        type="button"
        className="p-link layout-topbar-menu-button layout-topbar-button"
        onClick={showProfileSidebar}
      >
        <i className="pi pi-ellipsis-v" />
      </button>

      <Chip className="pl-0 pr-3 mr-2" template={SLAMContent}></Chip>
      <Chip className="pl-0 pr-3 mr-2" template={TASKContent}></Chip>
      {Connection?.slamnav && <Chip className="pl-0 pr-3 mr-2" template={MAPContent}></Chip>}
      {Connection?.slamnav && <Chip className="pl-0 pr-3 mr-2" template={LocalContent}></Chip>}
      {Connection?.slamnav && <Chip className="pl-0 pr-3 mr-2" template={RobotContent}></Chip>}

      <div
        ref={topbarmenuRef}
        className={classNames("layout-topbar-menu", {
          "layout-topbar-menu-mobile-active": layoutState.profileSidebarVisible,
        })}
      >

        {User?.state != "guest" && User?.state != "master" &&
        <div className="flex">
          <Chip icon="pi pi-clock" className={loginTime>60?"chip_normal":"chip_hurry"} label={String(Math.floor(loginTime/60)).padStart(2,'0')+":"+String(loginTime%60).padStart(2,'0')}></Chip>
          <Button label="연장" severity="secondary" className="ml-1" text onClick={renewLogin}></Button>
        </div>
        }
        <button type="button" className="p-link layout-topbar-button" onClick={(e) => profile.current?.toggle(e)}>
          <i className="pi pi-user"></i>
        </button>
        <OverlayPanel ref={profile} className="profile-panel">
          <div className="profile-panel-container">
            <Avatar icon = "pi pi-user" shape="circle" ></Avatar>
            <h5 className="font-bold ">{User?.user_name==""?"Unknown":User?.user_name}</h5>
              {User?.state != "guest" && User?.state != "master"  &&
              <div className="flex">
                <Chip icon="pi pi-clock" className={loginTime>60?"chip_normal":"chip_hurry"} label={String(Math.floor(loginTime/60)).padStart(2,'0')+":"+String(loginTime%60).padStart(2,'0')}></Chip>
                <Button label="연장" severity="secondary" className="ml-3" text onClick={renewLogin}></Button>
              </div>
              }
              <Divider />
            </div> 
            <div className="flex p-fluidw-full gap-8">

              {User?.state != "guest" && User?.state != "master"  &&
              <Button label="계정설정"  ></Button>
              }
              <Button label="로그아웃" onClick={(e)=>logout("")} ></Button>
            </div>
        </OverlayPanel>
      </div>
    </div>
  );
});

AppTopbar.displayName = "AppTopbar";

export default AppTopbar;
