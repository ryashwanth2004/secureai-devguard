import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AdminAuthContextType {
  token: string | null;
  adminUser: string | null;
  isAdminLoggedIn: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
  authHeaders: { headers: { Authorization: string } } | {};
}

const AdminAuthContext = createContext<AdminAuthContextType>({} as AdminAuthContextType);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('devguard_admin_token'));
  const [adminUser, setAdminUser] = useState<string | null>(() => localStorage.getItem('devguard_admin_user') || 'admin');

  const login = (newToken: string, username: string) => {
    setToken(newToken);
    setAdminUser(username);
    localStorage.setItem('devguard_admin_token', newToken);
    localStorage.setItem('devguard_admin_user', username);
  };

  const logout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('devguard_admin_token');
    localStorage.removeItem('devguard_admin_user');
  };

  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  return (
    <AdminAuthContext.Provider value={{
      token,
      adminUser,
      isAdminLoggedIn: !!token,
      login,
      logout,
      authHeaders
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
