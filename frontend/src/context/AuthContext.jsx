import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'upishield_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // On mount, verify JWT token is still valid
  useEffect(() => {
    const token = getToken();
    if (token && !user) {
      authApi.getProfile()
        .then((res) => {
          if (res?.data) setUser(res.data);
        })
        .catch(() => {
          clearToken();
          setUser(null);
        });
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.login(email, password);
      if (res?.data?.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error('Unexpected server response');
    } catch (err) {
      const msg = err.message || 'Login failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ name, email, password, businessName, merchantVpa, role = 'merchant' }) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.register({
        name,
        email,
        password,
        role,
        business_name: businessName,
        merchant_vpa: merchantVpa,
      });
      if (res?.data?.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error('Unexpected server response');
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setAuthError(null);
  };

  const updateProfile = async (fields) => {
    try {
      const res = await authApi.updateProfile(fields);
      if (res?.data) {
        setUser((prev) => ({ ...prev, ...res.data }));
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        authError,
        role: user?.role || 'guest',
        isAdmin: user?.role === 'admin',
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
