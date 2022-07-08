import React, {useContext, useEffect, useState} from 'react';
import {ItemType} from '../../types'
import Dashboard from "../../components/dashboard";
import BalancePage from "../../components/balancePage";
import AppPage from "../../components/app";
import {LIST_PAGES, DEFAULT_BALANCE} from "../../moks";
import app, {DB} from "../../base";
import {AuthContext} from "../auth/Auth";

const MainPage = () => {
    const [list, setList] = useState<ItemType[]>([])
    const [activePage, setActivePage] = useState<string | null>(null)
    const [defaultBalance, setDefaultBalance] = useState<number>(DEFAULT_BALANCE)

    const {currentUser}: any = useContext(AuthContext);
    const isAdmin = currentUser?.providerData[0]?.email === 'roman@mail.ru'

    const getData = async () => {
        try {
            const data =  await DB.ref('app')
            await data.on('value', (elem) => {
                const listData = JSON.parse(elem.val()) || []
                if (listData.length > 0) {
                    setList(listData)
                    setActivePage(LIST_PAGES.APP)
                } else {
                    setActivePage(LIST_PAGES.HOME)
                }
            })
        } catch (err) {
            console.log('Error : ' + err);
        }
    }

    const setData = async () => {
        try {
            const data =  await DB.ref('app')
            await data.set(JSON.stringify(list))
        } catch (err) {
            console.log('Error : ' + err);
        }
    }

    useEffect(() => {
        getData()
    },[])

    useEffect(() => {
        if(list.length > 0) {
            setData()
        }
    }, [list])

    const getContent = () => {
        switch (activePage) {

            case LIST_PAGES.DASHBOARD: {
                if(!isAdmin) {
                    return <AppPage
                        isAdmin={isAdmin}
                        defaultBalance={defaultBalance}
                        setActivePage={setActivePage}
                        list={list}
                        setList={setList}
                    />
                }
                return <Dashboard setActivePage={setActivePage}/>
            }
            case LIST_PAGES.HOME: {
                if(!isAdmin) {
                    return <AppPage
                        isAdmin={isAdmin}
                        defaultBalance={defaultBalance}
                        setActivePage={setActivePage}
                        list={list}
                        setList={setList}
                    />
                }
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
                    isAdmin={isAdmin}
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
        <div>
            <button onClick={() => app.auth().signOut()}>Sign out</button>
            {getContent()}
        </div>
    );
}

export default MainPage;
