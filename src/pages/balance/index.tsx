import React, {useState} from 'react';

import {DEFAULT_ITEM, DEFAULT_LIST_NAME, LIST_PAGES} from '../../moks';
import {ItemType} from "../../types";

import styles from './style.module.css';

type DashboardType = {
    setActivePage: (state: string) => void;
    setDefaultBalance: (state: number) => void;
    defaultBalance: number;
    setList: (list: ItemType[]) => void;
    list: ItemType[];
}

const BalancePage: React.FC<DashboardType> = ({
                                                  setActivePage,
                                                  setList,
                                                  list,
                                                  defaultBalance,
                                                  setDefaultBalance,
                                              }) => {
    const [value, setValue] = useState(defaultBalance)
    const isEmptyList = list.length === 0

    const handleChangeBalance = (event: any) => {
        setValue(event.target.value)
    }

    const handleSave = () => {
        setDefaultBalance(value)
        setList(DEFAULT_LIST_NAME.map(name => ({...DEFAULT_ITEM, name, balance: value, id: "id" + Math.random().toString(16).slice(2)})))
        setActivePage(LIST_PAGES.APP)
    }

    const handleContinue = () => {
        setActivePage(LIST_PAGES.APP)
    }

    return (
        <div className={styles.Container}>
            <h1>Initial Balance</h1>
            <div className={styles.content}>
                <button
                    style={{marginRight: '30px', background: 'green'}}
                    onClick={() => setValue(Number(value) + 100)}
                    className={styles.button}
                >
                    + 100
                </button>
                <button
                    onClick={() => setValue(value ? Number(value) - 100 : 0)}
                    className={styles.button}
                    style={{ background: 'red'}}
                >
                    - 100
                </button>
            </div>
            <input type='number' value={value} onChange={handleChangeBalance} className={styles.Input}/>
            <button
                disabled={!value}
                onClick={handleSave}
                className={styles.button}
            >
                NEXT
            </button>
            {!isEmptyList && <button
                onClick={handleContinue}
                className={styles.button}
                style={{ background: '#14a73e98'}}
            >
                CONTINUE
            </button>}
        </div>
    );
}

export default BalancePage;
