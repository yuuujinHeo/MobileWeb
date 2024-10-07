import React,{useEffect, useState, useRef} from 'react';
import { Panel } from 'primereact/panel';
import { InputText } from 'primereact/inputtext';
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Password } from 'primereact/password';
import { DataView } from "primereact/dataview";
import './style.scss';

interface PopupProps {
    visibleHidden: boolean;
    setVisibleHidden: React.Dispatch<React.SetStateAction<boolean>>;
    postLoginMaster: any
}

const PopupForce = React.memo<PopupProps>(({visibleHidden, setVisibleHidden, postLoginMaster}) => {
    const [password, setPassword] = useState('');
    
    useEffect(() =>{
        setPassword('');
    },[visibleHidden])
    
    useEffect(() => {
        if(password.length == 4){
            if(password == "2011"){
                //master login
                setVisibleHidden(false);
                postLoginMaster();
            }else{
                //failed
                setPassword('');
            }
        }
    },[password])

    const handleClick = (value: string | number) => {
        if (password.length < 4) {
            setPassword(password + value);
        }
    };

    const handleDelete = () => {
        setPassword(password.slice(0, -1));
    };

    const handleClear = () => {
        setPassword('');
    };
    return (
      <Dialog
        visible={visibleHidden}
        onHide={() => setVisibleHidden(false)}
      >
        <div className='password-main'>
            <div className="password-input">
                <Password value={password} readOnly className="password-box" />
            </div>
            <div className="pad-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Button
                        key={num}
                        label={String(num)}
                        className="pad-button-number"
                        onClick={() => handleClick(num)}
                        rounded
                    />
                ))}
                <Button icon="pi pi-trash" className="pad-button" onClick={handleClear} rounded/>
                <Button label="0" className="pad-button-number zero-button" onClick={() => handleClick(0)} rounded/>
            
                <Button icon="pi pi-delete-left" className="pad-button" onClick={handleDelete} rounded/>
            </div>
        </div>
      </Dialog>
    );
  });

  export default PopupForce;