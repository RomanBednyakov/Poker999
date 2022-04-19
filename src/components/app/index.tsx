import React, {useState} from 'react';

import {DEFAULT_ITEM, LIST_PAGES} from '../../moks';
import {ItemType} from "../../types";


import styles from './style.module.css';

type DashboardType = {
    setActivePage: (state: string) => void;
    setList: (list: ItemType[]) => void;
    list: ItemType[];
    defaultBalance: number;
}

const AppPage: React.FC<DashboardType> = ({setActivePage, list, setList, defaultBalance}) => {
    const [value, setValue] = useState('')

    const handleRefresh = () => {
        setActivePage(LIST_PAGES.HOME)
    }

    const handleChangeName = (event: any) => {
        setValue(event.target.value)
    }

    const handleSave = () => {
        setList([...list, {...DEFAULT_ITEM, name: value, balance: defaultBalance, id: "id" + Math.random().toString(16).slice(2)}])
        setValue('')
    }
    const setBalance = (balance: number, id: string) => {
        setList(list.map(item => (item.id === id ? {...item, balance} : item)))
    }

    const deleteUser = (id: string) => {
        setList(list.filter(item => (item.id !== id)))
    }

    return (
        <div className={styles.Container}>
            <div className={styles.contentName}>
                <input type='text' value={value} onChange={handleChangeName} className={styles.Input}/>
                <button
                    disabled={!value}
                    onClick={handleSave}
                    style={{width: '30%'}}
                    className={styles.button}
                >
                    ADD
                </button>
            </div>
            {list.map(item => (<div className={styles.list} key={item.id}>
                <button
                    onClick={() => setBalance(item.balance + 100, item.id)}
                    style={{backgroundColor: 'green'}}
                    className={styles.buttonAdd}
                >+ 100
                </button>
                <button
                    onClick={() => setBalance(item.balance - 100, item.id)}
                    style={{backgroundColor: '#FF013C'}}
                    className={styles.buttonAdd}
                >- 100
                </button>
                <div>{item.name}</div>
                <div className={styles.balance}>{item.balance}</div>
                <button
                    onClick={() => deleteUser(item.id)}
                    style={{backgroundColor: '#FF013C', marginLeft: 'auto'}}
                    className={styles.buttonAdd}
                >delete
                </button>
            </div>))}
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

export default AppPage;
