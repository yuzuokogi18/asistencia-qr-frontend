import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  Save, 
  User, 
  ShieldAlert, 
  Download, 
  Printer, 
  Clock, 
  QrCode,
  BookOpen,
  Calendar
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { API_CONFIG } from '../../api/config';
import { useToast } from '../../context/ToastContext';

export const AlumnoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { error, success } = useToast();

  const [grupos, setGrupos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    matricula: '',
    grupo_id: '',
    activo: true,
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showQrPreview, setShowQrPreview] = useState(true);

  // Cargar grupos para el selector
  useEffect(() => {
    apiClient.getGrupos()
      .then((data) => {
        setGrupos(data);
        if (!isEditing && data.length > 0) {
          setFormData(prev => ({ ...prev, grupo_id: data[0].id }));
        }
      })
      .catch((err) => error('Error al cargar grupos escolares'));
  }, []);

  // Si se está editando, cargar los datos del alumno
  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      apiClient.getAlumno(id)
        .then((alu) => {
          setFormData({
            nombre: alu.nombre,
            apellido_paterno: alu.apellido_paterno,
            apellido_materno: alu.apellido_materno,
            matricula: alu.matricula,
            grupo_id: alu.grupo_id,
            activo: alu.activo,
          });
        })
        .catch((err) => {
          error(err.message || 'Error al cargar alumno');
          navigate('/alumnos');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.apellido_paterno.trim() || !formData.matricula.trim()) {
      error('Nombre, apellido paterno y matrícula son campos obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        matricula: formData.matricula.trim(),
        nombre: formData.nombre.trim(),
        apellido_paterno: formData.apellido_paterno.trim(),
        apellido_materno: formData.apellido_materno.trim() || '',
        grupo_id: parseInt(formData.grupo_id, 10),
      };

      if (isEditing) {
        await apiClient.actualizarAlumno(id, { ...payload, activo: formData.activo });
        success('Información del alumno actualizada con éxito');
      } else {
        await apiClient.crearAlumno(payload);
        success('Alumno registrado exitosamente');
      }
      navigate('/alumnos');
    } catch (err) {
      error(err.message || 'Error al guardar alumno');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async () => {
    if (window.confirm(`¿Confirmas eliminar al alumno "${formData.nombre} ${formData.apellido_paterno}"?`)) {
      try {
        await apiClient.eliminarAlumno(id);
        success('Alumno dado de baja');
        navigate('/alumnos');
      } catch (err) {
        error(err.message || 'No se pudo dar de baja al alumno');
      }
    }
  };

  const grupoSeleccionado = grupos.find(g => g.id === parseInt(formData.grupo_id, 10));
  const nombreCompleto = `${formData.nombre} ${formData.apellido_paterno} ${formData.apellido_materno}`.trim();
  const qrImageUrl = formData.matricula ? apiClient.getQrUrl(formData.matricula) : '';

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Cargando expediente del alumno...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 select-none max-w-6xl mx-auto pb-12">
      
      {/* 1. ENCABEZADO Y BREADCRUMB */}
      <div>
        <Link 
          to="/alumnos" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Alumnos / Gestión de Alumno</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isEditing ? 'Perfil del Alumno' : 'Nuevo Registro de Alumno'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Administre la información académica y genere credenciales de acceso.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/alumnos')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              Regresar
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleEliminar}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL EN 2 COLUMNAS (CAPTURA 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Datos del Formulario */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Datos Generales */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Datos Generales
                </h3>
                <p className="text-[11px] text-slate-400">
                  Información oficial para el registro escolar y expedientes.
                </p>
              </div>
            </div>

            {/* Nombre de Pila */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                NOMBRE(S) *
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Apellidos Paterno y Materno */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  APELLIDO PATERNO *
                </label>
                <input
                  type="text"
                  name="apellido_paterno"
                  required
                  value={formData.apellido_paterno}
                  onChange={handleChange}
                  placeholder="Pérez"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  APELLIDO MATERNO
                </label>
                <input
                  type="text"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleChange}
                  placeholder="García"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Matrícula y Estatus Académico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  MATRÍCULA / ID ÚNICO *
                </label>
                <input
                  type="text"
                  name="matricula"
                  required
                  value={formData.matricula}
                  onChange={handleChange}
                  placeholder="20261001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-mono font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ESTATUS ACADÉMICO
                </label>
                <select
                  name="activo"
                  value={formData.activo ? 'true' : 'false'}
                  onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.value === 'true' }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                >
                  <option value="true">Activo</option>
                  <option value="false">Baja</option>
                </select>
              </div>
            </div>

            {/* Grupo y Turno */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  GRUPO ESCOLAR ASIGNADO
                </label>
                <select
                  name="grupo_id"
                  value={formData.grupo_id}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                >
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre} ({g.turno === 'matutino' ? 'Matutino' : 'Vespertino'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  TURNO DEL GRUPO
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={grupoSeleccionado ? (grupoSeleccionado.turno === 'matutino' ? 'Turno Matutino' : 'Turno Vespertino') : 'Sin turno'}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 font-medium capitalize"
                />
              </div>
            </div>
          </div>

          {/* Card: Seguridad y Acceso */}
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/80 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-blue-900">Seguridad y Acceso</h4>
              <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                El código QR codifica de manera única la matrícula del alumno. El lector físico en la entrada escaneará este código para registrar entrada o salida.
              </p>
            </div>
          </div>

        </div>

        {/* Columna Derecha: Tarjeta de Acceso y Código QR Real */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Tarjeta de Resumen con QR Real */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Header de la tarjeta */}
            <div className="bg-slate-900 text-white p-5 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md mb-2">
                {formData.nombre ? formData.nombre.charAt(0).toUpperCase() : 'A'}
              </div>
              <h3 className="text-sm font-bold truncate">
                {nombreCompleto || 'Nombre del Alumno'}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {formData.matricula || '2026----'}
              </p>
              <div className="flex justify-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-blue-400 border border-slate-700">
                  {grupoSeleccionado?.nombre || 'Grupo'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {formData.activo ? 'activo' : 'baja'}
                </span>
              </div>
            </div>

            {/* Código QR */}
            {showQrPreview && (
              <div className="p-6 text-center space-y-4 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  CÓDIGO DE ACCESO
                </p>

                {formData.matricula ? (
                  <div className="inline-block p-4 bg-white border-2 border-dashed border-slate-200 rounded-xl shadow-inner">
                    <img 
                      src={qrImageUrl} 
                      alt="Código QR del Alumno"
                      className="w-40 h-40 mx-auto object-contain"
                    />
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-2 uppercase">
                      VÁLIDO CICLO {API_CONFIG.SCHOOL_CYCLE}
                    </p>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                    Ingrese una matrícula para generar el QR
                  </div>
                )}

                {/* Botones de Descargar e Imprimir */}
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={!formData.matricula}
                    onClick={() => apiClient.descargarQr(formData.matricula, `QR_${formData.matricula}.png`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </button>

                  <button
                    type="button"
                    disabled={!formData.matricula}
                    onClick={() => navigate(`/qr/${formData.matricula}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-40"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Ver Credencial</span>
                  </button>
                </div>
              </div>
            )}

            {/* Botón toggle ocultar/mostrar */}
            <div className="p-2 text-center bg-slate-50">
              <button
                type="button"
                onClick={() => setShowQrPreview(!showQrPreview)}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider"
              >
                {showQrPreview ? 'OCULTAR PREVISUALIZACIÓN' : 'MOSTRAR PREVISUALIZACIÓN'}
              </button>
            </div>
          </div>

          {/* Card Contexto Académico */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Contexto Académico
            </h4>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Ciclo Escolar:</span>
                <span className="font-bold text-slate-800">{API_CONFIG.SCHOOL_CYCLE}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Grado:</span>
                <span className="font-bold text-slate-800">{grupoSeleccionado?.grado || 'General'}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Turno:</span>
                <span className="font-bold text-slate-800 capitalize">{grupoSeleccionado?.turno || 'Matutino'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </form>
  );
};
