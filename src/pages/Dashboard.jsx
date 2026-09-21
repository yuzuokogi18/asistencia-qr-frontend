import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Clock, 
  Calendar, 
  Download, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  UserPlus, 
  ClipboardCheck, 
  ArrowUpRight,
  TrendingUp,
  MoreVertical,
  Check
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { error, success } = useToast();

  // Estados de datos reales
  const [resumen, setResumen] = useState(null);
  const [historialSemanal, setHistorialSemanal] = useState([]);
  const [rankingGrupos, setRankingGrupos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado del buscador rápido
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Cargar datos iniciales del Dashboard
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resumenData, historialData, cumplimientoData, alertasData] = await Promise.all([
        apiClient.getResumenHoy(),
        apiClient.getHistorialSemanal(),
        apiClient.getCumplimiento(),
        apiClient.getAlertasRecientes(5),
      ]);

      setResumen(resumenData);
      setHistorialSemanal(historialData?.dias || []);
      setRankingGrupos(cumplimientoData || []);
      setAlertas(alertasData || []);
    } catch (err) {
      error(err.message || 'Error al cargar métricas del Dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Debounce para Búsqueda Rápida
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resultados = await apiClient.buscarAlumnos(searchQuery.trim());
        setSearchResults(resultados);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Descargar Reporte PDF Diario
  const handleDescargarReporte = async () => {
    try {
      await apiClient.descargarReporteDiarioPdf();
      success('Reporte diario en PDF descargado correctamente');
    } catch (err) {
      error(err.message || 'No se pudo descargar el reporte');
    }
  };

  // Resolver alerta directamente desde el widget
  const handleResolverAlerta = async (alertaId, e) => {
    e.stopPropagation();
    try {
      await apiClient.resolverAlerta(alertaId);
      success('Alerta marcada como resuelta');
      setAlertas(prev => prev.map(a => a.id === alertaId ? { ...a, resuelta: true } : a));
    } catch (err) {
      error(err.message || 'No se pudo resolver la alerta');
    }
  };

  // Formato de fecha de hoy para el encabezado
  const fechaHoyTexto = new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      
      {/* 1. ENCABEZADO PRINCIPAL DE LA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Resumen del Plantel
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo en tiempo real de asistencia y participación escolar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Pill de Fecha */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Hoy: {fechaHoyTexto}</span>
          </div>

          {/* Botón Descargar Reporte Diario */}
          <button
            onClick={handleDescargarReporte}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Reporte Diario</span>
          </button>
        </div>
      </div>

      {/* 2. TARJETAS MÉTRICAS SUPERIORES (4 STAT CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tarjeta 1: Total Alumnos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            {resumen?.alumnos_total?.comparativa_ayer && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1">
                ↗ {resumen.alumnos_total.comparativa_ayer}
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              TOTAL ALUMNOS
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {resumen?.alumnos_total?.inscritos || '--'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {resumen?.alumnos_total?.presentes || 0} presentes hoy
            </p>
          </div>
        </div>

        {/* Tarjeta 2: Asistencia Hoy */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            {resumen?.porcentaje_asistencia?.comparativa_ayer && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1">
                ↗ {resumen.porcentaje_asistencia.comparativa_ayer}
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ASISTENCIA HOY
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {resumen?.porcentaje_asistencia?.valor !== undefined ? `${resumen.porcentaje_asistencia.valor}%` : '--'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Promedio general del día
            </p>
          </div>
        </div>

        {/* Tarjeta 3: Grupos Activos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              GRUPOS ACTIVOS
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {resumen?.grupos_activos?.total || '--'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Matutino: {resumen?.grupos_activos?.matutino || 0} | Vespertino: {resumen?.grupos_activos?.vespertino || 0}
            </p>
          </div>
        </div>

        {/* Tarjeta 4: Retardos Semanales */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            {resumen?.retardos_semana?.comparativa && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 flex items-center gap-1">
                {resumen.retardos_semana.comparativa.startsWith('+') ? '↗' : '↘'} {resumen.retardos_semana.comparativa}
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              RETARDOS SEMANALES
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {resumen?.retardos_semana?.total || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Incidentes reportados esta semana
            </p>
          </div>
        </div>

      </div>

      {/* 3. FILA MEDIA: HISTORIAL SEMANAL Y CUMPLIMIENTO POR GRUPO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfica de Área: Historial de Asistencia Semanal */}
        <div className="lg:col-span-8 bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Historial de Asistencia Semanal
              </h3>
              <p className="text-xs text-slate-500">
                Porcentaje de alumnos presentes por día laborable
              </p>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 rounded-md text-[11px] font-semibold text-slate-600">
              Semana Actual
            </span>
          </div>

          {/* Gráfico SVG de Área con Curva Suave */}
          <div className="h-56 w-full relative flex items-end pt-6">
            {/* Ejes Y (0%, 25%, 50%, 75%, 100%) */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400">
              <div className="border-b border-slate-100 pb-0.5">100%</div>
              <div className="border-b border-slate-100 pb-0.5">75%</div>
              <div className="border-b border-slate-100 pb-0.5">50%</div>
              <div className="border-b border-slate-100 pb-0.5">25%</div>
              <div className="border-b border-slate-200 pb-0.5">0%</div>
            </div>

            {/* Barras e indicadores dinámicos con los datos reales */}
            <div className="w-full pl-8 grid grid-cols-5 gap-4 h-full items-end z-10">
              {historialSemanal.map((dia, idx) => {
                const pct = dia.porcentaje_asistencia || 0;
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <div className="text-[11px] font-bold text-blue-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {pct}%
                    </div>
                    {/* Barra con gradiente azul */}
                    <div 
                      className="w-full max-w-[48px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-md transition-all duration-500 hover:brightness-110 shadow-xs cursor-pointer"
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                    <span className="text-[11px] font-semibold text-slate-600 mt-2">
                      {dia.dia.substring(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-600 rounded-xs"></span>
              <span>Porcentaje de Asistencia Diaria</span>
            </div>
          </div>
        </div>

        {/* Tarjeta: Cumplimiento por Grupo */}
        <div className="lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Cumplimiento por Grupo
                </h3>
                <p className="text-xs text-slate-500">
                  Grupos con mayor índice de asistencia hoy
                </p>
              </div>
            </div>

            <div className="space-y-4 my-2">
              {rankingGrupos.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No hay datos de grupos hoy</p>
              ) : (
                rankingGrupos.slice(0, 5).map((g) => (
                  <div key={g.grupo_id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{g.nombre} ({g.turno === 'matutino' ? 'Mat.' : 'Vesp.'})</span>
                      <span className="font-bold text-slate-900">{g.porcentajeAsistencia}%</span>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${g.porcentajeAsistencia}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/grupos')}
            className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>Ver todos los grupos</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 4. FILA INFERIOR: ALERTAS RECIENTES Y BÚSQUEDA RÁPIDA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Alertas Recientes */}
        <div className="lg:col-span-6 bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Alertas Recientes
                </h3>
                <p className="text-xs text-slate-500">
                  Inasistencias y retardos críticos detectados
                </p>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            <div className="space-y-3 my-2">
              {alertas.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No hay alertas registradas</p>
              ) : (
                alertas.slice(0, 4).map((alerta) => {
                  const esFalta = alerta.tipo === 'falta_injustificada';
                  const esRetardo = alerta.tipo === 'retardo';

                  return (
                    <div 
                      key={alerta.id}
                      className={`flex items-start justify-between p-3 rounded-lg border transition-all ${
                        alerta.resuelta ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-100 hover:border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {esFalta ? (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        ) : esRetardo ? (
                          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {alerta.alumno?.nombre_completo || 'Alumno'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {alerta.grupo?.nombre} • <span className="capitalize">{alerta.tipo.replace('_', ' ')}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {alerta.tiempo_relativo}
                        </span>
                        {!alerta.resuelta && (
                          <button
                            onClick={(e) => handleResolverAlerta(alerta.id, e)}
                            title="Marcar como resuelta"
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                          >
                            <Check className="w-3 h-3" /> Resolver
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/asistencias')}
            className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors text-center border border-slate-200"
          >
            VER REGISTRO COMPLETO
          </button>
        </div>

        {/* Búsqueda Rápida de Alumno + Acciones */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Card de Búsqueda Rápida */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Búsqueda Rápida de Alumno
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Localiza información de contacto o QR de un alumno específico
            </p>

            {/* Input de búsqueda */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nombre, matrícula o código QR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Despliegue de Resultados */}
            {searchResults.length > 0 && (
              <div className="mt-3 divide-y divide-slate-100 max-h-48 overflow-y-auto border border-slate-100 rounded-lg bg-slate-50/50 p-1">
                {searchResults.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/alumnos`)}
                    className="p-2.5 hover:bg-white rounded-md cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                        {a.iniciales}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{a.nombre_completo}</p>
                        <p className="text-[10px] text-slate-400">{a.matricula} • {a.grupo?.nombre}</p>
                      </div>
                    </div>
                    {a.asistencia_hoy && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        a.asistencia_hoy.estatus === 'retardo' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {a.asistencia_hoy.estatus === 'retardo' ? 'Retardo' : 'Presente'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Dos Acciones Rápidas */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => navigate('/alumnos')}
                className="flex items-center gap-3 p-3.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Alta de Alumno</p>
                  <p className="text-[10px] text-slate-400">Registrar nuevo ingreso</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/asistencias')}
                className="flex items-center gap-3 p-3.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Pasar Asistencia</p>
                  <p className="text-[10px] text-slate-400">Registro por grupo</p>
                </div>
              </button>
            </div>
          </div>

          {/* Banner Azul: ¿Listo para el Escaneo? */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <h4 className="text-sm font-bold tracking-tight">¿Listo para el Escaneo?</h4>
              <p className="text-xs text-blue-100 mt-1 max-w-sm leading-relaxed">
                Inicia el modo kiosco para recibir alumnos en la entrada principal con el lector de código QR.
              </p>
            </div>
            <div className="mt-4 relative z-10">
              <button
                onClick={() => navigate('/escaneo')}
                className="px-4 py-2 bg-white text-blue-800 hover:bg-blue-50 font-bold text-xs rounded-lg shadow-xs transition-colors"
              >
                Abrir Modo Kiosco
              </button>
            </div>
            {/* Ícono de fondo semitransparente */}
            <QrCode className="w-24 h-24 text-white/10 absolute right-3 bottom-1 pointer-events-none" />
          </div>

        </div>

      </div>

    </div>
  );
};
