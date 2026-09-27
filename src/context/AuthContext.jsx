import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { authApi } from '../utils/api';
import { toast } from 'react-hot-toast';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const { setLanguage, t } = useLanguage();
  const { setTheme } = useTheme();

  const syncPreferences = (userData) => {
    if (userData?.preferences) {
      if (userData.preferences.language) {
        setLanguage(userData.preferences.language);
      }
      if (userData.preferences.theme) {
        setTheme(userData.preferences.theme, false);
      }
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get current user
        const { data } = await authApi.getMe();

        setUser(data.data);
        setIsAuthenticated(true);
        syncPreferences(data.data);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await authApi.login(email, password);

      setUser(data.user);
      setIsAuthenticated(true);
      syncPreferences(data.user);

      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

      toast.success(`${t.welcomeBack}, ${data.user.name.split(' ')[0]}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || t.loginFailed;
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const { data } = await authApi.register(name, email, password);

      setUser(data.user);
      setIsAuthenticated(true);
      syncPreferences(data.user);

      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

      toast.success(t.registrationSuccess);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || t.registrationFailed;
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (tokenId) => {
    try {
      setLoading(true);
      const { data } = await authApi.googleLogin(tokenId);

      setUser(data.user);
      setIsAuthenticated(true);
      syncPreferences(data.user);

      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

      toast.success(`${t.welcomeBack}, ${data.user.name.split(' ')[0]}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || t.googleLoginFailed;
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
      delete api.defaults.headers.common['Authorization'];
      toast.success(t.logoutSuccess);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
