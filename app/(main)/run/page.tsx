'use client';
import React, { useEffect,  useContext, useRef, useState } from 'react';
// import { useRouter } from 'next/router';
import { SplitButton } from 'primereact/splitbutton';
import { Button } from 'primereact/button';
import axios from 'axios';
import {Formik, useFormik, Form, Field, FormikProps} from 'formik';
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Knob } from "primereact/knob";
import { ListBox } from "primereact/listbox";
import { MultiSelect } from "primereact/multiselect";
import { RadioButton } from "primereact/radiobutton";
import { Rating } from "primereact/rating";
import { Panel } from 'primereact/panel';
import { Toolbar } from 'primereact/toolbar';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import { SelectButton } from "primereact/selectbutton";
import { Tree,TreeDragDropEvent, TreeExpandedKeysType, TreeSelectionEvent } from 'primereact/tree';
import { TreeTable } from 'primereact/treetable';
import { DataView } from 'primereact/dataview';
import { Slider, SliderChangeEvent } from "primereact/slider";
import { Accordion , AccordionTab} from 'primereact/accordion';
import { ToggleButton } from "primereact/togglebutton";
import { ScrollTop } from 'primereact/scrolltop';
import styles from './index.module.scss';
import { classNames } from 'primereact/utils';
import {v4 as uuidv4} from 'uuid';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import fs from 'fs';
import { Dialog } from 'primereact/dialog';
// import { ListBox } from 'primereact/listbox';
import { FileUpload,  FileUploadState, FileUploadHandlerEvent, FileUploadSelectEvent, FileUploadUploadEvent } from 'primereact/fileupload';
import { forEachChild } from 'typescript';
import { encode } from 'punycode';
import {userContext} from '../../../interface/user'
// import { selectMonitor } from '@/store/networkSlice';
import {version, defaultVersion, newversion, defaultNewVersion,versions, defaultNewVersions,defaultVersions} from '../../../interface/update';
import { start } from 'repl';
import { useDispatch, useSelector } from 'react-redux';
import {store,AppDispatch, RootState} from '../../../store/store';
// import ChartTemp from '@/components/Chart'
import { selectUser, setUser } from '@/store/userSlice';
import { selectStatus } from '@/store/statusSlice';
import { io } from "socket.io-client";
import { selectSetting, setRobot, setDebug, setLoc, setControl, setAnnotation, setDefault, setMotor, setMapping, setObs, MotorSetting } from '@/store/settingSlice';
import {getMobileAPIURL} from '../api/url';
import { transStatus } from '../api/to';
import { TreeNode } from 'primereact/treenode';
import emitter from '@/lib/eventBus'
import { selectTask } from '@/store/taskSlice';
import { TreeSelectChangeEvent } from 'primereact/treeselect';
import exp from 'constants';
import './style.scss'

