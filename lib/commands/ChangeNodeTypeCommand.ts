import { Command } from "../Command";
import { COMMAND_TYPE, NODE_TYPE } from "@/constants";
import * as THREE from "three";

class ChangeNodeTypeCommand extends Command {
  func: (value: string) => void;
  target: THREE.Object3D;
  category: string;
  newValue: string;
  originValue: string;
  constructor(
    func: (value: string) => void,
    // target: THREE.Object3D,
    // category: string,
    newValue: string
  ) {
    super();
    this.type = COMMAND_TYPE.CHANGE_NODE_TYPE;
    this.func = func;
    // this.target = target;
    // this.category = category;
    this.newValue = newValue;
    // this.originValue = target.userData.type;
    if (newValue === NODE_TYPE.GOAL) {
      this.originValue = NODE_TYPE.ROUTE;
    } else {
      this.originValue = NODE_TYPE.GOAL;
    }
  }
  undo() {
    // undoChangeNodeType
    this.func(this.originValue);
  }
  redo() {
    this.func(this.newValue);
  }
}

export { ChangeNodeTypeCommand };
