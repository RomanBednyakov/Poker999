import React from 'react';
import './App.css';
import {AuthProvider} from "./components/auth";
import {BrowserRouter as Router, Route} from "react-router-dom";
import PrivateRoute from "./components/privateRoute/privateRoute";
import Login from "./pages/login";
import SignUp from "./pages/registration";
import MainPage from "./pages/main";

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
