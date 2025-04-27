// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '../firebase'; // Assuming you have a firebase.js for initializing Firebase

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const auth = getAuth(app);
  const [currentUser, setCurrentUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  // Logout function
  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    currentUser,
    logout,  // make logout available
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
