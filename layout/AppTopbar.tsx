/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { useState, useCallback, useEffect, forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { AppTopbarRef } from '@/types';
import { useRouter } from 'next/navigation';
import { LayoutContext } from './context/layoutcontext';
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from "../store/store";
import { OverlayPanel } from 'primereact/overlaypanel';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import axios from 'axios';
import PopupLogout from '@/components/popup/popuplogout';
import { setUser } from '@/store/userSlice';
import { Chip } from 'primereact/chip';
import { Divider } from 'primereact/divider';

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

    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);

    const profile = useRef<OverlayPanel | null>(null);
    const router = useRouter();
  
    const [pendingNav, setPendingNav] = useState<{href:string, options:NavigateOptions| undefined}>({href:'', options:undefined});
    const socketRef = useRef<any>();

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    useEffect(()=>{
        console.log("User : ", User);
    },[User])

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
    
    router.push = newPush;
    window.onbeforeunload = BeforeUnloadHandler;
    return () =>{
      router.push = originalPush;
      window.onbeforeunload = null;
    }
  },[router, BeforeUnloadHandler]);

  var interval_timer: string | number | NodeJS.Timeout | undefined;
  useEffect(() => {
    //   default_setting();

        interval_timer = setInterval(() => {
        //   get_connection();
          get_user();
        }, 1000);

      return () => {
        clearInterval(interval_timer);
      };
  }, [Network]);
  
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

  const getAvatar = () =>{
    if(User.avatar == "icon"){
      return(
        <Avatar icon = {User.source} shape="circle" ></Avatar>
      );
    }else{//image
      return(
        <Avatar image = {Network.monitor+User.source} shape="circle" ></Avatar>
      );
    }
  };
  const getAvatarButton = () =>{
    if(User.avatar == "icon"){
      return(
        <Avatar size="large" onClick={(e) => profile.current?.toggle(e)} icon = {User.source} shape="circle" ></Avatar>
      );
    }else{//image
      return(
        <Avatar size="large" onClick={(e) => profile.current?.toggle(e)} image = {Network.monitor+User.source} shape="circle" ></Avatar>
      );
    }
    //   <button type="button" className="p-link layout-topbar-button" onClick={(e) => profile.current?.toggle(e)}>
    //   <i className="pi pi-user"></i>
    // </button>
  };


  const showMy = () =>{
    console.log("page go to my");
    setVisibleLogout(false);
    router.push('/my');
  }

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
      state:_state,
      avatar:"icon",
      source:"pi pi-user"
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
            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

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
        {getAvatarButton()}
        <OverlayPanel ref={profile} className="profile-panel">
          <div className="profile-panel-container">
            {getAvatar()}
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
              <Button label="계정설정"  onClick={showMy}></Button>
              }
              <Button label="로그아웃" onClick={(e)=>logout("")} ></Button>
            </div>
        </OverlayPanel>
      </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
