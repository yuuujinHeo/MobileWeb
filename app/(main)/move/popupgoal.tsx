import React from 'react';
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { DataView } from "primereact/dataview";

interface PopupProps {
    goalVisible: boolean;
    goals: string[];
    setGoalID: React.Dispatch<React.SetStateAction<string>>;
    setGoalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const PopupGoal = React.memo<PopupProps>(({goalVisible, goals, setGoalID, setGoalVisible}) => {
    const renderListItem = (goal: string) => {
      return (
        <div className="col-12 column w-full gap-2">
          <Button
            className="w-full"
            onClick={() => {
              setGoalID(goal);
              setGoalVisible(false);
            }}
            label={goal}
          ></Button>
        </div>
      );
    };
  
    const itemTemplate = (task: any) => {
      if (!task) {
        return;
      }
  
      return renderListItem(task);
    };
  
    return (
      <Dialog
        header="Goal 리스트"
        style={{ width: "300px" }}
        visible={goalVisible}
        onHide={() => setGoalVisible(false)}
      >
        <DataView value={goals} itemTemplate={itemTemplate} />
      </Dialog>
    );
  });

  export default PopupGoal;