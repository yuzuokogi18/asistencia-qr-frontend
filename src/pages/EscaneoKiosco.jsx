import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  LogOut, 
  LayoutDashboard, 
  Check, 
  Info,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../api/client';
import { API_CONFIG } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const EscaneoKiosco = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { error } = useToast();

  const [inputVal, setInputVal] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState(null);
  const [horaActual, setHoraActual] = useState(new Date());

  const inputRef = useRef(null);

  // Sintetizador de audio web para emular el 'beep' físico del escáner de códigos
  const reproducirBeep = (tipo = 'exito') => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (tipo === 'exito') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.16);
      } else if (tipo === 'retardo') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, audioCtx.currentTime);
        osc.frequency.setValueAtTime(450, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.26);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.23);
      }
    } catch {
      // Ignorar si el navegador bloquea audio antes del primer gesto
    }
  };

  // Reloj digital en tiempo real en la pantalla
  useEffect(() => {
    const timer = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // MANTENER INPUT SIEMPRE ENFOCADO PARA EL LECTOR FÍSICO USB
  useEffect(() => {
    const enfocar = () => {
      if (inputRef.current && !bloqueado) {
        inputRef.current.focus();
      }
    };

    enfocar();

    // Re-enfocar en cualquier clic del usuario en la pantalla
    const handleDocumentClick = (e) => {
      if (!e.target.closest('button, a')) {
        enfocar();
      }
    };

    // Redirección global: cualquier tecla presionada se dirige inmediatamente al input del escáner
    const handleGlobalKeyDown = (e) => {
      if (bloqueado) return;
      if (document.activeElement !== inputRef.current && !e.target.closest('button, a')) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('click', handleDocumentClick);
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [bloqueado]);

  // Procesar escaneo al recibir Enter del lector USB (emula pulsación del escáner HID)
  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const matricula = inputVal.trim();
      setInputVal('');

      if (!matricula || bloqueado) return;

      setProcesando(true);
      setBloqueado(true);

      try {
        const resultado = await apiClient.escanear(matricula);
        setUltimoResultado(resultado);

        // Reproducir sonido según el estatus
        if (resultado.estatus === 'retardo' || resultado.alerta) {
          reproducirBeep('retardo');
        } else {
          reproducirBeep('exito');
        }

        // Bloqueo temporal de 3.5 segundos para mostrar la tarjeta de confirmación
        setTimeout(() => {
          setUltimoResultado(null);
          setBloqueado(false);
          if (inputRef.current) inputRef.current.focus();
        }, 3500);

      } catch (err) {
        reproducirBeep('error');
        error(err.message || 'Error al procesar el código escaneado');
        setBloqueado(false);
        if (inputRef.current) inputRef.current.focus();
      } finally {
        setProcesando(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none">
      
      {/* INPUT OCULTO / DISIMULADO PERMANENTEMENTE ENFOCADO */}
      <input
        ref={inputRef}
        type="text"
        autoFocus
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        className="opacity-0 absolute pointer-events-none -top-20 left-0"
      />

      {/* 1. BARRA SUPERIOR DEL KIOSCO */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-5 z-20">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/15 shadow-sm">
            <img 
              src="/logo-telebachillerato.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white uppercase">
              {API_CONFIG.SCHOOL_NAME}
            </h1>
            <p className="text-xs text-emerald-400 font-bold tracking-wider uppercase">
              Kiosco de Escaneo en Vivo • Estación Entrada
            </p>
          </div>
        </div>

        {/* Reloj Digital en Vivo y Botones */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="font-mono text-xl font-black text-white tracking-widest">
              {horaActual.toLocaleTimeString('es-MX', { hour12: false })}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              {horaActual.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel Admin</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-bold text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. ÁREA CENTRAL: TARJETA DE CONFIRMACIÓN O ESPERA DE ESCANEO */}
      <main className="flex-1 flex items-center justify-center py-8 z-20">
        
        {ultimoResultado ? (
          /* TARJETA DE CONFIRMACIÓN GIGANTE CON DATOS REALES DE LA API */
          <div className={`w-full max-w-xl rounded-3xl p-8 sm:p-10 shadow-2xl border transition-all duration-300 transform scale-100 ${
            ultimoResultado.tipo === 'entrada'
              ? ultimoResultado.estatus === 'retardo'
                ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 border-amber-500/50'
                : 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/50'
              : ultimoResultado.tipo === 'salida'
              ? 'bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 border-blue-500/50'
              : 'bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 border-purple-500/50'
          }`}>
            
            {/* Ícono grande y badge de tipo de movimiento */}
            <div className="flex items-center justify-between mb-6">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                ultimoResultado.tipo === 'entrada'
                  ? ultimoResultado.estatus === 'retardo'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-400/40'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40'
                  : ultimoResultado.tipo === 'salida'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-400/40'
                  : 'bg-purple-500/20 text-purple-400 border-purple-400/40'
              }`}>
                {ultimoResultado.tipo === 'entrada' 
                  ? (ultimoResultado.estatus === 'retardo' ? 'ENTRADA CON RETARDO' : 'ENTRADA REGISTRADA') 
                  : ultimoResultado.tipo === 'salida'
                  ? 'SALIDA REGISTRADA'
                  : 'ASISTENCIA YA COMPLETADA'}
              </span>

              <span className="font-mono text-2xl font-black text-white">
                {ultimoResultado.hora || horaActual.toLocaleTimeString('es-MX', { hour12: false })}
              </span>
            </div>

            {/* Nombre del alumno grande */}
            <div className="space-y-1 mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                ALUMNO IDENTIFICADO
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                {ultimoResultado.alumno?.nombre_completo}
              </h2>
              <p className="text-sm font-bold text-slate-300 font-mono">
                Matrícula: {ultimoResultado.alumno?.matricula} • Grupo: {ultimoResultado.grupo?.nombre}
              </p>
            </div>

            {/* Mensaje amigable retornado directamente por la API */}
            <div className={`p-4 rounded-xl border text-sm font-medium leading-relaxed ${
              ultimoResultado.estatus === 'retardo'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-white/5 border-white/10 text-slate-200'
            }`}>
              {ultimoResultado.mensaje}
            </div>

            {/* Alerta detectada */}
            {ultimoResultado.alerta && (
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span>Notificación generada para prefectura y tutores.</span>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase animate-pulse">
                La pantalla volverá a estar lista en unos segundos...
              </p>
            </div>

          </div>
        ) : (
          /* ESTADO NORMAL: ESPERANDO ESCANEO DEL LECTOR FÍSICO */
          <div className="text-center space-y-6 max-w-lg mx-auto">
            
            {/* Animación del Marco de Escaneo QR */}
            <div className="relative w-60 h-60 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-dashed border-emerald-500/40 rounded-3xl animate-pulse" />
              <div className="w-44 h-44 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 shadow-inner">
                <QrCode className="w-16 h-16 text-emerald-400 mb-2 transition-transform duration-300 group-hover:scale-105" />
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                  ACERQUE EL QR
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Estación de Escaneo por Lector USB
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                Diseñado para <strong>escáner de escritorio USB</strong> (modo teclado físico). Acerque la credencial al lector: este escribe la matrícula y presiona <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[10px]">Enter</kbd> automáticamente (sin requerir cámara).
              </p>
            </div>

            {/* Buffer en tiempo real del lector USB o teclado */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Lector USB Conectado • Modo Teclado HID Activo</span>
              </div>

              {inputVal && (
                <div className="text-xs text-slate-300 font-mono bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                  Lectura entrante: <span className="text-emerald-400 font-bold">{inputVal}</span> (esperando Enter...)
                </div>
              )}
            </div>

            {/* Ayuda para pruebas manuales */}
            <p className="text-[11px] text-slate-500 italic">
              * Nota: También puede teclear una matrícula de prueba (ej. <code className="text-slate-300 font-bold">20261001</code>) y presionar <kbd className="text-slate-300 font-bold">Enter</kbd>.
            </p>

          </div>
        )}

      </main>

      {/* 3. FOOTER DEL KIOSCO */}
      <footer className="border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 z-20">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Sistema Automatizado de Control de Asistencia QR</span>
        </div>
        <p className="text-[11px] mt-2 sm:mt-0">
          Operador en turno: <strong className="text-slate-300">{user?.nombre || 'Prefectura'}</strong>
        </p>
      </footer>

    </div>
  );
};
