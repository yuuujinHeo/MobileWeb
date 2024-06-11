/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Viewer',
            items: [
                { label: 'State', icon: 'pi pi-fw pi-eye', to: '/blocks', badge: 'NEW' },
                { label: 'Map', icon: 'pi pi-fw pi-map', to: '/map', badge: 'NEW' }
            ]
        },
        {
            label: 'Setting',
            items: [
                { label: 'Config', icon: 'pi pi-fw pi-sliders-h', to: '/setting' },
                { label: 'Update', icon: 'pi pi-fw pi-file-import', to: '/update' }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
