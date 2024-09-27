'use client';
import React, { useEffect, useContext, useRef, useState } from 'react';
import { SplitButton } from 'primereact/splitbutton';
import { Button } from 'primereact/button';
import axios from 'axios';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toolbar } from 'primereact/toolbar';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Toast } from 'primereact/toast';
import { MegaMenu } from 'primereact/megamenu';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import { SelectButton } from 'primereact/selectbutton';
import PopupGoal from '@/components/popup/popupgoal';
import { RadioButton } from 'primereact/radiobutton';
import PopupSave from '@/components/popup/popupsave';
import PopupLoadTask from '@/components/popup/popuploadtask';
import {
  Tree,
  TreeDragDropEvent,
  TreeExpandedKeysType,
  TreeSelectionEvent,
} from 'primereact/tree';
import { DataView } from 'primereact/dataview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { v4 as uuidv4 } from 'uuid';
import { Dialog } from 'primereact/dialog';
import { shallowEqual, useDispatch, useStore, useSelector } from 'react-redux';
import { selectStatus, StatusState } from '@/store/statusSlice';
import { getMobileAPIURL } from '../api/url';
import { TreeNode } from 'primereact/treenode';
import './style.scss';
import { MenuItem } from 'primereact/menuitem';
import { RootState, AppDispatch } from '@/store/store';
import { selectTask, updateEditTaskName } from '@/store/taskSlice';
import { isInteger } from 'formik';
import PopupProgramList from '@/components/popup/popupprograms';

