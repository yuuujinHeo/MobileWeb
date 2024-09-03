"use client";
import React, { useEffect, useContext, useRef, useState } from "react";
import { SplitButton } from "primereact/splitbutton";
import { Button } from "primereact/button";
import axios from "axios";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toolbar } from "primereact/toolbar";
import { ScrollPanel } from "primereact/scrollpanel";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import { SelectButton } from "primereact/selectbutton";
import {
  Tree,
  TreeDragDropEvent,
  TreeExpandedKeysType,
  TreeSelectionEvent,
} from "primereact/tree";
import { DataView } from "primereact/dataview";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { v4 as uuidv4 } from "uuid";
import { Dialog } from "primereact/dialog";
import { shallowEqual, useDispatch, useStore, useSelector } from "react-redux";
import { selectStatus, StatusState } from "@/store/statusSlice";
import { getMobileAPIURL } from "../api/url";
import { TreeNode } from "primereact/treenode";
import "./style.scss";
import { MenuItem } from "primereact/menuitem";
import { RootState, AppDispatch } from "@/store/store";
import { selectTask, updateEditTaskName } from "@/store/taskSlice";

const Move: React.FC = () =>{
    const dispatch = useDispatch<AppDispatch>();
    // const taskState = useSelector((state:RootState) => selectTask(state));   
    const [mobileURL, setMobileURL] = useState('');
    const toast = useRef<Toast | null>(null);

  const store = useStore<RootState>();
  const Status = useRef<StatusState>(store.getState().status);

  // [TEMP]
  const task = useSelector((state: RootState): any => state.task);
  const url = useRef<string | null>(null);

  const TreeRef = useRef<any>(null);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectNodeKey, setSelectNodeKey] = useState<string>('');
  const [selectNode, setSelectNode] = useState<TreeNode | null>();
  const [selectMove, setSelectMove] = useState<string>('target');

  const [listVisible, setListVisible] = useState(false);
  const [saveVisible, setSaveVisible] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<TreeExpandedKeysType>({'0': true});

  const [tasks, setTasks] = useState<string[]>([]);
  const [moveGoal, setMoveGoal] = useState<string>('');
  const [moveX, setMoveX] = useState<any>(0);
  const [moveY, setMoveY] = useState<any>(0);
  const [moveRZ, setMoveRZ] = useState<any>(0);
  const [movePreset, setMovePreset] = useState<any>(0);
  const [waitTime, setWaitTime] = useState<any>(0);
  const [repeatTime, setRepeatTime] = useState<any>(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [goalVisible, setGoalVisible] = useState(false);

  const [copiedNode, setCopiedNode] = useState<TreeNode | null>(null);

  const [taskName, setTaskName] = useState('');
    
    useEffect(()=>{
        setURL();
        setSelectNodeKey('');
        setSelectNode(null);
    },[])

    useEffect(()=>{
        console.log(mobileURL);
        if(mobileURL != ''){
            getTaskList();
            // getTaskName();
        }
    },[mobileURL])
    
    useEffect(()=>{
        console.log(selectNode);
    },[selectNode])

    useEffect(()=>{
        console.log("nodes = ",nodes);
    },[nodes])


    useEffect(() => {
      const handleChange = () => {
        Status.current = store.getState().status;
        // console.log(store.getState().status.state.map)
      };
      const unsubscribe = store.subscribe(handleChange);
      return () => {
        unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
      };
    }, [store]);

    async function setURL() {
      setMobileURL(await getMobileAPIURL());
  
      // [TEMP]
      url.current = await getMobileAPIURL();
      if (task.editTaskName !== "" && task.editTaskName !== undefined) {
        getNodes(task.editTaskName);
      }
    }
    
    // async function getTaskName() {
    //   try {
    //     const response = await axios.get(mobileURL + "/task/file");
    //     console.log("getTaskName", response.data);
    //     if(response.data != "" && response.data != "disconnect"){
    //       getNodes(response.data);
    //     }
    //   } catch (e) {
    //     console.error(e);
    //   }
    // }

    async function getTaskList() {
      try {
        const response = await axios.get(mobileURL + "/task");
        console.log("getTask", response.data);
        setTasks(response.data);
      } catch (e) {
        console.error(e);
      }
    }

    const getcurPos = () =>{
        setMoveX(Status.current.pose.x);
        setMoveY(Status.current.pose.y);
        setMoveRZ(Status.current.pose.rz);
    }

    const openGoalList = () =>{
        getGoals();
        setGoalVisible(true);
    }

    const PopupGoal = () =>{
      const renderListItem = (goal: string) => {
        return (
          <div className="col-12 column w-full gap-2">
              <Button 
                className='w-full' 
                onClick={()=>{
                  setMoveGoal(goal); 
                  setGoalVisible(false);
                  }
                } 
                label={goal}
              >
              </Button>
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
        <Dialog 
          header = 'Goal 리스트'
          style={{width: '300px'}}
          visible={goalVisible} 
          onHide={()=>setGoalVisible(false)}
        >
          <DataView 
            value={goals}
            itemTemplate={itemTemplate}
          />
        </Dialog>
      );
  }

  
    const getGoals = async () => {
      try {
        const response = await axios.get(
          mobileURL + "/map/goal/" + Status.current.state.map
        );
        console.log("getgoals:", response.data);
        setGoals(response.data);
      } catch (e) {
        console.error(e);
      }
    };
  

    async function getNodes(name) {
      try {
        const response = await axios.get(url.current + "/task/" + name);
        setTaskName(name);
        setNodes(makeNodes(response.data));
      } catch (e) {
        console.error(e);
      }
    }

    const handleDragDrop = (e:TreeDragDropEvent) =>{
      if(e.dragNode.label == "root" || e.dragNode.label == "begin" || e.dragNode.label == "end"){
          return;
      }

      const temp = cloneValue(nodes);
      temp['0'].children = e.value;

      console.log("drop:",e.dropNode);
      console.log("drag:",e.dragNode);
      if(e.dropNode == null){
        if(findTreeParentNodeByKey(temp, e.dragNode.key).label == "root"){
            console.log(e.dropIndex, nodes['0'].children?.length);
            if(e.dropIndex > 0 && e.dropIndex < nodes['0'].children?.length!){
                setNodes(makeNodes(temp));
            }
        }else{
            if(e.dropIndex > 0 && e.dropIndex < nodes['0'].children?.length! - 1){
                setNodes(makeNodes(temp));
            }
        }
      }else if(e.dropNode.label == "repeat" || e.dropNode.label == "if" || e.dropNode.label == "else if"){
          // setNodes(temp);
          setNodes(makeNodes(temp));
      }else if(e.dropNode.label == "empty"){
          const parent = findTreeParentNodeByKey(temp,e.dropNode.key);
          // parent.children.pop();
          parent.children.push(e.dragNode);
          setNodes(makeNodes(temp));
      }else if(e.dropNode.label == "root"){
        if(findTreeParentNodeByKey(temp, e.dragNode.key).label == "root"){
            if(e.dropIndex > 0 && e.dropIndex < nodes['0'].children?.length!){
                setNodes(makeNodes(temp));
            }
        }else{
            if(e.dropIndex > 0 && e.dropIndex < nodes['0'].children?.length! - 1){
                setNodes(makeNodes(temp));
            }
        }
      }
    }

    const updateKeys = (nodes: TreeNode[], parentKey: string = '0'): TreeNode[] => {
        return nodes;
    }



  function findTreeNodeByKey(treeNodes, key) {
    for (let node of treeNodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const foundNode = findTreeNodeByKey(node.children, key);
        if (foundNode) {
          return foundNode;
        }
      }
    }
    return null;
  }

  function findTreeParentNodeByKey(treeNodes, key) {
    // If treeNodes is an array, we need to iterate over it
    if (Array.isArray(treeNodes)) {
      for (let i = 0; i < treeNodes.length; i++) {
        const node = treeNodes[i];
        const result = findTreeParentNodeByKey(node, key);
        if (result) {
          return result;
        }
      }
      return null;
    }

    // For non-array nodes
    if (treeNodes.children) {
      for (const node of treeNodes.children) {
        if (node.key === key) {
          return treeNodes; // Found the node, return its parent
        }

        const foundNode = findTreeParentNodeByKey(node, key);
        if (foundNode) {
          return foundNode;
        }
      }
    }

    return null;
  }

  const makeNodes = (
    nodes: TreeNode[],
    parentKey: string = "0"
  ): TreeNode[] => {
    return nodes.map((node, index) => {
      if (node.label == "script") {
        node.icon = "pi pi-fw pi-code";
      } else if (node.label == "map") {
        node.icon = "pi pi-fw pi-map";
      } else if (node.label == "repeat") {
        node.icon = "pi pi-fw pi-replay";
      } else if (node.label == "move") {
        node.icon = "pi pi-fw pi-forward";
      } else if (node.label == "wait") {
        node.icon = "pi pi-fw pi-hourglass";
      }

      if (!node.key) {
        node.key = uuidv4();
      }

      if (
        node.label == "if" ||
        node.label == "else if" ||
        node.label == "else" ||
        node.label == "repeat"
      ) {
        if (node.children?.length == 0) {
          node.children.push({ key: uuidv4(), label: "empty", children: [] });
        } else if (node.children?.length! > 1) {
          let new_child: TreeNode[] = [];
          node.children?.map((child, index) => {
            if (child.label != "empty") {
              new_child.push(child);
            }
          });

          node.children = new_child;
        }
      }

      return {
        ...node,
        children: node.children
          ? makeNodes(node.children, node.key as string)
          : node.children,
      };
    });
  };

  function copyExpandedKey(
    treeNodes: TreeNode[],
    _expandedKeys: TreeExpandedKeysType
  ) {
    for (let node of treeNodes) {
      if (expandedKeys[node.key as string]) {
        _expandedKeys[node.key as string] = true;
      }
      if (node.children) {
        copyExpandedKey(node.children, _expandedKeys);
      }
    }
    return _expandedKeys;
  }

  const handleSelect = async (e: TreeSelectionEvent) => {
    const node = findTreeNodeByKey(nodes, e.value as string);
    console.log(e.value, node, nodes);
    if (
      node.label == "root" ||
      node.label == "repeat" ||
      node.label == "if" ||
      node.label == "else if"
    ) {
      let _expandedKeys = {};

      copyExpandedKey(nodes, _expandedKeys);

      if (_expandedKeys[e.value as string]) {
        // delete _expandedKeys[e.value as string]
      } else {
        _expandedKeys[e.value as string] = true;
      }
      setExpandedKeys(_expandedKeys);
    }

    setSelectNodeInfo(node);
    console.log("???", node, findTreeParentNodeByKey(nodes, node.key));
    setSelectNodeKey(e.value as string);
    setSelectNode(node);
  };

  const setSelectNodeInfo = (node) => {
    if (node.label == "move") {
      if (node.data.split(",").length > 2) {
        setSelectMove("target");
        setMoveX(node.data.split(",").length > 1 ? node.data.split(",")[0] : 0);
        setMoveY(node.data.split(",")[1] ? node.data.split(",")[1] : 0);
        setMoveRZ(node.data.split(",")[2] ? node.data.split(",")[2] : 0);
        setMovePreset(node.data.split(",")[3] ? node.data.split(",")[3] : 0);
      } else {
        setSelectMove("goal");
        setMoveGoal(node.data.split(",")[0]);
        setMoveX(0);
        setMoveY(0);
        setMoveRZ(0);
        setMovePreset(node.data.split(",")[1] ? node.data.split(",")[1] : 0);
      }
    } else if (node.label == "wait") {
      setWaitTime(node.data.split(" ")[0]);
    } else if (node.label == "repeat") {
      setRepeatTime(node.data.split(" ")[0]);
    }
  };

  const expandAll = () => {
    let _expandedKeys = {};

    for (let node of nodes) {
      expandNode(node, _expandedKeys);
    }

    setExpandedKeys(_expandedKeys);
  };

  const collapseAll = () => {
    setExpandedKeys({ "0": true });
  };

  const expandNode = (node: TreeNode, _expandedKeys: TreeExpandedKeysType) => {
    if (node.children && node.children.length) {
      _expandedKeys[node.key as string] = true;

      for (let child of node.children) {
        expandNode(child, _expandedKeys);
      }
    }
  };

  const saveChange = () => {
    if (selectNode) {
      const changed = findTreeNodeByKey(nodes, selectNodeKey);

      if (selectNode?.label == "move") {
        if (selectMove == "target") {
          changed.data = moveX + "," + moveY + "," + moveRZ + "," + movePreset;
        } else {
          changed.data = moveGoal + "," + movePreset;
        }
      } else if (
        selectNode?.label == "script" ||
        selectNode?.label == "if" ||
        selectNode?.label == "else if"
      ) {
        changed.data = selectNode.data;
      } else if (selectNode?.label == "wait") {
        changed.data = waitTime + " sec";
      } else if (selectNode?.label == "repeat") {
        changed.data = repeatTime + " times";
      }
      console.log(changed.data);
      setSelectNode(cloneValue(changed));
    }
  };

  const deleteSelect = () => {
    if (selectNode?.label == "begin" || selectNode?.label == "end") {
      return;
    }
    const parent = findTreeParentNodeByKey(nodes, selectNodeKey);
    const index = parent.children.findIndex(
      (child) => child.key == selectNodeKey
    );
    console.log(parent, index);
    parent.children.splice(index, 1);
    setSelectNode(null);
    setSelectNodeKey("");
    setNodes(cloneValue(nodes));
  };

  const copyNode = () => {
    let copyNode: TreeNode;

    setCopiedNode(cloneValueNewKey(selectNode));
  };

  var cloneValueNewKey = function cloneValueNewKey(value) {
    if (Array.isArray(value)) {
      return value.map(cloneValueNewKey);
    } else if (!!value && Object.getPrototypeOf(value) === Object.prototype) {
      var result = {};
      // Leave data property alone and clone children
      for (var v in value) {
        if (v === "children") {
          result[v] = cloneValueNewKey(value[v]);
        } else if (v === "key") {
          result[v] = uuidv4();
        } else {
          result[v] = value[v];
        }
      }
      return result;
    } else return value;
  };

  const pasteNode = () => {
    if (copiedNode) {
      let temp = cloneValue(nodes);
      let parent;
      let key;

      if (selectNode == null) {
        parent = findTreeNodeByKey(temp, "0");
      } else {
        parent = findTreeParentNodeByKey(temp["0"], selectNode.key);
      }
      if (selectNode?.label == "empty") {
        parent.children.pop();
        parent.children.push(copiedNode);
      } else {
        insertNode(parent, selectNode!.key as string, copiedNode);
      }

      let _expandedKeys = expandedKeys;
      expandNode(copiedNode, _expandedKeys);
      setExpandedKeys(_expandedKeys);

      setSelectNodeInfo(copiedNode);
      setNodes(makeNodes(temp));
      setSelectNodeKey(copiedNode.key as string);
      setSelectNode(copiedNode);
      setCopiedNode(null);
    }
  };

  const unmakeNodes = (
    nodes: TreeNode[],
    parentKey: string = "0"
  ): TreeNode[] => {
    return nodes.map((node, index) => {
      return {
        label: node.label,
        data: node.data,
        children: node.children
          ? unmakeNodes(node.children, node.key as string)
          : node.children,
      };
    });
  };

  const saveTask = async (name: string | undefined) => {
    try {
      if (name == undefined || name == "") {
        name = taskName;
      }
      saveChange();
      //copy and make nodes
      const new_nodes = unmakeNodes(nodes);

      //post
      await axios.post(mobileURL + "/task/" + name, new_nodes);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Save Succeed",
      });
      // Task list update
      getTaskList();
    } catch (e) {
      console.error(e);

      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Save Failed",
      });
    }
  };

  const makeNewTask = () => {
    setTaskName("temp_12546a");
    // [TEMP]
    dispatch(updateEditTaskName(""));

    const newNode: TreeNode[] = [
      {
        key: "0",
        label: "root",
        children: [
          { key: uuidv4(), label: "begin", children: [] },
          { key: uuidv4(), label: "end", children: [] },
        ],
      },
    ];

    setNodes(makeNodes(newNode));
  };

  useEffect(() => {
    console.log("node change : ", nodes);
  }, [nodes]);

  const newTask = () => {
    if (taskName == "") {
      makeNewTask();
    } else {
      confirmDialog({
        message: "정말 현재 작업을 취소하고 새로 만드시겠습니까?",
        header: "New Task",
        icon: "pi pi-exclamation-triangle",
        accept: makeNewTask,
      });
    }
  };
  const openSave = () => {
    console.log("openSave");
    setSaveVisible(true);
  };
  const openPopup = () => {
    console.log("?");
    setListVisible(true);
  };

  const MainToolPanel = () => {
    return (
      <Toolbar
        className="tool-main"
        start={
          <React.Fragment>
            <Button
              icon="pi pi-plus"
              className="mr-2"
              onClick={newTask}
            ></Button>
            <Button
              icon="pi pi-folder-open"
              className="mr-2"
              onClick={openPopup}
            ></Button>
            <Chip
              label={taskName == "temp_12546a" ? "새로 만드는 중" : taskName}
            ></Chip>
          </React.Fragment>
        }
        center={
          <React.Fragment>
            <Button
              type="button"
              className="mr-5"
              icon="pi pi-angle-double-down"
              label="토글 열기"
              onClick={expandAll}
            />
            <Button
              type="button"
              icon="pi pi-angle-double-up"
              label="토글 닫기"
              onClick={collapseAll}
            />
          </React.Fragment>
        }
        end={
          <React.Fragment>
            <SplitButton
              icon="pi pi-save"
              className="mr-2"
              label="저장"
              disabled={taskName == ""}
              onClick={() =>
                taskName == "temp_12546a" ? openSave() : saveTask(undefined)
              }
              model={[
                // {
                //   label: "업로드",
                //   icon: "pi pi-upload",
                //   command: () => {},
                // },
                {
                  label: "다른 이름으로 저장",
                  command: () => {
                    openSave();
                  },
                },
              ]}
            ></SplitButton>
          </React.Fragment>
        }
      ></Toolbar>
    );
  };

  //------------------------------------------------------------------------------------------------
  const PopupLoad = () => {
    const renderListItem = (task: string) => {
      return (
        <div className="col-12 p-md-3">
          <div className="product-item card">
            <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
              <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                <div className="grid gap-2 text-2xl font-bold text-900">
                  {task}
                </div>
                <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                  <Button
                    onClick={() => {
                      // [TEMP]
                      dispatch(updateEditTaskName(task));
                      getNodes(task);
                      setListVisible(false);
                    }}
                  >
                    Select
                  </Button>
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

  const PopupSave = () =>{
      const [newName, setNewName] = useState('');
      const save = async() =>{
          if(newName.split('.').length > 1){
              setTaskName(newName);
              saveTask(newName);
          }else{
              setTaskName(newName+".task");
              saveTask(newName+".task");
          }
          setSaveVisible(false);
      }
      return(
          <Dialog header='저장'
              visible={saveVisible} onHide={()=>setSaveVisible(false)}>
                  <InputText value={newName} onChange={(e) =>setNewName(e.target.value)}></InputText>
                  <Button label='저장' disabled={newName==''} onClick={save}></Button>
                  <Button label='취소' onClick={()=>setSaveVisible(false)}></Button>
              </Dialog>        
      );
  }

  const ToolPanel = () =>{
      return(<Toolbar className='tool-tool' center={
          <div className='grid gap-5 align-item-center justify-content-center'>
              {/* <Button icon="pi pi-save" className='w-4' label="save" onClick={saveTask}></Button> */}
              <Button icon="pi pi-check" disabled={!selectNode} label="적용" className='btn-tool' onClick={saveChange}></Button>
              <Button icon="pi pi-eraser" disabled={!selectNode}  label="삭제"  className='btn-tool' onClick={deleteSelect}></Button>
              <Button icon="pi pi-clone" disabled={!selectNode} label="복사"  className='btn-tool' onClick={copyNode}></Button>
              <Button disabled={copiedNode==null} icon="pi pi-clone"   className='btn-tool' label="붙여넣기" onClick={pasteNode}></Button>
          </div>
      }></Toolbar>);
  }

  const AddPanel = () =>{
      return(<Toolbar className='tool-add' center={
          <div className='column gap-3'>
              <div className="flex flex-wrap mb-4">
                  <Button label="wait" className='btn-add' onClick={(e) => addNode('wait')}/>
              </div>
              <div className="flex flex-wrap mb-4">
                  <Button label="repeat" className='btn-add' onClick={(e) => addNode('repeat')}/>
              </div>
              <div className="flex flex-wrap mb-4">
                  <Button label="script"  className='btn-add'  onClick={(e) => addNode('script')}/>
              </div>
              <div className="flex flex-wrap mb-4">
                  <Button label="move"  className='btn-add' onClick={(e) => addNode('move')}/>
              </div>
              <div className="flex flex-wrap mb-4">
                  <Button label="if"  className='btn-add'  onClick={(e) => addNode('if')}/>
              </div>
              <div className="flex flex-wrap mb-4">
                  <Button label="else if"  className='btn-add'  disabled={selectNode?.label != "if" && selectNode?.label != "else if"} onClick={(e) => addNode('else if')}/>
              </div>
              <div className="flex flex-wrap mb-4">
                  <Button label="else" className='btn-add'  disabled={selectNode?.label != "if" && selectNode?.label != "else if"}  onClick={(e) => addNode('else')}/>
              </div>
              <div className="flex flex-wrap mb-4">
                  <Button label="break"  className='btn-add'  onClick={(e) => addNode('break')}/>
              </div>
              <div className="flex flex-wrap mb-4">
                  <Button label="continue"  className='btn-add'  onClick={(e) => addNode('continue')}/>
              </div>
          </div>
      }></Toolbar>);
  }


  const NamePanel = () =>{
      let name = <>선택된 노드가 없습니다</>;
      if(selectNode!=undefined){
          name = <>{selectNode.label!}</>;

          if(selectNode.label == "root"){
          }else if(selectNode.label == "begin"){
          }else if(selectNode.label == "wait"){
          }else if(selectNode.label == "script"){
          }else if(selectNode.label == "repeat"){
          }else if(selectNode.label == "end"){
          }
      }

      return(name);
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
  
  var cloneValue = function cloneValue(value) {
      if (Array.isArray(value)) {
        return value.map(cloneValue);
      } else if (!!value && Object.getPrototypeOf(value) === Object.prototype) {
        var result = {};
  
        // Leave data property alone and clone children
        for (var key in value) {
          if (key !== 'data') {
            result[key] = cloneValue(value[key]);
          } else {
            result[key] = value[key];
          }
        }
        return result;
      } else return value;
    };

  const insertNodeAt = (nodes: TreeNode[], path: number[], newNode: TreeNode): TreeNode[] => {
      const updatedNodes = [...nodes];
      let currentNode: TreeNode = { children: updatedNodes };

      for (let i = 0; i < path.length - 1; i++) {
          currentNode = currentNode.children![path[i]];
      }

      const index = path[path.length - 1];
      if (currentNode.children) {
          currentNode.children.splice(index, 0, newNode);
      } else {
          currentNode.children = [newNode];
      }

      return updatedNodes;
  };

  const makeNewNode = (label) =>{
      if(label == "wait"){
          return({ key: uuidv4(), label: label, data: '1 sec', children: [] });
      }else if(label == "repeat"){
          return({ key: uuidv4(), label: label, data: '1 times', children: [] });
      }else if(label == "if"){
          return({ key: uuidv4(), label: label, data: 'true', children: [] });
      }else if(label == "else if"){
          return({ key: uuidv4(), label: label, data: 'true', children: [] });
      }else if(label == "move"){
          return({ key: uuidv4(), label: label, data: '0,0,0', children: [] });
      }else{
          return({ key: uuidv4(), label: label, data: '', children: [] });
      }
  }

  const getIndex = (parent:TreeNode,key:string) =>{
      if(parent.children){
          parent.children.map((node, index) =>{
              if(node.key == key){
                  return index;
              }
          })
      }
      return null;
  }

  const insertNode = (parent:TreeNode,key:string,newNode:TreeNode) =>{
      if(parent.children){
          const index = parent.children.findIndex(child => child.key === key);
          if(index !== -1){
              parent.children.splice(index+1, 0, newNode);
          }else{
              parent.children.push(newNode);
          }
      }
  }

  const addNode = (label) =>{
      let temp = cloneValue(nodes);
      let parent;
      let key;

      if(selectNode == null){
          parent =findTreeNodeByKey(temp,'0');
      }else{
          parent =findTreeParentNodeByKey(temp['0'],selectNode.key);
      }

      const newNode = makeNewNode(label);

      if(selectNode?.label == "empty"){
          parent.children.pop();
          parent.children.push(newNode);
      }else if(parent.label == "root"){
          if(selectNode == null || selectNode.label == "end"){
              parent.children.pop();
              const endNode = makeNewNode('end');
              const tempNode = newNode;
              parent.children.push(tempNode);
              parent.children.push(endNode);
          }else{
              insertNode(parent, selectNode.key as string, newNode);
          }
      }else{
          insertNode(parent, selectNode!.key as string, newNode);
      }
      

      let _expandedKeys = expandedKeys;
      _expandedKeys[newNode.key] = true;
      setExpandedKeys(_expandedKeys);

      setSelectNodeInfo(newNode);

      setNodes(makeNodes(temp));
      setSelectNodeKey(newNode.key as string);
      setSelectNode(newNode);
  }

  const menuItem: MenuItem[] = [
      {
          label: 'Edit',
      }
  ]

  return(
    <main>
      <ConfirmDialog></ConfirmDialog>
      <PopupLoad></PopupLoad>
      <PopupSave></PopupSave>
      <PopupGoal></PopupGoal>
      <Toast ref={toast}></Toast>
      <div className="main-box card flex flex-column align-items-center">
          <MainToolPanel ></MainToolPanel>
          <div className='child-box2'>
              <div className='child-box'>
              <AddPanel></AddPanel>
                  <ScrollPanel className='tree-box w-full'>
                      <Tree className='custom-tree w-full' ref={TreeRef} 
                      dragdropScope="root" nodeTemplate={nodeTemplate} 
                      onExpand={(e) =>{console.log(e)}} 
                      onToggle={(e) => setExpandedKeys(e.value)}  
                      selectionMode="single" expandedKeys={expandedKeys} 
                      selectionKeys={selectNodeKey} onDragDrop={handleDragDrop} 
                      onSelectionChange={handleSelect} 
                      value={nodes['0']?nodes['0'].children:[]}>
                      </Tree>
                  </ScrollPanel>
              <div className='tool-box'>
              <ToolPanel></ToolPanel>
              <div className='tool-detail card p-fluid'>
                  {/* <NamePanel></NamePanel> */}
                  {selectNode?.label=="script" &&
                      <div className='field '>
                          <label htmlFor="name3" className="font-bold">
                              Script
                          </label>
                      <InputTextarea value={selectNode?.data} autoResize rows={5} cols={30} onChange={(e) => setSelectNode({...selectNode,data:e.target.value})}></InputTextarea>
                      </div>
                  }
                  {selectNode?.label=="wait" &&
                      <div className='field'>
                          <label htmlFor="name3" className="font-bold">
                              Wait Time
                          </label>
                          <InputNumber value={waitTime} showButtons min={0} onChange={(e) =>setWaitTime(e.value)} suffix=" sec" minFractionDigits={3}></InputNumber>
                      </div>
                  }   
                  {selectNode?.label=="repeat" &&
                      <div className='field '>
                      <label htmlFor="name3" className="font-bold">
                          Repeat times
                      </label>
                      <InputNumber value={repeatTime} showButtons onChange={(e) =>setRepeatTime(e.value)} min={-1} suffix=" times" className='mb-3'></InputNumber>
                      
                      * 무한루프 = -1 times
                  </div>
                  }   
                  {selectNode?.label=="if" &&
                      <div className='field'>
                          <label htmlFor="name3" className="font-bold">
                              Conditions
                          </label>
                          <InputTextarea value={selectNode?.data} autoResize onChange={(e) => setSelectNode({...selectNode,data:e.target.value})}></InputTextarea>
                      </div>
                  }
                  {selectNode?.label=="else if" &&
                      <div className='field'>
                          <label htmlFor="name3" className="font-bold">
                              Conditions
                          </label>
                          <InputTextarea value={selectNode?.data} autoResize onChange={(e) => setSelectNode({...selectNode,data:e.target.value})}></InputTextarea>
                      </div>
                  }
                  {selectNode?.label=="move" &&
                      <div>
                          <div>
                              <SelectButton value={selectMove} onChange={(e) => setSelectMove(e.value)} options={['target','goal']}></SelectButton>
                          </div>
                          {selectMove == 'target' &&
                              <div className='card p-fluid'>
                                  <div className='field'>
                                      <label htmlFor="name3" className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0">
                                          X
                                      </label>
                                      <InputNumber className='input_detail'  value={moveX} onChange={(e) => setMoveX(e.value)} suffix=" m" minFractionDigits={3}></InputNumber>
                                      
                                  </div>
                                  <div className='field'>
                                      <label htmlFor="name3" className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0">
                                          Y
                                      </label>
                                      <InputNumber className='input_detail' value={moveY} onChange={(e) => setMoveY(e.value)} suffix=" m" minFractionDigits={3}></InputNumber>
                                      
                                  </div>
                                  <div className='field '>
                                      <label htmlFor="name3" className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0">
                                          RZ
                                      </label>
                                      <InputNumber className='input_detail'  value={moveRZ} onChange={(e) => setMoveRZ(e.value)} suffix=" deg"></InputNumber>
                                  </div>
                                  <div className='field'>
                                      <label htmlFor="name3" className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0">
                                          Preset
                                      </label>
                                      <InputNumber className='input_detail' min={0} max={5} showButtons value={movePreset} onChange={(e) => setMovePreset(e.value)} suffix=""></InputNumber>
                                  </div>
                                  <Button label='현재위치 가져오기' onClick={getcurPos}></Button>
                              </div>
                          }
                          
                          {selectMove == 'goal' &&
                              <div className='card'>
                                  <div className='field'>
                                      <label htmlFor="name3" className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0">
                                          Goal
                                      </label>
                                      <InputText value={moveGoal} onChange={(e) => setMoveGoal(e.target.value)}></InputText>
                                  </div>
                                  <div className='field'>
                                      <label htmlFor="name3" className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0">
                                          Preset
                                      </label>
                                      <InputNumber className='input_detail' min={0} max={5} showButtons value={movePreset} onChange={(e) => setMovePreset(e.value)} suffix=""></InputNumber>
                                  </div>
                                  <Button  label='골 리스트' onClick={openGoalList}></Button>
                              </div>
                          }
                      </div>
                  }
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Move;
