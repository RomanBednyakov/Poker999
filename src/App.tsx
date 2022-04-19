import React, {useEffect, useState} from 'react';
import './App.css';
import {ItemType} from './types'
import Dashboard from "./components/dashboard";
import BalancePage from "./components/balancePage";
import AppPage from "./components/app";
import {LIST_PAGES, DEFAULT_BALANCE} from "./moks";
import {getLocalStorageItem, setLocalStorageItem} from './utils/localStorage';

const App = () => {
    const [list, setList] = useState<ItemType[]>([])
    const [activePage, setActivePage] = useState<string | null>(null)
    const [defaultBalance, setDefaultBalance] = useState<number>(DEFAULT_BALANCE)

    useEffect(() => {
        const list = getLocalStorageItem('list')
        if (list) {
            setList(list)
            setActivePage(LIST_PAGES.DASHBOARD)
        } else {
            setActivePage(LIST_PAGES.HOME)
        }
    }, [])

    useEffect(() => {
        if(list.length > 0) {
            setLocalStorageItem('list', list)
        }
    }, [list])

    const getContent = () => {
        switch (activePage) {
            case LIST_PAGES.DASHBOARD: {
                return <Dashboard setList={setList} setActivePage={setActivePage}/>
            }
            case LIST_PAGES.HOME: {
                return <BalancePage
                    setActivePage={setActivePage}
                    setList={setList}
                    list={list}
                    setDefaultBalance={setDefaultBalance}
                    defaultBalance={defaultBalance}
                />
            }
            case LIST_PAGES.APP: {
                return <AppPage
                    defaultBalance={defaultBalance}
                    setActivePage={setActivePage}
                    list={list}
                    setList={setList}
                />
            }
            default: {
                return <div/>;
            }
        }
    }

    return (
        <div className="App">
            {getContent()}
        </div>
    );
}

export default App;
