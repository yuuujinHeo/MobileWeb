/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
// import { ProductService } from '../../demo/service/ProductService';
import Link from 'next/link';
import { Demo } from '@/types';
import { Panel } from 'primereact/panel';
import {FieldArray, useFormik} from 'formik';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { DataView } from 'primereact/dataview';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { ChartData, ChartOptions } from 'chart.js';
import { NetworkInfo } from '@/interface/network';
import axios from 'axios';
import '../setting/style.scss';

const Network = () =>{
    const [curEthernet, setCurEthernet] = useState<NetworkInfo>();
    const [curWifi, setCurWifi] = useState<NetworkInfo>();
    const [curBt, setCurBt] = useState<NetworkInfo>();
    const [wifis, setWifis] = useState<NetworkInfo[]>([]);
    const [executed, setExecuted] = useState(false);
    const [visibleWifi, setVisibleWifi] = useState(false);

    const formik_ethernet = useFormik({
        initialValues:{
            type:curEthernet?.type,
            state: curEthernet?.state,
            device: curEthernet?.device,
            mac: curEthernet?.mac,
            name: curEthernet?.name,
            ip: curEthernet?.ip,
            gateway: curEthernet?.gateway,
            dns: curEthernet?.dns,
            subnet: curEthernet?.subnet,
            stasignal_levelte: curEthernet?.signal_level,
            quality: curEthernet?.quality,
            security: curEthernet?.security
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
    });
    const formik_wifi = useFormik({
        initialValues:{
            type:curWifi?.type,
            state: curWifi?.state,
            device: curWifi?.device,
            mac: curWifi?.mac,
            name: curWifi?.name,
            ip: curWifi?.ip,
            gateway: curWifi?.gateway,
            dns: curWifi?.dns,
            subnet: curWifi?.subnet,
            stasignal_levelte: curWifi?.signal_level,
            quality: curWifi?.quality,
            security: curWifi?.security
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
                dns: "",
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
    });
    const formik_bt = useFormik({
        initialValues:{
            type:curBt?.type,
            state: curBt?.state,
            device: curBt?.device,
            mac: curBt?.mac,
            name: curBt?.name,
            ip: curBt?.ip,
            gateway: curBt?.gateway,
            dns: curBt?.dns,
            subnet: curBt?.subnet,
            stasignal_levelte: curBt?.signal_level,
            quality: curBt?.quality,
            security: curBt?.security
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
                dns: [],
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
    });

    async function getCurrentInfo(){
        try{
            console.log("??????????????");
            const response = await axios.get('http://10.108.1.10:11334/network/current');
            console.log("--------------",response.data);   
            setCurEthernet(response.data.ethernet);
            setCurWifi(response.data.wifi);
            setCurBt(response.data.bt);
            formik_ethernet.handleReset(response.data.ethernet);
            formik_wifi.handleReset(response.data.wifi);
            formik_bt.handleReset(response.data.bt);
        }catch(error){
            console.error(error);
            // alert(error);
        }
    }

    useEffect(()=>{
        console.log("network useEffect")
        getCurrentInfo();
    },[])

    function refresh(){
        console.log("refresh");
        formik_ethernet.handleReset(curEthernet);
        formik_wifi.handleReset(curWifi);
        formik_bt.handleReset(curBt);
    }
    async function save_ethernet(){
        console.log("save ethernet");
        try{
            const response = await axios.post('http://10.108.1.10:11334/network/ethernet',formik_ethernet.values);
            console.log(response);
        }catch(error){
            console.error(error);


        }
    }
    async function save_wifi(){

    }
    async function showWifiPopup(){
        getWifiList();
        setVisibleWifi(true);
    }

    async function getWifiList(){
        try{
            const response = await axios.get('http://10.108.1.10:11334/network/wifi/list');
            console.log(response.data);
            setWifis(response.data);
        }catch(error){
            console.error(error);
        }

    }
    async function reScan(){
        
        try{
            const response = await axios.get('http://10.108.1.10:11334/network/wifi/scan');
            console.log(response.data);
            setWifis(response.data);
        }catch(error){
            console.error(error);
        }

    }
    const PopupWifi = () =>{
        const [block, setBlock] = useState(false);
        const getRating = (quality) =>{
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
        const renderListItem = (wifi) => {
            return (
              <div className="col-12 p-md-3" >
                <div className="product-item card">
                 <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                    <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                        <div className="text-2xl font-bold text-900">{wifi.ssid}</div>
                        <Rating value={getRating(wifi.quality)} readOnly cancel={false}></Rating>
                    </div>
                        <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                            <Button >연결</Button>
                        </div>
                    </div>
                </div>
              </div>
            );
          };
        
        const itemTemplate = (wifi) => {
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
            style={{width: '80%', maxWidth:'600px', minWidth:'400px'}}
            visible={visibleWifi} onHide={()=>setVisibleWifi(false)}>
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

    const ethernet_header = (
        <div className='grid justify-content-center mt-2 mb-1 ml-3'>
            <label className="font-bold items-center text-2xl block">{formik_ethernet.values.device}</label>
            <Tag severity={formik_ethernet.values.state===100?"success":"danger"} value={formik_ethernet.values.state===100?"connected":"disconnected"}  className="ml-5"></Tag>
            
        </div>
    );
    const wifi_header = (
        <div className='grid justify-content-center mt-2 mb-1 ml-3'>
            <label className="font-bold items-center text-2xl block">{formik_wifi.values.device}</label>
            <Tag severity={formik_wifi.values.state===100?"success":"danger"} value={formik_wifi.values.state===100?"connected":"disconnected"}  className="ml-5"></Tag>
        </div>
    );
    const bt_header = (
        <div className='grid justify-content-center mt-2 mb-1 ml-3'>
            <label className="font-bold items-center text-2xl block">bluetooth</label>
            <Tag severity={formik_wifi.values.state===100?"success":"danger"} value={formik_wifi.values.state===100?"connected":"disconnected"}  className="ml-5"></Tag>
        </div>
    );

    return (
        <div className="column gap-3">
        <PopupWifi></PopupWifi>
        <Panel header = {ethernet_header} > 
            <div className="column ">
                <div className='grid gap-3' >
                    <Button onClick={refresh}>초기화</Button>
                    <Button onClick={save_ethernet}>적용</Button>
                </div>
                <div className="flex-auto">
                    <label className="font-bold block mb-2">
                        Name
                    </label>
                    <InputText
                        name="name"
                        type="text"
                        readOnly
                        onChange={formik_ethernet.handleChange}
                        value={formik_ethernet.values.name}
                        className={`w-full p-inputtext-long ${formik_ethernet.errors.name?"p-invalid":""}`}
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
                        onChange={formik_ethernet.handleChange}
                        value={formik_ethernet.values.mac}
                        className={`w-full p-inputtext-long ${formik_ethernet.errors.mac?"p-invalid":""}`}
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
                            onChange={formik_ethernet.handleChange}
                            value={formik_ethernet.values.ip}
                            className={`w-full p-inputtext-long ${formik_ethernet.errors.ip?"p-invalid":""}`}
                        />
                    </div>
                    <div className="flex-auto">
                        <label className="font-bold block mb-2">
                            Subnet
                        </label>
                        <InputText
                            name="subnet"
                            type="text"
                            onChange={formik_ethernet.handleChange}
                            value={formik_ethernet.values.subnet}
                            className={`w-full p-inputtext-long ${formik_ethernet.errors.subnet?"p-invalid":""}`}
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
                        onChange={formik_ethernet.handleChange}
                        value={formik_ethernet.values.gateway}
                        className={`w-full p-inputtext-long ${formik_ethernet.errors.gateway?"p-invalid":""}`}
                    />
                </div>

                {formik_ethernet.values.dns && formik_ethernet.values.dns?.length>0 &&
                    <div className="flex-auto">
                        <label className="font-bold block mb-2">
                            DNS_Main
                        </label>
                        <InputText
                            name="dns[0]"
                            type="text"
                            onChange={formik_ethernet.handleChange}
                            value={formik_ethernet.values.dns[0]}
                            className={`w-full p-inputtext-long ${formik_ethernet.errors.dns && formik_ethernet.errors.dns![0]?"p-invalid":""}`}
                        />
                    </div>
                }
                {formik_ethernet.values.dns && formik_ethernet.values.dns[1] != '' &&
                    <div className="flex-auto mb-4">
                        <label className="font-bold block mb-2">
                            DNS_Serv
                        </label>
                        <InputText
                            name="dns[1]"
                            type="text"
                            onChange={formik_ethernet.handleChange}
                            value={formik_ethernet.values.dns[1]}
                            className={`w-full p-inputtext-long ${formik_ethernet.errors.dns && formik_ethernet.errors.dns![1]?"p-invalid":""}`}
                        />
                    </div>
                }
                </div>
        </Panel>
        <Panel header = {wifi_header}  > 
            <div className="column gap-4 ">
                <div className='grid gap-3' >
                    <Button onClick={refresh}>초기화</Button>
                    <Button onClick={showWifiPopup}>검색</Button>
                    <Button onClick={save_wifi}>적용</Button>
                </div>
                <div className="flex-auto mb-4">
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
                <div className="flex-auto mb-4">
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

                <div className="flex flex-wrap gap-5 mb-4">
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

                <div className="flex-auto mb-4">
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
                    <div className="flex-auto mb-4">
                        <label className="font-bold block mb-2">
                            DNS_Main
                        </label>
                        <InputText
                            name="dns"
                            type="text"
                            onChange={formik_wifi.handleChange}
                            value={formik_wifi.values.dns[0]}
                            className={`w-full p-inputtext-long ${formik_wifi.errors.dns && formik_wifi.errors.dns![0]?"p-invalid":""}`}
                        />
                    </div>
                }
                {formik_wifi.values.dns && formik_wifi.values.dns?.length>1 &&
                    <div className="flex-auto mb-4">
                        <label className="font-bold block mb-2">
                            DNS_Serv
                        </label>
                        <InputText
                            name="dns"
                            type="text"
                            onChange={formik_wifi.handleChange}
                            // value={formik_wifi.values.dns&&Array.isArray(formik_wifi.values.dns) &&formik_wifi.values.dns.length>1?formik_wifi.values.dns[1]:''}
                            value={formik_wifi.values.dns[1]}
                            className={`w-full p-inputtext-long ${formik_wifi.errors.dns && formik_wifi.errors.dns![1]?"p-invalid":""}`}
                        />
                    </div>
                }
            </div>
        </Panel>
        {curBt?.state===100 &&
        <Panel header = {bt_header} > 
            <div className="column gap-4 ">
                <div className="flex-auto mb-4">
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
                <div className="flex-auto mb-4">
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

                <div className="flex flex-wrap gap-5 mb-4">
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

                <div className="flex-auto mb-4">
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
                    <div className="flex-auto mb-4">
                        <label className="font-bold block mb-2">
                            DNS_Main
                        </label>
                        <InputText
                            name="dns"
                            type="text"
                            onChange={formik_bt.handleChange}
                            value={formik_bt.values.dns[0]}
                            className={`w-full p-inputtext-long ${formik_bt.errors.dns && formik_bt.errors.dns![0]?"p-invalid":""}`}
                        />
                    </div>
                }
                {formik_bt.values.dns && formik_bt.values.dns?.length>1 &&
                    <div className="flex-auto mb-4">
                        <label className="font-bold block mb-2">
                            DNS_Serv
                        </label>
                        <InputText
                            name="dns"
                            type="text"
                            onChange={formik_bt.handleChange}
                            value={formik_bt.values.dns[1]}
                            className={`w-full p-inputtext-long ${formik_bt.errors.dns && formik_bt.errors.dns![1]?"p-invalid":""}`}
                        />
                    </div>
                }
            </div>
        </Panel>
        }
        </div>
    );
};

export default Network;
