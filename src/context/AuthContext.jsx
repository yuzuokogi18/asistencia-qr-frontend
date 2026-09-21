import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { getAuthToken, getAuthUser, setAuthSession, clearAuthSession } from '../api/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getAuthUser());
  const [loading, setLoading] = useState(false);

  // Al montar, si hay token pero no datos, intentamos traer /auth/me
  useEffect(() => {
    const token = getAuthToken();
    if (token && !user) {
      apiClient.me()
        .then(userData => setUser(userData))
        .catch(() => clearAuthSession());
    }
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await apiClient.login(username, password);
      // res trae { token, usuario: { id, nombre, usuario, rol } }
      const currentUser = res.usuario;
      setUser(currentUser);
      setAuthSession(res.token, currentUser);
      return currentUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearAuthSession();
  };

  const isAdmin = user?.rol === 'admin';
  const isOperador = user?.rol === 'operador';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin,
      isOperador,
      loading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
