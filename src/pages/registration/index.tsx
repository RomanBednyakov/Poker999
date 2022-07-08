import React, { useCallback } from "react";
import { withRouter } from "react-router";
import app from "../../base";

const SignUp = ({ history }: any) => {
  const handleSignUp = useCallback(async (event: any )=> {
    event.preventDefault();
    const { email, password } = event.target.elements;
    try {
      await app
        .auth()
        .createUserWithEmailAndPassword(email.value, password.value);
      history.push("/Poker999");
    } catch (error) {
      alert(error);
    }
  }, [history]);

  const handleClickLogin = () => {
    history.push("/login");
  }

  return (
    <div>
      <h1>Sign up</h1>
      <form onSubmit={handleSignUp}>
        <label>
          Email
          <input name="email" type="email" placeholder="Email" />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="Password" />
        </label>
        <button type="submit">Sign Up</button>
        <button onClick={handleClickLogin}>Log in</button>
      </form>
    </div>
  );
};

export default withRouter(SignUp);
