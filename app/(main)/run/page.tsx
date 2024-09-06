"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import axios from "axios";
import { Toolbar } from "primereact/toolbar";
import { ScrollPanel } from "primereact/scrollpanel";
import { Toast } from "primereact/toast";
import {
  Tree,
  TreeExpandedKeysType,
  TreeSelectionEvent,
} from "primereact/tree";
import { DataView } from "primereact/dataview";
import { ScrollTop } from "primereact/scrolltop";
import { Chip } from "primereact/chip";
import { v4 as uuidv4 } from "uuid";
import { Dialog } from "primereact/dialog";
import { useSelector, useDispatch, useStore } from "react-redux";
import { StatusState } from "@/store/statusSlice";
import { RootState } from "../../../store/store";
import { TaskState } from "@/store/taskSlice";
import { getMobileAPIURL } from "../api/url";
import { TreeNode } from "primereact/treenode";
import { NetworkState } from "@/store/networkSlice";
import { ConnectionState } from "@/store/connectionSlice";
import emitter from "@/lib/eventBus";
import { selectTask, setTaskID, setTaskRunning, updateRunningTaskName } from "@/store/taskSlice";
import "./style.scss";

const Run: React.FC = () => {
  //**************************************Redux
  const dispatch = useDispatch();
  const taskState = useSelector((state: RootState) => selectTask(state));
  const Connection = useSelector((state:RootState) => state.connection);
  const Network = useSelector((state:RootState) => state.network);


  const store = useStore<RootState>();
  const Status = useRef<StatusState>();
  // const taskState = useRef<TaskState>();
  // const Connection = useRef<ConnectionState>();
  // const Network = useRef<NetworkState>();

  //**************************************Ref
  const ScrollRef = useRef<any>(null);
  const TreeRef = useRef<any>(null);
  const toast = useRef<Toast | null>(null);

  //**************************************State
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [listVisible, setListVisible] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<TreeExpandedKeysType>({
    "0": true,
  });
  const [tasks, setTasks] = useState<string[]>([]);

  useEffect(() => {
    const handleChange = () => {
      Status.current = store.getState().status;
      // console.log(Status.current?.state.map)
    };
    const unsubscribe = store.subscribe(handleChange);
    return () => {
      unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
    };
  }, [store.getState().status]);
  
  useEffect(() => {
    console.log("[] : ",Network?.mobile);
  }, []);

  useEffect(() => {
    console.log(taskState);
  },[taskState])

  useEffect(()  =>{
    if(taskState?.running){
      toast.current?.show({
        severity: "success",
        summary: "Task Start",
        life: 3000,
      });
    }else{
      if(taskState?.runningTaskName != ""){
        toast.current?.show({
          severity: "success",
          summary: "Task Done",
          life: 3000,
        });
      }
    }
  },[taskState?.running])

  useEffect(()  =>{
    if(taskState?.runningTaskName != ""){
      getNodes(taskState?.runningTaskName);
    }
  },[taskState?.runningTaskName])

  useEffect(() => {
    console.log("NETWORK RUN : ", Network)
    if (Network?.mobile != "") {
      getTaskList();
    }
  }, [Network?.mobile]);

  useEffect(() => {
    expandAll();
  }, [nodes]);

  async function getTaskList() {
    try {
      const response = await axios.get(Network?.mobile + "/task");
      setTasks(response.data);
    } catch (e) {
      console.error(e);
    }
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

      if (node.key != "0") node.key = node_num++;

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
        children: node.children ? makeNodes(node.children) : node.children,
      };
    });
  };

  const expandNode = (node: TreeNode, _expandedKeys: TreeExpandedKeysType) => {
    if (node.children && node.children.length) {
      _expandedKeys[node.key as string] = true;

      for (let child of node.children) {
        expandNode(child, _expandedKeys);
      }
    }
  };

  const openPopup = () => {
    setListVisible(true);
  };

  const playTask = async () => {
    try {
      if (taskState?.runningTaskName != "") {
        if (taskState?.running) {
          toast.current?.show({
            severity: "info",
            summary: "Already Playing",
            life: 3000,
          });
        } else {
          const response = await axios.get(Network?.mobile + "/task/load/" + taskState?.runningTaskName);
          if (response.data.result == "success") {
            // [TEMP]
            const response2 = await axios.get(Network?.mobile + "/task/run");
            // if (response2.data === "success"){
              // toast.current?.show({
              //   severity: "success",
              //   summary: "Task Start",
              //   life: 3000,
              // });
          } else {
            toast.current?.show({
              severity: "error",
              summary: "Load Fail",
              life: 3000,
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const stopTask = async () => {
    try {
      if (taskState?.runningTaskName != "") {
        if (taskState?.running) {
          const response = await axios.get(Network?.mobile + "/task/stop");
          // [TEMP]
          if (response.data === "success") {
            toast.current?.show({
              severity: "info",
              summary: "Task Stop",
              life: 3000,
            });
          }
        } else {
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const MainToolPanel = () => {
    return (
      <Toolbar
        className="tool-main"
        start={
          <React.Fragment>
            <Button
              icon="pi pi-folder-open"
              disabled={taskState?.running}
              onClick={openPopup}
              className="mr-2"
            ></Button>
            <Chip label={taskState?.runningTaskName as string}></Chip>
          </React.Fragment>
        }
        center={
          <React.Fragment>
            <Button
              className="mr-5"
              disabled={taskState?.runningTaskName==""||Connection?.task==false}
              icon={taskState?.running ? "pi pi-pause" : "pi pi-play"}
              onClick={playTask}
            />
            <Button
              icon="pi pi-stop"
              disabled={taskState?.runningTaskName==""||Connection?.task==false}
              onClick={stopTask}
            />
          </React.Fragment>
        }
        end={<React.Fragment></React.Fragment>}
      ></Toolbar>
    );
  };

  async function getNodes(name) {
    try {
      console.log("getNodes : ", Network?.mobile + "/task/" + name)
      const response = await axios.get(Network?.mobile + "/task/" + name);
      console.log("getNodes2 : ",Network?.mobile + "/task/" + name)
      console.log(response.data);
      node_num = 0;
      // setCurTask(name);

      setNodes(makeNodes(response.data));
    } catch (e) {
      console.error(e);
    }
  }

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
                      axios.get(Network?.mobile + "/task/load/" + task);
                      dispatch(updateRunningTaskName(task));
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
    return (
      <Dialog
        header="Task 리스트"
        style={{ width: "80%", maxWidth: "800px", minWidth: "400px" }}
        visible={listVisible}
        onHide={() => setListVisible(false)}
      >
        <DataView
          value={tasks}
          // layout={'list'}
          itemTemplate={itemTemplate}
          // header={header}
        />
      </Dialog>
    );
  };

  const nodeTemplate = (node, options) => {
    let label;
    if (node.label == "begin" || node.label == "end") {
      label = (
        <>
          <b className={"custom-label-frame"}>{node.label}</b>{" "}
        </>
      );
    } else if (node.label == "script") {
      label = (
        <>
          <b className={"custom-label"}>{node.label}</b>{" "}
        </>
      );
    } else if (node.label == "empty") {
      label = (
        <>
          <b className={"custom-label-empty"}>{node.label}</b>{" "}
        </>
      );
    } else {
      label = (
        <>
          <b className={"custom-label"}>{node.label}</b>{" "}
          <b className="custom-data">{node.data}</b>
        </>
      );
    }
    return <span className="node-box">{label}</span>;
  };

  const handleSelect = async (e: TreeSelectionEvent) => {
    console.log(e.value);
  };

  useEffect(() => {
    if (taskState?.taskID) {
      const offsetTop = parseInt(taskState.taskID) * 50;
      document.getElementById("my-tree")!.parentElement!.scrollTop = offsetTop;
    }
  }, [taskState?.taskID]);

  return (
    <main>
      <PopupLoad></PopupLoad>
      <Toast ref={toast}></Toast>
      <div className="main-box card flex flex-column align-items-center">
        <MainToolPanel></MainToolPanel>
        <div className="child-box2">
          <div className="child-box">
            <ScrollPanel
              id="my-scroll-panel"
              ref={ScrollRef}
              className="tree-box w-full"
            >
              <Tree
                id="my-tree"
                className="custom-tree w-full"
                onSelectionChange={handleSelect}
                ref={TreeRef}
                nodeTemplate={nodeTemplate}
                onExpand={(e) => {
                  console.log(e);
                }}
                dragdropScope="f"
                onToggle={(e) => {}}
                selectionMode="single"
                expandedKeys={expandedKeys}
                selectionKeys={taskState?.taskID}
                value={nodes["0"] ? nodes["0"].children : []}
              ></Tree>
              <ScrollTop
                target="parent"
                threshold={100}
                className="w-2rem h-2rem border-round bg-primary"
                icon="pi pi-arrow-up text-base"
              />
            </ScrollPanel>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Run;
