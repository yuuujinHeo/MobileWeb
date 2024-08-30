import { Command } from "../Command.js";

class AddRouteCommand extends Command {
  constructor(undoFunc, redoFunc, object, nodePose) {
    super();
    this.type = "AddRouteCommmand";
    this.redoFunc = redoFunc;
    this.undoFunc = undoFunc;
    this.object = object;
    this.nodePose = nodePose;
  }
  undo() {
    this.undoFunc(this.object);
  }
  redo() {
    this.redoFunc(this.object, this.nodePose);
  }
}

export { AddRouteCommand };
