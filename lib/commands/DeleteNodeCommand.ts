import { Command } from "../Command";
import { NodePose } from "@/interface/canvas.js";
import { COMMAND_TYPE } from "@/constants";
import * as THREE from "three";

class DeleteNodeCommand extends Command {
  undoFunc: (
    object: THREE.Object3D,
    nodePose: NodePose,
    links: string[],
    links_from: string[]
  ) => void;
  redoFunc: (target: THREE.Object3D) => void;
  object: THREE.Object3D;
  nodePose: NodePose;
  links: string[];
  links_from: string[];
  constructor(
    undoFunc: (
      object: THREE.Object3D,
      nodePose: NodePose,
      links: string[],
      links_from: string[]
    ) => void,
    redoFunc: (target: THREE.Object3D) => void,
    object: THREE.Object3D,
    nodePose: NodePose
  ) {
    super();
    this.undoFunc = undoFunc;
    this.redoFunc = redoFunc;
    this.object = object;
    this.links = this.object.userData.links;
    this.links_from = this.object.userData.links_from;
    this.nodePose = nodePose;
    this.type = COMMAND_TYPE.DELETE_NODE;
  }
  undo() {
    // restoreNode
    this.undoFunc(this.object, this.nodePose, this.links, this.links_from);
  }
  redo() {
    // removeNode
    this.redoFunc(this.object);
  }
}

export { DeleteNodeCommand };
