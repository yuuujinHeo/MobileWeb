import { Command } from "../Command.js";

class AddGoalCommand extends Command {
  constructor(redoFunc, undoFunc, object, nodePose) {
    super();
    this.type = "AddGoalCommmand";
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

export { AddGoalCommand };
