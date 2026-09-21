import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  QrCode, 
  Edit, 
  Trash2, 
  UserCheck, 
  AlertCircle, 
  UserX,
  ExternalLink 
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AlumnosList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { error, success } = useToast();

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('todos'); // 'todos', 'activos', 'bajas'

  // Si viene con query string ?q= desde el navbar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) setSearchTerm(q);
  }, [location.search]);

  const cargarAlumnos = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAlumnos();
      setAlumnos(data);
    } catch (err) {
      error(err.message || 'Error al cargar alumnos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const handleEliminarAlumno = async (id, nombre) => {
    if (window.confirm(`¿Confirmas dar de baja lógica al alumno "${nombre}"?`)) {
      try {
        await apiClient.eliminarAlumno(id);
        success('Alumno dado de baja correctamente');
        setAlumnos(prev => prev.filter(a => a.id !== id));
      } catch (err) {
        error(err.message || 'No se pudo dar de baja al alumno');
      }
    }
  };

  // Filtrado de alumnos
  const alumnosFiltrados = alumnos.filter(a => {
    const coincideTexto = 
      `${a.nombre} ${a.apellido_paterno} ${a.apellido_materno}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.grupo?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!coincideTexto) return false;

    if (filtroEstatus === 'activos') return a.activo !== false;
    if (filtroEstatus === 'bajas') return a.activo === false;
    return true;
  });

  // Estadísticas inferiores
  const totalAlumnos = alumnos.length;
  const activosTotal = alumnos.filter(a => a.activo !== false).length;
  const bajasTotal = totalAlumnos - activosTotal;

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      
      {/* 1. ENCABEZADO Y ACCIONES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestión de Alumnos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administra la información de los estudiantes, sus grupos y credenciales QR.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const csvData = alumnos.map(a => `${a.matricula},"${a.nombre} ${a.apellido_paterno}",${a.grupo?.nombre}`).join('\n');
              const blob = new Blob([`Matrícula,Alumno,Grupo\n${csvData}`], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'alumnos_prepa.csv';
              link.click();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar Lista</span>
          </button>

          <button
            onClick={() => navigate('/alumnos/nuevo')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Alumno</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS Y PESTAÑAS (TODOS, ACTIVOS, BAJAS) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, matrícula o grupo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Pestañas Todos / Activos / Bajas */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
          <button
            onClick={() => setFiltroEstatus('todos')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filtroEstatus === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroEstatus('activos')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filtroEstatus === 'activos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFiltroEstatus('bajas')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filtroEstatus === 'bajas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Bajas
          </button>
        </div>

      </div>

      {/* 3. TABLA DE ALUMNOS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">Foto</th>
                <th className="py-3 px-4">Alumno</th>
                <th className="py-3 px-4">Matrícula</th>
                <th className="py-3 px-4">Grupo</th>
                <th className="py-3 px-4">Estatus</th>
                <th className="py-3 px-4">Asistencia</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Cargando lista de alumnos...
                  </td>
                </tr>
              ) : alumnosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No se encontraron alumnos con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                alumnosFiltrados.map((alumno) => {
                  const nombreCompleto = `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}`;
                  const iniciales = `${alumno.nombre.charAt(0)}${alumno.apellido_paterno.charAt(0)}`.toUpperCase();

                  return (
                    <tr key={alumno.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Avatar */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="w-8 h-8 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {iniciales}
                        </div>
                      </td>

                      {/* Nombre del Alumno */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 leading-tight">
                          {nombreCompleto}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Inscrito en el ciclo 2026-2027
                        </p>
                      </td>

                      {/* Matrícula */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {alumno.matricula}
                      </td>

                      {/* Grupo */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span>{alumno.grupo?.nombre || 'Sin Grupo'}</span>
                        </span>
                      </td>

                      {/* Estatus */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          alumno.activo !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${alumno.activo !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span>{alumno.activo !== false ? 'Activo' : 'Baja'}</span>
                        </span>
                      </td>

                      {/* Asistencia con barra de progreso */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-[11px]">95%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full w-[95%]"></div>
                          </div>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/qr/${alumno.matricula}`)}
                            title="Ver / Generar Credencial QR"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/alumnos/${alumno.id}/editar`)}
                            title="Editar Alumno"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminarAlumno(alumno.id, nombreCompleto)}
                            title="Dar de baja alumno"
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
          <span>Mostrando {alumnosFiltrados.length} de {alumnos.length} alumnos</span>
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

      {/* 4. TRES TARJETAS INFERIORES DE RESUMEN (MAQUETADO CAPTURA 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        
        {/* Total de Alumnos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              TOTAL DE ALUMNOS
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {totalAlumnos}
            </h3>
          </div>
        </div>

        {/* Presentes Hoy */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ALUMNOS ACTIVOS
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {activosTotal}
            </h3>
          </div>
        </div>

        {/* Bajas Registradas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              BAJAS REGISTRADAS
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {bajasTotal}
            </h3>
          </div>
        </div>

      </div>

    </div>
  );
};
