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
import {userContext} from '../../../interface/user'
import { useDispatch, useSelector } from 'react-redux';
import {store,AppDispatch, RootState} from '../../../store/store';
import { Message } from 'primereact/message';
import PopupForce from './popupforce';
import { Messages } from 'primereact/messages';
import { selectUser, setUser } from '@/store/userSlice';

const LoginPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userState = useSelector((state:RootState) => state.user);   
    const [user_id, setUser_id] = useState('');
    const [user_passwd, setUser_passwd] = useState('');
    const [checked, setChecked] = useState(false);
    const [visibleLogin, setVisibleLogin] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const messages = useRef<Messages | null>(null);

    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const guestLogin = () =>{
        dispatch(setUser({
            user_id:"guest",
            user_name:"Guest",
            permission:["read"],
            token:"",
            state:"guest"
          }));        
    }

    const postLoginForce = async() =>{
        console.log("force!!!");
        try{
            const response = await axios.post('http://192.168.1.88:11335/login/force',{
              user_id,user_passwd
            });
            console.log("response???",response.data)
  
            if(response.data.error == null){
                dispatch(setUser({
                    user_id:response.data.user_id,
                    user_name:response.data.user_name,
                    permission:response.data.permission,
                    token:response.data.token,
                    state:"user"
                  }));
            }else{
                console.log("what?")
            }

        }catch(error){
            setUser_passwd('');
        }
    }


    const postLogin = async() =>{
        console.log("postLogin, ",user_id, user_passwd)
        try{
          const response = await axios.post('http://192.168.1.88:11335/login',{
            user_id,user_passwd
          });

          console.log("response???",response.data)

          if(response.data.error != null){
            console.log(response.data.error);
            if(response.data.error == 'blocked'){
                setUser_passwd('');
                messages.current?.show(
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
                messages.current?.show(
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
              state:"user"
            }));
          }
        }catch(error){
            setUser_passwd('');
        }
      }

      useEffect(() =>{
        if(userState?.token != "" || userState?.state=="guest"){
            router.push('/')
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
            <div className="flex flex-column align-items-center justify-content-center">
                {/* <img src={`/layout/images/rainbow_logo.png`} className="mb-5 w-15rem flex-shrink-0" /> */}
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--red-500) 20%, rgba(0,0,0,0) 50%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-5xl font-medium mb-3">Mobile Web</div>
                            <div className="text-600 font-medium mb-3">Welcome, Mobile Web</div>
                        </div>
                        <div>
                            <label htmlFor="text" className="block text-900 text-xl font-medium mb-2">
                                ID
                            </label>

                            <InputText id="user_id" value={user_id} onChange={(e) => setUser_id(e.target.value)} type="text" placeholder="User ID" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} />

                            <label className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>

                            <Password feedback={false} onKeyDown={(e) =>{e.key==='Enter'?postLogin():{}}} value={user_passwd} onChange={(e) => setUser_passwd(e.target.value)} placeholder="Password" toggleMask className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem"></Password>
                            
                            <Messages ref={messages}></Messages>
                            
                            <Button label="로그인" className="w-full p-3 text-xl" style={{backgroundColor:"var(--red-500)", borderColor:"var(--red-500)"}} onClick={postLogin}></Button>
                            <Button label="게스트 로그인" className="w-full p-3 mt-3 text-xl" style={{backgroundColor:"var(--red-300)", borderColor:"var(--red-300)"}} onClick={guestLogin}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
