import { Command } from '../Command';
import { COMMAND_TYPE } from '@/constants';
import * as THREE from 'three';

class AddLinkCommand extends Command {
  undoFunc: (fromUUID: string, toNodeName: string) => void;
  redoFunc: (from: THREE.Object3D, to: THREE.Object3D) => void;
  from: THREE.Object3D;
  to: THREE.Object3D;
  isBidirectional: boolean;
  constructor(
    undoFunc: (fromUUID: string, toNodeName: string) => void,
    redoFunc: (from: THREE.Object3D, to: THREE.Object3D) => void,
    from: THREE.Object3D,
    to: THREE.Object3D,
    isBidirectional: boolean = false
  ) {
    super();
    this.undoFunc = undoFunc;
    this.redoFunc = redoFunc;
    this.from = from;
    this.to = to;
    this.type = COMMAND_TYPE.LINK_NODES;
    this.isBidirectional = isBidirectional;
  }
  undo() {
    this.undoFunc(this.from.uuid, this.to.name);
    if (this.isBidirectional) {
      this.undoFunc(this.to.uuid, this.from.name);
    }
  }
  redo() {
    this.redoFunc(this.from, this.to);
    if (this.isBidirectional) {
      this.redoFunc(this.to, this.from);
    }
  }
}

export { AddLinkCommand };
