import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  Search, 
  Calendar, 
  RotateCcw,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const AsistenciasReporte = () => {
  const { error, success } = useToast();
  const { isAdmin } = useAuth();

  const [asistencias, setAsistencias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [cerrandoDia, setCerrandoDia] = useState(false);

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split('T')[0]);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');

  // Cargar grupos para el filtro
  useEffect(() => {
    apiClient.getGrupos().then(setGrupos).catch(() => {});
  }, []);

  // Cargar asistencias según filtros
  const cargarAsistencias = async () => {
    try {
      setLoading(true);
      const filtros = {
        fecha: filtroFecha || undefined,
        grupo_id: filtroGrupo || undefined,
        estatus: filtroEstatus || undefined,
      };
      const data = await apiClient.getAsistencias(filtros);
      setAsistencias(data);
    } catch (err) {
      error(err.message || 'Error al consultar historial de asistencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsistencias();
  }, [filtroFecha, filtroGrupo, filtroEstatus]);

  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltroTexto('');
    setFiltroFecha(new Date().toISOString().split('T')[0]);
    setFiltroGrupo('');
    setFiltroEstatus('');
  };

  // Descargar Reporte PDF Diario
  const handleDescargarPdf = async () => {
    try {
      setDescargandoPdf(true);
      await apiClient.descargarReporteDiarioPdf(filtroFecha);
      success('Reporte diario en PDF descargado exitosamente');
    } catch (err) {
      error(err.message || 'Error al descargar el PDF');
    } finally {
      setDescargandoPdf(false);
    }
  };

  // Ejecutar Cierre Diario Administrativo
  const handleEjecutarCierreDiario = async () => {
    setCerrandoDia(true);
    try {
      const res = await apiClient.cierreDiario(filtroFecha);
      success(`Cierre completado: se registraron ${res.total_faltas_registradas} faltas con alerta`);
      setModalCierreAbierto(false);
      cargarAsistencias();
    } catch (err) {
      error(err.message || 'Error al ejecutar cierre diario');
    } finally {
      setCerrandoDia(false);
    }
  };

  // Filtrado local por texto (nombre o matrícula)
  const asistenciasFiltradas = asistencias.filter(a => {
    if (!filtroTexto.trim()) return true;
    const query = filtroTexto.toLowerCase();
    const nombre = (a.alumno?.nombre_completo || '').toLowerCase();
    const matricula = (a.alumno?.matricula || '').toLowerCase();
    return nombre.includes(query) || matricula.includes(query);
  });

  // Estadísticas para las 4 tarjetas superiores
  const totalRegistros = asistencias.length;
  const presentesHoy = asistencias.filter(a => a.hora_entrada !== null && a.estatus !== 'falta').length;
  const retardosHoy = asistencias.filter(a => a.estatus === 'retardo').length;
  const faltasHoy = asistencias.filter(a => a.estatus === 'falta').length;

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-12">
      
      {/* 1. ENCABEZADO Y ACCIONES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Reportes de Asistencia
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulte y gestione el historial de entradas y salidas de la comunidad escolar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón Cierre del Día (Solo Admin) */}
          {isAdmin && (
            <button
              onClick={() => setModalCierreAbierto(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Cierre del Día</span>
            </button>
          )}

          {/* Exportar CSV */}
          <button
            onClick={() => {
              const rows = asistenciasFiltradas.map(a => 
                `"${a.alumno?.nombre_completo}","${a.alumno?.matricula}","${a.grupo?.nombre}","${a.estatus}","${a.hora_entrada || '--'}","${a.hora_salida || '--'}"`
              );
              const csvContent = `Alumno,Matricula,Grupo,Estatus,Entrada,Salida\n${rows.join('\n')}`;
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `asistencias_${filtroFecha}.csv`;
              link.click();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          {/* Descargar Reporte PDF */}
          <button
            onClick={handleDescargarPdf}
            disabled={descargandoPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{descargandoPdf ? 'Generando PDF...' : 'Descargar Reporte PDF'}</span>
          </button>
        </div>
      </div>

      {/* 2. CUATRO TARJETAS SUPERIORES (CAPTURA 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Alumnos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TOTAL REGISTROS</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalRegistros}</h3>
          </div>
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Asistencias Hoy */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ASISTENCIAS HOY</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{presentesHoy}</h3>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Retardos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">RETARDOS</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{retardosHoy}</h3>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Faltas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">FALTAS</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{faltasHoy}</h3>
          </div>
          <div className="w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 3. BARRA DE FILTROS DE BÚSQUEDA (CAPTURA 8) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            FILTROS DE BÚSQUEDA
          </h3>
          <button
            onClick={handleLimpiarFiltros}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Limpiar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Buscar alumno */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              BUSCAR ALUMNO
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nombre o matrícula..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Fecha del Reporte */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              FECHA DEL REPORTE
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Grupo / Salón */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              GRUPO / SALÓN
            </label>
            <select
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
            >
              <option value="">Todos los grupos</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre} ({g.turno})
                </option>
              ))}
            </select>
          </div>

          {/* Estatus */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              ESTATUS
            </label>
            <select
              value={filtroEstatus}
              onChange={(e) => setFiltroEstatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
            >
              <option value="">Todos los estatus</option>
              <option value="a_tiempo">Presente (A tiempo)</option>
              <option value="retardo">Retardo</option>
              <option value="sin_salida">Sin salida registrada</option>
              <option value="falta">Falta injustificada</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. TABLA DE ASISTENCIAS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Alumno</th>
                <th className="py-3 px-4">Matrícula</th>
                <th className="py-3 px-4">Grupo</th>
                <th className="py-3 px-4">Estatus</th>
                <th className="py-3 px-4">Entrada</th>
                <th className="py-3 px-4">Salida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Consultando registros de asistencia...
                  </td>
                </tr>
              ) : asistenciasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No se encontraron asistencias registradas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                asistenciasFiltradas.map((asist) => {
                  const esRetardo = asist.estatus === 'retardo';
                  const esFalta = asist.estatus === 'falta';
                  const iniciales = (asist.alumno?.nombre_completo || 'A')
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('');

                  return (
                    <tr key={asist.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Alumno */}
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {iniciales}
                        </div>
                        <span className="font-bold text-slate-900">
                          {asist.alumno?.nombre_completo}
                        </span>
                      </td>

                      {/* Matrícula */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {asist.alumno?.matricula}
                      </td>

                      {/* Grupo */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {asist.grupo?.nombre || '--'}
                      </td>

                      {/* Estatus */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          esFalta
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : esRetardo
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            esFalta ? 'bg-red-500' : esRetardo ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <span className="capitalize">{asist.estatus.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* Hora Entrada */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {asist.hora_entrada ? (
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{asist.hora_entrada}</span>
                          </div>
                        ) : '--:--'}
                      </td>

                      {/* Hora Salida */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {asist.hora_salida ? (
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{asist.hora_salida}</span>
                          </div>
                        ) : '--:--'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando {asistenciasFiltradas.length} de {asistencias.length} registros</span>
          <div className="flex gap-1">
            <button disabled className="px-3 py-1 border border-slate-200 rounded-md text-slate-400 disabled:opacity-50">
              Anterior
            </button>
            <button disabled className="px-3 py-1 border border-slate-200 rounded-md text-slate-400 disabled:opacity-50">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN: CIERRE DEL DÍA */}
      {modalCierreAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">¿Confirmas cerrar el día?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Esta acción administrativa identificará a todos los alumnos que no registraron ingreso en la fecha <strong>{filtroFecha}</strong>, les asignará estatus de <strong>FALTA</strong> y creará las alertas de <strong>falta injustificada</strong> correspondientes.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalCierreAbierto(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={cerrandoDia}
                onClick={handleEjecutarCierreDiario}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {cerrandoDia ? 'Cerrando...' : 'Confirmar Cierre'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
