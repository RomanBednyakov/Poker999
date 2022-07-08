import React from 'react';
import './App.css';
import {AuthProvider} from "./components/auth/Auth";
import {BrowserRouter as Router, Route} from "react-router-dom";
import PrivateRoute from "./components/auth/PrivateRoute";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import MainPage from "./components/main";

const App = () => {

    return (
        <div className="App">
            <AuthProvider>
                <Router>
                    <div>
                        <PrivateRoute exact path="/Poker999" component={MainPage} />
                        <PrivateRoute exact path="/" component={MainPage} />
                        <Route exact path="/login" component={Login} />
                        <Route exact path="/signup" component={SignUp} />
                    </div>
                </Router>
            </AuthProvider>
        </div>
    );
}

export default App;
