'use client';
import React, { useEffect, useContext, useRef, useState } from 'react';
import { SplitButton } from 'primereact/splitbutton';
import { Button } from 'primereact/button';
import axios from 'axios';
import { Column } from 'primereact/column';
import { TreeTable } from 'primereact/treetable';
import { TreeNode } from 'primereact/treenode';
import { Tree, TreeSelectionEvent } from 'primereact/tree';
import { InputSwitch } from 'primereact/inputswitch';
import { DataTable } from 'primereact/datatable';
import { Row } from 'primereact/row';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { TreeSelectChangeEvent } from 'primereact/treeselect';
import { Dialog } from 'primereact/dialog';
import { Category, findNodeByKey } from './interface';
import { InputText } from 'primereact/inputtext';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';
import { TabView,TabPanel} from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { toPadding } from 'chart.js/dist/helpers/helpers.options';
import { Badge } from 'primereact/badge';
 
const List: React.FC = () =>{
    const [categories, setCategories] = useState<[]>([]);
    const [categoriestree, setCategoriestree] = useState<[]>([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [lists, setLists] = useState<[]>([]);
    const [users, setUsers] = useState([]);
    const [robots, setRobots] = useState([]);
    const [selectedRobot, setSelectedRobot] = useState(null);
    const [selectedNewRobot, setSelectedNewRobot] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [displayAddRobot, setDisplayAddRobot] = useState(false);
    const [displayRobotMode, setDisplayRobotMode] = useState('add');
    const [displayStatus, setDisplayStatus] = useState(false);
    const [displayAddUser, setDisplayAddUser] = useState(false);
    const [new_con, setNew_con] = useState(0);
    const [displayUserMode, setDisplayUserMode] = useState('add');
    const toast_main = useRef<Toast | null>(null);
    
    function refresh(){
        console.log("refresh : ",selectedCategory);
        if(selectedCategory){
            readRobotList(selectedCategory);
            readList(selectedCategory);
        }else{
            readList(0);
            readRobotList(0);
        }
        readNewList();
        setSelectedNewRobot(null);
        setSelectedRobot(null);
        setSelectedUser(null);
    }
    const readCategory = async() =>{
        try{
            const response = await axios.get('http://192.168.1.88:11335/categories');

            if(response.data != undefined){
                setCategories(response.data);
            }   
        }catch(error){
            console.error("get list error = ",error);
        }
    }
    const readCategorytree = async() =>{
        try{
            const response = await axios.get('http://192.168.1.88:11335/categories/tree');
            if(response.data != undefined){
                setCategoriestree(response.data);
                console.log(response.data);
            }   
        }catch(error){
            console.error("get list error = ",error);
        }
    }

    const readNewList = async() =>{
        try{
            const response = await axios.get('http://192.168.1.88:11335/robotlist/new');
            console.log(response.data);
            setNew_con(response.data);
        }catch(err){
            console.error(err);
        }
    }

    const readList = async(category:number) =>{
        setUsers([]);
        try{
            if(category>0){
                const response = await axios.get('http://192.168.1.88:11335/lists/'+category);
                if(response.data != undefined){
                    console.log(response.data);
                    setUsers(response.data);
                }   
            }
        }catch(error){
            console.error("get list error = ",error);
        }
    }
    const readRobotList = async(category:number) =>{
        setRobots([]);
        try{
            if(category>0){
                const response = await axios.get('http://192.168.1.88:11335/robots/'+category);
                if(response.data != undefined){
                    console.log(response.data);
                    setRobots(response.data);
                }   
            }
        }catch(error){
            console.error("get list error = ",error);
        }
    }

    const changeCategory = async(e:TreeSelectionEvent) =>{
        setSelectedCategory(e.value);
        readList(findNodeByKey(categoriestree,e.value).id);
        readRobotList(findNodeByKey(categoriestree,e.value).id);
        setSelectedUser(null);
    }

    useEffect(()=>{
        readCategory();
        readCategorytree();
        readList(0);
        readRobotList(0);
        readNewList();
    },[])

    const AddUserDialog = () => {
        const [new_id, setNew_id] = useState('');
        const [new_passwd, setNew_passwd] = useState('');
        const [new_name, setNew_name] = useState('');
        const [new_group, setNew_group] = useState('');
        const [new_permissions, setNew_permissions] = useState([]);
        const onIngredientsChange = (e:CheckboxChangeEvent) => {
            let _ingredients = [...new_permissions];
    
            if (e.checked)
                _ingredients.push(e.value);
            else
                _ingredients.splice(_ingredients.indexOf(e.value), 1);
    
                setNew_permissions(_ingredients);
        }
        const addUser = async() =>{
            console.log(new_id);
            if(new_id == '' || new_passwd == '' || new_name == ''){
                toast_main.current?.show({
                    severity: 'error',
                    summary: '사용자 추가 실패',
                    detail: '항목을 기입하세요',
                    life: 3000
                });
            }else if(new_group == ''){
                toast_main.current?.show({
                    severity: 'error',
                    summary: '사용자 추가 실패',
                    detail: '그룹을 선택하세요',
                    life: 3000
                });
            }else{
                //add user
                const body = {
                    new_id: new_id,
                    new_passwd: new_passwd,
                    new_name: new_name,
                    new_permissions: JSON.stringify(new_permissions),
                    new_group:new_group.id
                }

                console.log(body);

                try{
                    const response = await axios.post('http://192.168.1.88:11335/users',body);
                    if(response.data != undefined){
                        console.log(response.data);
                        setDisplayAddUser(false);
                        refresh();

                        toast_main.current?.show({
                            severity: 'success',
                            summary: '사용자 추가',
                            detail: '추가를 완료하였습니다',
                            life: 3000
                        });
                    }   
                }catch(err){
                    if(err.response.status == 409){
                        toast_main.current?.show({
                            severity: 'error',
                            summary: '사용자 추가',
                            detail: 'ID가 중복됩니다',
                            life: 3000
                        });
                    }else if(err.response.status == 400){
                        toast_main.current?.show({
                            severity: 'error',
                            summary: '사용자 추가',
                            detail: '항목을 모두 입력해주세요',
                            life: 3000
                        });
                    }
                }
            }
        }
        const editUser = async() =>{
            if(new_id == '' || new_passwd == '' || new_name == ''){
                toast_main.current?.show({
                    severity: 'error',
                    summary: '사용자 추가 실패',
                    detail: '항목을 기입하세요',
                    life: 3000
                });
            }else if(new_group == ''){
                toast_main.current?.show({
                    severity: 'error',
                    summary: '사용자 추가 실패',
                    detail: '그룹을 선택하세요',
                    life: 3000
                });
            }else{
                //add user
                const body = {
                    new_id: new_id,
                    new_passwd: new_passwd,
                    new_name: new_name,
                    new_permissions: JSON.stringify(new_permissions),
                    new_group:new_group.id
                }

                console.log(body);

                try{
                    const response = await axios.put('http://192.168.1.88:11335/users',body);
                    if(response.data != undefined){
                        console.log(response.data);
                        setDisplayAddUser(false);
                        refresh();

                        toast_main.current?.show({
                            severity: 'success',
                            summary: '사용자 수정',
                            detail: '수정을 완료하였습니다',
                            life: 3000
                        });
                    }   
                }catch(err){
                    if(err.response.status == 400){
                        toast_main.current?.show({
                            severity: 'error',
                            summary: '사용자 수정',
                            detail: '항목을 모두 입력해주세요',
                            life: 3000
                        });
                    }
                }
            }
        }
        const deleteUser = async() =>{

            try{
                const response = await axios.delete('http://192.168.1.88:11335/users/'+new_id);
                if(response.data != undefined){
                    console.log(response.data);
                    setDisplayAddUser(false);
                    refresh();

                    toast_main.current?.show({
                        severity: 'success',
                        summary: '사용자 삭제',
                        detail: '삭제를 완료하였습니다',
                        life: 3000
                    });
                }   
            }catch(err){
                toast_main.current?.show({
                    severity: 'error',
                    summary: '사용자 삭제',
                    life: 3000
                });
                
            }
        }
        const dialogheader = (
            <Toolbar
                end={<div >
                <Button visible={displayUserMode=="add"} label="추가" onClick={addUser} icon="pi pi-user" style={{ width: '10rem' }}></Button> 
                <Button visible={displayUserMode=="edit"} label="변경" onClick={editUser} icon="pi pi-user" style={{ width: '10rem' }}></Button> 
                <Button visible={displayUserMode=="edit"} label="삭제" onClick={deleteUser} icon="pi pi-user" style={{ width: '10rem' }}></Button> 
                </div>
                }>
            </Toolbar>
        )

        useEffect(() =>{
            if(displayUserMode == "add"){
            }else if(displayUserMode == "edit"){
                if(selectedUser){
                    setNew_id(selectedUser.id);
                    setNew_passwd(selectedUser.id);
                    setNew_name(selectedUser.name);
                    setNew_group(categories[selectedUser.parent_id-1]);
                    setNew_permissions(JSON.parse(selectedUser.permission));
                }
            }
        },[])
        return(
            <Dialog header={dialogheader} visible={displayAddUser} style={{ width: '60vw' }} modal onHide={() => setDisplayAddUser(false)}>
                <div className="col-12 md:col-6">
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="ID">ID</label>
                                <InputText id="ID" readOnly={displayUserMode=="edit"} value={new_id} onChange ={(e) => setNew_id(e.target.value)} type="text" />
                            </div>
                            <div className="field col">
                                <label htmlFor="Password">Password</label>
                                <InputText id="Password" value={new_passwd} onChange ={(e) => setNew_passwd(e.target.value)} type="text" />
                            </div>
                        </div>
                        <div className="field">
                            <label htmlFor="Name">Name</label>
                                <InputText id="Name" value={new_name} onChange ={(e) => setNew_name(e.target.value)} type="text" />
                        </div>
                        <div className="field">
                            <label htmlFor="Name">Group</label>
                            <Dropdown id="state" value={new_group} onChange={(e) => setNew_group(e.value)} options={categories} optionLabel="name" placeholder="Select One"></Dropdown>
                        </div>
                        <div className="field">
                            <label htmlFor="Name">Permission</label>
                            <div className="flex flex-wrap justify-content-center gap-3">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="ingredient1" name="admin" value="admin" onChange={onIngredientsChange} checked={new_permissions.includes('admin')} />
                                    <label htmlFor="ingredient1" className="ml-2">admin</label>
                                </div>
                                <div className="flex align-items-center">
                                    <Checkbox inputId="ingredient2" name="write" value="write" onChange={onIngredientsChange} checked={new_permissions.includes('admin')||new_permissions.includes('write')} />
                                    <label htmlFor="ingredient2" className="ml-2">write</label>
                                </div>
                                <div className="flex align-items-center">
                                    <Checkbox inputId="ingredient3" name="read" value="read" onChange={onIngredientsChange} checked={new_permissions.includes('admin')||new_permissions.includes('read')} />
                                    <label htmlFor="ingredient3" className="ml-2">read</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        )
    }
    const AddRobotDialog = () => {
        const [new_mac, setNew_mac] = useState('');
        const [new_name, setNew_name] = useState('');
        const [new_group, setNew_group] = useState('');
        const [new_types, setNew_types] = useState([]);
        
        const addRobot = async() =>{
            console.log(new_mac);
            if(new_mac == '' || new_name == ''){
                toast_main.current?.show({
                    severity: 'error',
                    summary: '로봇 추가 실패',
                    detail: '항목을 기입하세요',
                    life: 3000
                });
            }else if(new_group == ''){
                toast_main.current?.show({
                    severity: 'error',
                    summary: '로봇 추가 실패',
                    detail: '그룹을 선택하세요',
                    life: 3000
                });
            }else{
                //add user
                const body = {
                    mac: new_mac,
                    new_name: new_name,
                    new_types: JSON.stringify(new_types),
                    new_group:new_group.id
                }

                console.log(body);

                try{
                    const response = await axios.post('http://192.168.1.88:11335/robots',body);
                    if(response.data != undefined){
                        console.log(response.data);
                        setDisplayAddRobot(false);
                        refresh();

                        toast_main.current?.show({
                            severity: 'success',
                            summary: '로봇 추가',
                            detail: '추가를 완료하였습니다',
                            life: 3000
                        });
                    }   
                }catch(err){
                    if(err.response.status == 409){
                        toast_main.current?.show({
                            severity: 'error',
                            summary: '로봇 추가',
                            detail: 'MAC이 중복됩니다',
                            life: 3000
                        });
                    }else if(err.response.status == 400){
                        toast_main.current?.show({
                            severity: 'error',
                            summary: '로봇 추가',
                            detail: '항목을 모두 입력해주세요',
                            life: 3000
                        });
                    }
                }
            }
        }
        const deleteRobot = async() =>{
            try{
                const response = await axios.delete('http://192.168.1.88:11335/robots/'+new_mac);
                if(response.data != undefined){
                    console.log(response.data);
                    setDisplayAddRobot(false);
                    refresh();

                    toast_main.current?.show({
                        severity: 'success',
                        summary: '로봇 삭제',
                        detail: '삭제를 완료하였습니다',
                        life: 3000
                    });
                }   
            }catch(err){
                toast_main.current?.show({
                    severity: 'error',
                    summary: '로봇 삭제',
                    life: 3000
                });
            }
        }
        const dialogheader = (
            <Toolbar
                end={<div >
                <Button visible={displayRobotMode=="add"} label="추가" onClick={addRobot} icon="pi pi-user" style={{ width: '10rem' }}></Button> 
                {/* <Button visible={displayUserMode=="edit"} label="변경" onClick={editUser} icon="pi pi-user" style={{ width: '10rem' }}></Button>  */}
                <Button visible={displayRobotMode=="edit"} label="삭제" onClick={deleteRobot} icon="pi pi-user" style={{ width: '10rem' }}></Button> 
                </div>
                }>
            </Toolbar>
        )

        useEffect(() =>{
            if(displayRobotMode == "add"){
                if(selectedNewRobot){
                    setNew_mac(selectedNewRobot.mac);
                }
            }else if(displayRobotMode == "edit"){
                if(selectedRobot){
                    setNew_mac(selectedRobot.mac);
                    setNew_name(selectedRobot.name);
                    setNew_group(categories[selectedRobot.parent_id-1]);
                    setNew_types(JSON.parse(selectedRobot.types));
                }
            }
        },[])



        return(
            <Dialog header={dialogheader} visible={displayAddRobot} style={{ width: '60vw' }} modal onHide={() => setDisplayAddRobot(false)}>
                <div className="col-12 md:col-6">
                    <div className="card p-fluid">
                        <div className="field">
                                <label htmlFor="MAC">MAC</label>
                                <InputText id="MAC" readOnly={displayUserMode=="edit"} value={new_mac} onChange ={(e) => setNew_mac(e.target.value)} type="text" />
                        </div>
                        <div className="field">
                            <label htmlFor="Name">Name</label>
                                <InputText id="Name" value={new_name} onChange ={(e) => setNew_name(e.target.value)} type="text" />
                        </div>
                        <div className="field">
                            <label htmlFor="Name">Group</label>
                            <Dropdown id="state" value={new_group} onChange={(e) => setNew_group(e.value)} options={categories} optionLabel="name" placeholder="Select One"></Dropdown>
                        </div>
                        <div className="field">
                        </div>
                    </div>
                </div>
            </Dialog>
        )
    }

    const openStatusDialog = () =>{
        // StatusDialog.
    }

    const StatusDialog = () =>{
        const [status, setStatus] = useState({
            id:'0',
            power:{
                battery_out:'0'
            },
            date:''
        });
        const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);
        
        const readStatus = async() =>{
            try{
                console.log("readStatus");
                if(selectedRobot){
                    const response = await axios.get('http://192.168.1.88:11335/status/'+selectedRobot.id);
                    if(response.data != undefined){
                        setStatus({id:response.data.id, power:JSON.parse(response.data.power), date:response.data.date});
                    }   
                }
            }catch(error){
                console.error(error);
            }
        }
        const [id,setId] = useState();


        // const set = () =>{
        //     const intervalID = setInterval(readStatus,1000);
        //     return intervalID;
        // }

        const opened = async() =>{
            console.log("open!!!!!!!!!");
            setIntervalId(setInterval(readStatus,1000));
        }
        const closed = () =>{
            console.log("closed!!!!");
            setDisplayStatus(false);
            if(intervalId){
                console.log("clear");
                clearInterval(intervalId);
            }
        }

        return(
            <Dialog visible={displayStatus} style={{ width: '60vw' }} modal onShow={() => opened()} onHide={() => closed()}>
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="Name">ID</label>
                        <InputText id="Name" readOnly value={status.id} type="text" />
                </div>
                <div className="field">
                    <label htmlFor="Name">Battery</label>
                        <InputText id="Battert" readOnly value={status.power.battery_out} type="text" />
                </div>
                <div className="field">
                    <label htmlFor="Name">Date</label>
                        <InputText id="Battert" readOnly value={status.date} type="text" />
                </div>
            </div>
            </Dialog>
        );
    }
    return(
        <main>
            <Toast ref={toast_main}></Toast>
            <Toolbar 
                start={
                    <Button label="새로고침" icon="pi pi-refresh" onClick={refresh} style={{ marginRight: '.5em' }} severity="secondary"/>
                }
                end={<>
                    <Button label="로봇 추가" onClick={() => {setDisplayRobotMode("add");setDisplayAddRobot(true)}} icon="pi pi-user" style={{ width: '10rem' }}></Button> 
                    
                    <Button label="사용자 추가" onClick={() => {setDisplayUserMode("add");setDisplayAddUser(true)}} icon="pi pi-user" style={{ width: '10rem' }}></Button> 
                    <Button label="사용자 수정" disabled={selectedUser==null} onClick={() => {setDisplayUserMode("edit");setDisplayAddUser(true)}} icon="pi pi-user" style={{ width: '10rem' }}></Button>
                    {/* <Button label="사용자 수정" disabled={selectedUser==null} onClick={() => {setDisplayUserMode("edit");setDisplayAddUser(true)}} icon="pi pi-user" style={{ width: '10rem' }}></Button> */}
                   </>
                }>
            </Toolbar>
            <AddRobotDialog></AddRobotDialog>
            <AddUserDialog></AddUserDialog>
            <StatusDialog></StatusDialog>
        
            <div className="card grid w-full">
                <Tree value={categoriestree} selectionMode="single" selectionKeys={selectedCategory} onSelectionChange={(e) => changeCategory(e)} className="md:w-30rem" />
                <Divider layout="vertical" />
                <div className="card">
                    <TabView>
                        <TabPanel header="User" rightIcon="pi pi-user ml-2">
                            <DataTable className="md:w-70rem" value={users} selectionMode="single" selection={selectedUser!} 
                                onSelectionChange={(e) => setSelectedUser(e.value)} dataKey="id" tableStyle={{ minWidth: '50rem' }}>
                                <Column field="category" header="Category"></Column>
                                <Column field="id" header="UserID"></Column>
                                <Column field="name" header="Name"></Column>
                                <Column field="permission" header="Permissions"></Column>
                                <Column field="date" header="EditedDate"></Column>
                            </DataTable>
                        </TabPanel>
                        <TabPanel header="Robot" rightIcon="pi pi-android ml-2">
                            <DataTable className="md:w-70rem" value={robots} selectionMode="single" selection={selectedRobot!} 
                                onDoubleClick={(e) =>{selectedRobot?setDisplayStatus(true):{}}} onSelectionChange={(e) => {console.log(e.value);setSelectedRobot(e.value)}} dataKey="mac" tableStyle={{ minWidth: '50rem' }}>
                                <Column field="category" header="Category"></Column>
                                <Column field="mac" header="Mac"></Column>
                                <Column field="name" header="Name"></Column>
                                <Column field="type" header="Type"></Column>
                                <Column field="date" header="EditedDate"></Column>
                            </DataTable> 
                        </TabPanel>
                        <TabPanel header="New" rightIcon={<Badge value={new_con.length}></Badge>} disabled={new_con.length<1} >
                            <DataTable className="md:w-70rem" value={new_con} selectionMode="single" selection={selectedNewRobot!} 
                                onSelectionChange={(e) => setSelectedNewRobot(e.value)} dataKey="mac" tableStyle={{ minWidth: '50rem' }}>
                                <Column field="mac" header="Mac"></Column>
                                <Column field="author" header="Author"></Column>
                                <Column field="date" header="RequestDate"></Column>
                            </DataTable> 
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </main>
    );
}

export default List;