/* eslint-disable @next/next/no-img-element */
'use client';



import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import React, {createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
// import { ProductService } from '../../demo/service/ProductService';
import Link from 'next/link';
import { Demo } from '@/types';
import { Panel } from 'primereact/panel';
import {FieldArray, useFormik, Formik} from 'formik';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { DataView } from 'primereact/dataview';
import { Password } from 'primereact/password';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toolbar } from 'primereact/toolbar';
import { GetServerSideProps } from 'next';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { ChartData, ChartOptions } from 'chart.js';
import { Avatar } from 'primereact/avatar';
import { NetworkInfo } from '@/interface/network';
import { Chip } from 'primereact/chip';
import { Badge } from 'primereact/badge';
import { useDispatch, UseDispatch, useSelector } from 'react-redux';
import { setMobileURL } from '@/store/networkSlice';
import axios from 'axios';
import '../setting/style.scss';
import {store,AppDispatch, RootState} from '../../../store/store';
import { useRouter } from 'next/navigation';
import { current } from '@reduxjs/toolkit';
import {getMobileAPIURL} from '../api/url'

const initialData = [
    { id: 1, name: 'Form 1' , data:'Hi'},
    { id: 2, name: 'Form 2' , data:'Im'},
    { id: 3, name: 'Form 3' , data:'Yujin'}
  ];
  
