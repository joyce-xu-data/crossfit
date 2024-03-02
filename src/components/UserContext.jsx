import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ isLoggedIn: false, role: '' });

  // Function to log in the user
  const login = (userData, token) => {
    // Store the token in localStorage
    localStorage.setItem('token', token);
    // Update user state to reflect that the user is now logged in
    setUser({ isLoggedIn: true, ...userData });
  };

  // Function to log out the user
  const logout = () => {
    // Remove the token from storage
    localStorage.removeItem('token');
    // Update user state to reflect that the user is now logged out
    setUser({ isLoggedIn: false, role: '' });
  };

  useEffect(() => {
    // Moved fetchUserDetails inside useEffect to avoid missing dependencies warning
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/users/details', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const userDetails = await response.json();
            setUser({ isLoggedIn: true, ...userDetails });
          } else {
            // Handle non-OK responses, including redirects to HTML pages
            console.error("Response not OK, possibly redirected.");
            logout();
          }
        } catch (error) {
          console.error(error.message);
          logout();
        }
      }
    };

    fetchUserDetails();
  // Removed the dependency array to ensure fetchUserDetails runs once on component mount
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
