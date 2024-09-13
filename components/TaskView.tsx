"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import {
  Tree,
  TreeExpandedKeysType,
  TreeSelectionEvent,
} from "primereact/tree";
import { v4 as uuidv4 } from "uuid";
import { ScrollTop } from "primereact/scrolltop";
import { RootState } from "../store/store";
import { ScrollPanel } from "primereact/scrollpanel";
import axios from "axios";
import { Chip } from "primereact/chip";
import { TreeNode } from "primereact/treenode";
import { useSelector, useDispatch, useStore } from "react-redux";
import '@/app/(main)/run/style.scss';


const TaskView = () => {
    const taskState = useSelector((state: RootState) =>state.task);
    const Network = useSelector((state:RootState) => state.network);
    const toast = useRef<Toast | null>(null);
    const TreeRef = useRef<any>(null);
    const ScrollRef = useRef<any>(null);
    const [nodes, setNodes] = useState<TreeNode[]>([]);  
    const [expandedKeys, setExpandedKeys] = useState<TreeExpandedKeysType>({
        "0": true,
      });
      let node_num = 0;


    useEffect(()  =>{
        if(taskState.runningTaskName != ""){
            getNodes(taskState.runningTaskName);
        }
    },[taskState.runningTaskName])

    useEffect(() => {
        expandAll();
    }, [nodes]);

    useEffect(()  =>{
        if(taskState.running){
        toast.current?.show({
            severity: "success",
            summary: "Task Start",
            life: 2000,
        });
        }else{
        if(taskState.runningTaskName != ""){
            toast.current?.show({
            severity: "success",
            summary: "Task Done",
            life: 2000,
            });
        }
        }
    },[taskState.running])

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
    const expandAll = () => {
        let _expandedKeys = {};
    
        for (let node of nodes) {
          expandNode(node, _expandedKeys);
        }
        setExpandedKeys(_expandedKeys);
      };

      const expandNode = (node: TreeNode, _expandedKeys: TreeExpandedKeysType) => {
        if (node.children && node.children.length) {
          _expandedKeys[node.key as string] = true;
    
          for (let child of node.children) {
            expandNode(child, _expandedKeys);
          }
        }
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
    
    return (
        <main>
            <Toast ref={toast}></Toast>
            <ScrollPanel
                id="my-scroll-panel"
                ref={ScrollRef}
                className="tree-box w-full"
            >
                <Tree
                id="my-tree"
                className="custom-tree w-full"
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
          
        </main>
      );
};
export default TaskView;