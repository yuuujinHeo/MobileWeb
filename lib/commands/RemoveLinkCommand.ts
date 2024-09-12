import { Command } from "../Command";
import { COMMAND_TYPE } from "@/constants";
import * as THREE from "three";

class RemoveLinkCommand extends Command {
  undoFunc: (from: THREE.Object3D, to: THREE.Object3D) => void;
  redoFunc: (fromUUID: string, toNodeName: string) => void;
  from: THREE.Object3D;
  to: THREE.Object3D;
  constructor(
    undoFunc: (from: THREE.Object3D, to: THREE.Object3D) => void,
    redoFunc: (fromUUID: string, toNodeName: string) => void,
    from: THREE.Object3D,
    to: THREE.Object3D
  ) {
    super();
    this.undoFunc = undoFunc;
    this.redoFunc = redoFunc;
    this.from = from;
    this.to = to;
    this.type = COMMAND_TYPE.REMOVE_LINK;
  }
  undo() {
    this.undoFunc(this.from, this.to);
  }
  redo() {
    this.redoFunc(this.from.uuid, this.to.name);
  }
}

export { RemoveLinkCommand };
