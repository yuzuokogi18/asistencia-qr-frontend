import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  Search, 
  Plus, 
  Download, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Clock 
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const GruposList = () => {
  const navigate = useNavigate();
  const { error, success } = useToast();

  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const cargarGrupos = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getGrupos();
      setGrupos(data);
    } catch (err) {
      error(err.message || 'Error al cargar grupos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGrupos();
  }, []);

  const handleEliminarGrupo = async (id, nombre) => {
    if (window.confirm(`¿Confirmas eliminar el grupo "${nombre}"? Los alumnos mantendrán sus registros.`)) {
      try {
        await apiClient.eliminarGrupo(id);
        success('Grupo eliminado correctamente');
        setGrupos(prev => prev.filter(g => g.id !== id));
      } catch (err) {
        error(err.message || 'No se pudo eliminar el grupo');
      }
    }
  };

  // Filtrado de grupos
  const gruposFiltrados = grupos.filter(g => 
    g.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.grado.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.turno.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas para las 3 tarjetas superiores
  const totalGrupos = grupos.length;
  const totalAlumnos = grupos.reduce((acc, g) => acc + (g.totalAlumnos || 0), 0);
  const capacidadPromedio = totalGrupos > 0 ? Math.round(totalAlumnos / totalGrupos) : 0;

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      
      {/* 1. ENCABEZADO Y ACCIONES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Grupos Escolares
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administre los grupos, turnos y asignaciones de horarios de la institución.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const csvData = grupos.map(g => `${g.nombre},${g.grado},${g.turno},${g.totalAlumnos}`).join('\n');
              const blob = new Blob([`Nombre,Grado,Turno,Alumnos\n${csvData}`], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'grupos_escolares.csv';
              a.click();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar</span>
          </button>

          <button
            onClick={() => navigate('/grupos/nuevo')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Grupo</span>
          </button>
        </div>
      </div>

      {/* 2. TRES TARJETAS DE RESUMEN SUPERIORES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total de Grupos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              TOTAL DE GRUPOS
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {totalGrupos}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Alumnos Registrados */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ALUMNOS REGISTRADOS
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {totalAlumnos}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        {/* Capacidad Promedio */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              CAPACIDAD PROMEDIO
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {capacidadPromedio}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 3. TABLA: LISTADO DE GRUPOS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Barra de Filtro y Búsqueda */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Listado de Grupos</h3>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o turno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Contenedor de la Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Nombre ⇅</th>
                <th className="py-3 px-4">Grado</th>
                <th className="py-3 px-4">Turno</th>
                <th className="py-3 px-4 text-center">Cantidad de Alumnos</th>
                <th className="py-3 px-4">Horarios (Entrada / Salida)</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Cargando grupos escolares...
                  </td>
                </tr>
              ) : gruposFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No se encontraron grupos escolares registrados.
                  </td>
                </tr>
              ) : (
                gruposFiltrados.map((grupo) => (
                  <tr key={grupo.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {grupo.nombre}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {grupo.grado}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        grupo.turno === 'matutino'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {grupo.turno}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {grupo.totalAlumnos || 0}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>
                          Entrada: <strong className="text-slate-800">{grupo.hora_inicio_entrada ? `${grupo.hora_inicio_entrada.substring(0, 5)} - ` : ''}{grupo.hora_limite_entrada?.substring(0, 5)}</strong>
                          {' • '}
                          Salida: <strong className="text-slate-800">{grupo.hora_inicio_salida ? `${grupo.hora_inicio_salida.substring(0, 5)} - ` : ''}{grupo.hora_esperada_salida?.substring(0, 5)}</strong>
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/grupos/${grupo.id}/alumnos`)}
                          title="Ver alumnos del grupo"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/grupos/${grupo.id}/editar`)}
                          title="Editar grupo"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminarGrupo(grupo.id, grupo.nombre)}
                          title="Eliminar grupo"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de Paginación */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando {gruposFiltrados.length} de {grupos.length} grupos registrados</span>
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

    </div>
  );
};
