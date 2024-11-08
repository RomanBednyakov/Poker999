import React, {useEffect, useState} from "react";
import {TextField} from "@material-ui/core";
import {withRouter} from "react-router";
import styles from './style.module.css';

const TradingPage = () => {
    const [amount, setAmount] = useState(1000)
    const [percent, setPercent] = useState(1)
    const [listAmount, setListAmount] = useState<number[]>([])

    const handleChangeAmount = (event: any ) => {
        setAmount(event.target.value)
    }

    const handleChangePercent = (event: any ) => {
        if(event.target.value <= 100) {
            setPercent(event.target.value)
        }
    }


    useEffect(() => {
        if(amount && percent) {
            const firstStep = amount / 100 * percent
            const list = [firstStep];
            let step = firstStep;
            let lastStep = firstStep;
            for (step = firstStep; step < amount; step++) {
                const newStep = lastStep * 2.3
                if(newStep < amount) {
                    list.push(Math.floor(newStep))
                }
                lastStep = newStep
            }
            setListAmount(list)
        }
    }, [amount, percent]);

    console.log('@@@@', listAmount);

    return (
        <div className={styles.main}>
            <div className={styles.inputBox}>
                <TextField
                    color="secondary"
                    className={styles.input}
                    name="amount"
                    type="number"
                    id="outlined-basic"
                    label="сумма"
                    variant="outlined"
                    value={amount}
                    onChange={handleChangeAmount}
                />
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
                <div>Количество ставок: {listAmount.length}</div>
                <div>{listAmount.map((item, i) => (
                    <div>{i+1}) {item}</div>
                ))}</div>
            </div>
        </div>
    );
};

export default withRouter(TradingPage);


