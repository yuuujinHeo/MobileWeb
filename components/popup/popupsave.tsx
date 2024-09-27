import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { DataView } from 'primereact/dataview';

interface PopupProps {
  visible: boolean;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const PopupSave = React.memo<PopupProps>(
  ({ visible, setValue, setVisible }) => {
    const [newName, setNewName] = useState('');

    const save = () => {
      setValue(newName);
      setVisible(false);
    };

    return (
      <Dialog header="저장" visible={visible} onHide={() => setVisible(false)}>
        <InputText
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        ></InputText>
        <Button label="저장" disabled={newName == ''} onClick={save}></Button>
        <Button label="취소" onClick={() => setVisible(false)}></Button>
      </Dialog>
    );
  }
);

export default PopupSave;