const Move: React.FC = () => {
  //**************************************Redux
  const dispatch = useDispatch<AppDispatch>();
  const taskState = useSelector((state: RootState) => selectTask(state));
  const Connection = useSelector((state: RootState) => state.connection);
  const Network = useSelector((state: RootState) => state.network);
  const toast = useRef<Toast | null>(null);
  const store = useStore<RootState>();
  const Status = useRef<StatusState>();

  //**************************************Ref
  const TreeRef = useRef<any>(null);

  //**************************************State
  //task node
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [copiedNode, setCopiedNode] = useState<TreeNode | null>(null);
  const [selectNodeKey, setSelectNodeKey] = useState<string>('');
  const [selectNode, setSelectNode] = useState<TreeNode | null>();
  const [goalVisible, setGoalVisible] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [saveVisible, setSaveVisible] = useState(false);
  const [programVisible, setProgramVisible] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<TreeExpandedKeysType>({
    '0': true,
  });
  const [tasks, setTasks] = useState<string[]>([]);
  const [taskName, setTaskName] = useState('');

  const [selectMove, setSelectMove] = useState<string>('target');
  const [moveGoal, setMoveGoal] = useState<string>('');
  const [moveX, setMoveX] = useState<any>(0);
  const [moveY, setMoveY] = useState<any>(0);
  const [moveRZ, setMoveRZ] = useState<any>(0);
  const [movePreset, setMovePreset] = useState<any>(0);
  const [goals, setGoals] = useState<string[]>([]);

  const [modeRepeat, setModeRepeat] = useState<string>('number');
  const [repeatTime, setRepeatTime] = useState<any>(0);
  const [waitTime, setWaitTime] = useState<any>(0);

  const [subProgram, setSubProgram] = useState('');

  //socket node
  const socket_num = 4;
  const [socketMode, setSocketMode] = useState<string>('open');
  const [socketOpenIP, setSocketOpenIP] = useState<string>('');
  const [socketOpenPort, setSocketOpenPort] = useState<string>('');
  const [socketSendStr, setSocketSendStr] = useState<string>('');
  const [socketOpenVar, setSocketOpenVar] = useState<string>('');
  const [socketReadVar, setSocketReadVar] = useState<string>('');
  const [socketID, setSocketID] = useState<number>(0);

  //script 변수 모음
  interface variable {
    type: string;
    name: string;
    initValue: string | number | undefined | [];
  }
  const [listVariables, setListVaraibles] = useState<variable[]>([]);

  useEffect(() => {
    setSelectNodeKey('');
    setSelectNode(null);
  }, []);

  useEffect(() => {
    if (taskState.editTaskName != '') {
      getNodes(taskState.editTaskName);
    }
  }, [taskState.editTaskName]);

  useEffect(() => {
    const handleChange = () => {
      Status.current = store.getState().status;
    };
    const unsubscribe = store.subscribe(handleChange);
    return () => {
      unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
    };
  }, [store]);

  useEffect(() => {
    console.log('NETWORK RUN : ', Network);
    if (Network.mobile != '') {
      getTaskList();
    }
  }, [Network.mobile]);

  async function getTaskList() {
    try {
      const response = await axios.get(Network.mobile + '/task');
      console.log('getTask', response.data);
      setTasks(response.data);
    } catch (e) {
      console.error(e);
    }
  }

  const getcurPos = () => {
    setMoveX(Status.current?.pose.x);
    setMoveY(Status.current?.pose.y);
    setMoveRZ(Status.current?.pose.rz);
  };

  const openGoalList = () => {
    getGoals();
    setGoalVisible(true);
  };

  const getGoals = async () => {
    try {
      const response = await axios.get(
        Network.mobile + '/map/goal/' + Status.current?.state.map
      );
      console.log('getgoals:', response.data);
      setGoals(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  async function getNodes(name: string) {
    try {
      const response = await axios.get(Network.mobile + '/task/' + name);
      setTaskName(name);
      setNodes(makeNodes(response.data));
    } catch (e) {
      console.error(e);
    }
  }

  const handleDragDrop = (e: TreeDragDropEvent) => {
    if (
      e.dragNode.label == 'root' ||
      e.dragNode.label == 'begin' ||
      e.dragNode.label == 'end' ||
      e.dragNode.label == 'general_thread' ||
      e.dragNode.label == 'assign'
    ) {
      return;
    }

    const temp = cloneValue(nodes);
    temp['0'].children = e.value;

    if (e.dropNode == null) {
      if (findTreeParentNodeByKey(temp, e.dragNode.key).label == 'root') {
        console.log(e.dropIndex, nodes['0'].children?.length);
        if (e.dropIndex > 0 && e.dropIndex < nodes['0'].children?.length!) {
          setNodes(makeNodes(temp));
        }
      } else {
        if (e.dropIndex > 0 && e.dropIndex < nodes['0'].children?.length! - 1) {
          setNodes(makeNodes(temp));
        }
      }
    } else if (
      e.dropNode.label == 'repeat' ||
      e.dropNode.label == 'if' ||
      e.dropNode.label == 'else if' ||
      e.dropNode.label == 'folder'
    ) {
      setNodes(makeNodes(temp));
    } else if (e.dropNode.label == 'empty') {
      const parent = findTreeParentNodeByKey(temp, e.dropNode.key);
      parent.children.push(e.dragNode);
      setNodes(makeNodes(temp));
    } else if (e.dropNode.label == 'root') {
      if (findTreeParentNodeByKey(temp, e.dragNode.key).label == 'root') {
        if (e.dropIndex > 0 && e.dropIndex < nodes['0'].children?.length!) {
          setNodes(makeNodes(temp));
        }
      } else {
        if (e.dropIndex > 0 && e.dropIndex < nodes['0'].children?.length! - 1) {
          setNodes(makeNodes(temp));
        }
      }
    }
  };

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
    parentKey: string = '0'
  ): TreeNode[] => {
    return nodes.map((node, index) => {
      if (node.label == 'script' || node.label == 'assign') {
        node.icon = 'pi pi-fw pi-code';
      } else if (node.label == 'map') {
        node.icon = 'pi pi-fw pi-map';
      } else if (node.label == 'folder') {
        node.icon = 'pi pi-fw pi-folder';
      } else if (node.label == 'general_thread') {
        node.icon = 'pi pi-fw pi-replay';
      } else if (node.label == 'repeat') {
        node.icon = 'pi pi-fw pi-replay';
      } else if (node.label == 'move') {
        node.icon = 'pi pi-fw pi-forward';
      } else if (node.label == 'wait') {
        node.icon = 'pi pi-fw pi-hourglass';
      } else if (node.label!.includes('socket_func')) {
        node.icon = 'pi pi-fw pi-sitemap';
      } else if (node.label == 'subp') {
        node.icon = 'pi pi-fw pi-file';
      } else if (node.label == 'halt') {
        node.icon = 'pi pi-fw pi-ban';
      } else if (node.label == 'continue') {
        node.icon = 'pi pi-fw pi-forward';
      } else if (node.label == 'break') {
        node.icon = 'pi pi-fw pi-sign-out';
      } else if (
        node.label == 'if' ||
        node.label == 'else if' ||
        node.label == 'else'
      ) {
        node.icon = 'pi pi-fw pi-share-alt';
      }

      if (!node.key) {
        node.key = uuidv4();
      }

      if (
        node.label == 'if' ||
        node.label == 'else if' ||
        node.label == 'else' ||
        node.label == 'repeat' ||
        node.label == 'general_thread' ||
        node.label == 'folder'
      ) {
        if (node.children?.length == 0) {
          node.children.push({ key: uuidv4(), label: 'empty', children: [] });
        } else if (node.children?.length! > 1) {
          let new_child: TreeNode[] = [];
          node.children?.map((child, index) => {
            if (child.label != 'empty') {
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

  const handleSelect = async (e: TreeSelectionEvent) => {
    const node = findTreeNodeByKey(nodes, e.value as string);
    console.log(e.value, node, nodes);
    if (
      node.label == 'root' ||
      node.label == 'repeat' ||
      node.label == 'if' ||
      node.label == 'else if' ||
      node.label == 'folder' ||
      node.label == 'general_thread'
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
    setSelectNodeKey(e.value as string);

    if (node.label == 'repeat') {
      if (isInteger(node.data.split(' times')[0])) {
        setModeRepeat('number');
      } else {
        setModeRepeat('string');
      }
    } else if (node.label.includes('socket_func')) {
      setSocketID(node.label.split('_')[2]);
      if (node.data.includes('socket_open')) {
        setSocketMode('open');
        if (node.data.includes(' = ')) {
          setSocketOpenVar(node.data.split(' = ')[0]);
        } else {
          setSocketOpenVar('');
        }
        setSocketOpenIP(node.data.split('(')[1].split('"')[1]);
        setSocketReadVar('');
        setSocketOpenPort(node.data.split('(')[1].split(',')[1].split(')')[0]);
        setSocketSendStr('');
      } else if (node.data.includes('socket_send_string')) {
        setSocketMode('send');
        setSocketSendStr(node.data.split('(')[1].split(')')[0]);
        setSocketOpenVar('');
        setSocketReadVar('');
        setSocketOpenIP('');
        setSocketOpenPort('');
      } else if (node.data.includes('socket_read_string')) {
        setSocketMode('read');
        setSocketSendStr('');
        setSocketOpenVar('');
        setSocketReadVar(node.data.split(' = ')[0]);
        setSocketOpenIP('');
        setSocketOpenPort('');
      }
    }
    setSelectNode(node);
  };

  const setSelectNodeInfo = (node) => {
    if (node.label == 'move') {
      if (node.data.split(',').length > 2) {
        setSelectMove('target');
        setMoveX(node.data.split(',').length > 1 ? node.data.split(',')[0] : 0);
        setMoveY(node.data.split(',')[1] ? node.data.split(',')[1] : 0);
        setMoveRZ(node.data.split(',')[2] ? node.data.split(',')[2] : 0);
        setMovePreset(node.data.split(',')[3] ? node.data.split(',')[3] : 0);
      } else {
        setSelectMove('goal');
        setMoveGoal(node.data.split(',')[0]);
        setMoveX(0);
        setMoveY(0);
        setMoveRZ(0);
        setMovePreset(node.data.split(',')[1] ? node.data.split(',')[1] : 0);
      }
    } else if (node.label == 'wait') {
      setWaitTime(node.data.split(' sec')[0]);
    } else if (node.label == 'repeat') {
      setRepeatTime(node.data.split(' times')[0]);
    } else if (node.label == 'subp') {
      setSubProgram(node.data);
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
    setExpandedKeys({ '0': true });
  };

  const expandNode = (node: TreeNode, _expandedKeys: TreeExpandedKeysType) => {
    if (node.children && node.children.length) {
      _expandedKeys[node.key as string] = true;

      for (let child of node.children) {
        expandNode(child, _expandedKeys);
      }
    }
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

  const saveChange = () => {
    if (selectNode) {
      const changed = findTreeNodeByKey(nodes, selectNodeKey);

      if (selectNode?.label == 'move') {
        if (selectMove == 'target') {
          changed.data = moveX + ',' + moveY + ',' + moveRZ + ',' + movePreset;
        } else {
          changed.data = moveGoal + ',' + movePreset;
        }
      } else if (
        selectNode?.label == 'script' ||
        selectNode?.label == 'assign' ||
        selectNode?.label == 'if' ||
        selectNode?.label == 'else if' ||
        selectNode.label == 'folder'
      ) {
        changed.data = selectNode.data;
      } else if (selectNode?.label == 'wait') {
        changed.data = waitTime + ' sec';
      } else if (selectNode?.label == 'repeat') {
        changed.data = repeatTime + ' times';
      } else if (selectNode.label == 'subp') {
        changed.data = subProgram;
      } else if (selectNode.label?.includes('socket_func')) {
        let socket_str = '';
        if (socketMode == 'open') {
          if (socketOpenVar != '') {
            socket_str = socketOpenVar + ' = ';
          }
          socket_str += 'socket_open(';
          socket_str += '"' + socketOpenIP + '"' + ',';
          socket_str += socketOpenPort + ')';
        } else if (socketMode == 'read') {
          socket_str = socketReadVar + ' = ';
          socket_str += 'socket_read_string()';
        } else if (socketMode == 'send') {
          socket_str += 'socket_send_string(';
          socket_str += '' + socketSendStr + ')';
        }
        changed.data = socket_str;
        changed.label = 'socket_func_' + socketID;
      }
      setSelectNode(cloneValue(changed));
    }
  };

  const deleteSelect = () => {
    if (selectNode?.label == 'begin' || selectNode?.label == 'end') {
      return;
    }
    const parent = findTreeParentNodeByKey(nodes, selectNodeKey);
    const index = parent.children.findIndex(
      (child) => child.key == selectNodeKey
    );
    parent.children.splice(index, 1);
    if (
      parent.children.length == 0 &&
      (parent.label == 'folder' ||
        parent.label == 'general_thread' ||
        parent.label == 'if' ||
        parent.label == 'else if' ||
        parent.label == 'else' ||
        parent.label == 'repeat')
    ) {
      parent.children.push({ key: uuidv4(), label: 'empty', children: [] });
    }
    setSelectNode(null);
    setSelectNodeKey('');
    setNodes(cloneValue(nodes));
  };

  const copyNode = () => {
    setCopiedNode(cloneValueNewKey(selectNode));
  };

  var cloneValueNewKey = function cloneValueNewKey(value) {
    if (Array.isArray(value)) {
      return value.map(cloneValueNewKey);
    } else if (!!value && Object.getPrototypeOf(value) === Object.prototype) {
      var result = {};
      // Leave data property alone and clone children
      for (var v in value) {
        if (v === 'children') {
          result[v] = cloneValueNewKey(value[v]);
        } else if (v === 'key') {
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
        parent = findTreeNodeByKey(temp, '0');
      } else {
        parent = findTreeParentNodeByKey(temp['0'], selectNode.key);
      }
      if (selectNode?.label == 'empty') {
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
    parentKey: string = '0'
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
      if (name == undefined || name == '') {
        name = taskName;
      }
      saveChange();
      //copy and make nodes
      const new_nodes = unmakeNodes(nodes);

      //post
      await axios.post(Network.mobile + '/task/' + name, new_nodes);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Save Succeed',
      });
      // Task list update
      getTaskList();
    } catch (e) {
      console.error(e);

      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Save Failed',
      });
    }
  };

  const makeNewTask = () => {
    setTaskName('temp_12546a');
    // [TEMP]
    dispatch(updateEditTaskName(''));

    const newNode: TreeNode[] = [
      {
        key: '0',
        label: 'root',
        children: [
          { key: uuidv4(), label: 'begin', children: [] },
          { key: uuidv4(), label: 'end', children: [] },
        ],
      },
    ];

    setNodes(makeNodes(newNode));
  };

  const newTask = () => {
    if (taskName == '') {
      makeNewTask();
    } else {
      confirmDialog({
        message: '정말 현재 작업을 취소하고 새로 만드시겠습니까?',
        header: 'New Task',
        icon: 'pi pi-exclamation-triangle',
        accept: makeNewTask,
      });
    }
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
              onClick={() => setListVisible(true)}
            ></Button>
            <Chip
              label={taskName == 'temp_12546a' ? '새로 만드는 중' : taskName}
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
              disabled={taskName == ''}
              onClick={() =>
                taskName == 'temp_12546a'
                  ? setSaveVisible(true)
                  : saveTask(undefined)
              }
              model={[
                // {
                //   label: "업로드",
                //   icon: "pi pi-upload",
                //   command: () => {},
                // },
                {
                  label: '다른 이름으로 저장',
                  command: () => {
                    setSaveVisible(true);
                  },
                },
              ]}
            ></SplitButton>
          </React.Fragment>
        }
      ></Toolbar>
    );
  };

  const setEditTask = (task: string) => {
    dispatch(updateEditTaskName(task));
  };

  const save = (name: string) => {
    if (name.split('.').length > 1) {
      setTaskName(name);
      saveTask(name);
    } else {
      setTaskName(name + '.task');
      saveTask(name + '.task');
    }
  };

  const ToolPanel = () => {
    return (
      <Toolbar
        className="tool-tool"
        center={
          <div className="grid gap-5 align-item-center justify-content-center">
            <Button
              icon="pi pi-check"
              disabled={
                !selectNode ||
                selectNode.label == 'empty' ||
                selectNode.label == 'begin' ||
                selectNode.label == 'end'
              }
              label="적용"
              className="btn-tool"
              onClick={saveChange}
            ></Button>
            <Button
              icon="pi pi-eraser"
              disabled={
                !selectNode ||
                selectNode.label == 'empty' ||
                selectNode.label == 'begin' ||
                selectNode.label == 'end'
              }
              label="삭제"
              className="btn-tool"
              onClick={deleteSelect}
            ></Button>
            <Button
              icon="pi pi-clone"
              disabled={
                !selectNode ||
                selectNode.label == 'empty' ||
                selectNode.label == 'begin' ||
                selectNode.label == 'end'
              }
              label="복사"
              className="btn-tool"
              onClick={copyNode}
            ></Button>
            <Button
              disabled={copiedNode == null}
              icon="pi pi-clone"
              className="btn-tool"
              label="붙여넣기"
              onClick={pasteNode}
            ></Button>
          </div>
        }
      ></Toolbar>
    );
  };

  const AddPanel2 = () => {
    const menus = [
      {
        label: '기본',
        icon: 'pi pi-fw pi-forward',
        items: [
          [
            {
              label: '기본',
              items: [
                {
                  label: 'wait',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {
                    addNode('wait');
                  },
                },
                {
                  label: 'halt',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {},
                },
              ],
            },
          ],
          [
            {
              label: '그룹',
              items: [
                {
                  label: 'folder',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {},
                },
                {
                  label: 'subp',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {},
                },
              ],
            },
          ],
          [
            {
              label: '스크립트',
              items: [
                {
                  label: 'script',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {
                    addNode('script');
                  },
                },
              ],
            },
          ],
        ],
      },
      {
        label: '이동',
        icon: 'pi pi-fw pi-forward',
        items: [
          [
            {
              label: 'MOVE',
              items: [
                {
                  label: 'MoveTarget',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {
                    addNode('move');
                  },
                },
                {
                  label: 'MoveGoal',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {
                    addNode('move');
                  },
                },
              ],
            },
          ],
          [],
        ],
      },
      {
        label: '반복',
        icon: 'pi pi-fw pi-forward',
        items: [
          [
            {
              label: '반복형 루프',
              items: [
                {
                  label: 'repeat',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {
                    addNode('repeat');
                  },
                },
                {
                  label: 'general_thread',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {},
                },
              ],
            },
          ],
          [
            {
              label: '조건',
              items: [
                {
                  label: 'if',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {
                    addNode('if');
                  },
                },
                {
                  label: 'else if',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {
                    addNode('else if');
                  },
                },
                {
                  label: 'else',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {
                    addNode('else');
                  },
                },
              ],
            },
          ],
          [
            {
              label: '조건탈출',
              items: [
                {
                  label: 'break',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {},
                },
                {
                  label: 'continue',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {},
                },
              ],
            },
          ],
          [],
        ],
      },
      {
        label: '연결',
        icon: 'pi pi-fw pi-forward',
        items: [
          [
            {
              label: 'MOVE',
              items: [
                {
                  label: 'MoveTarget',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {},
                },
                {
                  label: 'MoveGoal',
                  icon: 'pi pi-fw pi-forward',
                  command: () => {},
                },
              ],
            },
          ],
          [],
        ],
      },
    ];
    return <MegaMenu model={menus} orientation="vertical" breakpoint="767px" />;
  };

  const AddPanel = () => {
    return (
      <div className="card tool-add">
        <ScrollPanel className="add-panel">
          {/* <Button
            label="wait"
            className="btn-add"
            onClick={(e) => addNode('wait')}
          /> */}
          {/* <Button
            label="repeat"
            className="btn-add"
            onClick={(e) => addNode('repeat')}
          /> */}
          {/* <Button
            label="script"
            className="btn-add"
            onClick={(e) => addNode('script')}
          /> */}
          {/* <Button
            label="move"
            className="btn-add"
            onClick={(e) => addNode('move')}
          /> */}
          {/* <Button
            label="if"
            className="btn-add"
            onClick={(e) => addNode('if')}
          />
          <Button
            label="else if"
            className="btn-add"
            disabled={
              selectNode?.label != 'if' && selectNode?.label != 'else if'
            }
            onClick={(e) => addNode('else if')}
          />
          <Button
            label="else"
            className="btn-add"
            disabled={
              selectNode?.label != 'if' && selectNode?.label != 'else if'
            }
            onClick={(e) => addNode('else')}
          /> */}
          {/* <Button
            label="break"
            className="btn-add"
            onClick={(e) => addNode('break')}
          />
          <Button
            label="continue"
            className="btn-add"
            onClick={(e) => addNode('continue')}
          /> */}
          <Button
            label="socket"
            className="btn-add"
            onClick={(e) => addNode('socket_func')}
          />
          {/* <Button
            label="folder"
            className="btn-add"
            onClick={(e) => addNode('folder')}
          /> */}
          {/* <Button
            label="subp"
            className="btn-add"
            onClick={(e) => addNode('subp')}
          />
          <Button
            label="halt"
            className="btn-add"
            onClick={(e) => addNode('halt')}
          /> */}
        </ScrollPanel>
      </div>
    );
  };

  const nodeTemplate = (node, options) => {
    let label;
    if (node.label == 'begin' || node.label == 'end') {
      label = (
        <>
          <b className={'custom-label-frame'}>{node.label}</b>{' '}
        </>
      );
    } else if (node.label == 'script') {
      label = (
        <>
          <b className={'custom-label'}>{node.label}</b>{' '}
        </>
      );
    } else if (node.label == 'empty') {
      label = (
        <>
          <b className={'custom-label-empty'}>{node.label}</b>{' '}
        </>
      );
    } else {
      label = (
        <>
          <b className={'custom-label'}>{node.label}</b>{' '}
          <b className="custom-data">{node.data}</b>
        </>
      );
    }
    return <span className="node-box">{label}</span>;
  };

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

  const insertNodeAt = (
    nodes: TreeNode[],
    path: number[],
    newNode: TreeNode
  ): TreeNode[] => {
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

  const makeNewNode = (label) => {
    if (label == 'wait') {
      return { key: uuidv4(), label: label, data: '1 sec', children: [] };
    } else if (label == 'repeat') {
      return { key: uuidv4(), label: label, data: '1 times', children: [] };
    } else if (label == 'if') {
      return { key: uuidv4(), label: label, data: 'true', children: [] };
    } else if (label == 'else if') {
      return { key: uuidv4(), label: label, data: 'true', children: [] };
    } else if (label == 'move') {
      return { key: uuidv4(), label: label, data: '0,0,0', children: [] };
    } else {
      return { key: uuidv4(), label: label, data: '', children: [] };
    }
  };

  const getIndex = (parent: TreeNode, key: string) => {
    if (parent.children) {
      parent.children.map((node, index) => {
        if (node.key == key) {
          return index;
        }
      });
    }
    return null;
  };

  const insertNode = (parent: TreeNode, key: string, newNode: TreeNode) => {
    if (parent.children) {
      const index = parent.children.findIndex((child) => child.key === key);
      if (index !== -1) {
        parent.children.splice(index + 1, 0, newNode);
      } else {
        parent.children.push(newNode);
      }
    }
  };

  const addNode = (label) => {
    let temp = cloneValue(nodes);
    let parent;
    let key;

    if (selectNode == null) {
      parent = findTreeNodeByKey(temp, '0');
    } else {
      parent = findTreeParentNodeByKey(temp['0'], selectNode.key);
    }

    const newNode = makeNewNode(label);

    if (selectNode?.label == 'empty') {
      parent.children.pop();
      parent.children.push(newNode);
    } else if (parent.label == 'root') {
      if (selectNode == null || selectNode.label == 'end') {
        parent.children.pop();
        const endNode = makeNewNode('end');
        const tempNode = newNode;
        parent.children.push(tempNode);
        parent.children.push(endNode);
      } else {
        insertNode(parent, selectNode.key as string, newNode);
      }
    } else {
      insertNode(parent, selectNode!.key as string, newNode);
    }

    let _expandedKeys = expandedKeys;
    _expandedKeys[newNode.key] = true;
    setExpandedKeys(_expandedKeys);

    setSelectNodeInfo(newNode);

    setNodes(makeNodes(temp));
    setSelectNodeKey(newNode.key as string);
    setSelectNode(newNode);
  };

  return (
    <main>
      <ConfirmDialog></ConfirmDialog>
      <PopupLoadTask
        visible={listVisible}
        lists={tasks}
        setValue={setEditTask}
        setVisible={setListVisible}
      ></PopupLoadTask>
      <PopupSave
        visible={saveVisible}
        setValue={save}
        setVisible={setSaveVisible}
      ></PopupSave>
      <PopupGoal
        visible={goalVisible}
        lists={goals}
        setValue={setMoveGoal}
        setVisible={setGoalVisible}
      ></PopupGoal>
      <PopupProgramList
        visible={programVisible}
        lists={tasks}
        setValue={setSubProgram}
        setVisible={setProgramVisible}
      />

      <Toast ref={toast}></Toast>
      <div className="main-box card flex flex-column align-items-center">
        <MainToolPanel></MainToolPanel>
        <div className="child-box2">
          <div className="child-box">
            <AddPanel2></AddPanel2>
            <ScrollPanel className="tree-box w-full">
              <Tree
                className="custom-tree w-full"
                ref={TreeRef}
                dragdropScope="root"
                nodeTemplate={nodeTemplate}
                onExpand={(e) => {
                  console.log(e);
                }}
                onToggle={(e) => setExpandedKeys(e.value)}
                selectionMode="single"
                expandedKeys={expandedKeys}
                selectionKeys={selectNodeKey}
                onDragDrop={handleDragDrop}
                onSelectionChange={handleSelect}
                value={nodes['0'] ? nodes['0'].children : []}
              ></Tree>
            </ScrollPanel>
            <div className="tool-box">
              <ToolPanel></ToolPanel>
              <div className="tool-detail card p-fluid">
                {/* <NamePanel></NamePanel> */}
                {selectNode?.label == 'script' && (
                  <div className="field ">
                    <label htmlFor="name3" className="font-bold">
                      Script
                    </label>
                    <InputTextarea
                      value={selectNode?.data}
                      autoResize
                      rows={5}
                      cols={30}
                      onChange={(e) =>
                        setSelectNode({ ...selectNode, data: e.target.value })
                      }
                    ></InputTextarea>
                  </div>
                )}
                {selectNode?.label == 'assign' && (
                  <div className="field ">
                    <label htmlFor="name3" className="font-bold">
                      Assign
                    </label>
                    <InputTextarea
                      value={selectNode?.data}
                      autoResize
                      rows={5}
                      cols={30}
                      onChange={(e) =>
                        setSelectNode({ ...selectNode, data: e.target.value })
                      }
                    ></InputTextarea>
                  </div>
                )}
                {selectNode?.label == 'folder' && (
                  <div className="field ">
                    <label htmlFor="name3" className="font-bold">
                      Folder Name
                    </label>
                    <InputText
                      value={selectNode.data}
                      onChange={(e) =>
                        setSelectNode({ ...selectNode, data: e.target.value })
                      }
                    ></InputText>
                  </div>
                )}
                {selectNode?.label!.includes('socket_func') && (
                  <div className="flex flex-column gap-3">
                    <label htmlFor="name3" className="font-bold">
                      Socket
                    </label>
                    <div>
                      <label htmlFor="username">num</label>
                      <InputNumber
                        value={socketID}
                        showButtons
                        min={0}
                        max={socket_num - 1}
                        onChange={(e) => setSocketID(e.value as number)}
                      />
                    </div>
                    <div>
                      <label htmlFor="username">Mode</label>
                      <SelectButton
                        value={socketMode}
                        onChange={(e) => setSocketMode(e.value)}
                        options={['open', 'send', 'read']}
                      ></SelectButton>
                    </div>
                    {socketMode == 'open' && (
                      <>
                        <div>
                          <label htmlFor="username">Variable</label>
                          <InputText
                            value={socketOpenVar}
                            onChange={(e) => setSocketOpenVar(e.target.value)}
                          ></InputText>
                        </div>
                        <div>
                          <label htmlFor="username">IP</label>
                          <InputText
                            value={socketOpenIP}
                            onChange={(e) => setSocketOpenIP(e.target.value)}
                          ></InputText>
                        </div>
                        <div>
                          <label htmlFor="username">Port</label>
                          <InputText
                            value={socketOpenPort}
                            onChange={(e) => setSocketOpenPort(e.target.value)}
                          ></InputText>
                        </div>
                      </>
                    )}
                    {socketMode == 'send' && (
                      <>
                        <div>
                          <label htmlFor="username">String</label>
                          <InputText
                            value={socketSendStr}
                            onChange={(e) => setSocketSendStr(e.target.value)}
                          ></InputText>
                        </div>
                      </>
                    )}
                    {socketMode == 'read' && (
                      <>
                        <div>
                          <label htmlFor="username">Variable</label>
                          <InputText
                            value={socketReadVar}
                            onChange={(e) => setSocketReadVar(e.target.value)}
                          ></InputText>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {selectNode?.label == 'wait' && (
                  <div className="field">
                    <label htmlFor="name3" className="font-bold">
                      Wait Time
                    </label>
                    <InputNumber
                      value={waitTime}
                      showButtons
                      min={0}
                      onChange={(e) => setWaitTime(e.value)}
                      suffix=" sec"
                      minFractionDigits={3}
                    ></InputNumber>
                  </div>
                )}
                {selectNode?.label == 'repeat' && (
                  <div className="field ">
                    <label htmlFor="name3" className="font-bold">
                      Repeat times
                    </label>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="flex align-items-center">
                        <RadioButton
                          inputId="ingredient1"
                          name="pizza"
                          value="number"
                          onChange={(e) => setModeRepeat(e.value)}
                          checked={modeRepeat === 'number'}
                        />
                        <label htmlFor="ingredient1" className="ml-2">
                          number
                        </label>
                      </div>
                      <div className="flex align-items-center">
                        <RadioButton
                          inputId="ingredient2"
                          name="pizza"
                          value="string"
                          onChange={(e) => setModeRepeat(e.value)}
                          checked={modeRepeat === 'string'}
                        />
                        <label htmlFor="ingredient2" className="ml-2">
                          string
                        </label>
                      </div>
                    </div>

                    {modeRepeat == 'number' && (
                      <>
                        <InputNumber
                          value={repeatTime}
                          showButtons
                          onChange={(e) => setRepeatTime(e.value)}
                          min={-1}
                          suffix=" times"
                          className="mb-3"
                        ></InputNumber>
                        * 무한루프 = -1 times
                      </>
                    )}
                    {modeRepeat == 'string' && (
                      <>
                        <InputText
                          value={repeatTime}
                          onChange={(e) => setRepeatTime(e.target.value)}
                          className="mb-3"
                        ></InputText>
                      </>
                    )}
                  </div>
                )}
                {selectNode?.label == 'if' && (
                  <div className="field">
                    <label htmlFor="name3" className="font-bold">
                      Conditions
                    </label>
                    <InputTextarea
                      value={selectNode?.data}
                      autoResize
                      onChange={(e) =>
                        setSelectNode({ ...selectNode, data: e.target.value })
                      }
                    ></InputTextarea>
                  </div>
                )}
                {selectNode?.label == 'else if' && (
                  <div className="field">
                    <label htmlFor="name3" className="font-bold">
                      Conditions
                    </label>
                    <InputTextarea
                      value={selectNode?.data}
                      autoResize
                      onChange={(e) =>
                        setSelectNode({ ...selectNode, data: e.target.value })
                      }
                    ></InputTextarea>
                  </div>
                )}
                {selectNode?.label == 'subp' && (
                  <div className="field">
                    <label htmlFor="name3" className="font-bold">
                      Sub Program
                    </label>
                    <InputText
                      value={subProgram}
                      onChange={(e) => setSubProgram(e.target.value)}
                    ></InputText>

                    <Button
                      label="목록 불러오기"
                      onClick={() => setProgramVisible(true)}
                    ></Button>
                  </div>
                )}
                {selectNode?.label == 'move' && (
                  <div className="p-fluid">
                    <div className="mb-3">
                      <SelectButton
                        value={selectMove}
                        onChange={(e) => setSelectMove(e.value)}
                        options={['target', 'goal']}
                      ></SelectButton>
                    </div>
                    {selectMove == 'target' && (
                      <div>
                        <div className="field">
                          <label
                            htmlFor="name3"
                            className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0"
                          >
                            X
                          </label>
                          <InputNumber
                            className="input_detail"
                            value={moveX}
                            onChange={(e) => setMoveX(e.value)}
                            suffix=" m"
                            minFractionDigits={3}
                          ></InputNumber>
                        </div>
                        <div className="field">
                          <label
                            htmlFor="name3"
                            className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0"
                          >
                            Y
                          </label>
                          <InputNumber
                            className="input_detail"
                            value={moveY}
                            onChange={(e) => setMoveY(e.value)}
                            suffix=" m"
                            minFractionDigits={3}
                          ></InputNumber>
                        </div>
                        <div className="field ">
                          <label
                            htmlFor="name3"
                            className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0"
                          >
                            RZ
                          </label>
                          <InputNumber
                            className="input_detail"
                            value={moveRZ}
                            onChange={(e) => setMoveRZ(e.value)}
                            suffix=" deg"
                          ></InputNumber>
                        </div>
                        <div className="field">
                          <label
                            htmlFor="name3"
                            className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0"
                          >
                            Preset
                          </label>
                          <InputNumber
                            className="input_detail"
                            min={0}
                            max={5}
                            showButtons
                            value={movePreset}
                            onChange={(e) => setMovePreset(e.value)}
                            suffix=""
                          ></InputNumber>
                        </div>
                        <Button
                          label="현재위치 가져오기"
                          onClick={getcurPos}
                        ></Button>
                      </div>
                    )}

                    {selectMove == 'goal' && (
                      <div>
                        <div className="field">
                          <label
                            htmlFor="name3"
                            className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0"
                          >
                            Goal
                          </label>
                          <InputText
                            value={moveGoal}
                            onChange={(e) => setMoveGoal(e.target.value)}
                          ></InputText>
                        </div>
                        <div className="field">
                          <label
                            htmlFor="name3"
                            className="font-bold w-3 col-12 mb-2 md:col-2 md:mb-0"
                          >
                            Preset
                          </label>
                          <InputNumber
                            className="input_detail"
                            min={0}
                            max={5}
                            showButtons
                            value={movePreset}
                            onChange={(e) => setMovePreset(e.value)}
                            suffix=""
                          ></InputNumber>
                        </div>
                        <Button
                          label="골 리스트"
                          onClick={openGoalList}
                        ></Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Move;
