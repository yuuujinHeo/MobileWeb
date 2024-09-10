import { Command } from "../Command";
import { COMMAND_TYPE } from "@/constants";
import * as THREE from "three";

class ChangeNameCommand extends Command {
  func: (target: THREE.Object3D, category: string, value: string) => void;
  target: THREE.Object3D;
  category: string;
  originName: string;
  newName: string;
  constructor(
    func: (target: THREE.Object3D, category: string, value: string) => void,
    target: THREE.Object3D,
    category: string,
    originName: string,
    newName: string
  ) {
    super();
    this.type = COMMAND_TYPE.CHANGE_NAME;
    this.func = func;
    this.target = target;
    this.category = category;
    this.originName = originName;
    this.newName = newName;
  }
  undo() {
    // updateProperty
    this.func(this.target, this.category, this.originName);
  }
  redo() {
    // updateProperty
    this.func(this.target, this.category, this.newName);
  }
}

export { ChangeNameCommand };
