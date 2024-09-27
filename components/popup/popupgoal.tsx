import React from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataView } from 'primereact/dataview';

interface PopupProps {
  visible: boolean;
  lists: string[];
  setValue: React.Dispatch<React.SetStateAction<string>>;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const PopupGoal = React.memo<PopupProps>(
  ({ visible, lists, setValue, setVisible }) => {
    const renderListItem = (item: string) => {
      return (
        <div className="col-12 column w-full gap-2">
          <Button
            className="w-full"
            onClick={() => {
              setValue(item);
              setVisible(false);
            }}
            label={item}
          ></Button>
        </div>
      );
    };

    const itemTemplate = (item: any) => {
      if (!item) {
        return;
      }

      return renderListItem(item);
    };

    return (
      <Dialog
        header="Goal 리스트"
        style={{ width: '300px' }}
        visible={visible}
        onHide={() => setVisible(false)}
      >
        <DataView value={lists} itemTemplate={itemTemplate} />
      </Dialog>
    );
  }
);

export default PopupGoal;
