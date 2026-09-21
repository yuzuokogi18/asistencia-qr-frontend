import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const KioskLayout = () => {
  const { isAuthenticated } = useAuth();

  // Si no está autenticado, redirigir a /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col select-none overflow-x-hidden">
      <Outlet />
    </div>
  );
};
