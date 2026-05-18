import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'user', 'employee', 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and fetch user details if needed
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedUser = localStorage.getItem('user');

    if (token && storedRole) {
      setRole(storedRole);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, userRole, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setUser(userData);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, role, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
