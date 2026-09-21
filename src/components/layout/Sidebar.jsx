import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  QrCode, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout, isAdmin, isOperador } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Ítems de navegación según el rol
  const navItems = isOperador
    ? [
        { 
          to: '/escaneo', 
          label: 'Kiosco de Escaneo', 
          icon: QrCode,
          highlight: true,
        },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/grupos', label: 'Grupos', icon: Users },
        { to: '/alumnos', label: 'Alumnos', icon: GraduationCap },
        { to: '/asistencias', label: 'Asistencias', icon: ClipboardCheck },
        { to: '/escaneo', label: 'Kiosco de Escaneo', icon: QrCode },
      ];

  return (
    <aside className="w-60 bg-slate-50 border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Header Institucional con Logotipo Oficial */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-center">
        <img 
          src="/logo-telebachillerato.png" 
          alt="Telebachillerato Comunitario" 
          className="h-16 w-auto object-contain drop-shadow-sm" 
        />
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                isActive
                  ? 'bg-slate-200/80 text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-4 h-4 text-slate-500" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer del Sidebar */}
      <div className="p-3 border-t border-slate-200 space-y-1">
        {isAdmin && (
          <NavLink
            to="/configuracion"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isActive ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`
            }
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Configuración</span>
          </NavLink>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
