import { Command } from "../Command";
import { NodePose } from "@/interface/canvas.js";
import { COMMAND_TYPE } from "@/constants";
import * as THREE from "three";

class AddNodeCommand extends Command {
  undoFunc: (object: THREE.Object3D) => void;
  redoFunc: (object: THREE.Object3D, nodePose: NodePose) => void;
  object: THREE.Object3D;
  nodePose: NodePose;
  constructor(
    undoFunc: (object: THREE.Object3D) => void,
    redoFunc: (object: THREE.Object3D, nodepose: NodePose) => void,
    object: THREE.Object3D,
    nodePose: NodePose
  ) {
    super();
    this.undoFunc = undoFunc;
    this.redoFunc = redoFunc;
    this.object = object;
    this.nodePose = nodePose;
    this.type = COMMAND_TYPE.ADD_NODE;
  }
  undo() {
    this.undoFunc(this.object);
  }
  redo() {
    this.redoFunc(this.object, this.nodePose);
  }
}

export { AddNodeCommand };
