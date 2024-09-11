import * as THREE from "three";

class Command {
  type: string;
  name: string;
  object: THREE.Object3D;

  constructor() {
    this.type = "";
    this.name = "";
  }

  undo() {}

  redo() {}

  toJSON() {
    const output = { type: "", name: "" };
    output.type = this.type;
    output.name = this.name;
    return output;
  }

  fromJSON(json) {
    this.type = json.type;
    this.name = json.name;
  }
}

export { Command };
