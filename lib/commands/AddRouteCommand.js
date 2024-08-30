import { Command } from "../Command.js";

class AddRouteCommand extends Command {
  constructor(redoFunc, undoFunc, object) {
    super();
    this.type = "AddRouteCommmand";
    this.redoFunc = redoFunc;
    this.undoFunc = undoFunc;
    this.object = object;
  }
  undo() {
    this.undoFunc(this.object);
  }
  redo() {
    this.redoFunc(this.object);
  }
}

export { AddRouteCommand };
