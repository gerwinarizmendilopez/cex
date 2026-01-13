import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    // Verificar token JWT existente o sesión de Google
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Primero intentar verificar token JWT
      if (token) {
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setLoading(false);
        return;
      }

      // Si no hay token JWT, intentar sesión de Google via cookie
      try {
        const googleResponse = await axios.get(`${API}/auth/google/me`, {
          withCredentials: true
        });
        setUser(googleResponse.data);
      } catch (googleError) {
        // No hay sesión activa, usuario no autenticado
        setUser(null);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('home_token', access_token);
    
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
    // Usar window.location.origin para obtener la URL dinámica
    const redirectUrl = window.location.origin + '/';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const processGoogleSession = async (sessionId) => {
    const response = await axios.post(
      `${API}/auth/google/session`,
      { session_id: sessionId },
      { withCredentials: true }
    );
    
    const { access_token, user: userData } = response.data;
    
    // Guardar token JWT para mantener compatibilidad
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('home_token', access_token);
    
    return userData;
  };

  const logout = async () => {
    try {
      // Intentar cerrar sesión de Google si existe
      await axios.post(`${API}/auth/google/logout`, {}, { withCredentials: true });
    } catch (error) {
      // Ignorar errores de logout de Google
    }
    
    setToken(null);
    setUser(null);
    localStorage.removeItem('home_token');
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