const Network:React.FC = () =>{
    const [curEthernet, setCurEthernet] = useState<NetworkInfo[]>();
    const [curWifi, setCurWifi] = useState<NetworkInfo[]>();
    const [curBt, setCurBt] = useState<NetworkInfo[]>();
    const [wifis, setWifis] = useState<NetworkInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [executed, setExecuted] = useState(false);
    const [visibleWifi, setVisibleWifi] = useState(false);
    const [mobileURL, setMobileURL] = useState('');
    const toast = useRef<Toast | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    
    useEffect(()=>{
        console.log("network useEffect")
        setURL()
    },[])

    useEffect(()=>{
        if(mobileURL != ''){
            getCurrentInfo();
        }
    },[mobileURL])


    function makeNetworkForm(data: NetworkInfo | undefined){
        return useFormik({
            initialValues:{
                type:data?.type,
                state: data?.state,
                device: data?.device,
                mac: data?.mac,
                name: data?.name,
                ip: data?.ip,
                gateway: data?.gateway,
                dns: data?.dns,
                subnet: data?.subnet,
                stasignal_levelte: data?.signal_level,
                quality: data?.quality,
                security: data?.security
            },
            enableReinitialize: true,
            validate: (values) => {
                const errors = {
                    type:"",
                    state:"",
                    device: "",
                    mac: "",
                    name:"",
                    ip: "",
                    gateway: "",
                    dns: ['',''],
                    subnet: "",
                    stasignal_levelte: "",
                    quality: "",
                    security:""
                };
                return errors;
            },
            onSubmit: (data) => {
                console.log("SAVE : ",data);
            }
        })
    }

    const formik_ethernet1 = makeNetworkForm(curEthernet?.[0]);
    const formik_ethernet2 = makeNetworkForm(curEthernet?.[1]);
    const formik_wifi = makeNetworkForm(curWifi?.[0]);
    const formik_bt = makeNetworkForm(curBt?.[0]);

    async function getCurrentInfo() {
        try {
          const response = await axios.get(mobileURL + '/network/current');
          console.log("--------------", response.data);
    
          setCurEthernet(response.data.ethernet);
          setCurWifi(response.data.wifi);
          setCurBt(response.data.bt);
          
          if(response.data.ethernet.length > 0)
            formik_ethernet1.handleReset(response.data.ethernet[0]);
          if(response.data.ethernet.length > 1)
            formik_ethernet1.handleReset(response.data.ethernet[1]);
          formik_wifi.handleReset(response.data.wifi);
          formik_bt.handleReset(response.data.bt);
    
        } catch (error) {
          console.error(error);
        }
      }
    async function setURL(){
        setMobileURL(await getMobileAPIURL());
    }

    function refresh(){
        console.log("refresh");
        formik_ethernet1.handleReset(curEthernet?.[0]);
        formik_ethernet2.handleReset(curEthernet?.[1]);
        formik_wifi.handleReset(curWifi?.[0]);
        formik_bt.handleReset(curBt?.[0]);
    }

    async function save_ethernet_1(){
        console.log("save ethernet");
        try{
            const response = await axios.put(mobileURL+'/network/ethernet1',formik_ethernet1.values);
            console.log(response);
        }catch(error){
            console.error(error);


        }
    }
    async function save_ethernet_2(){
        console.log("save ethernet");
        try{
            const response = await axios.put(mobileURL+'/network/ethernet2',formik_ethernet2.values);
            console.log(response);
        }catch(error){
            console.error(error);
        }
    }
    async function save_wifi(){
        try{
            setLoading(true);
            const response = await axios.put(mobileURL+'/network/wifi',formik_wifi.values);
            getCurrentInfo();
            toast.current?.show({
                severity: 'success',
                summary: 'Wifi 세팅 성공',
                detail: '설정이 완료되었습니다',
                life: 3000
            })
            setLoading(false);
        }catch(error){
            console.error(error);
            setLoading(false);
        }
    }
    async function save_bt(){

    }
    async function showWifiPopup(){
        getWifiList();
        setVisibleWifi(true);
    }

    async function getWifiList(){
        try{
            const response = await axios.get(mobileURL+'/network/wifi/list');
            console.log(response.data);
            setWifis(response.data);
        }catch(error){
            console.error(error);
        }

    }
    async function reScan(){        
        try{
            const response = await axios.get(mobileURL+'/network/wifi/scan');
            console.log(response.data);
            setWifis(response.data);
        }catch(error){
            console.error(error);
        }

    }

    //------------------------------------------------------------------------------------------------
    const PopupWifi = () =>{
        const [block, setBlock] = useState(false);
        const [visibleWifiPassword, setVisibleWifiPassword] = useState(false);
        const [newWifi, setNewWifi] = useState<string>('');

        const getRating = (quality: number) =>{
            if(quality>80){
                return 5;
            }else if(quality>60){
                return 4;
            }else if(quality>40){
                return 3;
            }else if(quality>20){
                return 2;
            }else{
                return 1;
            }
        }
        
        const PopupPassword = () =>{
            const [password, setPassword] = useState('');
            return(
                <Dialog header = {newWifi}
                style={{width: '350px'}} visible={visibleWifiPassword} onHide={() => setVisibleWifiPassword(false)}>

                <div className='column gap-1 justify-content-center align-items-center flex'>
                    <h6>패스워드를 입력하세요</h6>
                    <Password
                        className='flex'
                        value={password}
                        feedback={false}
                        onChange={(e) => setPassword(e.target.value)} />

                    <Button onClick={()=>{
                        if(password != ''){
                            connectWifi(newWifi, password);
                        }else{
                        }
                    }}>연결</Button>
                </div>

                </Dialog>
            );
        }
        const connectWifi = async(wifi: any, password: string | undefined=undefined) =>{
            console.log("connectWifi, ",wifi);
            try{
                setBlock(true);

                var response;
                response = await axios.post(mobileURL+'/network/wifi',{...wifi,password:password});
                
                console.log("RESPONSE:",response.data);
                setBlock(false);

                if(response.data.includes('successfully')){
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Wifi 연결 성공',
                        detail: '설정에 성공하였습니다',
                        life: 3000
                    })
                }else if(response.data.includes('Secrets were required')){
                    console.log("!!????????????!!!!!!!!!!!!!!");
                }else if(response.data.includes('failed:')){
                    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!");
                }else{

                }
                getCurrentInfo();
                setVisibleWifi(false);
            }catch(error){
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Wifi 연결 실패',
                    detail: '실행할 수 없습니다',
                    life: 3000
                })
                setBlock(false);
            }
        };
        const renderListItem = (wifi: { security: string, ssid: string; quality: any; }) => {
            return (
              <div className="col-12 p-md-3" >
                <div className="product-item card">
                 <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                    <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                        <div className="grid gap-2 text-2xl font-bold text-900">
                            {wifi.ssid}
                            {wifi.security!='' && <Avatar icon="pi pi-lock"></Avatar>}
                        </div>
                        <Rating value={getRating(wifi.quality)} readOnly cancel={false}></Rating>
                    </div>
                        <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                            <Button onClick={()=>{
                                if(wifi.security == ''){
                                    connectWifi(wifi);
                                }else{
                                    setNewWifi(wifi.ssid);
                                    setVisibleWifiPassword(true);
                                }
                            }}>연결</Button>
                        </div>
                    </div>
                </div>
              </div>
            );
          };
        
        const itemTemplate = (wifi: any) => {
            if (!wifi) {
            return;
            }

            return renderListItem(wifi);
        };

        async function rescan(){
            setBlock(true);
            await reScan();
            setBlock(false);
        }

        const header = (
          <div className="p-grid">
              <Button onClick={rescan}>새로고침</Button>
          </div>
        );


        return(
            <Dialog header = '와이파이 리스트' 
            style={{width: '80%', maxWidth:'800px', minWidth:'400px'}}
            visible={visibleWifi} onHide={()=>setVisibleWifi(false)}>
                <PopupPassword></PopupPassword>
                <div className=' flex justify-content-center'>
                {block&&
                <ProgressSpinner  aria-label="Loading"/>}
                {!block&&
                <DataView
                    value={wifis}
                    // layout={'list'}
                    itemTemplate={itemTemplate}
                    header={header}
                />
                }
                </div>
            </Dialog>
        )
    }

    return (
        <div className="column gap-3">
        <PopupWifi></PopupWifi>
        <Toast ref={toast}></Toast>


        <Panel header={"Ethernet ("+curEthernet?.[0].name+" : "+curEthernet?.[0].device+")"}>
            {(curEthernet?.[0] && curEthernet?.[0].name != '--') &&
             <div className="column ">
             <div className='grid gap-3' >
                 <Button disabled={loading} onClick={refresh}>초기화</Button>
                 <Button disabled={loading} onClick={save_ethernet_1}>적용</Button>
             </div>
            {loading?
                <ProgressSpinner  aria-label="Loading"/> :
                <div className = "column">
                    <div className="flex-auto">
                        <label className="font-bold block mb-2">
                            Name
                        </label>
                        <InputText
                            name="name"
                            type="text"
                            readOnly
                            onChange={formik_ethernet1.handleChange}
                            value={formik_ethernet1.values.name}
                            className={`w-full p-inputtext-long ${formik_ethernet1.errors.name?"p-invalid":""}`}
                        />
                    </div>

                    <div className="flex-auto mb-2">
                        <label className="font-bold block mb-2">
                            Mac Address
                        </label>
                        <InputText
                            name="mac"
                            type="text"
                            readOnly
                            onChange={formik_ethernet1.handleChange}
                            value={formik_ethernet1.values.mac}
                            className={`w-full p-inputtext-long ${formik_ethernet1.errors.mac?"p-invalid":""}`}
                        />
                    </div>

                    <div className="flex flex-wrap gap-5 ">
                        <div className="flex-auto">
                            <label className="font-bold block mb-2">
                                IP
                            </label>
                            <InputText
                                name="ip"
                                type="text"
                                onChange={formik_ethernet1.handleChange}
                                value={formik_ethernet1.values.ip}
                                className={`w-full p-inputtext-long ${formik_ethernet1.errors.ip?"p-invalid":""}`}
                            />
                        </div>
                        <div className="flex-auto">
                            <label className="font-bold block mb-2">
                                Subnet
                            </label>
                            <InputText
                                name="subnet"
                                type="text"
                                onChange={formik_ethernet1.handleChange}
                                value={formik_ethernet1.values.subnet}
                                className={`w-full p-inputtext-long ${formik_ethernet1.errors.subnet?"p-invalid":""}`}
                            />
                        </div>
                    </div>

                    <div className="flex-auto">
                        <label className="font-bold block mb-2">
                            Gateway
                        </label>
                        <InputText
                            name="gateway"
                            type="text"
                            onChange={formik_ethernet1.handleChange}
                            value={formik_ethernet1.values.gateway}
                            className={`w-full p-inputtext-long ${formik_ethernet1.errors.gateway?"p-invalid":""}`}
                        />
                    </div>

                    {formik_ethernet1.values.dns && formik_ethernet1.values.dns?.length>0 &&
                        <div className="flex-auto">
                            <label className="font-bold block mb-2">
                                DNS_Main
                            </label>
                            <InputText
                                name="dns[0]"
                                type="text"
                                onChange={formik_ethernet1.handleChange}
                                value={formik_ethernet1.values.dns[0]}
                                className={`w-full p-inputtext-long ${formik_ethernet1.errors.dns && formik_ethernet1.errors.dns![0]?"p-invalid":""}`}
                            />
                        </div>
                    }
                    {formik_ethernet1.values.dns?.[1] && formik_ethernet1.values.dns[1] != '' &&
                        <div className="flex-auto mb-4">
                            <label className="font-bold block mb-2">
                                DNS_Serv
                            </label>
                            <InputText
                                name="dns[1]"
                                type="text"
                                onChange={formik_ethernet1.handleChange}
                                value={formik_ethernet1.values.dns[1]}
                                className={`w-full p-inputtext-long ${formik_ethernet1.errors.dns && formik_ethernet1.errors.dns![1]?"p-invalid":""}`}
                            />
                        </div>
                    }
                    </div> 
                    }
             </div>
            }
            {!(curEthernet?.[0] && curEthernet?.[0].name != '--') &&
            <>연결된 네트워크가 없습니다</>}
        </Panel>

        {(curEthernet?.[1] && curEthernet?.[1].name != '--') &&
        <Panel header={"Ethernet ("+curEthernet?.[1].name+" : "+curEthernet?.[1].device+")"}>
             <div className="column ">
             <div className='grid gap-3' >
                 <Button disabled={loading} onClick={refresh}>초기화</Button>
                 <Button disabled={loading} onClick={save_ethernet_2}>적용</Button>
             </div>
            {loading?
                <ProgressSpinner  aria-label="Loading"/> :
                <div className = "column">
                    <div className="flex-auto">
                        <label className="font-bold block mb-2">
                            Name
                        </label>
                        <InputText
                            name="name"
                            type="text"
                            readOnly
                            onChange={formik_ethernet2.handleChange}
                            value={formik_ethernet2.values.name}
                            className={`w-full p-inputtext-long ${formik_ethernet2.errors.name?"p-invalid":""}`}
                        />
                    </div>

                    <div className="flex-auto mb-2">
                        <label className="font-bold block mb-2">
                            Mac Address
                        </label>
                        <InputText
                            name="mac"
                            type="text"
                            readOnly
                            onChange={formik_ethernet2.handleChange}
                            value={formik_ethernet2.values.mac}
                            className={`w-full p-inputtext-long ${formik_ethernet2.errors.mac?"p-invalid":""}`}
                        />
                    </div>

                    <div className="flex flex-wrap gap-5 ">
                        <div className="flex-auto">
                            <label className="font-bold block mb-2">
                                IP
                            </label>
                            <InputText
                                name="ip"
                                type="text"
                                onChange={formik_ethernet2.handleChange}
                                value={formik_ethernet2.values.ip}
                                className={`w-full p-inputtext-long ${formik_ethernet2.errors.ip?"p-invalid":""}`}
                            />
                        </div>
                        <div className="flex-auto">
                            <label className="font-bold block mb-2">
                                Subnet
                            </label>
                            <InputText
                                name="subnet"
                                type="text"
                                onChange={formik_ethernet2.handleChange}
                                value={formik_ethernet2.values.subnet}
                                className={`w-full p-inputtext-long ${formik_ethernet2.errors.subnet?"p-invalid":""}`}
                            />
                        </div>
                    </div>
                    

                    <div className="flex-auto">
                        <label className="font-bold block mb-2">
                            Gateway
                        </label>
                        <InputText
                            name="gateway"
                            type="text"
                            onChange={formik_ethernet2.handleChange}
                            value={formik_ethernet2.values.gateway}
                            className={`w-full p-inputtext-long ${formik_ethernet2.errors.gateway?"p-invalid":""}`}
                        />
                    </div>

                    {formik_ethernet2.values.dns && formik_ethernet2.values.dns?.length>0 &&
                        <div className="flex-auto">
                            <label className="font-bold block mb-2">
                                DNS_Main
                            </label>
                            <InputText
                                name="dns[0]"
                                type="text"
                                onChange={formik_ethernet2.handleChange}
                                value={formik_ethernet2.values.dns[0]}
                                className={`w-full p-inputtext-long ${formik_ethernet2.errors.dns && formik_ethernet2.errors.dns![0]?"p-invalid":""}`}
                            />
                        </div>
                    }
                    {formik_ethernet2.values.dns?.[1] && formik_ethernet2.values.dns[1] != '' &&
                        <div className="flex-auto mb-4">
                            <label className="font-bold block mb-2">
                                DNS_Serv
                            </label>
                            <InputText
                                name="dns[1]"
                                type="text"
                                onChange={formik_ethernet2.handleChange}
                                value={formik_ethernet2.values.dns[1]}
                                className={`w-full p-inputtext-long ${formik_ethernet2.errors.dns && formik_ethernet2.errors.dns![1]?"p-invalid":""}`}
                            />
                        </div>
                    }
                    </div>
                }
                </div>
        </Panel>
        }

        
        {(curWifi?.[0] && curWifi?.[0].name != '--') &&
            <Panel header={"Wifi ("+curWifi[0].name+" : "+curWifi?.[0].device+")"}>
                <div className="column">
                <div className='grid gap-3' >
                    <Button disabled={loading} onClick={refresh}>초기화</Button>
                    <Button disabled={loading} onClick={showWifiPopup}>검색</Button>
                    <Button disabled={loading} onClick={save_wifi}>적용</Button>
                </div>
                {loading?
                    <ProgressSpinner  aria-label="Loading"/> :
                    <div className="column">
                    <div className="flex-auto">
                        <label className="font-bold block mb-2">
                            Name
                        </label>
                        <InputText
                            name="name"
                            type="text"
                            readOnly
                            onChange={formik_wifi.handleChange}
                            value={formik_wifi.values.name}
                            className={`w-full p-inputtext-long ${formik_wifi.errors.name?"p-invalid":""}`}
                        />
                    </div>
    
                    <div className="flex-auto mb-2">
                        <label className="font-bold block mb-2">
                            Mac Address
                        </label>
                        <InputText
                            name="mac"
                            type="text"
                            readOnly
                            onChange={formik_wifi.handleChange}
                            value={formik_wifi.values.mac}
                            className={`w-full p-inputtext-long ${formik_wifi.errors.mac?"p-invalid":""}`}
                        />
                    </div>
    
                    <div className="flex flex-wrap gap-5 ">
                        <div className="flex-auto">
                            <label className="font-bold block mb-2">
                                IP
                            </label>
                            <InputText
                                name="ip"
                                type="text"
                                onChange={formik_wifi.handleChange}
                                value={formik_wifi.values.ip}
                                className={`w-full p-inputtext-long ${formik_wifi.errors.ip?"p-invalid":""}`}
                            />
                        </div>
                        <div className="flex-auto">
                            <label className="font-bold block mb-2">
                                Subnet
                            </label>
                            <InputText
                                name="subnet"
                                type="text"
                                onChange={formik_wifi.handleChange}
                                value={formik_wifi.values.subnet}
                                className={`w-full p-inputtext-long ${formik_wifi.errors.subnet?"p-invalid":""}`}
                            />
                        </div>
                    </div>
    
                    <div className="flex-auto">
                        <label className="font-bold block mb-2">
                            Gateway
                        </label>
                        <InputText
                            name="gateway"
                            type="text"
                            onChange={formik_wifi.handleChange}
                            value={formik_wifi.values.gateway}
                            className={`w-full p-inputtext-long ${formik_wifi.errors.gateway?"p-invalid":""}`}
                        />
                    </div>
    
                    {formik_wifi.values.dns && formik_wifi.values.dns?.length>0 &&
                        <div className="flex-auto">
                            <label className="font-bold block mb-2">
                                DNS_Main
                            </label>
                            <InputText
                                name="dns[0]"
                                type="text"
                                onChange={formik_wifi.handleChange}
                                value={formik_wifi.values.dns[0]}
                                className={`w-full p-inputtext-long ${formik_wifi.errors.dns && formik_wifi.errors.dns![0]?"p-invalid":""}`}
                            />
                        </div>
                    }
                    {formik_wifi.values.dns?.[1] && formik_wifi.values.dns[1] != '' &&
                        <div className="flex-auto mb-4">
                            <label className="font-bold block mb-2">
                                DNS_Serv
                            </label>
                            <InputText
                                name="dns[1]"
                                type="text"
                                onChange={formik_wifi.handleChange}
                                value={formik_wifi.values.dns[1]}
                                className={`w-full p-inputtext-long ${formik_wifi.errors.dns && formik_wifi.errors.dns![1]?"p-invalid":""}`}
                            />
                        </div>
                    }
                        </div>
                    
                }
                </div>
            </Panel>
        }

        {(curBt?.[0] && curBt?.[0].name != '--') &&
            <Panel header={"Bluetooth ("+curBt[0].name+" : "+curBt?.[0].device+")"}>
                <div className="column ">
                <div className='grid gap-3' >
                    <Button disabled={loading} onClick={refresh}>초기화</Button>
                    <Button disabled={loading} onClick={save_bt}>적용</Button>
                </div>
                {loading?
                    <ProgressSpinner  aria-label="Loading"/> :
                    <div className = "column">
                        <div className="flex-auto">
                            <label className="font-bold block mb-2">
                                Name
                            </label>
                            <InputText
                                name="name"
                                type="text"
                                readOnly
                                onChange={formik_bt.handleChange}
                                value={formik_bt.values.name}
                                className={`w-full p-inputtext-long ${formik_bt.errors.name?"p-invalid":""}`}
                            />
                        </div>

                        <div className="flex-auto mb-2">
                            <label className="font-bold block mb-2">
                                Mac Address
                            </label>
                            <InputText
                                name="mac"
                                type="text"
                                readOnly
                                onChange={formik_bt.handleChange}
                                value={formik_bt.values.mac}
                                className={`w-full p-inputtext-long ${formik_bt.errors.mac?"p-invalid":""}`}
                            />
                        </div>

                        <div className="flex flex-wrap gap-5 ">
                            <div className="flex-auto">
                                <label className="font-bold block mb-2">
                                    IP
                                </label>
                                <InputText
                                    name="ip"
                                    type="text"
                                    onChange={formik_bt.handleChange}
                                    value={formik_bt.values.ip}
                                    className={`w-full p-inputtext-long ${formik_bt.errors.ip?"p-invalid":""}`}
                                />
                            </div>
                            <div className="flex-auto">
                                <label className="font-bold block mb-2">
                                    Subnet
                                </label>
                                <InputText
                                    name="subnet"
                                    type="text"
                                    onChange={formik_bt.handleChange}
                                    value={formik_bt.values.subnet}
                                    className={`w-full p-inputtext-long ${formik_bt.errors.subnet?"p-invalid":""}`}
                                />
                            </div>
                        </div>

                        <div className="flex-auto">
                            <label className="font-bold block mb-2">
                                Gateway
                            </label>
                            <InputText
                                name="gateway"
                                type="text"
                                onChange={formik_bt.handleChange}
                                value={formik_bt.values.gateway}
                                className={`w-full p-inputtext-long ${formik_bt.errors.gateway?"p-invalid":""}`}
                            />
                        </div>

                        {formik_bt.values.dns && formik_bt.values.dns?.length>0 &&
                            <div className="flex-auto">
                                <label className="font-bold block mb-2">
                                    DNS_Main
                                </label>
                                <InputText
                                    name="dns[0]"
                                    type="text"
                                    onChange={formik_bt.handleChange}
                                    value={formik_bt.values.dns[0]}
                                    className={`w-full p-inputtext-long ${formik_bt.errors.dns && formik_bt.errors.dns![0]?"p-invalid":""}`}
                                />
                            </div>
                        }
                        {formik_bt.values.dns?.[1] && formik_bt.values.dns[1] != '' &&
                            <div className="flex-auto mb-4">
                                <label className="font-bold block mb-2">
                                    DNS_Serv
                                </label>
                                <InputText
                                    name="dns[1]"
                                    type="text"
                                    onChange={formik_bt.handleChange}
                                    value={formik_bt.values.dns[1]}
                                    className={`w-full p-inputtext-long ${formik_bt.errors.dns && formik_bt.errors.dns![1]?"p-invalid":""}`}
                                />
                            </div>
                        }
                        </div> }
                    </div>
            </Panel>
        }
        </div>
    );
};

export default Network;
