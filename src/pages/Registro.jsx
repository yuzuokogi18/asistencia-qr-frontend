import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  KeyRound, 
  Ban,
  School
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import bgImage from '../assets/background-login.jpg';

export const Registro = () => {
  const navigate = useNavigate();
  const { error, success } = useToast();
  const { setSessionDirectly } = useAuth?.() || {};

  const [cupos, setCupos] = useState(null);
  const [loadingCupos, setLoadingCupos] = useState(true);

  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    password: '',
    confirmPassword: '',
    rol: 'admin',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cargarCupos = async () => {
    try {
      setLoadingCupos(true);
      const data = await apiClient.getCuposRegistro();
      setCupos(data);

      // Si el rol admin ya no está disponible, seleccionar operador por defecto
      if (!data.adminDisponible && data.operadorDisponible) {
        setFormData(prev => ({ ...prev, rol: 'operador' }));
      }
    } catch (err) {
      error(err.message || 'No se pudo consultar el estado de cupos');
    } finally {
      setLoadingCupos(false);
    }
  };

  useEffect(() => {
    cargarCupos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nombre.trim() || !formData.usuario.trim() || !formData.password.trim()) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    // Validar cupos en cliente antes de enviar
    if (formData.rol === 'admin' && !cupos.adminDisponible) {
      setErrorMsg('Ya se registraron las 2 cuentas de directora. No hay cupos disponibles para este rol.');
      return;
    }

    if (formData.rol === 'operador' && !cupos.operadorDisponible) {
      setErrorMsg('Ya se registraron las 2 cuentas de operador. No hay cupos disponibles para este rol.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        usuario: formData.usuario.trim(),
        password: formData.password,
        rol: formData.rol,
      };

      const res = await apiClient.registrarUsuario(payload);
      success(`¡Cuenta de ${formData.rol === 'admin' ? 'Directora' : 'Operador'} registrada exitosamente!`);
      
      // Si el AuthContext soporta auto-login directo:
      if (res.token && res.usuario) {
        localStorage.setItem('asistencia_auth_token', res.token);
        localStorage.setItem('asistencia_auth_user', JSON.stringify(res.usuario));
        if (res.usuario.rol === 'operador') {
          navigate('/escaneo');
        } else {
          navigate('/dashboard');
        }
        window.location.reload();
      } else {
        navigate('/login');
      }
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo completar el registro');
      // Recargar cupos por si otro usuario se registró simultáneamente
      cargarCupos();
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCupos) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400">Verificando cupos institucionales disponibles...</p>
        </div>
      </div>
    );
  }

  // CASO: REGISTRO COMPLETAMENTE CERRADO (4/4 CUENTAS ASIGNADAS)
  if (cupos && !cupos.registroAbierto) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-8 bg-slate-900 overflow-hidden select-none">
        {/* Fondo institucional oficial */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-slate-950/50" />

        <div className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-2xl p-8 sm:p-10 shadow-2xl border border-slate-100 text-center space-y-6">
          <img 
            src="/logo-telebachillerato.png" 
            alt="Telebachillerato Comunitario" 
            className="h-16 w-auto mx-auto object-contain drop-shadow-sm" 
          />
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Ban className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200 mb-2">
              CUPO INSTITUCIONAL COMPLETO
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Registro Institucional Cerrado
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              El sistema ha alcanzado el límite máximo de <strong>4 cuentas asignadas</strong> permitidas por la institución:
            </p>
          </div>

          {/* Tarjetas de estado de cupo 4/4 */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DIRECTORAS (ADMIN)</p>
              <p className="text-base font-black text-slate-800 mt-0.5">2 de 2</p>
              <span className="text-[10px] font-bold text-red-600">Cupo agotado</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PREFECTURA (OPERADOR)</p>
              <p className="text-base font-black text-slate-800 mt-0.5">2 de 2</p>
              <span className="text-[10px] font-bold text-red-600">Cupo agotado</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed text-left">
            💡 Si usted ya cuenta con una cuenta activa, inicie sesión con su usuario y contraseña. Si requiere reemplazar una cuenta existente, solicite a la Dirección escolar la baja del usuario correspondiente.
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-colors"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // CASO: REGISTRO ABIERTO (MENOS DE 4 CUENTAS)
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-8 bg-slate-900 overflow-hidden select-none">
      {/* Fondo institucional oficial */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-slate-950/50" />

      <div className="relative z-10 w-full max-w-xl mx-auto">
        <div className="bg-white rounded-2xl p-6 sm:p-9 shadow-2xl border border-slate-100">
          
          {/* Header */}
          <div className="mb-5 text-center sm:text-left">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo-emblema.png" 
                  alt="Telebachillerato Comunitario" 
                  className="h-11 sm:h-12 w-auto object-contain drop-shadow-sm shrink-0" 
                />
                <div className="leading-tight text-left">
                  <span className="text-xs sm:text-sm font-black text-slate-800 tracking-wider uppercase block">
                    TELEBACHILLERATO
                  </span>
                  <span className="text-[11px] sm:text-xs font-black text-teal-700 tracking-widest uppercase block">
                    COMUNITARIO
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                CUPO: 4 CUENTAS
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Registro Institucional
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Cada integrante del personal escolar se registra una sola vez en el sistema.
            </p>
          </div>

          {/* INDICADORES DE CUPO DISPONIBLE */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Cupo Directoras */}
            <div className={`p-3 rounded-xl border transition-all ${
              cupos?.adminDisponible 
                ? 'bg-blue-50/70 border-blue-200 text-blue-900' 
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Directora (Admin)</span>
                <span className="text-[11px] font-mono font-bold">{cupos?.admin} / {cupos?.maxAdmin}</span>
              </div>
              <p className="text-xs font-black mt-0.5">
                {cupos?.adminDisponible ? `${cupos.maxAdmin - cupos.admin} disponible(s)` : 'Cupo completo'}
              </p>
            </div>

            {/* Cupo Operadores */}
            <div className={`p-3 rounded-xl border transition-all ${
              cupos?.operadorDisponible 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Operador (Entrada)</span>
                <span className="text-[11px] font-mono font-bold">{cupos?.operador} / {cupos?.maxOperador}</span>
              </div>
              <p className="text-xs font-black mt-0.5">
                {cupos?.operadorDisponible ? `${cupos.maxOperador - cupos.operador} disponible(s)` : 'Cupo completo'}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* SELECCIÓN DE ROL CON CUPO */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                ROL A REGISTRAR *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opción 1: Directora (Admin) */}
                <button
                  type="button"
                  disabled={!cupos?.adminDisponible}
                  onClick={() => setFormData(prev => ({ ...prev, rol: 'admin' }))}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    formData.rol === 'admin'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/30'
                      : !cupos?.adminDisponible
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Directora (Admin)</span>
                    {formData.rol === 'admin' && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Acceso total a estadísticas, grupos, alumnos y reportes.
                  </p>
                  {!cupos?.adminDisponible && (
                    <p className="text-[10px] font-bold text-amber-700 mt-2 bg-amber-50 p-1 rounded border border-amber-200">
                      ⚠️ Ya se registraron las 2 cuentas de directora.
                    </p>
                  )}
                </button>

                {/* Opción 2: Operador (Prefectura) */}
                <button
                  type="button"
                  disabled={!cupos?.operadorDisponible}
                  onClick={() => setFormData(prev => ({ ...prev, rol: 'operador' }))}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    formData.rol === 'operador'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/30'
                      : !cupos?.operadorDisponible
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Operador (Entrada)</span>
                    {formData.rol === 'operador' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Acceso directo y exclusivo a la pantalla del Kiosco de Escaneo QR.
                  </p>
                  {!cupos?.operadorDisponible && (
                    <p className="text-[10px] font-bold text-amber-700 mt-2 bg-amber-50 p-1 rounded border border-amber-200">
                      ⚠️ Ya se registraron las 2 cuentas de operador.
                    </p>
                  )}
                </button>
              </div>
            </div>

            {/* Nombre Completo */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                NOMBRE COMPLETO *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Lic. Laura Elena Gutiérrez"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Nombre de Usuario */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                NOMBRE DE USUARIO (LOGIN) *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleChange}
                  placeholder="Ej. laura_directora o prefectura_turno1"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Contraseña y Confirmación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  CONTRASEÑA *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  CONFIRMAR CONTRASEÑA *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repita su contraseña"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Botón Registrar */}
            <button
              type="submit"
              disabled={submitting || (formData.rol === 'admin' && !cupos?.adminDisponible) || (formData.rol === 'operador' && !cupos?.operadorDisponible)}
              className="w-full py-3 bg-[#0c6b64] hover:bg-[#095751] active:bg-[#074742] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors disabled:opacity-50 mt-2 cursor-pointer"
            >
              {submitting ? 'REGISTRANDO CUENTA...' : 'COMPLETAR REGISTRO INSTITUCIONAL'}
            </button>

            {/* Enlace a Login */}
            <div className="pt-3 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                ¿Ya tienes una cuenta registrada?{' '}
                <Link to="/login" className="font-bold text-[#0c6b64] hover:underline">
                  Iniciar Sesión
                </Link>
              </p>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
