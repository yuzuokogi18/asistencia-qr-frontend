import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, X, Save, Clock, AlertTriangle, Users, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { ImportarAlumnosModal } from '../../components/grupos/ImportarAlumnosModal';

export const GrupoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { error, success } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    grado: '1° Semestre',
    turno: 'matutino',
    ciclo_escolar: '2026-2027',
    hora_inicio_entrada: '08:00',
    hora_limite_entrada: '09:00',
    hora_inicio_salida: '13:00',
    hora_esperada_salida: '14:00',
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      apiClient.getGrupo(id)
        .then((g) => {
          setFormData({
            nombre: g.nombre || '',
            grado: g.grado || '1° Semestre',
            turno: 'matutino',
            ciclo_escolar: g.ciclo_escolar || '2026-2027',
            hora_inicio_entrada: g.hora_inicio_entrada ? g.hora_inicio_entrada.substring(0, 5) : '08:00',
            hora_limite_entrada: g.hora_limite_entrada ? g.hora_limite_entrada.substring(0, 5) : '09:00',
            hora_inicio_salida: g.hora_inicio_salida ? g.hora_inicio_salida.substring(0, 5) : '13:00',
            hora_esperada_salida: g.hora_esperada_salida ? g.hora_esperada_salida.substring(0, 5) : '14:00',
          });
        })
        .catch((err) => {
          error(err.message || 'Error al cargar los datos del grupo');
          navigate('/grupos');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return null;
    return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  };

  const buildPayload = () => ({
    nombre: formData.nombre.trim(),
    grado: formData.grado,
    turno: 'matutino',
    ciclo_escolar: formData.ciclo_escolar,
    hora_inicio_entrada: formatTime(formData.hora_inicio_entrada),
    hora_limite_entrada: formatTime(formData.hora_limite_entrada) || '09:00:00',
    hora_inicio_salida: formatTime(formData.hora_inicio_salida),
    hora_esperada_salida: formatTime(formData.hora_esperada_salida) || '14:00:00',
    tiene_segundo_horario: false,
    hora_inicio_entrada2: null,
    hora_limite_entrada2: null,
    hora_inicio_salida2: null,
    hora_esperada_salida2: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      error('El nombre del grupo es obligatorio');
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();

      if (isEditing) {
        await apiClient.actualizarGrupo(id, payload);
        success('Grupo actualizado correctamente');
      } else {
        await apiClient.crearGrupo(payload);
        success('Grupo creado exitosamente');
      }
      navigate('/grupos');
    } catch (err) {
      error(err.message || 'Error al guardar el grupo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCrearGrupoAntesDeImportar = async () => {
    if (!formData.nombre.trim()) {
      error('El nombre del grupo es obligatorio para poder importar alumnos');
      throw new Error('Nombre de grupo faltante');
    }

    const payload = buildPayload();
    const nuevo = await apiClient.crearGrupo(payload);
    return nuevo;
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Cargando información del grupo...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 select-none max-w-6xl mx-auto pb-12">
      
      {/* 1. ENCABEZADO SUPERIOR */}
      <div>
        <Link 
          to="/grupos" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Regresar a Grupos</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isEditing ? 'Editar Grupo Escolar' : 'Gestión de Grupos'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure la información administrativa para el nuevo grupo escolar.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (!isEditing && !formData.nombre.trim()) {
                  error('Por favor escribe primero el nombre del grupo para poder importar alumnos.');
                  return;
                }
                setModalImportarAbierto(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Importar Alumnos</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/grupos')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
              <span>Cancelar</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? 'Guardando...' : 'Guardar Grupo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CONTENIDO EN 2 COLUMNAS REPLICADO DEL MAQUETADO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Formulario Principal */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Datos Generales */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Datos Generales
                </h3>
                <p className="text-[11px] text-slate-400">
                  Información principal de identificación del grupo.
                </p>
              </div>
            </div>

            {/* Nombre del Grupo */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                NOMBRE DEL GRUPO *
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingrese el identificador (ej. 402-A o 1° A)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Semestre/Grado y Turno */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  SEMESTRE / GRADO
                </label>
                <select
                  name="grado"
                  value={formData.grado}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                >
                  <option value="1° Semestre">1° Semestre</option>
                  <option value="2° Semestre">2° Semestre</option>
                  <option value="3° Semestre">3° Semestre</option>
                  <option value="4° Semestre">4° Semestre</option>
                  <option value="5° Semestre">5° Semestre</option>
                  <option value="6° Semestre">6° Semestre</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  TURNO
                </label>
                <select
                  name="turno"
                  value={formData.turno}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                >
                  <option value="matutino">Matutino (Plantel exclusivo)</option>
                </select>
              </div>
            </div>

            {/* Ciclo Escolar */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                CICLO ESCOLAR VIGENTE
              </label>
              <select
                name="ciclo_escolar"
                value={formData.ciclo_escolar}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              >
                <option value="2026-2027">Ciclo Escolar 2026-2027</option>
                <option value="2025-2026">Ciclo Escolar 2025-2026</option>
              </select>
            </div>

            <p className="text-[10px] text-slate-400 italic text-center pt-2">
              Todos los campos son obligatorios para el registro administrativo.
            </p>
          </div>

          {/* Card 2: Configuración de Horario (Turno Matutino) */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Configuración de Horario (Turno Matutino)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Defina los rangos de entrada y salida matutina para el registro con lector QR.
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Turno Matutino
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rango de Entrada */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-blue-900 uppercase tracking-wider">
                    Rango de Entrada
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    A tiempo
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Ventana horaria de llegada escolar (ej. de 8:00 a 9:00). Posterior a la hora límite es retardo.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                      Desde (Inicio)
                    </span>
                    <input
                      type="time"
                      name="hora_inicio_entrada"
                      value={formData.hora_inicio_entrada}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                      Hasta (Límite *)
                    </span>
                    <input
                      type="time"
                      name="hora_limite_entrada"
                      required
                      value={formData.hora_limite_entrada}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Rango de Salida */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-indigo-900 uppercase tracking-wider">
                    Rango de Salida
                  </label>
                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Normal
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Ventana horaria de salida escolar (ej. de 13:00 a 14:00). Previo al inicio es salida anticipada.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                      Desde (Inicio)
                    </span>
                    <input
                      type="time"
                      name="hora_inicio_salida"
                      value={formData.hora_inicio_salida}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                      Hasta (Esperada *)
                    </span>
                    <input
                      type="time"
                      name="hora_esperada_salida"
                      required
                      value={formData.hora_esperada_salida}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Columna Derecha: Tarjetas de Información */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card Ilustración: Organización Académica */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Organización Académica</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              La correcta configuración de grupos permite que el sistema genere los listados de asistencia y códigos QR específicos para cada aula.
            </p>
          </div>

          {/* Card Resumen de Grupo */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              RESUMEN DE GRUPO
            </h4>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Nombre:</span>
                <span className="font-bold text-slate-800">{formData.nombre || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Semestre:</span>
                <span className="font-bold text-slate-800">{formData.grado}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Turno:</span>
                <span className="font-bold text-slate-800">Matutino</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block mb-1">Horario Matutino:</span>
                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Entrada:</span>
                    <strong className="text-blue-700 font-mono">
                      {formData.hora_inicio_entrada || '--:--'} a {formData.hora_limite_entrada || '--:--'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Salida:</span>
                    <strong className="text-indigo-700 font-mono">
                      {formData.hora_inicio_salida || '--:--'} a {formData.hora_esperada_salida || '--:--'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Carga Rápida de Alumnos (CSV / Excel) */}
          <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-xl p-5 border border-emerald-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-900">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Carga Rápida de Alumnos</h4>
                <p className="text-[10px] text-emerald-700">Evite el registro uno por uno</p>
              </div>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Suba un archivo <strong>CSV</strong> o <strong>Excel</strong> con las matrículas y nombres para dar de alta a todos los alumnos del grupo en un solo paso con vista previa interactiva.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!isEditing && !formData.nombre.trim()) {
                  error('Por favor escriba primero el nombre del grupo para poder importar la lista de alumnos.');
                  return;
                }
                setModalImportarAbierto(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Importar Alumnos desde Archivo</span>
            </button>
          </div>

          {/* Card Aviso Importante */}
          <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-200/80 text-amber-900 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>AVISO IMPORTANTE</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Al guardar los horarios, la lógica de retardo del escáner en la entrada se actualizará de inmediato para todos los alumnos del grupo.
            </p>
          </div>

        </div>

      </div>

      {/* MODAL DE IMPORTACIÓN MASIVA CSV / EXCEL */}
      <ImportarAlumnosModal
        isOpen={modalImportarAbierto}
        onClose={() => setModalImportarAbierto(false)}
        grupoId={id ? parseInt(id, 10) : null}
        nombreGrupo={formData.nombre}
        onCrearGrupoPrimero={handleCrearGrupoAntesDeImportar}
        onCompletado={(nuevoGrupoId) => {
          navigate(`/grupos/${nuevoGrupoId || id}/alumnos`);
        }}
      />

    </form>
  );
};
