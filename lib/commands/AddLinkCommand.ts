import { Command } from "../Command";
import { COMMAND_TYPE } from "@/constants";
import * as THREE from "three";

class AddLinkCommand extends Command {
  undoFunc: (fromUUID: string, toNodeName: string) => void;
  redoFunc: (from: THREE.Object3D, to: THREE.Object3D) => void;
  from: THREE.Object3D;
  to: THREE.Object3D;
  constructor(
    undoFunc: (fromUUID: string, toNodeName: string) => void,
    redoFunc: (from: THREE.Object3D, to: THREE.Object3D) => void,
    from: THREE.Object3D,
    to: THREE.Object3D
  ) {
    super();
    this.undoFunc = undoFunc;
    this.redoFunc = redoFunc;
    this.from = from;
    this.to = to;
    this.type = COMMAND_TYPE.LINK_NODES;
  }
  undo() {
    this.undoFunc(this.from.uuid, this.to.name);
  }
  redo() {
    this.redoFunc(this.from, this.to);
  }
}

export { AddLinkCommand };
