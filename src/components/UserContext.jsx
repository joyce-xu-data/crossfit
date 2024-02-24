  import React, { createContext, useContext, useState } from 'react';

  const UserContext = createContext();

  export const useUser = () => useContext(UserContext);

  export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({ isLoggedIn: false, role: '' });

      // Function to log in the user
    const login = (userData, token) => {
      // Store the token in localStorage or sessionStorage
      localStorage.setItem('token', token);

      // Update user state to reflect that the user is now logged in
      setUser({ isLoggedIn: true, ...userData });
    };

      // Function to log out the user
    const logout = () => {
      // Remove the token from storage
      localStorage.removeItem('token');

      // Update user state to reflect that the user is now logged out
      setUser({ isLoggedIn: false });
    };

    return (
      <UserContext.Provider value={{ user,login,logout }}>
        {children}
      </UserContext.Provider>
    );
  };
