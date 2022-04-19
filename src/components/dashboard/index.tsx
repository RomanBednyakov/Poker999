import React, {useState} from 'react';

import {getLocalStorageItem} from '../../utils/localStorage';
import { LIST_PAGES} from '../../moks';
import {ItemType} from "../../types";

import styles from './style.module.css';

type DashboardType = {
    setActivePage: (state: string) => void;
    setList: (list: ItemType[]) => void;
}

const Dashboard: React.FC<DashboardType> = ({setActivePage, setList}) => {

    const handleContinue = () => {
        const list = getLocalStorageItem('list')
        setList(list)
        setActivePage(LIST_PAGES.APP)
    }

    const handleRefresh = () => {
        setActivePage(LIST_PAGES.HOME)
    }
    return (
        <div className={styles.Container}>
            <button
                style={{backgroundColor: '#13aa52'}}
                className={styles.button}
                onClick={handleContinue}>
                CONTINUE
            </button>
            <button
                onClick={handleRefresh}
                style={{backgroundColor: '#FF013C'}}
                className={styles.button}
            >
                REFRESH
            </button>
        </div>
    );
}

export default Dashboard;
