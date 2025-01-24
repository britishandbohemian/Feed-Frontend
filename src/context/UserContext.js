// UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

export const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user information
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Tracks authentication status

  // Sets user info and marks as authenticated
  const setUserInfo = (userInfo) => {
    setUser(userInfo);
    setIsAuthenticated(true);
    // Optionally save to localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userInfo));
  };

  // Clears user info on logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user'); // Clear user from localStorage
  };

  // Checks if the user is already logged in by looking at localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUserInfo, isAuthenticated, logout }}>
      {children}
    </UserContext.Provider>
  );
};
