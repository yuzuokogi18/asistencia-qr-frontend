import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowRight, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import bgImage from '../assets/background-login.jpg';

export const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario.trim() || !password.trim()) {
      setErrorMsg('Por favor ingresa tu usuario y contraseña');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const user = await login(usuario.trim(), password);
      success(`¡Bienvenido(a), ${user.nombre}!`);

      if (user.rol === 'operador') {
        navigate('/escaneo');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-8 md:p-12 bg-[#031d20] overflow-hidden select-none">
      {/* Fondo fotográfico institucional oficial */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />
      {/* Capa de gradiente profundo teal/esmeralda replicada de la maqueta */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#031f23]/95 via-[#053237]/88 to-[#062c31]/35" />

      {/* Contenedor Principal Dividido en 2 Columnas */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Columna Izquierda: Información de Marca e Impacto Institucional */}
        <div className="lg:col-span-6 text-white space-y-7 pr-0 lg:pr-4">
          
          {/* Logo institucional superior proporcional y limpio */}
          <div className="flex items-center gap-4">
            <img 
              src="/logo-emblema.png" 
              alt="Telebachillerato Comunitario" 
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm shrink-0" 
            />
            <div className="leading-tight">
              <span className="text-base sm:text-lg font-black text-white tracking-wider uppercase block">
                TELEBACHILLERATO
              </span>
              <span className="text-sm sm:text-base font-black text-white tracking-widest uppercase block">
                COMUNITARIO
              </span>
            </div>
          </div>

          {/* Badge CONTROL ESCOLAR */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-[#0d4a46]/90 text-[#2dd4bf] border border-[#14b8a6]/40 shadow-xs">
              CONTROL ESCOLAR
            </span>
          </div>

          {/* Título Principal de Impacto */}
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-white leading-[1.12]">
            Asistencia escolar,<br />
            <span className="text-[#2dd4bf]">simple y segura.</span>
          </h1>

          {/* Descripción */}
          <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-lg font-normal">
            Registra, consulta y administra la asistencia de tus grupos desde un solo lugar.
          </p>

          {/* Marca de agua decorativa de Código QR (inferior izquierda) */}
          <div className="pt-2 flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/20 backdrop-blur-xs text-[#2dd4bf]/40">
              <QrCode className="w-24 h-24 sm:w-28 sm:h-28" strokeWidth={1.75} />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Login Ampliada y Confortable */}
        <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-[490px] bg-white rounded-[32px] p-8 sm:p-11 shadow-2xl border-2 border-teal-600/25 relative">
            
            {/* Header de la Tarjeta */}
            <div className="text-center mb-6">
              <img 
                src="/logo-telebachillerato.png" 
                alt="Telebachillerato Comunitario" 
                className="h-16 w-auto mx-auto mb-3.5 object-contain drop-shadow-xs" 
              />
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Bienvenido de nuevo
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
                Accede al control de asistencia de tu institución
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Usuario */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  USUARIO O CORREO INSTITUCIONAL
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder=""
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    CONTRASEÑA
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Para restablecer tu contraseña, comunícate con la Dirección.')}
                    className="text-xs text-teal-700 hover:text-teal-800 hover:underline font-bold transition-colors cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    className="w-full pl-11 pr-11 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botón Iniciar Sesión con Flecha (Estilo Maqueta) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#0c6b64] hover:bg-[#095751] active:bg-[#074742] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 mt-1 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? 'VERIFICANDO...' : 'Iniciar sesión'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* ENLACE "REGÍSTRATE AQUÍ" */}
              <div className="pt-2 text-center">
                <p className="text-sm text-slate-600 font-medium">
                  ¿No tienes una cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/registro')}
                    className="font-black text-[#0c6b64] hover:text-[#095751] hover:underline cursor-pointer ml-1"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>

              {/* Leyenda Pie de Tarjeta Replicada */}
              <p className="text-xs text-slate-400 text-center pt-2 font-medium">
                Acceso exclusivo para personal autorizado
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
