import React, {useContext, useEffect, useRef, useState} from "react";
import {TextField} from "@material-ui/core";
import {withRouter} from "react-router";
import styles from './style.module.css';
import {DB} from "../../base";
import {AuthContext} from "../../components/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TradingPage = () => {
    const [data, setData] = useState({
        bet: 1,
        profitability: 80,
        making: 2,
        amount: 1,
        lastAmount: 1,
    })

    const [listAmount, setListAmount] = useState<{ amount: number; lastBet: number; }[]>([])

    const firstRender = useRef(true);

    const {currentUser}: any = useContext(AuthContext);
    const email = currentUser?.providerData[0]?.email

    const handleChangeBet = (event: any ) => {
        setData({
            ...data,
            bet: event.target.value
        })
    }

    const handleChangeProfitability = (event: any ) => {
        setData({
            ...data,
            profitability: event.target.value
        })
    }

    const handleChangeMaking = (event: any ) => {
        setData({
            ...data,
            making: event.target.value
        })
    }

    const handleChangeAmount = (event: any ) => {
        setData({
            ...data,
            amount: event.target.value
        })
    }

    const handleChangeLastAmount = (event: any ) => {
        setData({
            ...data,
            lastAmount: event.target.value
        })
    }


    const getData = async () => {
        try {
            const data =  await DB.ref(`appTradingMartin_${email.split('@')[0]}`)
             data.on('value', (elem) => {
                const dataTrading = JSON.parse(elem.val()) || {
                    bet: 1,
                    profitability: 80,
                    making: 2,
                    amount: 1,
                    lastAmount: 1,
                };

                console.log('@@dataTrading@@', dataTrading);
                if(firstRender.current) {
                    setData(dataTrading)
                }
                 firstRender.current = false;
            })
        } catch (err) {
            console.log('Error : ' + err);
        }
    }

    const setDataDB = async () => {
        try {
            const dataRef =  await DB.ref(`appTradingMartin_${email.split('@')[0]}`)
            await dataRef.set(JSON.stringify(data))
        } catch (err) {
            console.log('Error : ' + err);
        }
    }

    const handleCopyText = (text:string, index: number) => {
        const inputArea = document.createElement('textarea');
        inputArea.value = text;
        document.body.appendChild(inputArea);
        inputArea.select();
        try {
            document.execCommand('copy');
            if(index === 2) {
                toast(`ПОСЛЕДНАЯ СТАВКА ПЕРЕД VIP КАНАЛОМ !! ${text}`, {type: 'warning'})
                return;
            }
            if(index > 4) {
                toast(`ХОРОШ УЖЕ!!!!!!!, ЖДИ СТАВОК НА VIP !!!!! ${text}`, {type: 'error'})
                return
            }
            if(index > 3) {
                toast(`СТОП, ЖДИ СТАВОК НА VIP !!!!! ${text}`, {type: 'error'})
                return
            }
            toast(`скопировано в буфер обмена ${text}`, {type: 'success'})

        } catch (err) {
        }
        document.body.removeChild(inputArea);
    };

    useEffect(() => {
        getData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (firstRender.current) {
            return;
        }
        setDataDB()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    // const listAmount = useMemo(() => {
    //     const result = []
    //     let lastBet: number = Number(data.bet) ?? 1
    //     for (let i = 1; i <= data.making; i++) {
    //         if(i === 1) {
    //             result.push({
    //                 amount: Number(data?.bet),
    //                 lastBet: Number(lastBet)
    //             })
    //         } else {
    //             const amountBet  = Number(data?.bet)  + Number(lastBet) / Number(data.profitability) * 100
    //             lastBet = Number(lastBet) + Number(amountBet)
    //             result.push({
    //                 amount: amountBet,
    //                 lastBet: lastBet
    //             })
    //         }
    //     }
    //     return result
    // },[data.making, data.bet, data.profitability])

    useEffect(() => {
        if(data.bet > 0 && data.profitability > 0 && data.making > 0) {
            const result = []
            let lastBet: number = Number(data.bet) ?? 1
            for (let i = 1; i <= data.making; i++) {
                if(i === 1) {
                    result.push({
                        amount: Number(data?.bet),
                        lastBet: Number(lastBet)
                    })
                } else {
                    const amountBet  = Number(data?.bet)  + Number(lastBet) / Number(data.profitability) * 100
                    lastBet = Number(lastBet) + Number(amountBet)
                    result.push({
                        amount: amountBet,
                        lastBet: lastBet
                    })
                }
            }
            setListAmount(result)
        }
    }, [data.making, data.bet, data.profitability]);

    console.log('@@@@', listAmount);

    const resultAmountPercent = ((data.lastAmount - data.amount) / data.amount * 100).toFixed(0)

    return (
        <div className={styles.main}>
            <div className={styles.inputBox}>
                <div className={styles.inputWrapper}>
                    <TextField
                        color="primary"
                        className={styles.input}
                        name="bet"
                        type="number"
                        id="outlined-basic"
                        label="Ставка"
                        variant="outlined"
                        value={data.bet}
                        onChange={handleChangeBet}
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <TextField
                        color="primary"
                        className={styles.input}
                        name="bet"
                        type="profitability"
                        id="outlined-basic"
                        label="Доходность в % (например: 80%)"
                        variant="outlined"
                        value={data.profitability}
                        onChange={handleChangeProfitability}
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <TextField
                        color="primary"
                        className={styles.input}
                        name="making"
                        type="profitability"
                        id="outlined-basic"
                        label="Максимальная убыточная серия"
                        variant="outlined"
                        value={data.making}
                        onChange={handleChangeMaking}
                    />
                </div>
                <div className={styles.countWrapper}>{listAmount.map((item, i) => {
                    return (
                        <div className={styles.countItem} key={item.lastBet}>
                            <div className={styles.countItemFirst}>
                                {i ? `${i}) ` : ''}
                            </div >
                            <div className={ i > 3 ? styles.countItemNext : styles.countItemNextWar}>
                                {item.amount.toFixed(0)}
                            </div>
                            <div className={styles.countItemLastBet}>
                                ({item.lastBet.toFixed(0)})
                            </div>
                            <button className={styles.countItemLast} onClick={() => handleCopyText(String(item.amount.toFixed(0)), i)}>copy</button>
                        </div>
                    )
                })}</div>
                <div className={styles.inputWrapper}>
                    <TextField
                        color="primary"
                        className={styles.input}
                        name="lastAmount"
                        type="number"
                        id="outlined-basic"
                        label="сумма"
                        variant="outlined"
                        value={data.amount}
                        onChange={handleChangeAmount}
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <TextField
                        color="primary"
                        className={styles.input}
                        name="lastAmount"
                        type="number"
                        id="outlined-basic"
                        label="итоговая сумма"
                        variant="outlined"
                        value={data.lastAmount}
                        onChange={handleChangeLastAmount}
                    />
                </div>
                <div className={styles.inputWrapper}>
                    процентная разница {resultAmountPercent}%
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default withRouter(TradingPage);
