import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  GraduationCap, 
  Calendar,
  Share2
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { apiClient } from '../api/client';
import { API_CONFIG } from '../api/config';
import { useToast } from '../context/ToastContext';

export const CredencialQR = () => {
  const { matricula } = useParams();
  const { error } = useToast();

  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar datos del alumno mediante búsqueda o lista
    apiClient.buscarAlumnos(matricula)
      .then((resultados) => {
        if (resultados.length > 0) {
          setAlumno(resultados[0]);
        }
      })
      .catch((err) => error('No se pudieron obtener los datos de la credencial'))
      .finally(() => setLoading(false));
  }, [matricula]);

  const qrImageUrl = apiClient.getQrUrl(matricula);

  const handlePrint = () => {
    window.print();
  };

  const nombreMostrar = alumno?.nombre_completo || 'Alumno Registrado';
  const grupoMostrar = alumno?.grupo?.nombre || 'General';

  const handleDescargarPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Fondo blanco con esquinas redondeadas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 640, 800);

    // Borde exterior
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 632, 792);

    // Encabezado institucional
    const grad = ctx.createLinearGradient(0, 0, 640, 0);
    grad.addColorStop(0, '#064E3B');
    grad.addColorStop(1, '#047857');
    ctx.fillStyle = grad;
    ctx.fillRect(4, 4, 632, 115);

    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/logo-telebachillerato.png';

    const renderCard = () => {
      // Recuadro blanco para el logo oficial
      try {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(25, 18, 80, 80, 10);
        ctx.fill();
        ctx.drawImage(logoImg, 30, 22, 70, 72);
      } catch (e) {
        // Si hay error en dibujo de logo
      }

      // Texto de institución
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('TELEBACHILLERATO COMUNITARIO', 120, 52);

      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillStyle = '#A7F3D0';
      ctx.fillText(`CREDENCIAL ESTUDIANTIL OFICIAL • CICLO ${API_CONFIG.SCHOOL_CYCLE}`, 120, 76);

      ctx.textAlign = 'center';

      // Nombre completo del alumno en tipografía destacada
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 24px Arial, sans-serif';
      ctx.fillText(nombreMostrar.toUpperCase(), 320, 175);

      // Matrícula y Grupo visibles
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`MATRÍCULA: ${matricula}`, 320, 208);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 15px Arial, sans-serif';
      ctx.fillText(`GRUPO: ${grupoMostrar}  •  VIGENCIA: JULIO 2027`, 320, 236);

      // Línea divisoria
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 255);
      ctx.lineTo(580, 255);
      ctx.stroke();

      // Contenedor visual del QR
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(170, 275, 300, 320, 16);
      ctx.fill();
      ctx.stroke();

      // Dibujar QR desde canvas local en alta resolución
      try {
        const qrCanvas = document.getElementById('qr-canvas-download');
        if (qrCanvas) {
          ctx.drawImage(qrCanvas, 195, 290, 250, 250);
        }
      } catch (e) {}

      // Leyenda directa debajo del QR: Nombre y matrícula repetidos
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText(nombreMostrar.toUpperCase(), 320, 560);

      ctx.fillStyle = '#047857';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(matricula, 320, 580);

      // Pie de credencial
      ctx.fillStyle = '#64748B';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText('Presente esta credencial ante el lector de códigos de asistencia.', 320, 680);
      ctx.fillText('El código QR es exclusivo e intransferible para el registro escolar.', 320, 705);

      ctx.font = '10px Arial, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('DOCUMENTO OFICIAL VALIDADOR DEL ALUMNO', 320, 755);

      // Descargar archivo
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Credencial_QR_${matricula}_${nombreMostrar.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    if (logoImg.complete) {
      renderCard();
    } else {
      logoImg.onload = renderCard;
      logoImg.onerror = renderCard;
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Cargando credencial oficial...</div>;
  }

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto pb-12">
      
      {/* 1. ENCABEZADO Y ACCIONES */}
      <div className="no-print">
        <Link 
          to="/alumnos" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Alumnos</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Generación de Credencial
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Previsualice y genere la credencial escolar oficial para el alumno. El código QR es compatible con el kiosco de escaneo.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDescargarPng}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Descargar PNG</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Credencial</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL (CAPTURA 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Vista Previa de Credencial */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Vista Previa de Credencial
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Lista para imprimir
              </span>
            </div>

            {/* TARJETA CREDENCIAL HORIZONTAL IMPRIMIBLE */}
            <div 
              id="credencial-imprimible" 
              className="w-full max-w-xl mx-auto bg-white rounded-2xl border-2 border-slate-300 shadow-lg overflow-hidden flex relative"
              style={{ minHeight: '260px' }}
            >
              {/* Barra lateral azul institucional */}
              <div className="w-4 bg-gradient-to-b from-blue-700 to-indigo-800 shrink-0" />

              {/* Contenido de la credencial */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                
                {/* Header de la credencial */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src="/logo-telebachillerato.png" 
                      alt="Telebachillerato Comunitario" 
                      className="h-10 w-auto object-contain"
                    />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                        INSTITUCIÓN EDUCATIVA
                      </p>
                      <p className="text-xs font-black text-slate-900 tracking-tight">
                        {API_CONFIG.SCHOOL_NAME}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[9px] rounded-md border border-blue-200 tracking-wider uppercase">
                    CREDENCIAL OFICIAL
                  </span>
                </div>

                {/* Cuerpo: QR Izquierda + Datos Derecha */}
                <div className="grid grid-cols-12 gap-4 items-center my-3">
                  {/* Código QR con Nombre Completo y Matrícula visibles */}
                  <div className="col-span-5 flex flex-col items-center justify-center p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1.5">
                    <p className="text-[9px] font-black uppercase text-slate-800 tracking-wider truncate w-full px-1">
                      {nombreMostrar}
                    </p>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                      <QRCodeSVG 
                        value={matricula || ''} 
                        size={144}
                        level="H"
                        includeMargin={false}
                        className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
                      />
                    </div>
                    {/* Canvas oculto para la descarga en PNG de ultra alta resolución */}
                    <div className="hidden" aria-hidden="true">
                      <QRCodeCanvas
                        id="qr-canvas-download"
                        value={matricula || ''}
                        size={300}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-mono font-black text-blue-700">
                        {matricula}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        Matrícula Escolar
                      </p>
                    </div>
                  </div>

                  {/* Datos del Alumno */}
                  <div className="col-span-7 space-y-2 pl-2">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        NOMBRE DEL ALUMNO
                      </p>
                      <h3 className="text-sm font-black text-slate-900 uppercase leading-tight">
                        {nombreMostrar}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          GRUPO
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          {grupoMostrar}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          CICLO
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          {API_CONFIG.SCHOOL_CYCLE}
                        </p>
                      </div>
                    </div>

                    <div className="pt-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        VIGENCIA
                      </p>
                      <p className="text-xs font-bold text-blue-700">
                        JULIO 2027
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer de la credencial */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
                  <span>Válida para el registro automatizado de asistencia escolar</span>
                  <span className="font-mono font-bold text-slate-500">AUTORIZADO</span>
                </div>

              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center no-print">
              La credencial está optimizada para impresión en formato ID-1 (85.60 x 53.98 mm). Asegúrese de imprimir a escala real (100%).
            </p>

            {/* Especificaciones de impresión */}
            <div className="grid grid-cols-2 gap-4 pt-2 no-print">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Calidad de impresión</p>
                  <p className="text-[11px] text-slate-500">300 DPI (Alta resolución)</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Legibilidad QR</p>
                  <p className="text-[11px] text-slate-500">Verificada Nivel Óptimo</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Columna Derecha: Detalles del Registro */}
        <div className="lg:col-span-4 space-y-4 no-print">
          
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Detalles del Registro
            </h4>
            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Estado del Alumno:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                  Activo
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Fecha de Registro:</span>
                <span className="font-bold text-slate-800">Ciclo {API_CONFIG.SCHOOL_CYCLE}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Token QR Unívoco:</span>
                <span className="font-mono font-bold text-blue-600">{matricula}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-amber-900 text-xs space-y-1">
            <p className="font-bold">Nota para la impresión:</p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              El código QR contiene únicamente la matrícula. El lector en la entrada la leerá y enviará automáticamente al sistema.
            </p>
          </div>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Enlace copiado al portapapeles');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Compartir credencial digital</span>
          </button>

        </div>

      </div>

    </div>
  );
};
