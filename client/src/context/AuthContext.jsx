import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = authService.getCurrentUser();
    if (localUser) {
      setUser(localUser);
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, email, password, role) => {
    setLoading(true);
    try {
      const newUser = await authService.register(name, email, password, role);
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
