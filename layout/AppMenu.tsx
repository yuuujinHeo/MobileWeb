/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { useDispatch, useSelector } from 'react-redux';
import { store, AppDispatch, RootState } from '../store/store';
import Link from 'next/link';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const User = useSelector((state: RootState) => state.user);

  const model: AppMenuItem[] = [
    {
      label: 'Home',
      items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }],
    },
    {
      label: 'Viewer',
      visible: User?.state != 'guest',
      items: [
        { label: 'State', icon: 'pi pi-fw pi-eye', to: '/state', badge: 'NEW' },
        { label: 'Map', icon: 'pi pi-fw pi-map', to: '/map', badge: 'NEW' },
        { label: 'MoveTest', icon: 'pi pi-fw pi-forward', to: '/move' },
        { label: 'Task', icon: 'pi pi-fw pi-sitemap', to: '/task' },
        { label: 'Run', icon: 'pi pi-fw pi-directions', to: '/run' },
      ],
    },
    {
      label: 'Setting',
      visible: User?.state != 'guest',
      items: [
        { label: 'Config', icon: 'pi pi-fw pi-sliders-h', to: '/setting' },
        { label: 'Update', icon: 'pi pi-fw pi-file-import', to: '/update' },
        { label: 'Network', icon: 'pi pi-fw pi-wifi', to: '/network' },
      ],
    },
  ];

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {model.map((item, i) => {
          return !item?.seperator ? (
            <AppMenuitem item={item} root={true} index={i} key={item.label} />
          ) : (
            <li className="menu-separator"></li>
          );
        })}
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
