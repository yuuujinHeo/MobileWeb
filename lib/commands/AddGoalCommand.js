import { Command } from "../Command.js";

class AddGoalCommand extends Command {
  constructor(redoFunc, undoFunc, object) {
    super();
    this.type = "AddGoalCommmand";
    this.redoFunc = redoFunc;
    this.undoFunc = undoFunc;
    this.object = object;

    // this.uuid = uuid;
  }
  undo() {
    this.undoFunc(this.object);
  }
  redo() {
    this.redoFunc(this.object);
  }
}

export { AddGoalCommand };
