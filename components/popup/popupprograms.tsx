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

const PopupProgramList = React.memo<PopupProps>(
  ({ visible, lists, setValue, setVisible }) => {
    const renderedLists = lists.map((list, index) => (
      <div key={index}>
        <Button
          style={{ width: '250px' }}
          label={list}
          severity="secondary"
          onClick={(e) => {
            setValue(list.split('.')[0]);
            setVisible(false);
          }}
        ></Button>
      </div>
    ));

    return (
      <Dialog
        header="Task 리스트"
        style={{ width: '300px' }}
        visible={visible}
        onHide={() => setVisible(false)}
      >
        <div className="flex flex-column align-items-center gap-2">
          {renderedLists}
        </div>
      </Dialog>
    );
  }
);

export default PopupProgramList;
