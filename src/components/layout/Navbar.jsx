import React, { useState } from 'react';
import { Search, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/alumnos?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Breadcrumb dinámico según la ruta
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return { section: 'Dashboard', page: 'Resumen General' };
    if (path.includes('/grupos/nuevo')) return { section: 'Administración', page: 'Nuevo Grupo' };
    if (path.includes('/grupos')) return { section: 'Administración', page: 'Gestión de Grupos' };
    if (path.includes('/alumnos/nuevo')) return { section: 'Alumnos', page: 'Nuevo Alumno' };
    if (path.includes('/alumnos')) return { section: 'Alumnos', page: 'Gestión de Alumnos' };
    if (path.includes('/qr')) return { section: 'Alumnos', page: 'Generación de Credencial' };
    if (path.includes('/asistencias')) return { section: 'Dashboard', page: 'Reportes de Asistencia' };
    if (path.includes('/escaneo')) return { section: 'Kiosco', page: 'Escaneo en Vivo' };
    return { section: 'Sistema', page: 'Control Escolar' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="text-slate-400">{breadcrumb.section}</span>
        <span>/</span>
        <span className="text-slate-800 font-bold">{breadcrumb.page}</span>
      </div>

      {/* Buscador global y Perfil de Usuario */}
      <div className="flex items-center gap-4">
        {isAdmin && (
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar alumnos, grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </form>
        )}

        {/* Campana de Notificaciones Interactivas */}
        <NotificationDropdown />

        {/* Badge de Usuario */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 pl-1.5 pr-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.nombre || 'Usuario'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium capitalize">
                {user?.rol === 'admin' ? 'Administrador' : 'Operador'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Menú desplegable */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-xs text-slate-700 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900 truncate">{user?.nombre}</p>
                <p className="text-slate-500 text-[11px] truncate">@{user?.usuario}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
