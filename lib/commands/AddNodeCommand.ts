import { Command } from "../Command.js";
import { NodePose } from "@/interface/canvas.js";
import * as THREE from "three";

class AddNodeCommand extends Command {
  type: string;
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
    this.redoFunc = redoFunc;
    this.undoFunc = undoFunc;
    this.object = object;
    this.nodePose = nodePose;
  }
  undo() {
    this.undoFunc(this.object);
  }
  redo() {
    this.redoFunc(this.object, this.nodePose);
  }
}

export { AddNodeCommand };
