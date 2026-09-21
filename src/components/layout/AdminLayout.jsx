import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout = () => {
  const { isAuthenticated, isOperador } = useAuth();

  // Si no está autenticado, redirigir a /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si es operador, bloquear acceso a paneles administrativos y enviar al Kiosco de Escaneo
  if (isOperador) {
    return <Navigate to="/escaneo" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenedor principal */}
      <div className="flex-1 ml-60 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
        {/* Footer discreto */}
        <footer className="px-8 py-3 bg-transparent text-[11px] text-slate-400 flex justify-between items-center border-t border-slate-200/60">
          <span>Telebachillerato Comunitario &copy; {new Date().getFullYear()}</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Soporte Técnico</span>
            <span className="hover:text-slate-600 cursor-pointer">Guía de Usuario</span>
            <span className="hover:text-slate-600 cursor-pointer">Privacidad</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
