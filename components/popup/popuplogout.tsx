import React from 'react';
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { DataView } from "primereact/dataview";
import './style.scss';

interface PopupProps {
    visibleLogout: boolean;
    setVisibleLogout: React.Dispatch<React.SetStateAction<boolean>>;
    state: string;
    logout;
}

const PopupLogout = React.memo<PopupProps>(({visibleLogout, state, setVisibleLogout, logout}) => {
    const confirm = () =>{
      setVisibleLogout(false);
      logout("");
    }  
  return (
      <Dialog
        header="로그아웃"
        visible={visibleLogout}
        onHide={() => {
          setVisibleLogout(false);
        }}
      >
      {state=="force" &&
        <div className='dialog-login'>
            <p>다른 브라우저에서 강제로 로그인 했습니다</p>
            <p>현재 브라우저에서는 로그아웃 됩니다</p>
            <div className='select-row'>
                <Button label="확인" onClick={confirm}></Button>
            </div>
        </div>
      }
      {state=="timeout" &&
        <div className='dialog-login'>
            <p>접속시간이 경과되었습니다</p>
            <p>현재 브라우저에서는 로그아웃 됩니다</p>
            <div className='select-row'>
                <Button label="확인" onClick={confirm}></Button>
            </div>
        </div>
      }
      </Dialog>
    );
  });

  export default PopupLogout;