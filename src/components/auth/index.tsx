import React, { useEffect, useState } from "react";
import app from "../../base";

export const AuthContext = React.createContext({});

export const AuthProvider = ({ children }: any) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [pending, setPending] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    // Проверяем гостевой режим
    const guestMode = localStorage.getItem('guestMode');
    if (guestMode === 'true') {
      setIsGuestMode(true);
      setCurrentUser({
        uid: 'guest_user',
        providerData: [{ email: 'guest@poker999.com' }]
      } as any);
      setPending(false);
    } else {
      app.auth().onAuthStateChanged((user: any) => {
        setCurrentUser(user)
        setPending(false)
      });
    }
  }, []);

  if(pending){
    return <>Loading...</>
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isGuestMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
