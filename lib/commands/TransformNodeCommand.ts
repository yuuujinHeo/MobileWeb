import { Command } from "../Command";
import { COMMAND_TYPE, SCALE_FACTOR } from "@/constants";
import * as THREE from "three";

class TransformNodeCommand extends Command {
  func: (target: THREE.Object3D, category: string, value: string) => void;
  target: THREE.Object3D;
  category: string;
  originValue: string;
  newValue: string;
  constructor(
    func: (target: THREE.Object3D, category: string, value: string) => void,
    target: THREE.Object3D,
    category: string,
    newValue: string
  ) {
    super();
    this.type = COMMAND_TYPE.TRANSFROM_CHANGE;
    this.func = func;
    this.target = target;
    this.category = category;
    if (category === "pose-x") {
      this.originValue = (target.position.x / SCALE_FACTOR).toString();
    } else if (category === "pose-y") {
      this.originValue = (target.position.y / SCALE_FACTOR).toString();
    } else if (category === "pose-rz") {
      this.originValue = target.rotation.z.toString();
    }
    this.newValue = newValue;
  }
  undo() {
    // updateProperty
    this.func(this.target, this.category, this.originValue);
  }
  redo() {
    // updateProperty
    this.func(this.target, this.category, this.newValue);
  }
}

export { TransformNodeCommand };
