import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('home_token'));

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('home_token');
    
    if (storedToken) {
      try {
        // Verificar token JWT (sin credentials, usa header Authorization)
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setUser(response.data);
        setToken(storedToken);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Token inválido:', error.response?.data || error.message);
        // Solo limpiar si es un error de autenticación (401)
        if (error.response?.status === 401) {
          localStorage.removeItem('home_token');
          setToken(null);
          setUser(null);
        }
      }
    }
    
    // Si no hay token JWT válido, el usuario no está autenticado
    // (La verificación de Google cookie se hará solo cuando sea necesario)
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    
    // Guardar token en localStorage PRIMERO
    localStorage.setItem('home_token', access_token);
    
    // Luego actualizar estado
    setToken(access_token);
    setUser(userData);
    
    return userData;
  };

  const register = async (email, password) => {
    const response = await axios.post(`${API}/auth/register`, { email, password });
    return response.data;
  };

  const verifyEmail = async (email, code) => {
    const response = await axios.post(`${API}/auth/verify-email`, { email, code });
    return response.data;
  };

  const resendVerification = async (email) => {
    const response = await axios.post(`${API}/auth/resend-verification`, { email });
    return response.data;
  };

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const loginWithGoogle = () => {
    const redirectUrl = window.location.origin + '/';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const processGoogleSession = async (sessionId) => {
    const response = await axios.post(`${API}/auth/google/session`, { session_id: sessionId });
    
    const { access_token, user: userData } = response.data;
    
    // Guardar token en localStorage PRIMERO
    localStorage.setItem('home_token', access_token);
    
    // Luego actualizar estado
    setToken(access_token);
    setUser(userData);
    
    return userData;
  };

  const logout = async () => {
    // Limpiar localStorage (token y carrito) por privacidad
    localStorage.removeItem('home_token');
    localStorage.removeItem('home_cart');
    
    setToken(null);
    setUser(null);
    
    // Recargar la página para limpiar todo el estado
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyEmail,
        resendVerification,
        loginWithGoogle,
        processGoogleSession,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.is_admin || false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
