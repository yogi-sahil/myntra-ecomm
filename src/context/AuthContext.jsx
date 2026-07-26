/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/auth/me`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Session unavailable');
        return response.json();
      })
      .then(({ user: currentUser }) => {
        if (!active) return;
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('token');
  };

  const logout = () => {
    fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' }).catch(() => {});
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('myntra_cart');
  };

  // Existing consumers use this only as an "authenticated" signal. The real
  // credential is an HttpOnly cookie and is never exposed to JavaScript.
  const token = user ? 'cookie-session' : null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
