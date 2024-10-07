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
import { Category, Category_Node, findNodeByKey } from '../list/interface';
import { Row } from 'primereact/row';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { TreeSelectChangeEvent } from 'primereact/treeselect';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';
import { TabView,TabPanel} from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { toPadding } from 'chart.js/dist/helpers/helpers.options';
import { Badge } from 'primereact/badge';
 
const Users: React.FC = () =>{
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
    
    useEffect(()=>{
        readCategory();
        readCategorytree();
        readUserList();
    },[])

    function refresh(){
        console.log("refresh : ",selectedCategory);
        if(selectedCategory){
            readRobotList(selectedCategory);
            readList(selectedCategory);
        }else{
            readList(0);
            readRobotList(0);
        }
        readUserList();
        setSelectedUser(null);
    }
    
    const changeCategory = async(e:TreeSelectionEvent) =>{
        setSelectedCategory(e.value);
        readList(findNodeByKey(categoriestree,e.value).id);
        readRobotList(findNodeByKey(categoriestree,e.value).id);
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
    const readUserList = async() =>{
        try{
            const response = await axios.get('http://192.168.1.88:11335/lists/1');
            console.log(response.data);
            setUsers(response.data);
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

    return(
        <main>
            <Toast ref={toast_main}></Toast>
            <Toolbar 
                start={
                    <Button label="새로고침" icon="pi pi-refresh" onClick={refresh} style={{ marginRight: '.5em' }} severity="secondary"/>
                }
                end={<>
                    <Button label="사용자 추가" onClick={() => {setDisplayUserMode("add");setDisplayAddUser(true)}} icon="pi pi-user" style={{ width: '10rem' }}></Button> 
                    <Button label="사용자 수정" disabled={selectedUser==null} onClick={() => {setDisplayUserMode("edit");setDisplayAddUser(true)}} icon="pi pi-user" style={{ width: '10rem' }}></Button>
                </>
                }>
            </Toolbar>

            <div className="card flex w-full">
                <Tree value={categoriestree} selectionMode="single" selectionKeys={selectedCategory} onSelectionChange={(e) => changeCategory(e)} className="md:w-30rem" />
                <Divider layout='vertical'/>
                <DataTable className="md:w-70rem" value={users} selectionMode="single" selection={selectedUser!} 
                    onSelectionChange={(e) => setSelectedUser(e.value)} dataKey="id" tableStyle={{ minWidth: '50rem' }}>
                    <Column field="category" header="Category"></Column>
                    <Column field="id" header="ID"></Column>
                    <Column field="avatar" header="Avatar"></Column>
                    <Column field="name" header="Name"></Column>
                    <Column field="permission" header="Permissions"></Column>
                    <Column field="date" header="EditedDate"></Column>
                </DataTable>
            </div>
        </main>
    );
}

export default Users;