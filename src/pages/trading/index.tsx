import React, {useContext, useEffect, useMemo, useState} from "react";
import {TextField} from "@material-ui/core";
import {withRouter} from "react-router";
import styles from './style.module.css';
import {DB} from "../../base";
import {AuthContext} from "../../components/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TradingPage = () => {
    const [amount, setAmount] = useState(0)
    const [percent, setPercent] = useState<number>(1)
    const [percentCount, setPercentCount] = useState<number>(2.2)
    // const [listAmount, setListAmount] = useState<number[]>([])
    const [lastAmount, setLastAmount] = useState<number>(0)

    const {currentUser}: any = useContext(AuthContext);
    const email = currentUser?.providerData[0]?.email
    const resultAmountPercent = ((lastAmount - amount) / amount * 100).toFixed(0)

    const handleChangeAmount = (event: any ) => {
        setAmount(event.target.value)
    }

    const handleChangeLastAmount = (event: any ) => {
        setLastAmount(event.target.value)
    }

    const handleChangePercent = (event: any ) => {
        if(event.target.value <= 100) {
            setPercent(event.target.value)
        }
    }

    const handleChangePercentCount = (event: any ) => {
        setPercentCount(event.target.value)
    }

    const getData = async () => {
        try {
            const data =  await DB.ref(`appTrading_${email.split('@')[0]}`)
             data.on('value', (elem) => {
                const dataTrading = JSON.parse(elem.val()) || {
                    percent: 1,
                    amount: 1,
                    percentCount: 1,
                    lastAmount: 1,
                };
                if(dataTrading?.amount) {
                    setAmount(Number(dataTrading.amount))
                    setLastAmount(Number(dataTrading.amount))
                }
                if(dataTrading?.lastAmount) {
                    setLastAmount(Number(dataTrading.lastAmount))
                }
                 if(dataTrading?.percent) {
                     setPercent(Number(dataTrading.percent))
                 }
                 if(dataTrading?.percentCount) {
                     setPercentCount(Number(dataTrading.percentCount))
                 }
            })
        } catch (err) {
            console.log('Error : ' + err);
        }
    }

    const setData = async () => {
        try {
            const data =  await DB.ref(`appTrading_${email.split('@')[0]}`)
            await data.set(JSON.stringify({
                percent,
                amount,
                percentCount,
                lastAmount,
            }))
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
                toast("ПОСЛЕДНАЯ СТАВКА ПЕРЕД VIP КАНАЛОМ !!", {type: 'warning'})
                return;
            }
            if(index > 4) {
                toast("ХОРОШ УЖЕ!!!!!!!, ЖДИ СТАВОК НА VIP !!!!!", {type: 'error'})
                return
            }
            if(index > 2) {
                toast("СТОП, ЖДИ СТАВОК НА VIP !!!!!", {type: 'error'})
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
        if(amount) {
            setData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount, percent, percentCount]);



    // useEffect(() => {
    //     if(amount && percent && Number(amount) !== 0 && Number(percent) !== 0 && Number(percentCount) !== 0) {
    //         const firstStep = amount / 100 * percent
    //         const list = [firstStep];
    //         let step = firstStep;
    //         let lastStep = firstStep;
    //         for (step = firstStep; step < amount; step++) {
    //             const newStep = lastStep * percentCount
    //             if((newStep < amount)) {
    //                 list.push(Math.floor(newStep))
    //             }
    //             lastStep = newStep
    //         }
    //         >(list)
    //         setData()
    //     }
    // }, [amount, percent, percentCount]);


    const listAmount = useMemo(() => {
        if(amount && percent && Number(amount) !== 0 && Number(percent) !== 0 && Number(percentCount) !== 0) {
            const firstStep = amount / 100 * percent
            const list = [firstStep];
            let step = firstStep;
            let lastStep = firstStep;
            for (step = firstStep; step < amount; step++) {
                const newStep = lastStep * percentCount
                if((newStep < amount)) {
                    list.push(Math.floor(newStep))
                }
                lastStep = newStep
            }
            return list
        }
        return []
    },[amount, percent, percentCount])

    const resultAmount = useMemo(() => {
        return  listAmount.reduce((acc, number) => acc + number, 0);
    },[listAmount])

    return (
        <div className={styles.main}>
            <div className={styles.inputBox}>
                <div className={styles.inputWrapper}>
                    <TextField
                        color="primary"
                        className={styles.input}
                        name="amount"
                        type="number"
                        id="outlined-basic"
                        label="сумма"
                        variant="outlined"
                        value={amount}
                        onChange={handleChangeAmount}
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <TextField
                        color="secondary"
                        className={styles.input}
                        type="number"
                        name="percent"
                        id="outlined-basic"
                        label="проценты"
                        variant="outlined"
                        value={percent}
                        onChange={handleChangePercent}
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <TextField
                        color="secondary"
                        className={styles.input}
                        type="number"
                        name="percentCount"
                        id="outlined-basic"
                        label="проценты усножение"
                        variant="outlined"
                        value={percentCount}
                        onChange={handleChangePercentCount}
                    />
                </div>
                <div className={styles.countWrapper}>{listAmount.map((item, i) => {
                    if(listAmount[listAmount.length - 1] === item) {
                        if(resultAmount > amount) {
                            return null
                        }
                        return (
                            <div className={styles.countItem}  key={item}>
                                <div className={styles.countItemFirst}>
                                    {i ? `${i}) ` : ''}
                                </div >
                                <div className={ i > 2 ? styles.countItemNext : styles.countItemNextWar}>
                                    {item.toFixed(0)}
                                </div>
                                <button className={styles.countItemLast} onClick={() => handleCopyText(String(item.toFixed(0)), i)}>copy</button>
                            </div>
                        )
                    }
                    return (
                        <div className={styles.countItem}  key={item}>
                            <div className={styles.countItemFirst}>
                                {i ? `${i}) ` : ''}
                            </div >
                            <div className={ i > 2 ? styles.countItemNext : styles.countItemNextWar}>
                                {item.toFixed(0)}
                            </div>
                            <button className={styles.countItemLast} onClick={() => handleCopyText(String(item.toFixed(0)), i)}>copy</button>
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
                        label="итоговая сумма"
                        variant="outlined"
                        value={lastAmount}
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
