import React from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataView } from 'primereact/dataview';
import './style.scss';

interface PopupProps {
  visibleLogin: boolean;
  setVisibleLogin: React.Dispatch<React.SetStateAction<boolean>>;
  postLoginForce;
}

const PopupForce = React.memo<PopupProps>(
  ({ visibleLogin, setVisibleLogin, postLoginForce }) => {
    const force = () => {
      setVisibleLogin(false);
      postLoginForce();
    };
    return (
      <Dialog
        header="중복 로그인"
        // style={{ width: "300px" }}
        visible={visibleLogin}
        onHide={() => setVisibleLogin(false)}
      >
        <div className="dialog-login">
          <p>이미 동일한 아이디로 다른 브라우저에서 로그인 중입니다</p>
          <p>다른 브라우저를 로그아웃하고 로그인 하시겠습니까?</p>
          <div className="select-row">
            <Button label="네" onClick={force}></Button>
            <Button
              label="아니요"
              onClick={(e) => setVisibleLogin(false)}
            ></Button>
          </div>
        </div>
      </Dialog>
    );
  }
);

export default PopupForce;
