import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  LogOut, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  UserCheck,
  Calendar
} from 'lucide-react';
import { formatTime12h } from '../../utils/dateUtils';
import { audioFeedback } from '../../utils/audioFeedback';

export const KioskFeedback = ({ result, onDismiss, autoDismissTime = 3500 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!result) return;

    // Reproducir tono de audio correspondiente
    audioFeedback.playFeedbackForType(result.tipo);

    // Barra de progreso y auto-cierre
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / autoDismissTime) * 100);
      setProgress(remaining);

      if (elapsed >= autoDismissTime) {
        clearInterval(interval);
        onDismiss?.();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [result, autoDismissTime, onDismiss]);

  if (!result) return null;

  const isEntrada = result.tipo === 'ENTRADA';
  const isSalida = result.tipo === 'SALIDA';
  const isCompletado = result.tipo === 'COMPLETADO';
  const isError = result.tipo === 'ERROR';

  const alumno = result.alumno;
  const nombreCompleto = alumno 
    ? `${alumno.nombres} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno || ''}`.trim()
    : 'Identidad no encontrada';

  const colorStyles = {
    ENTRADA: {
      bg: 'bg-emerald-950/90 border-emerald-500/80 shadow-emerald-500/20 text-emerald-100',
      badgeBg: 'bg-emerald-500 text-white',
      ringColor: 'ring-emerald-500/40',
      barColor: 'bg-emerald-500',
      icon: CheckCircle2,
      textColor: 'text-emerald-400'
    },
    SALIDA: {
      bg: 'bg-sky-950/90 border-sky-500/80 shadow-sky-500/20 text-sky-100',
      badgeBg: 'bg-sky-500 text-white',
      ringColor: 'ring-sky-500/40',
      barColor: 'bg-sky-500',
      icon: LogOut,
      textColor: 'text-sky-400'
    },
    COMPLETADO: {
      bg: 'bg-amber-950/90 border-amber-500/80 shadow-amber-500/20 text-amber-100',
      badgeBg: 'bg-amber-500 text-slate-950',
      ringColor: 'ring-amber-500/40',
      barColor: 'bg-amber-500',
      icon: AlertTriangle,
      textColor: 'text-amber-400'
    },
    ERROR: {
      bg: 'bg-rose-950/90 border-rose-500/80 shadow-rose-500/20 text-rose-100',
      badgeBg: 'bg-rose-600 text-white',
      ringColor: 'ring-rose-500/40',
      barColor: 'bg-rose-500',
      icon: XCircle,
      textColor: 'text-rose-400'
    }
  }[result.tipo] || {
    bg: 'bg-slate-900 border-slate-700 text-white',
    badgeBg: 'bg-slate-700 text-white',
    ringColor: 'ring-slate-700',
    barColor: 'bg-slate-500',
    icon: Clock,
    textColor: 'text-slate-400'
  };

  const IconComponent = colorStyles.icon;

  return (
    <div className="w-full max-w-2xl mx-auto transform transition-all duration-300 animate-pop-in">
      <div 
        className={`relative overflow-hidden rounded-3xl border-2 p-8 md:p-10 shadow-2xl backdrop-blur-xl ${colorStyles.bg} ring-4 ${colorStyles.ringColor}`}
      >
        {/* Barra de progreso de auto-cierre */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-black/40">
          <div 
            className={`h-full transition-all ease-linear ${colorStyles.barColor}`} 
            style={{ width: `${progress}%` }} 
          />
        </div>

        <div className="flex flex-col items-center text-center space-y-5">
          {/* Icono de Estado Gigante */}
          <div className={`p-4 rounded-3xl ${colorStyles.badgeBg} shadow-xl flex items-center justify-center animate-bounce-short`}>
            <IconComponent className="w-16 h-16 md:w-20 md:h-20" />
          </div>

          {/* Título de Estado */}
          <div>
            <span className={`inline-block text-xs md:text-sm font-black tracking-widest uppercase px-4 py-1 rounded-full ${colorStyles.badgeBg} mb-2`}>
              {result.titulo}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
              {nombreCompleto}
            </h2>
            <p className={`text-base md:text-lg font-medium mt-1 ${colorStyles.textColor}`}>
              {result.mensaje}
            </p>
          </div>

          {/* Ficha de Detalles del Alumno / Hora */}
          {!isError && alumno ? (
            <div className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 md:p-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block">
                  Matrícula
                </span>
                <span className="text-sm md:text-base font-mono font-bold text-white">
                  {alumno.matricula}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block">
                  Grupo & Turno
                </span>
                <span className="text-sm md:text-base font-bold text-white">
                  {alumno.grupoNombre} ({alumno.turno})
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block">
                  Hora de Registro
                </span>
                <span className="text-sm md:text-base font-mono font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-400" />
                  {formatTime12h(result.hora)}
                </span>
              </div>

              {isCompletado && (
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-amber-300">
                  <span>Entrada registrada: <strong>{formatTime12h(result.horaEntrada)}</strong></span>
                  <span>Salida registrada: <strong>{formatTime12h(result.horaSalida)}</strong></span>
                </div>
              )}
            </div>
          ) : isError ? (
            <div className="w-full bg-rose-950/60 border border-rose-500/30 rounded-2xl p-4 text-center">
              <p className="text-sm font-mono text-rose-200">
                Código escaneado: <strong className="text-white">{result.matricula || 'No legible'}</strong>
              </p>
              <p className="text-xs text-rose-300/80 mt-1">
                Verifica que el código QR corresponda a un alumno registrado en el ciclo escolar actual.
              </p>
            </div>
          ) : null}

          {/* Botón táctil para descartar de inmediato */}
          <button
            onClick={onDismiss}
            data-interactive="true"
            className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 py-2 px-5 rounded-full transition-colors"
          >
            Presiona para continuar o espera {Math.ceil((progress / 100) * (autoDismissTime / 1000))}s
          </button>
        </div>
      </div>
    </div>
  );
};
