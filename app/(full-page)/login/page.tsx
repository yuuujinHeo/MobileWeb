/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';
import { classNames } from 'primereact/utils';
import { setMonitorURL } from '@/store/networkSlice';
import {userContext} from '../../../interface/user'
import { useDispatch, useSelector } from 'react-redux';
import {store,AppDispatch, RootState} from '../../../store/store';
import { Message } from 'primereact/message';
import PopupForce from './popupforce';
import PopupHidden from './popuphidden';
import { Messages } from 'primereact/messages';
import { selectUser, setUser, setUserDefault } from '@/store/userSlice';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoginPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userState = useSelector((state:RootState) => state.user); 
    const Network = useSelector((state:RootState) => state.network);
    
    const [user_id, setUser_id] = useState('');
    const [user_passwd, setUser_passwd] = useState('');
    const [checked, setChecked] = useState(false);
    const [visibleLogin, setVisibleLogin] = useState(false);
    const [visibleHidden, setVisibleHidden] = useState(false);
    const [loading, setLoading] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const messages = useRef<Messages | null>(null);
    var hidden_count = 0;

    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });


    useEffect(()=>{
        console.log("Network : ", Network);
    },[Network])
    useEffect(()=>{
        hidden_count = 0;
        dispatch(setMonitorURL('http://211.188.53.173:11335'));
    },[])

    const guestLogin = () =>{
        setLoading(true);
        dispatch(setUserDefault({
            user_id:"guest",
            user_name:"Guest",
            permission:["read"],
            token:"",
            state:"guest",
            avatar:"",
            source:""
          }));        
    }

    const postLoginForce = async() =>{
        console.log("force!!!");
        try{
            setLoading(true);
            const response = await axios.post(Network?.monitor+'/login/force',{
              user_id,user_passwd
            });
            console.log("response???",response.data)
  
            if(response.data.error == null){
                dispatch(setUser({
                    user_id:response.data.user_id,
                    user_name:response.data.user_name,
                    permission:response.data.permission,
                    token:response.data.token,
                    state:"user",
                    avatar:response.data.user_avatar,
                    source:response.data.avatar_source
                  }));
            }else{
                setLoading(false);
                console.log("what?")
            }

        }catch(error){
            setUser_passwd('');
            setLoading(false);
        }
    }

    const handleHiddenClick = () =>{
        if(hidden_count > 5){
            setVisibleHidden(true);
        }else{
            console.log(++hidden_count);
        }
    }

    const postLoginMaster = () =>{
        setLoading(true);
        dispatch(setUserDefault({
            user_id:"master",
            user_name:"Master",
            permission:["admin"],
            token:"",
            state:"master",
            avatar:"",
            source:""
        }));        
    }

    const postLogin = async() =>{
        console.log("postLogin, ",user_id, user_passwd, Network)
        try{
            setLoading(true);
          const response = await axios.post(Network?.monitor+'/login',{
            user_id,user_passwd
          });

          console.log("response???",response.data)

          if(response.data.error != null){
            setLoading(false);
            console.log(response.data.error);
            if(response.data.error == 'blocked'){
                setUser_passwd('');
                messages.current!.show(
                    {sticky:false, life:3000, severity: 'error', summary: '관리자에게 문의 해주세요', detail: response.data.user.blocked_reason, closable: false}
                );
            }else if(response.data.error == 'password'){
                setUser_passwd('');
                messages.current?.show(
                    {sticky:false, life:3000, severity: 'error', summary: '비밀번호가 틀렸습니다', detail: response.data.user.fail_count, closable: false}
                );
            }else if(response.data.error == "id"){
                setUser_id('');
                setUser_passwd('');
                messages.current!.show(
                    {sticky:false, life:3000, severity: 'error', summary: '아이디를 찾을 수 없습니다', detail: '', closable: false}
                );
            }else if(response.data.error == "already login"){
                setVisibleLogin(true);
            }else{
                console.log("hhhhhhhhhhhhhhhh query error");
                messages.current?.show(
                    {sticky:false, life:3000, severity: 'error', summary: '로그인 할 수 없습니다', detail: '서버 에러', closable: false}
                );
            }
          }else{
            dispatch(setUser({
              user_id:response.data.user_id,
              user_name:response.data.user_name,
              permission:response.data.permission,
              token:response.data.token,
              state:"user",
              avatar:response.data.user_avatar,
              source: response.data.avatar_source
            }));
          }
        }catch(error){
            setUser_passwd('');
            setLoading(false);
        }
      }

      useEffect(() =>{
        if(userState?.token != "" || userState?.state=="guest" || userState?.state=="master"){
            router.push('/')
            setLoading(false);
            console.log("pass to /")
        }
      })

    return (
        <div className={containerClassName}>
            <PopupForce 
            visibleLogin={visibleLogin}
            setVisibleLogin={setVisibleLogin}
            postLoginForce={postLoginForce}
            />
            <PopupHidden 
            visibleHidden={visibleHidden}
            setVisibleHidden={setVisibleHidden}
            postLoginMaster={postLoginMaster}
            />
            <div className=''>

            <Messages ref={messages}></Messages>
            <div className="flex flex-column align-items-center justify-content-center">
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--red-500) 20%, rgba(0,0,0,0) 50%)'
                    }}
                >
                    <div className="box-login surface-card py-8 px-5 sm:px-8" >
                        {/* <div className="text-center mb-5">
                            <div className="text-900 text-5xl font-medium mb-3">Mobile Web</div>
                            <div className="text-600 font-medium mb-3">Welcome, Mobile Web</div>
                        </div> */}
                        {loading && <ProgressSpinner className='loading-login '></ProgressSpinner>}
                        {!loading && 
                        <div className="flex flex-column ">
                        <div className = "w-full flex flex-column  align-items-center">
                            <img src={`/layout/images/rainbow_logo.png`} className="w-15rem flex-shrink-0" onClick={handleHiddenClick}/>
                        </div>
                        <label htmlFor="text" className="block text-900 text-xl font-medium mb-2">
                            ID
                        </label>

                        <InputText id="user_id" value={user_id} onChange={(e) => setUser_id(e.target.value)} type="text" placeholder="User ID" className=" md:w-30rem mb-5" style={{ padding: '1rem' }} />

                        <label className="block text-900 font-medium text-xl mb-2">
                            Password
                        </label>

                        <Password feedback={false} onKeyDown={(e) =>{e.key==='Enter'?postLogin():{}}} value={user_passwd} onChange={(e) => setUser_passwd(e.target.value)} placeholder="Password" toggleMask className="mb-5" inputClassName="w-full p-3 md:w-30rem"></Password>
                        
                        <Button label="로그인" className="w-full p-3 text-xl" style={{backgroundColor:"var(--red-500)", borderColor:"var(--red-500)"}} onClick={postLogin}></Button>
                        <Button label="게스트 로그인" className="w-full p-3 mt-3 text-xl" style={{backgroundColor:"var(--red-300)", borderColor:"var(--red-300)"}} onClick={guestLogin}></Button>
                    </div>
                    }
                        
                    </div>
                </div>
                </div>
            </div>
        
            
        </div>
    );
};

export default LoginPage;
