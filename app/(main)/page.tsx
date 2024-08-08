/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
// import { ProductService } from '../../demo/service/ProductService';
import { LayoutContext } from '../../layout/context/layoutcontext';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Demo } from '@/types';
import { ChartData, ChartOptions } from 'chart.js';
import {userContext} from '../../interface/user'
import { io } from "socket.io-client";
import {AppDispatch, RootState} from '@/store/store';
import { selectSetting } from '@/store/settingSlice';
import { selectStatus,  setStatus, StatusState } from '@/store/statusSlice';
import { transStatus } from '@/app/(main)/api/to'

const Dashboard = () => {

}

export default Dashboard;
