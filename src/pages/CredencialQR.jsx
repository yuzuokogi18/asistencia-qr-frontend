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
  Share2,
  User
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
    canvas.width = 540;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');

    // Fondo blanco con esquinas redondeadas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 540, 850);

    // Borde exterior
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 3;
    ctx.strokeRect(3, 3, 534, 844);

    // Encabezado institucional oscuro
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(3, 3, 534, 105);

    // Barra acento azul
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(3, 104, 534, 4);

    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/logo-telebachillerato.png';

    const renderCard = () => {
      // Recuadro blanco para el logo oficial
      try {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(20, 16, 74, 74, 10);
        ctx.fill();
        ctx.drawImage(logoImg, 25, 20, 64, 66);
      } catch (e) {}

      // Texto de institución
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 17px Arial, sans-serif';
      ctx.fillText('TELEBACHILLERATO', 110, 42);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText('COMUNITARIO', 110, 64);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText(`CREDENCIAL • ${API_CONFIG.SCHOOL_CYCLE}`, 110, 86);

      ctx.textAlign = 'center';

      // --- 1. RECUADRO PARA FOTO INFANTIL (CENTRO) ---
      const photoW = 160;
      const photoH = 200;
      const photoX = (540 - photoW) / 2;
      const photoY = 125;

      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 10);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      // Silueta esquemática
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.arc(270, photoY + 65, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(270, photoY + 130, 48, 32, 0, Math.PI, 0, false);
      ctx.fill();

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText('FOTO INFANTIL', 270, photoY + 160);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px Arial, sans-serif';
      ctx.fillText('2.5 × 3.0 CM', 270, photoY + 180);

      // Badge activo
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText('● ALUMNO(A) ACTIVO(A)', 270, photoY + photoH + 20);

      // --- 2. DATOS DEL ALUMNO (CENTRO) ---
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText('NOMBRE DEL ALUMNO', 270, 375);

      ctx.fillStyle = '#0F172A';
      ctx.font = '900 20px Arial, sans-serif';
      ctx.fillText(nombreMostrar.toUpperCase(), 270, 402);

      // Línea divisoria
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(60, 420);
      ctx.lineTo(480, 420);
      ctx.stroke();

      // Matrícula
      ctx.fillStyle = '#1D4ED8';
      ctx.font = 'bold 19px monospace';
      ctx.fillText(matricula, 270, 448);

      // Grupo y Turno
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText(`GRUPO: ${grupoMostrar}  •  ${alumno?.grupo?.turno?.toUpperCase() || 'MATUTINO'}`, 270, 474);

      // Ciclo y Vigencia
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText(`CICLO: ${API_CONFIG.SCHOOL_CYCLE}  •  VIGENCIA: JULIO 2027`, 270, 498);

      // --- 3. CÓDIGO QR DE ACCESO (CENTRO) ---
      const qrBoxW = 180;
      const qrBoxH = 180;
      const qrBoxX = (540 - qrBoxW) / 2;
      const qrBoxY = 525;

      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 12);
      ctx.fill();
      ctx.stroke();

      // Dibujar QR desde canvas local en alta resolución
      try {
        const qrCanvas = document.getElementById('qr-canvas-download');
        if (qrCanvas) {
          ctx.drawImage(qrCanvas, qrBoxX + 12, qrBoxY + 12, 156, 156);
        }
      } catch (e) {}

      // Leyenda QR
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText('ACCESO ESCOLAR PREPA-QR', 270, 730);

      // Sello oficial
      ctx.fillStyle = '#ECFDF5';
      ctx.strokeStyle = '#A7F3D0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(170, 748, 200, 34, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#065F46';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText('✓ OFICIAL AUTORIZADO', 270, 770);

      // Barra inferior acento
      ctx.fillStyle = '#2563EB';
      ctx.fillRect(3, 842, 534, 5);

      // Descargar archivo
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Credencial_Vertical_54x85mm_${matricula}_${nombreMostrar.replace(/\s+/g, '_')}.png`;
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

            {/* TARJETA CREDENCIAL VERTICAL (54 × 85 mm - Indra IND-0391) */}
            <div 
              id="credencial-imprimible" 
              className="w-full max-w-[310px] mx-auto bg-white rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden flex flex-col relative"
              style={{ minHeight: '488px' }}
            >
              {/* Encabezado oscuro institucional */}
              <div className="bg-slate-900 px-4 py-3 border-b-2 border-blue-600 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                    <img 
                      src="/logo-telebachillerato.png" 
                      alt="Telebachillerato Comunitario" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black tracking-tight leading-none text-white">
                      TELEBACHILLERATO
                    </p>
                    <p className="text-[8.5px] font-medium text-slate-300 leading-tight">
                      COMUNITARIO
                    </p>
                    <p className="text-[7.5px] font-bold text-sky-400">
                      CICLO {API_CONFIG.SCHOOL_CYCLE}
                    </p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 font-extrabold text-[8px] rounded border border-blue-400/30 uppercase">
                  OFICIAL
                </span>
              </div>

              {/* Cuerpo Vertical de la Credencial */}
              <div className="flex-1 p-3.5 flex flex-col items-center justify-between space-y-2.5 text-center">
                
                {/* 1. Recuadro para Foto Infantil */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-28 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-1.5 relative shadow-inner">
                    <div className="w-8 h-8 rounded-full bg-slate-200/90 flex items-center justify-center text-slate-400 mb-1">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <span className="text-[8.5px] font-black uppercase text-slate-600 tracking-wider">
                      FOTO INFANTIL
                    </span>
                    <span className="text-[7px] text-slate-400 font-medium">
                      2.5 × 3.0 cm
                    </span>
                  </div>
                  <span className="text-[7.5px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">
                    ● ALUMNO(A) ACTIVO(A)
                  </span>
                </div>

                {/* 2. Datos del Estudiante */}
                <div className="w-full space-y-1">
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                    NOMBRE DEL ALUMNO
                  </p>
                  <h3 className="text-xs font-black text-slate-900 uppercase leading-snug line-clamp-2 px-1">
                    {nombreMostrar}
                  </h3>
                  <div className="w-4/5 mx-auto border-t border-slate-200 my-1" />
                  <p className="text-xs font-mono font-black text-blue-700">
                    {matricula}
                  </p>
                  <p className="text-[9.5px] font-bold text-slate-700">
                    GRUPO: {grupoMostrar}  •  {alumno?.grupo?.turno?.toUpperCase() || 'MATUTINO'}
                  </p>
                  <p className="text-[8px] text-slate-500 font-medium">
                    VIGENCIA: JULIO 2027
                  </p>
                </div>

                {/* 3. Código QR de Acceso */}
                <div className="flex flex-col items-center">
                  <div className="p-1.5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                    <QRCodeSVG 
                      value={matricula || ''} 
                      size={96}
                      level="H"
                      includeMargin={false}
                      className="w-24 h-24 object-contain"
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
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                    ACCESO ESCOLAR PREPA-QR
                  </p>
                </div>

                {/* 4. Sello de autorización al pie */}
                <div className="w-full pt-1 border-t border-slate-100 flex items-center justify-center">
                  <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[8px] font-black uppercase">
                    ✓ OFICIAL AUTORIZADO SEP
                  </span>
                </div>

              </div>

              {/* Barra inferior azul institucional */}
              <div className="h-1.5 bg-blue-600 shrink-0" />
            </div>

            <p className="text-[11px] text-slate-400 text-center no-print">
              La credencial está optimizada para formato vertical estándar ID-1 (54 × 85 mm) compatible con portagafete Indra IND-0391. Asegúrese de imprimir a escala real (100%).
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
