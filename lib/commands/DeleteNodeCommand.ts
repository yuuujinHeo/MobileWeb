import { Command } from "../Command.js";
import { NodePose } from "@/interface/canvas.js";
import * as THREE from "three";

class DeleteNodeCommand extends Command {
  undoFunc: (object: THREE.Object3D, nodePose: NodePose) => void;
  // redoFunc: (object: THREE.Object3D, nodePose: NodePose) => void;
  redoFunc: undefined;
  object: THREE.Object3D;
  nodePose: NodePose;
  constructor(
    undoFunc: (object: THREE.Object3D, nodePose: NodePose) => void,
    redoFunc,
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
    this.undoFunc(this.object, this.nodePose);
  }
  redo() {
    // this.redoFunc(this.object, this.nodePose);
  }
}

export { DeleteNodeCommand };
