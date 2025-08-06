import React, {useCallback, useContext} from "react";
import {Box, Button, TextField} from "@material-ui/core";
import {withRouter, Redirect} from "react-router";
import app from "../../base.js";
import {AuthContext} from "../../components/auth";

import styles from './style.module.css';

const Login = ({history}: any) => {
    const handleLogin = useCallback(
        async (event: any) => {
            event.preventDefault();
            const {email, password} = event.target.elements;
            try {
                await app
                    .auth()
                    .signInWithEmailAndPassword(email.value, password.value);
                history.push("/");
            } catch (error) {
                alert(error);
            }
        },
        [history]
    );

    const {currentUser}: any = useContext(AuthContext);

    if (currentUser) {
        return <Redirect to="/Poker999"/>;
    }

    const handleClickSignup = () => {
        history.push("/signup");
    }

    const handleGuestMode = () => {
        // Создаем временного пользователя для гостевого режима
        localStorage.setItem('guestMode', 'true');
        // Перезагружаем страницу чтобы AuthContext перечитал localStorage
        window.location.href = "/Poker999";
    }

    return (
        <div className={styles.main}>
            <Box
                className={styles.form}
                onSubmit={handleLogin}
                component="form"
                sx={{
                    width: '90%',
                }}
            >
                <div className={styles.header}>
                    <h1 className={styles.logoText}>Poker Office</h1>
                </div>

                <div className={styles.inputBox}>
                    <TextField color="secondary" className={styles.input} type="email" name="email" id="outlined-basic" label="email"
                               variant="outlined"/>
                    <TextField color="secondary" className={styles.input} name="password" type="password" id="outlined-basic"
                               label="Password" variant="outlined"/>
                </div>
                <div className={styles.buttonBox}>
                    <Button className={styles.button} type="submit" variant="contained">Log in</Button>
                    <Button className={styles.buttonSingUp} variant="text" onClick={handleClickSignup}>Sign up</Button>
                    <Button className={styles.guestButton} variant="outlined" onClick={handleGuestMode}>
                        Continue as Guest
                    </Button>
                </div>

            </Box>
        </div>
    );
};

export default withRouter(Login);
