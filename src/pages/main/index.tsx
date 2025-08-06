import React, {useContext, useEffect, useState, useCallback} from 'react';
import {ItemType} from '../../types'
import Dashboard from "../dashboard";
import BalancePage from "../balance";
import AppPage from "../app";
import {LIST_PAGES, DEFAULT_BALANCE} from "../../moks";
import app, {DB} from "../../base";
import {AuthContext} from "../../components/auth";
import style from './style.module.css'
import TradingPage from "../trading";
import TradingMartinPage from "../trading-martin";

const MainPage = () => {
    const [list, setList] = useState<ItemType[]>([])
    const [activePage, setActivePage] = useState<string | null>(null)
    const [defaultBalance, setDefaultBalance] = useState<number>(DEFAULT_BALANCE)

    const {currentUser, isGuestMode}: any = useContext(AuthContext);
    const email = currentUser?.providerData[0]?.email
    const isAdmin = !isGuestMode && (email === 'roman@mail.ru' || email === 'gitis.senja@ya.ru')

    const getData = async () => {
        try {
            const data =  await DB.ref('app')
            data.on('value', (elem) => {
                const listData = JSON.parse(elem.val()) || [];
                if (listData.length > 0) {
                    setList(listData);
                    setActivePage(LIST_PAGES.APP);
                } else {
                    setActivePage(LIST_PAGES.HOME);
                }
            })
        } catch (err) {
            console.log('Error : ' + err);
        }
    }

    const setData = useCallback(async () => {
        try {
            const data =  await DB.ref('app')
            await data.set(JSON.stringify(list))
        } catch (err) {
            console.log('Error : ' + err);
        }
    }, [list])

    useEffect(() => {
        getData()
    },[])

    useEffect(() => {
        if(list.length > 0) {
            setData()
        }
    }, [list, setData])

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
            case LIST_PAGES.Trading: {
                return <TradingPage />
            }
            case LIST_PAGES.TradingMartin: {
                return <TradingMartinPage />
            }
            default: {
                return <div/>;
            }
        }
    }

    return (
        <div className={style.main}>
            <div className={style.navigation}>
                {isGuestMode && (
                    <div className={style.guestIndicator}>
                        Guest Mode
                    </div>
                )}
                <button 
                    className={style.signOutButton}
                    onClick={() => {
                        if (isGuestMode) {
                            localStorage.removeItem('guestMode');
                            window.location.reload();
                        } else {
                            app.auth().signOut();
                        }
                    }}
                >
                    {isGuestMode ? 'Exit Guest' : 'Sign out'}
                </button>
                <button 
                    className={style.navButton}
                    onClick={() => setActivePage(LIST_PAGES.Trading)}
                >
                    Trading
                </button>
                <button 
                    className={style.navButton}
                    onClick={() => setActivePage(LIST_PAGES.TradingMartin)}
                >
                    Trading Martin
                </button>
                <button 
                    className={style.navButton}
                    onClick={() => setActivePage(LIST_PAGES.DASHBOARD)}
                >
                    Poker
                </button>
            </div>
            {getContent()}
        </div>
    );
}

export default MainPage;
