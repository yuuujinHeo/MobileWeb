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

const PopupLoadTask = React.memo<PopupProps>(
  ({ visible, lists, setValue, setVisible }) => {
    const renderListItem = (item: string) => {
      return (
        <div className="col-12 p-md-3">
          <div className="product-item card">
            <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
              <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                <div className="grid gap-2 text-2xl font-bold text-900">
                  {item}
                </div>
                <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                  <Button
                    onClick={() => {
                      console.log('PopupLoadTask Select : ', item);
                      setValue(item);
                      setVisible(false);
                    }}
                  >
                    Select
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
        header="Task 리스트"
        style={{ width: '80%', maxWidth: '800px', minWidth: '400px' }}
        visible={visible}
        onHide={() => setVisible(false)}
      >
        <DataView value={lists} itemTemplate={itemTemplate} />
      </Dialog>
    );
  }
);

export default PopupLoadTask;
