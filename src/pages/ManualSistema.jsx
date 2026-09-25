import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  QrCode, 
  Users, 
  GraduationCap, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  ScanLine, 
  FileText, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  PlayCircle, 
  ChevronRight,
  Info,
  ExternalLink,
  Volume2,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { API_CONFIG } from '../api/config';

export const ManualSistema = () => {
  const [tabActiva, setTabActiva] = useState('simulador');
  const [faqAbierto, setFaqAbierto] = useState(null);

  // Estado del Simulador Interactivo de Escaneo
  const [simulacionEstado, setSimulacionEstado] = useState({
    activo: true,
    tipo: 'entrada_tiempo', // 'entrada_tiempo', 'retardo', 'salida', 'duplicado', 'error'
    alumno: 'AYLIN AGUILAR LOPEZ',
    matricula: '2607138001',
    grupo: '1-A (Matutino)',
    hora: '08:42:15 AM',
    mensaje: '¡Asistencia registrada a tiempo! Que tengas un excelente día.',
    color: 'emerald',
    sonidoReproducido: false
  });

  // Reproductor de sonido sintético para la demo (Web Audio API)
  const reproducirBeep = (tipo) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (tipo === 'exito') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // La5
        osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.08); // Re6
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (tipo === 'retardo') {
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // Mi5
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime + 0.1); // Re5
        gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(329.63, audioCtx.currentTime); // Mi4
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      // Ignorar si el navegador bloquea audio sin interacción previa
    }
  };

  const ejecutarSimulacion = (tipo) => {
    reproducirBeep(tipo === 'entrada_tiempo' || tipo === 'salida' ? 'exito' : tipo === 'retardo' ? 'retardo' : 'error');

    if (tipo === 'entrada_tiempo') {
      setSimulacionEstado({
        activo: true,
        tipo: 'entrada_tiempo',
        alumno: 'AYLIN AGUILAR LOPEZ',
        matricula: '2607138001',
        grupo: '1-A (Matutino)',
        hora: '08:42:15 AM',
        mensaje: '¡Asistencia registrada a tiempo! Hora límite oficial: 09:00 AM.',
        color: 'emerald',
        sonidoReproducido: true
      });
    } else if (tipo === 'retardo') {
      setSimulacionEstado({
        activo: true,
        tipo: 'retardo',
        alumno: 'CARLOS MANUEL GOMEZ DIAZ',
        matricula: '2607138005',
        grupo: '1-A (Matutino)',
        hora: '09:14:32 AM',
        mensaje: 'Llegada con RETARDO registrada (Superó el horario límite de las 09:00 AM). Se notificó a Dirección.',
        color: 'amber',
        sonidoReproducido: true
      });
    } else if (tipo === 'salida') {
      setSimulacionEstado({
        activo: true,
        tipo: 'salida',
        alumno: 'AYLIN AGUILAR LOPEZ',
        matricula: '2607138001',
        grupo: '1-A (Matutino)',
        hora: '02:04:18 PM',
        mensaje: 'SALIDA del plantel registrada con éxito. Ciclo escolar diario completado.',
        color: 'blue',
        sonidoReproducido: true
      });
    } else if (tipo === 'duplicado') {
      setSimulacionEstado({
        activo: true,
        tipo: 'duplicado',
        alumno: 'AYLIN AGUILAR LOPEZ',
        matricula: '2607138001',
        grupo: '1-A (Matutino)',
        hora: '02:05:02 PM',
        mensaje: 'El alumno ya completó su ciclo de asistencia de hoy (Entrada y Salida registradas). Se previene duplicidad.',
        color: 'purple',
        sonidoReproducido: true
      });
    } else if (tipo === 'error') {
      setSimulacionEstado({
        activo: true,
        tipo: 'error',
        alumno: 'DESCONOCIDO',
        matricula: '9999999999',
        grupo: 'No asignado',
        hora: '08:50:00 AM',
        mensaje: 'No se encontró ningún alumno activo con esta matrícula. Por favor contacte a Control Escolar.',
        color: 'rose',
        sonidoReproducido: true
      });
    }
  };

  // Descargar plantilla CSV de prueba para Excel
  const descargarPlantillaCsv = () => {
    const encabezados = 'matricula,nombre,apellido_paterno,apellido_materno,curp,email,telefono_tutor\n';
    const filas = [
      '2607138001,AYLIN,AGUILAR,LOPEZ,AULA010101HCSLPA01,aylin@gmail.com,9611234567',
      '2607138002,BRENDA,HERNANDEZ,CASTILLO,HECB020202MCSLRB02,brenda@gmail.com,9612345678',
      '2607138003,CARLOS MANUEL,GOMEZ,DIAZ,GODC030303HCSMNC03,carlos@gmail.com,9613456789'
    ].join('\n');

    const contenido = '\uFEFF' + encabezados + filas; // BOM para compatibilidad con Excel en Windows
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_alumnos_telebachillerato.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'simulador', label: '🎮 Demo Interactiva', icon: PlayCircle },
    { id: 'flujo', label: '🚀 Flujo Diario', icon: Clock },
    { id: 'grupos', label: '👥 Grupos y Horarios', icon: Users },
    { id: 'alumnos', label: '🎓 Alumnos y CSV', icon: GraduationCap },
    { id: 'credenciales', label: '🔲 Credencial 54x85mm', icon: QrCode },
    { id: 'kiosco', label: '📷 Kiosco de Escaneo', icon: ScanLine },
    { id: 'reportes', label: '📊 Dashboard y Reportes', icon: FileText },
    { id: 'faq', label: '❓ Preguntas Frecuentes', icon: HelpCircle },
  ];

  const faqs = [
    {
      q: '¿Qué pasa si un alumno pasa dos veces la credencial por el escáner?',
      a: 'El sistema cuenta con control inteligente de ciclo diario: El 1er escaneo registra la ENTRADA (evalúa si es puntual o con retardo). El 2do escaneo registra la SALIDA. Si el alumno vuelve a pasar la tarjeta después de registrar su salida, el sistema le notifica amablemente que su ciclo de asistencia de hoy ya está completo, sin alterar los registros existentes ni generar duplicados.'
    },
    {
      q: '¿Cómo deben imprimirse las credenciales para que quepan en el portagafete Indra IND-0391?',
      a: 'Al abrir el PDF generado desde el botón "Credenciales PDF" de cada grupo, imprima en cualquier impresora láser o de inyección de tinta en hoja tamaño CARTA configurando la escala al 100% ("Escala Real" o "Tamaño Real"). Al recortar sobre la línea punteada perimetral (✂ corte 54x85mm), la credencial medirá exactamente 5.4 cm de ancho por 8.5 cm de alto, deslizándose a la perfección en el portagafete rígido Indra IND-0391.'
    },
    {
      q: '¿Qué tipo de lector se necesita en el Kiosco de Escaneo?',
      a: 'El sistema es 100% universal: Puede utilizar un lector de códigos de barras/QR USB tipo pistola o de sobremesa (que se conecta a cualquier PC o laptop y funciona automáticamente sin instalar drivers) o bien activar la cámara web de la computadora para leer la credencial directamente.'
    },
    {
      q: '¿Por qué existen 4 cuentas autorizadas en el sistema?',
      a: 'Por seguridad escolar y control de acceso institucional, el plantel cuenta con un cupo estricto de 4 cuentas oficiales: 2 cuentas de Directora (rol admin: creación de grupos, importación masiva de alumnos, generación de reportes y supervisión) y 2 cuentas de Operador (rol operador: dedicadas exclusivamente a atender la pantalla de escaneo en la puerta escolar).'
    },
    {
      q: '¿Qué formato debe tener el archivo CSV para importar alumnos?',
      a: 'El archivo debe contener las columnas: matricula, nombre, apellido_paterno, apellido_materno, curp, email, telefono_tutor. Puedes presionar el botón "Descargar Plantilla CSV" en la pestaña de Alumnos de este manual para obtener un archivo listo con el formato exacto.'
    }
  ];

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto pb-16">
      
      {/* 1. HERO HEADER INSTITUCIONAL */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>GUÍA OFICIAL Y CENTRO DE AYUDA • CICLO {API_CONFIG.SCHOOL_CYCLE}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Manual de Uso del Sistema de Asistencia
            </h1>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Bienvenido al manual interactivo del <strong className="text-white">Telebachillerato Comunitario</strong>. Aquí aprenderá paso a paso cómo operar cada módulo, registrar asistencias en tiempo récord con códigos QR, gestionar grupos y emitir credenciales oficiales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <Link
              to="/escaneo"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-102"
            >
              <ScanLine className="w-4 h-4" />
              <span>Abrir Kiosco de Escaneo</span>
            </Link>

            <button
              onClick={descargarPlantillaCsv}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Descargar Plantilla CSV</span>
            </button>
          </div>
        </div>

        {/* Insignias de métricas rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Medida Gafete: <strong>54 × 85 mm</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-slate-300">Velocidad: <strong>&lt; 1 seg/alumno</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-300">Portagafete: <strong>Indra IND-0391</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-slate-300">Disponibilidad: <strong>Nube 24/7</strong></span>
          </div>
        </div>
      </div>

      {/* 2. PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const activa = tabActiva === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activa
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${activa ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. CONTENIDO DINÁMICO POR PESTAÑA */}

      {/* --- PESTAÑA 1: SIMULADOR INTERACTIVO --- */}
      {tabActiva === 'simulador' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-blue-600" />
                  <span>Simulador de Escaneo en Vivo (Demo Interactiva)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Experimente cómo reacciona la pantalla del Kiosco ante cada tipo de escaneo escolar sin alterar los datos reales del colegio.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0 self-start sm:self-auto">
                Modo Interactivo
              </span>
            </div>

            {/* Controles del Simulador */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Seleccione un caso de prueba para simular:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <button
                  onClick={() => ejecutarSimulacion('entrada_tiempo')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    simulacionEstado.tipo === 'entrada_tiempo'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-800">1. Entrada a Tiempo</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1">Llegada a las 08:42 AM (antes del límite 09:00 AM)</p>
                </button>

                <button
                  onClick={() => ejecutarSimulacion('retardo')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    simulacionEstado.tipo === 'retardo'
                      ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-800">2. Entrada con Retardo</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1">Llegada a las 09:14 AM (supera límite oficial)</p>
                </button>

                <button
                  onClick={() => ejecutarSimulacion('salida')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    simulacionEstado.tipo === 'salida'
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-800">3. Registro de Salida</span>
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <p className="text-[11px] text-blue-700 mt-1">Segundo escaneo del día a las 02:04 PM</p>
                </button>

                <button
                  onClick={() => ejecutarSimulacion('error')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    simulacionEstado.tipo === 'error'
                      ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-800">4. QR No Registrado</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  </div>
                  <p className="text-[11px] text-rose-700 mt-1">Matrícula no existente o alumno inactivo</p>
                </button>
              </div>
            </div>

            {/* PANTALLA SIMULADA DEL KIOSCO */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                  Respuesta visual y sonora en el Kiosco:
                </span>
                <span className="font-mono text-[11px]">Simulación en tiempo real</span>
              </div>

              <div 
                className={`p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 ${
                  simulacionEstado.color === 'emerald'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-950'
                    : simulacionEstado.color === 'amber'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-950'
                    : simulacionEstado.color === 'blue'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-950'
                    : 'bg-rose-500/10 border-rose-500 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                      simulacionEstado.color === 'emerald'
                        ? 'bg-emerald-600'
                        : simulacionEstado.color === 'amber'
                        ? 'bg-amber-600'
                        : simulacionEstado.color === 'blue'
                        ? 'bg-blue-600'
                        : 'bg-rose-600'
                    }`}
                  >
                    {simulacionEstado.tipo === 'error' ? (
                      <XCircle className="w-9 h-9" />
                    ) : (
                      <CheckCircle2 className="w-9 h-9" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span 
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${
                        simulacionEstado.color === 'emerald'
                          ? 'bg-emerald-700'
                          : simulacionEstado.color === 'amber'
                          ? 'bg-amber-700'
                          : simulacionEstado.color === 'blue'
                          ? 'bg-blue-700'
                          : 'bg-rose-700'
                      }`}
                    >
                      {simulacionEstado.tipo === 'entrada_tiempo' && '● ENTRADA REGISTRADA'}
                      {simulacionEstado.tipo === 'retardo' && '▲ LLEGADA CON RETARDO'}
                      {simulacionEstado.tipo === 'salida' && '■ SALIDA REGISTRADA'}
                      {simulacionEstado.tipo === 'error' && '✕ ALUMNO NO ENCONTRADO'}
                    </span>

                    <h3 className="text-xl font-black tracking-tight">
                      {simulacionEstado.alumno}
                    </h3>
                    
                    <p className="text-xs font-semibold opacity-85">
                      {simulacionEstado.mensaje}
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-black/5 text-center min-w-[180px] shrink-0 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hora del Evento</p>
                  <p className="text-base font-black font-mono text-slate-900">{simulacionEstado.hora}</p>
                  <p className="text-[11px] font-mono font-bold text-blue-700">Mat: {simulacionEstado.matricula}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{simulacionEstado.grupo}</p>
                </div>
              </div>
            </div>

            {/* Explicación de lo que sucedió internamente */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>¿Qué hace el sistema internamente en este escenario?</span>
              </p>
              {simulacionEstado.tipo === 'entrada_tiempo' && (
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Detecta que es el primer escaneo de la matrícula en la fecha actual (hoy).</li>
                  <li>Consulta la hora límite configurada en el grupo (09:00:00). Como son las 08:42 AM, asigna estatus <strong className="text-emerald-700">"a_tiempo"</strong>.</li>
                  <li>Registra el timestamp en la base de datos en la nube y actualiza en tiempo real el porcentaje de asistencia en el Dashboard.</li>
                </ul>
              )}
              {simulacionEstado.tipo === 'retardo' && (
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Compara la hora de llegada (09:14 AM) con el límite de entrada del grupo (09:00 AM).</li>
                  <li>Al superar la hora oficial, marca la asistencia como <strong className="text-amber-700">"retardo"</strong>.</li>
                  <li>Emite automáticamente una notificación en la campana de alertas para que la Directora tenga el registro del retardo.</li>
                </ul>
              )}
              {simulacionEstado.tipo === 'salida' && (
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Reconoce que el alumno ya cuenta con un registro de entrada previo el día de hoy.</li>
                  <li>Actualiza el campo <strong className="text-blue-700">hora_salida</strong> de la asistencia sin necesidad de que el operador cambie de modo manualmente.</li>
                  <li>Cierra el ciclo diario de presencia escolar del estudiante.</li>
                </ul>
              )}
              {simulacionEstado.tipo === 'error' && (
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Busca la matrícula en la base de datos de alumnos activos.</li>
                  <li>Si la matrícula no existe o fue dada de baja, emite un aviso visual en rojo y sonido grave.</li>
                  <li><strong>Importante:</strong> El kiosco nunca se bloquea ni se congela; se restablece automáticamente en 2 segundos para el siguiente alumno.</li>
                </ul>
              )}
            </div>

          </div>
        </div>
      )}

      {/* --- PESTAÑA 2: FLUJO DIARIO --- */}
      {tabActiva === 'flujo' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Flujo Operativo Diario de la Preparatoria
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Así funciona el ciclo automatizado desde que el estudiante entra al plantel hasta la entrega de reportes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-xs font-bold text-slate-900">Llegada del Alumno</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  El estudiante porta su credencial oficial (54 × 85 mm) en el portagafete Indra IND-0391. Al ingresar, presenta el código QR ante el lector del Kiosco.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="text-xs font-bold text-slate-900">Escaneo Instantáneo</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  En menos de 1 segundo, el Kiosco confirma con sonido y pantalla verde o naranja (si llegó con retardo según el horario de su grupo).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="text-xs font-bold text-slate-900">Registro en la Nube</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  El sistema guarda la asistencia en tiempo real. La Directora puede ver el porcentaje de asistencia y las alertas desde el Dashboard.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                  4
                </div>
                <h3 className="text-xs font-bold text-slate-900">Salida y Reporte</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Al terminar la jornada (14:00 hrs), el alumno vuelve a escanear su credencial para marcar su SALIDA. La Directora puede descargar el PDF diario oficial.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PESTAÑA 3: GRUPOS Y HORARIOS --- */}
      {tabActiva === 'grupos' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Gestión de Grupos y Configuración de Horarios
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Los grupos organizan a los alumnos por grado y determinan los horarios oficiales de tolerancia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2">
                  <h4 className="font-bold text-blue-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Configuración de Horario del Turno</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-blue-800">
                    <li><strong>Hora Límite de Entrada:</strong> Establece hasta qué hora el alumno es considerado "A tiempo" (Ejemplo: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">09:00:00</code>). Cualquier escaneo posterior a esa hora se registrará automáticamente como <strong>Retardo</strong>.</li>
                    <li><strong>Hora Esperada de Salida:</strong> Hora programada de retiro (Ejemplo: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">14:00:00</code>). Si el alumno registra su salida antes, se genera una alerta de salida anticipada.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-slate-700" />
                    <span>Botón "Credenciales PDF" por Grupo</span>
                  </h4>
                  <p>
                    Tanto en la lista de Grupos (<code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">/grupos</code>) como en la de Alumnos, cada grupo cuenta con un botón directo para generar en un solo archivo PDF todas las credenciales de los alumnos inscritos, formateadas en 6 tarjetas por hoja Carta con guías punteadas listas para recortar.
                  </p>
                </div>
              </div>

              {/* Tarjeta de Ejemplo de Grupo */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ejemplo de Grupo Activo</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Activo
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">Grupo 1-A</h3>
                  <p className="text-xs text-slate-500 font-semibold">1° Semestre • Turno Matutino</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">LÍMITE ENTRADA</span>
                    <span className="font-mono font-black text-slate-800 text-sm">09:00:00</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">HORA SALIDA</span>
                    <span className="font-mono font-black text-slate-800 text-sm">14:00:00</span>
                  </div>
                </div>

                <Link
                  to="/grupos"
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  <span>Administrar Grupos en Vivo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PESTAÑA 4: ALUMNOS Y CSV --- */}
      {tabActiva === 'alumnos' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Registro de Alumnos e Importación Masiva (CSV / Excel)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inscriba estudiantes uno por uno o cargue una lista completa de 30 a 50 alumnos en un solo clic mediante archivo CSV.
                </p>
              </div>

              <button
                onClick={descargarPlantillaCsv}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Plantilla CSV</span>
              </button>
            </div>

            {/* Guía de Columnas */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Estructura de Columnas para Archivos CSV / Excel:
              </h3>
              
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Columna</th>
                      <th className="p-2.5">Requerido</th>
                      <th className="p-2.5">Descripción</th>
                      <th className="p-2.5">Ejemplo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-blue-700">matricula</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Obligatorio</span></td>
                      <td className="p-2.5">Identificador único del estudiante (números o texto)</td>
                      <td className="p-2.5 font-mono">2607138001</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-slate-900">nombre</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Obligatorio</span></td>
                      <td className="p-2.5">Nombre o nombres de pila del estudiante</td>
                      <td className="p-2.5 uppercase">AYLIN</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-slate-900">apellido_paterno</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Obligatorio</span></td>
                      <td className="p-2.5">Primer apellido</td>
                      <td className="p-2.5 uppercase">AGUILAR</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-slate-900">apellido_materno</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Opcional</span></td>
                      <td className="p-2.5">Segundo apellido</td>
                      <td className="p-2.5 uppercase">LOPEZ</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-slate-900">curp</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Opcional</span></td>
                      <td className="p-2.5">Clave Única de Registro de Población (18 caracteres)</td>
                      <td className="p-2.5 font-mono uppercase">AULA010101HCSLPA01</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-slate-900">telefono_tutor</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Opcional</span></td>
                      <td className="p-2.5">Teléfono a 10 dígitos del padre o tutor</td>
                      <td className="p-2.5 font-mono">9611234567</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Consejos para evitar errores en Excel */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Consejo para guardar desde Microsoft Excel:</span>
              </p>
              <p className="leading-relaxed">
                Al preparar su lista en Excel, haga clic en <strong>Archivo ➔ Guardar como</strong> y en Tipo de archivo seleccione <strong>"CSV (delimitado por comas) (*.csv)"</strong> o <strong>"CSV UTF-8"</strong>. Esto garantiza que los acentos y nombres con letra Ñ se conserven perfectamente limpios.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- PESTAÑA 5: CREDENCIALES INDRA IND-0391 --- */}
      {tabActiva === 'credenciales' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Credencial Escolar Vertical (Medida Exacta: 54 × 85 mm)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Diseñada con precisión milimétrica para el portagafete rígido <strong className="text-slate-800">Indra IND-0391</strong> con cordón al cuello.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* VISTA PREVIA VISUAL DE LA CREDENCIAL */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div 
                  className="w-56 bg-white rounded-xl border-2 border-slate-300 shadow-xl overflow-hidden flex flex-col text-center"
                  style={{ aspectRatio: '54/85' }}
                >
                  {/* Header */}
                  <div className="bg-slate-900 px-3 py-2 border-b-2 border-blue-600 text-white shrink-0">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-6 h-6 rounded bg-white p-0.5 shrink-0">
                        <img src="/logo-telebachillerato.png" alt="Logo" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-left">
                        <p className="text-[7.5px] font-black leading-none">TELEBACHILLERATO</p>
                        <p className="text-[6.5px] text-slate-300 leading-none">COMUNITARIO</p>
                        <p className="text-[6px] text-sky-400 font-bold">CICLO {API_CONFIG.SCHOOL_CYCLE}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo */}
                  <div className="flex-1 p-2 flex flex-col items-center justify-between space-y-1.5">
                    {/* Espacio Foto */}
                    <div className="w-16 h-20 rounded border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-1">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-0.5">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[6.5px] font-black uppercase text-slate-600">FOTO INFANTIL</span>
                      <span className="text-[5.5px] text-slate-400">2.5 × 3.0 cm</span>
                    </div>

                    {/* Datos Alumno */}
                    <div className="w-full space-y-0.5">
                      <p className="text-[6px] font-bold text-slate-400 uppercase">NOMBRE DEL ALUMNO</p>
                      <p className="text-[8.5px] font-black text-slate-900 uppercase leading-none">AYLIN AGUILAR LOPEZ</p>
                      <div className="w-4/5 mx-auto border-t border-slate-200 my-0.5" />
                      <p className="text-[8px] font-mono font-black text-blue-700">2607138001</p>
                      <p className="text-[7px] font-bold text-slate-700">GRUPO 1-A • MATUTINO</p>
                      <p className="text-[6px] text-slate-400">VIGENCIA: JULIO 2027</p>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center">
                      <div className="p-1 bg-white rounded border border-slate-200">
                        <QrCode className="w-12 h-12 text-slate-900" />
                      </div>
                      <span className="text-[5.5px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        ACCESO ESCOLAR PREPA-QR
                      </span>
                    </div>
                  </div>

                  {/* Barra azul */}
                  <div className="h-1 bg-blue-600 shrink-0" />
                </div>

                <span className="text-[11px] font-bold text-slate-500 mt-2">
                  Medida Real: 54 mm × 85 mm
                </span>
              </div>

              {/* EXPLICACIÓN DE CARACTERÍSTICAS */}
              <div className="md:col-span-7 space-y-4 text-xs text-slate-600">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Compatibilidad con Portagafete Indra IND-0391</span>
                  </h4>
                  <p className="leading-relaxed">
                    Las credenciales generadas en PDF tienen exactamente las dimensiones del inserto oficial que viene en el paquete de portagafetes <strong>Indra IND-0391</strong> (85 × 54 mm vertical).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-emerald-600" />
                    <span>Instrucciones de Impresión en Papel / Cartulina</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    <li>Descargue el PDF del grupo desde el botón <strong>"Credenciales PDF"</strong>.</li>
                    <li>Al imprimir, elija papel tamaño <strong>CARTA</strong> y configure la escala al <strong>100% (Escala Real)</strong>.</li>
                    <li>Cada página contiene <strong>6 credenciales</strong> separadas por guías punteadas con la indicación <code className="bg-white px-1 rounded border border-slate-200">✂ corte 54x85mm</code>.</li>
                    <li>Corte las tarjetas con tijeras o guillotina siguiendo la línea punteada.</li>
                    <li>Pegue la fotografía infantil del alumno (2.5 × 3.0 cm) en el recuadro superior e inserte la tarjeta en el portagafete.</li>
                  </ol>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- PESTAÑA 6: KIOSCO DE ESCANEO --- */}
      {tabActiva === 'kiosco' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Operación del Kiosco de Escaneo de Asistencia (/escaneo)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                La pantalla de asistencia está pensada para colocarse en una laptop o computadora en la entrada del plantel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                  1
                </div>
                <h3 className="font-bold text-slate-900">Lector USB / Escáner</h3>
                <p className="leading-relaxed">
                  Conecte un lector de código de barras o QR por USB. Estos dispositivos funcionan emulando el teclado: al leer la credencial, envían automáticamente la matrícula y presionan Enter sin requerir clics del operador.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                  2
                </div>
                <h3 className="font-bold text-slate-900">Detección Inteligente</h3>
                <p className="leading-relaxed">
                  No es necesario presionar botones de "Entrada" o "Salida": El sistema evalúa el historial del día y registra automáticamente la ENTRADA por la mañana y la SALIDA al finalizar las clases.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  3
                </div>
                <h3 className="font-bold text-slate-900">Modo Pantalla Completa</h3>
                <p className="leading-relaxed">
                  En el kiosco, presione la tecla <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">F11</kbd> de su teclado para activar el modo pantalla completa, ocultando barras de navegación y distracciones.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/escaneo"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <ScanLine className="w-4 h-4" />
                <span>Ir al Kiosco de Escaneo en Vivo</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* --- PESTAÑA 7: REPORTES Y DASHBOARD --- */}
      {tabActiva === 'reportes' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Dashboard y Generación de Reportes Oficiales en PDF
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Control escolar transparente con reportes oficiales listos para supervisión de zona educativa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-xs text-slate-600">
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Reporte Diario de Asistencia en PDF</span>
                  </h4>
                  <p className="leading-relaxed">
                    En la sección <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">/asistencias</code>, haga clic en <strong>"Descargar Reporte PDF"</strong>. El sistema genera un documento formal membretado con la fecha seleccionada, la relación de alumnos presentes, retardos, inasistencias y porcentaje de cumplimiento grupal.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Campana de Notificaciones y Alertas</span>
                  </h4>
                  <p className="leading-relaxed">
                    En la esquina superior derecha del Navbar se ubica la campana de alertas. Cada vez que un alumno ingresa con retardo o se registra una salida anticipada, se crea una alerta. La Directora puede revisarlas y marcarlas como "Atendidas".
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900">Métricas Principales del Dashboard:</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>% de Asistencia Hoy</span>
                    <span className="font-bold text-emerald-600">Calculado en tiempo real</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Alumnos Presentes vs Inscritos</span>
                    <span className="font-bold text-slate-800">Conteo automático</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Historial Semanal</span>
                    <span className="font-bold text-blue-600">Lunes a Viernes</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Ranking de Grupos</span>
                    <span className="font-bold text-slate-800">Mayor cumplimiento escolar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PESTAÑA 8: FAQ (PREGUNTAS FRECUENTES) --- */}
      {tabActiva === 'faq' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>Preguntas Frecuentes y Dudas Comunes</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Respuestas a las situaciones más habituales durante la operación escolar del sistema.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {faqs.map((faq, index) => {
                const abierto = faqAbierto === index;
                return (
                  <div 
                    key={index} 
                    className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setFaqAbierto(abierto ? null : index)}
                      className="w-full p-4 text-left font-bold text-xs text-slate-800 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${abierto ? 'rotate-90' : ''}`} />
                    </button>
                    {abierto && (
                      <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