const Run: React.FC = () =>{
    const dispatch = useDispatch<AppDispatch>();
    const settingState = useSelector((state:RootState) => selectSetting(state));
    const userState = useSelector((state:RootState) => selectUser(state));    
    const taskState = useSelector((state:RootState) => selectTask(state));
    const [mobileURL, setMobileURL] = useState('');
    const toast_main = useRef('');
    const toast = useRef<Toast | null>(null);
    const ScrollRef = useRef<any>(null);
    const TreeRef = useRef<any>(null);
    const [nodes, setNodes] = useState<TreeNode[]>([]);
    const [selectNodeKey, setSelectNodeKey] = useState<string>('');
    const [selectNode, setSelectNode] = useState<TreeNode | null>();
    const [selectMove, setSelectMove] = useState<string>('target');

    const [curTask, setCurTask] = useState<String>('');

    const [listVisible, setListVisible] = useState(false);
    const [expandedKeys, setExpandedKeys] = useState<TreeExpandedKeysType>({'0': true});

    const [tasks, setTasks] = useState<string[]>([]);
    const [moveX, setMoveX] = useState<any>(0);
    const [moveY, setMoveY] = useState<any>(0);
    const [moveRZ, setMoveRZ] = useState<any>(0);
    const [waitTime, setWaitTime] = useState<any>(0);
    const [repeatTime, setRepeatTime] = useState<any>(0);

    // const [playing, setPlaying] = useState<boolean>(false);
    const [pause, setPause] = useState<boolean>(false);

    const [copiedNode, setCopiedNode] = useState<TreeNode | null>(null);


    // const [taskID,setTaskID] = useState<string>('');

    useEffect(()=>{
        setURL();
        setSelectNodeKey('');
        setSelectNode(null);
    },[])

    useEffect(()=>{
        console.log(mobileURL);
        if(mobileURL != ''){
            getTaskList();
        }
    },[mobileURL])

    useEffect(() =>{
        expandAll();
    },[nodes])

    useEffect(() => {
        const handlerTask = (event) =>{
            console.log("task handler ",event)
            if(event == "start"){
                toast.current?.show({
                    severity: 'success',
                    summary: 'Task Start',
                    life: 3000
                })
            }else{
                toast.current?.show({
                    severity: 'success',
                    summary: 'Task Stop',
                    life: 3000
                })
            }
        };

        emitter.on('task',handlerTask);

        return () =>{
            emitter.off('task',handlerTask);
        };
    }, []);

    async function setURL(){
        setMobileURL(await getMobileAPIURL());
    }
    
    async function getTaskList(){
        const response = await axios.get(mobileURL + "/task");
        setTasks(response.data);
    }

    const expandAll = () => {
        let _expandedKeys = {};

        for (let node of nodes) {
            expandNode(node, _expandedKeys);
        }

        setExpandedKeys(_expandedKeys);
    };

    let node_num = 0;
    const makeNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node, index) => {
            if(node.label == "script"){
                node.icon = "pi pi-fw pi-code"; 
            }else if(node.label == "map"){
                node.icon = 'pi pi-fw pi-map';
            }else if(node.label == "repeat"){
                node.icon = 'pi pi-fw pi-replay';
            }else if(node.label == "move"){
                node.icon = 'pi pi-fw pi-forward';
            }else if(node.label == "wait"){
                node.icon = 'pi pi-fw pi-hourglass';
            }

            if(node.key != '0')
                node.key = node_num++;
            

            if(node.label == "if" || node.label == "else if" || node.label == "else" || node.label == "repeat"){
                if(node.children?.length == 0){
                    node.children.push({ key: uuidv4(), label: 'empty', children: [] });
                }else if(node.children?.length! > 1){
                    let new_child: TreeNode[] = [];
                    node.children?.map((child,index)=>{
                        if(child.label != "empty"){
                            new_child.push(child);
                        }
                    });

                    node.children = new_child;
                }
            }

            return {
                ...node,
                children: node.children ? makeNodes(node.children) : node.children
            };
        });
    }


    const expandNode = (node: TreeNode, _expandedKeys: TreeExpandedKeysType) => {
        if (node.children && node.children.length) {
            _expandedKeys[node.key as string] = true;

            for (let child of node.children) {
                expandNode(child, _expandedKeys);
            }
        }
    };

    const openPopup = () =>{
        setListVisible(true);
    }

    const playTask = async() =>{
        if(curTask != ''){
            if(taskState.running){
                toast.current?.show({
                    severity: 'info',
                    summary: 'Already Playing',
                    life: 3000
                })
            }else{
                const response = await axios.get(mobileURL + "/task/load/"+curTask);
                if(response.data == "success"){
                    const response2 = await axios.get(mobileURL + "/task/run");
                }else{
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Load Fail',
                        life: 3000
                    })
                }
            }
        }
    }

    const stopTask = async() =>{
        if(curTask != ''){
            if(taskState.running){
                const response = await axios.get(mobileURL + "/task/stop");
            }else{

            }
        }
    }

    const MainToolPanel = () =>{
        return(
        <Toolbar className='tool-main' start={
            <React.Fragment>
                <Button icon="pi pi-folder-open" disabled={taskState.running} onClick={openPopup}></Button>
            </React.Fragment>
        } center={
            <React.Fragment>
                <Button className='mr-5' disabled={curTask==''} icon={taskState.running ? "pi pi-pause" : "pi pi-play"} onClick={playTask} />
                <Button icon="pi pi-stop" disabled={curTask==''} onClick={stopTask} />
            </React.Fragment>
        } end={
            <React.Fragment>
            </React.Fragment>
        }></Toolbar>
    );
    }

    async function getNodes(name){
        const response = await axios.get(mobileURL + "/task/"+name);
        node_num = 0;
        setCurTask(name);
        
        setNodes(makeNodes(response.data));
    }

    //------------------------------------------------------------------------------------------------
    const PopupLoad = () =>{
        const renderListItem = (task: string) => {
            return (
              <div className="col-12 p-md-3" >
                <div className="product-item card">
                 <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                    <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                        <div className="grid gap-2 text-2xl font-bold text-900">
                            {task}
                        </div>
                        <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                            <Button onClick={()=>{getNodes(task); setListVisible(false);
                                }}>Select</Button>
                        </div>
                    </div>
                    </div>
                </div>
              </div>
            );
          };
        const itemTemplate = (task: any) => {
            if (!task) {
            return;
            }

            return renderListItem(task);
        };
        return(
            <Dialog header = 'Task 리스트' 
            style={{width: '80%', maxWidth:'800px', minWidth:'400px'}}
            visible={listVisible} onHide={()=>setListVisible(false)}>
                <DataView
                    value={tasks}
                    // layout={'list'}
                    itemTemplate={itemTemplate}
                    // header={header}
                />
            </Dialog>
        )
    }

    const nodeTemplate = (node, options) => {
        let label;
        if(node.label == "begin" || node.label == "end"){
            label = <><b className={'custom-label-frame'}>{node.label}</b> </>;
        }else if(node.label == "script"){
            label = <><b className={'custom-label'}>{node.label}</b> </>;
        }else if(node.label == "empty"){
            label = <><b className={'custom-label-empty'}>{node.label}</b> </>;
        }else{
            label = <><b className={'custom-label'}>{node.label}</b>   <b className='custom-data'>{node.data}</b></>;
        }
        return <span className="node-box">{label}</span>;
    }

    const [draggingNode, setDraggingNode] = useState<TreeNode>();
    
    const handleSelect = async(e:TreeSelectionEvent) =>{
        console.log(e.value);
    }


    useEffect(() => {
      if (taskState.taskID) {
        const offsetTop = parseInt(taskState.taskID)*50;
        document.getElementById("my-tree")!.parentElement!.scrollTop = offsetTop;
      }
    }, [taskState.taskID]);
  
    return(
        <main>
        <PopupLoad></PopupLoad>
        <Toast ref={toast}></Toast>
        <div className="main-box card flex flex-column align-items-center">
            <MainToolPanel ></MainToolPanel>
            <div className='child-box2'>
                <div className='child-box'>
                    <ScrollPanel id="my-scroll-panel"  ref={ScrollRef} className='tree-box w-full'>
                        <Tree  id="my-tree" className='custom-tree w-full' onSelectionChange={handleSelect} 
                        ref={TreeRef} nodeTemplate={nodeTemplate} 
                        onExpand={(e) =>{console.log(e)}} dragdropScope="f" 
                        onToggle={(e) => {}}  selectionMode="single" 
                        expandedKeys={expandedKeys} selectionKeys={taskState.taskID} 
                        value={nodes['0']?nodes['0'].children:[]}>
                        </Tree>
                        <ScrollTop target="parent" threshold={100} className="w-2rem h-2rem border-round bg-primary" icon="pi pi-arrow-up text-base" />
                    </ScrollPanel>
                </div>
            </div>
        </div>
        </main>
    );
}

export default Run;