import React, {useState} from 'react';

import {DEFAULT_ITEM, LIST_PAGES} from '../../moks';
import {ItemType} from "../../types";
import DeleteIcon from "../../img/delete.png";


import styles from './style.module.css';

type DashboardType = {
    setActivePage: (state: string) => void;
    setList: (list: ItemType[]) => void;
    list: ItemType[];
    defaultBalance: number;
    isAdmin: boolean;
}

const AppPage: React.FC<DashboardType> = ({setActivePage, list, setList, defaultBalance, isAdmin}) => {
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

    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter') {
            if(value) {
                handleSave()
            }
        }
    }

    const getBalance = () => {
        let result = 0
        list.forEach(item => {
            result = Number(result) + Number(item.balance)
        })
        return result
    }

    return (
        <div className={styles.Container}>
            <div className={styles.sumBalance}>Sum: {getBalance()} $</div>
            {list.map(item => (<div className={styles.list} key={item.id}>
                    {isAdmin && <button
                    onClick={() => setBalance(item.balance + 100, item.id)}
                    style={{backgroundColor: 'green'}}
                    className={styles.buttonAdd}
                    disabled={!isAdmin}
                >+
                </button>}
                    {isAdmin && <button
                    onClick={() => setBalance(item.balance - 100, item.id)}
                    style={{backgroundColor: '#FF013C'}}
                    className={styles.buttonAdd}
                    disabled={!isAdmin}
                >-
                </button>}
                <div>{item.name}:</div>
                <div className={styles.balance}>{item.balance}$</div>
                    {isAdmin && <button
                    onClick={() => deleteUser(item.id)}
                    style={{backgroundColor: 'transparent', marginRight: 0}}
                    className={styles.buttonAdd}
                    disabled={!isAdmin}
                ><img className={styles.img} src={DeleteIcon} alt=""/>
                </button>}
            </div>))}
            {isAdmin && <div className={styles.contentName}>
                <input
                    type='text'
                    value={value}
                    onKeyDown={handleKeyDown}
                    onChange={handleChangeName}
                    disabled={!isAdmin}
                    className={styles.Input}

                />
                <button
                    disabled={!value || !isAdmin}
                    onClick={handleSave}
                    style={{width: '30%'}}
                    className={styles.button}
                >
                    ADD
                </button>
            </div>}
            {isAdmin && <button
                onClick={handleRefresh}
                disabled={!isAdmin}
                style={{backgroundColor: '#FF013C'}}
                className={styles.button}
            >
                REFRESH
            </button>}
        </div>
    );
}

export default AppPage;
