/* eslint-disable @next/next/no-img-element */
'use client';
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { AppDispatch, RootState } from '@/store/store';
import { Toolbar } from 'primereact/toolbar';
import axios from 'axios';
import { ProgressSpinner } from 'primereact/progressspinner';
import { setUserProfile } from '@/store/userSlice';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import './style1.scss';
import { InputText } from 'primereact/inputtext';

const My: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [new_password, setNew_password] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [password2, setPassword2] = useState<string>('');
  const [type, setType] = useState<string>('icon');
  const [source, setSource] = useState<string>('pi pi-user');
  const dispatch = useDispatch<AppDispatch>();
  const User = useSelector((state: RootState) => state.user);
  const Network = useSelector((state: RootState) => state.network);

  useEffect(() => {
    console.log('My useEffect', User);
    setType(User.avatar);
    setName(User.user_name);
    if (User.avatar == 'icon') {
      setSource(User.source);
    } else {
      setSource(Network.monitor + User.source);
    }
  }, [User]);

  useEffect(() => {
    console.log('name : ', name);
  }, [name]);

  const getAvatar = () => {
    if (type == 'icon') {
      return (
        <Avatar
          icon={source || undefined}
          size="xlarge"
          shape="circle"
          className="profile-avatar p-mb-3"
        />
      );
    } else {
      return (
        <Avatar
          image={source || undefined}
          size="xlarge"
          shape="circle"
          className="profile-avatar p-mb-3"
        />
      );
    }
  };

  const onUpload = (e: FileUploadHandlerEvent) => {
    console.log('????????????????');
    setShowPopupLoading(true);
    const file = e.files[0];
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target?.result) {
        setType('image');
        setSource(event.target.result as string); // Save the base64 image data
      }
    };
    reader.readAsDataURL(file);
    setVisibleProfile(false);
    setShowPopupLoading(false);
  };

  const resetProfile = () => {
    setType(User.avatar);
    setName(User.user_name);
    if (User.avatar == 'icon') {
      setSource(User.source);
    } else {
      setSource(Network.monitor + User.source);
    }
    setNew_password('');
    setVisiblePassword(false);
    setPassword('');
    setPassword2('');
  };

  const saveProfile = async () => {
    try {
      console.log('saveProfile : ', type, source);

      const response = await axios.put(
        Network.monitor + '/user/' + User.user_id,
        {
          user_passwd: new_password,
          user_name: name,
          user_avatar: type,
          avatar_source: source,
        }
      );
      console.log(response.data);
      if (User.user_id == response.data.user_id) {
        dispatch(
          setUserProfile({
            user_name: response.data.user_name,
            avatar: response.data.user_avatar,
            source: response.data.avatar_source,
          })
        );
      }
    } catch (e) {
      console.error('saveProfile Error : ', e);
    }
  };

  const [visiblePassword, setVisiblePassword] = useState(false);
  const [availablePassword, setAvailablePassword] = useState(false);
  const [visibleProfile, setVisibleProfile] = useState(false);
  const savePassword = () => {
    setVisiblePassword(false);
    setNew_password(password);
  };
  const handlePasswordAgain = (e) => {
    if (password != '' && password == e.target.value) {
      setAvailablePassword(true);
    } else {
      setAvailablePassword(false);
    }
    setPassword2(e.target.value);
  };
  const showProfileEdit = () => {
    setVisibleProfile(true);
  };
  const setAvatarIcon = (icon) => {
    console.log('set Avatar Icon : ', icon);
    setType('icon');
    setSource(icon);
    setVisibleProfile(false);
  };

  const test = () => {
    console.log('select');
  };
  const [showPopupLoading, setShowPopupLoading] = useState(false);

  return (
    <div className="card">
      <Toolbar
        className="mb-5"
        center={
          <span style={{ fontSize: 24, fontWeight: 600 }}>계정 설정</span>
        }
        end={
          <>
            <Button
              label="reset"
              icon="pi pi-sync"
              onClick={resetProfile}
            ></Button>
            <Button
              label="save"
              icon="pi pi-save"
              className="ml-3"
              onClick={saveProfile}
            ></Button>
          </>
        }
      />
      <div className="flex flex-column align-items-center justify-items-center">
        <div className="flex align-items-center justify-items-center gap-8">
          <div className="avatar-wrapper" onClick={showProfileEdit}>
            {getAvatar()}
            <div className="avatar-overlay">
              <span>Edit</span>
            </div>
          </div>
          <Dialog
            header="프로필 이미지 변경"
            visible={visibleProfile}
            style={{ width: '30vw' }}
            onHide={() => setVisibleProfile(false)}
          >
            {showPopupLoading && <ProgressSpinner />}
            {!showPopupLoading && (
              <>
                <div className="flex">
                  {/* <p>변경할 프로필 아이콘 혹은 파일을 선택하세요</p> */}
                  <FileUpload
                    mode="basic"
                    accept="image/*"
                    maxFileSize={1000000}
                    auto
                    customUpload
                    onSelect={test}
                    uploadHandler={onUpload}
                    chooseLabel="Image File"
                    className="mt-5 w-full"
                  />
                </div>
                <Divider />
                <div className="flex align-content-center justify-content-center">
                  <div className="grid gap-3 w-full">
                    <Avatar
                      icon="pi pi-user"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-user')}
                    />
                    <Avatar
                      icon="pi pi-android"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-android')}
                    />
                    <Avatar
                      icon="pi pi-heart"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-heart')}
                    />
                    <Avatar
                      icon="pi pi-sun"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-sun')}
                    />
                    <Avatar
                      icon="pi pi-wrench"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-wrench')}
                    />
                    <Avatar
                      icon="pi pi-twitter"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-twitter')}
                    />
                    <Avatar
                      icon="pi pi-thumbs-up"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-thumbs-up')}
                    />
                    <Avatar
                      icon="pi pi-thumbs-down"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-thumbs-down')}
                    />
                    <Avatar
                      icon="pi pi-stopwatch"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-stopwatch')}
                    />
                    <Avatar
                      icon="pi pi-star"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-star')}
                    />
                    <Avatar
                      icon="pi pi-star-fill"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-star-fill')}
                    />
                    <Avatar
                      icon="pi pi-send"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-send')}
                    />
                    <Avatar
                      icon="pi pi-prime"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-prime')}
                    />
                    <Avatar
                      icon="pi pi-verified"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-verified')}
                    />
                    <Avatar
                      icon="pi pi-phone"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-phone')}
                    />
                    <Avatar
                      icon="pi pi-bitcoin"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-bitcoin')}
                    />
                    <Avatar
                      icon="pi pi-id-card"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-id-card')}
                    />
                    <Avatar
                      icon="pi pi-map"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-map')}
                    />
                    <Avatar
                      icon="pi pi-map-marker"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-map-marker')}
                    />
                    <Avatar
                      icon="pi pi-microsoft"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-microsoft')}
                    />
                    <Avatar
                      icon="pi pi-moon"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-moon')}
                    />
                    <Avatar
                      icon="pi pi-github"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-github')}
                    />
                    <Avatar
                      icon="pi pi-truck"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-truck')}
                    />
                    <Avatar
                      icon="pi pi-wallet"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-wallet')}
                    />
                    <Avatar
                      icon="pi pi-reddit"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-reddit')}
                    />
                    <Avatar
                      icon="pi pi-palette"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-palette')}
                    />
                    <Avatar
                      icon="pi pi-google"
                      shape="circle"
                      size="xlarge"
                      className="icon-template"
                      onClick={() => setAvatarIcon('pi pi-google')}
                    />
                  </div>
                </div>
              </>
            )}
          </Dialog>
          <div className="flex flex-column ">
            <label className="font-bold block mb-2">Name</label>
            <InputText
              value={name}
              type="text"
              onChange={(e) => setName(e.target.value)}
            ></InputText>
            <label className="font-bold block mb-2 mt-3">Password</label>
            {!visiblePassword && (
              <Button
                label="패스워드 변경"
                icon={new_password == '' ? '' : 'pi pi-check'}
                onClick={(e) => setVisiblePassword(true)}
              ></Button>
            )}
            {visiblePassword && (
              <>
                <div className="flex">
                  <div className="flex flex-column">
                    <InputText
                      value={password}
                      placeholder="새로운 비밀번호"
                      type="password"
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setNew_password('');
                      }}
                    ></InputText>
                    <InputText
                      className={availablePassword ? '' : 'p-invalid'}
                      value={password2}
                      placeholder="한번 더 입력해주세요"
                      type="password"
                      onChange={handlePasswordAgain}
                    ></InputText>
                  </div>
                  <Button
                    disabled={!availablePassword}
                    label="패스워드 변경"
                    onClick={savePassword}
                  ></Button>
                </div>
              </>
            )}
            {/* <FileUpload 
                            mode="basic" 
                            accept="image/*" 
                            maxFileSize={1000000} 
                            auto 
                            customUpload 
                            uploadHandler={onUpload} 
                            chooseLabel="Upload" 
                            className="mt-5 w-full"
                        /> */}
          </div>
        </div>
      </div>
      <Divider></Divider>
    </div>
  );
};

export default My;
