/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';
import { classNames } from 'primereact/utils';
import {userContext} from '../../../interface/user'

const LoginPage = () => {
    const [user_id, setUser_id] = useState('');
    const [user_passwd, setUser_passwd] = useState('');
    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const {state,setState} = useContext(userContext);

    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const postLogin = async() =>{
        console.log("postLogin, ",state)
        try{
          const response = await axios.post('http://192.168.1.88:11335/login',{
            user_id,user_passwd
          });
          setState((prevState) =>({...prevState,
            user_id:response.data.user_id,
            user_name:response.data.user_name,
            permission:response.data.permission,
            token:response.data.token
          }));
        }catch(error){
            setUser_passwd('');
        }
      }

      useEffect(() =>{
        if(state.token != ""){
            router.push('/')
            // navigator('/');
            console.log("pass to /")
        }
      })

    function checkLogin(){
        console.log(user_id, user_passwd)
    }

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`/layout/images/rainbow_logo.png`} className="mb-5 w-15rem flex-shrink-0" />
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
                            <Button label="Sign In" className="w-full p-3 text-xl" style={{backgroundColor:"var(--red-500)", borderColor:"var(--red-500)"}} onClick={postLogin}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
