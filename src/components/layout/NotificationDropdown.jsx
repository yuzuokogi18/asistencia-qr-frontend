import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  LogOut, 
  Check, 
  ExternalLink, 
  RefreshCw,
  CheckCircle2,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAlertasRecientes(15);
      setAlertas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar alertas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
    // Sondeo periódico cada 45 segundos para mantener actualizado el kiosco
    const interval = setInterval(cargarAlertas, 45000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar al hacer clic fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleResolverAlerta = async (e, id) => {
    e.stopPropagation();
    try {
      await apiClient.resolverAlerta(id);
      setAlertas(prev => prev.map(a => a.id === id ? { ...a, resuelta: true } : a));
    } catch (err) {
      console.error('No se pudo resolver la alerta:', err);
    }
  };

  const noResueltas = alertas.filter(a => !a.resuelta);
  const conteoPendientes = noResueltas.length;

  const getTipoInfo = (tipo) => {
    switch (tipo) {
      case 'retardo':
        return {
          label: 'Retardo',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Clock,
          iconColor: 'text-amber-600',
        };
      case 'salida_anticipada':
        return {
          label: 'Salida Anticipada',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: LogOut,
          iconColor: 'text-purple-600',
        };
      case 'falta_injustificada':
      default:
        return {
          label: 'Inasistencia',
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: AlertTriangle,
          iconColor: 'text-red-600',
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Notificaciones y Alertas Escolares"
        className={`relative p-2 rounded-xl transition-all ${
          isOpen 
            ? 'bg-blue-50 text-blue-600 shadow-2xs' 
            : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
        }`}
      >
        <Bell className="w-4 h-4" />
        {conteoPendientes > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] h-4.5 min-w-4.5 px-1 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
            {conteoPendientes > 9 ? '9+' : conteoPendientes}
          </span>
        )}
      </button>

      {/* Menú Desplegable de Notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fadeIn text-slate-800">
          
          {/* Header del Dropdown */}
          <div className="p-3.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 tracking-tight">
                  Notificaciones y Alertas
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {conteoPendientes === 0 
                    ? 'Al día • Sin incidencias pendientes' 
                    : `${conteoPendientes} incidencia(s) por atender`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={cargarAlertas}
                title="Actualizar notificaciones"
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Lista de Alertas */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading && alertas.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-blue-600" />
                Cargando notificaciones...
              </div>
            ) : alertas.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  ¡Todo en orden!
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  No hay retardos ni incidencias de asistencia pendientes en este momento.
                </p>
              </div>
            ) : (
              alertas.map((alerta) => {
                const info = getTipoInfo(alerta.tipo);
                const IconComponent = info.icon;
                return (
                  <div
                    key={alerta.id}
                    className={`p-3.5 transition-colors flex gap-3 ${
                      alerta.resuelta 
                        ? 'bg-slate-50/50 opacity-60' 
                        : 'hover:bg-slate-50 bg-white'
                    }`}
                  >
                    {/* Icono de tipo de alerta */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${info.bg}`}>
                      <IconComponent className={`w-4 h-4 ${info.iconColor}`} />
                    </div>

                    {/* Contenido de la alerta */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${info.bg}`}>
                          {info.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {alerta.tiempo_relativo || alerta.fecha_hora?.substring(11, 16)}
                        </span>
                      </div>

                      <p className="text-xs font-black text-slate-900 truncate">
                        {alerta.alumno?.nombre_completo || 'Alumno'}
                      </p>

                      <p className="text-[11px] text-slate-500 leading-tight">
                        {alerta.descripcion}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="font-semibold text-slate-400">
                          {alerta.grupo?.nombre ? `Grupo: ${alerta.grupo.nombre}` : ''}
                        </span>

                        {isAdmin && !alerta.resuelta && (
                          <button
                            onClick={(e) => handleResolverAlerta(e, alerta.id)}
                            className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <Check className="w-3 h-3" />
                            <span>Atendida</span>
                          </button>
                        )}
                        {alerta.resuelta && (
                          <span className="text-emerald-600 font-bold inline-flex items-center gap-0.5">
                            ✓ Atendida
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer del Dropdown */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/asistencias');
              }}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <span>Ver reporte general de asistencias</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
