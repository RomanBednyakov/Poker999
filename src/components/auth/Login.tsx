import React, { useCallback, useContext } from "react";
import { withRouter, Redirect } from "react-router";
import app from "../../base.js";
import { AuthContext } from "./Auth";

const Login = ({ history }: any) => {
  const handleLogin = useCallback(
    async (event: any) => {
      event.preventDefault();
      const { email, password } = event.target.elements;
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

  const { currentUser }: any = useContext(AuthContext);

  if (currentUser) {
    return <Redirect to="/Poker999" />;
  }

    const handleClickSignup = () => {
            history.push("/signup");
    }

  return (
    <div>
      <h1>Log in</h1>
      <form onSubmit={handleLogin}>
        <label>
          Email
          <input name="email" type="email" placeholder="Email" />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="Password" />
        </label>
        <button type="submit">Log in</button>
        <button onClick={handleClickSignup}>sign up</button>
      </form>
    </div>
  );
};

export default withRouter(Login);
