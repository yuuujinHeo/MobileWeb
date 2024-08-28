class Command {
  constructor() {
    // this.id = -1;
    // this.inMemory = false;
    // this.updatable = false;
    this.type = "";
    this.name = "";
    this.object = undefined;
    // this.editor = editor;
  }

  undo() {}
  redo() {}

  toJSON() {
    const output = {};
    output.type = this.type;
    output.id = this.id;
    output.name = this.name;
    return output;
  }

  fromJSON(json) {
    this.inMemory = true;
    this.type = json.type;
    this.id = json.id;
    this.name = json.name;
  }
}

export { Command };
