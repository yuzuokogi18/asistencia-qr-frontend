import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, GraduationCap, ShieldCheck } from 'lucide-react';
import { formatQRPayload, downloadQRAsPNG, triggerPrint } from '../../utils/qrGenerator';
import { API_CONFIG } from '../../api/config';
import { Button } from '../common/Button';

export const QRCard = ({
  alumno,
  size = 200,
  showActions = true,
  isPrintableBadge = false
}) => {
  const canvasContainerRef = useRef(null);

  if (!alumno) return null;

  const qrPayload = formatQRPayload(alumno);
  const nombreCompleto = `${alumno.nombres} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno || ''}`.trim();

  const handleDownload = () => {
    const canvas = canvasContainerRef.current?.querySelector('canvas');
    if (canvas) {
      downloadQRAsPNG(canvas, `credencial_qr_${alumno.matricula}_${alumno.apellidoPaterno}.png`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Contenedor de la Credencial Escolar */}
      <div 
        ref={canvasContainerRef}
        className="w-full bg-gradient-to-b from-white to-slate-50 border-2 border-slate-200/90 rounded-2xl p-6 shadow-md text-center relative overflow-hidden print-credential-container"
      >
        {/* Franja de Color Institucional Superior */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-brand-700 via-brand-500 to-indigo-600" />

        {/* Encabezado Escolar */}
        <div className="flex items-center justify-center gap-2 mb-3 mt-1">
          <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-900 leading-tight uppercase tracking-wider">
              {API_CONFIG.SCHOOL_NAME}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">Credencial de Asistencia Escolar</p>
          </div>
        </div>

        {/* Ciclo Escolar */}
        <div className="inline-block bg-brand-50 border border-brand-200/60 text-brand-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-4">
          Ciclo {API_CONFIG.SCHOOL_CYCLE}
        </div>

        {/* Código QR Generado */}
        <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-100 shadow-inner inline-flex items-center justify-center mb-4">
          <QRCodeCanvas
            value={qrPayload}
            size={size}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: '/favicon.svg',
              height: 36,
              width: 36,
              excavate: true,
            }}
          />
        </div>

        {/* Datos del Alumno */}
        <div className="space-y-1 border-t border-slate-200/70 pt-3">
          <h3 className="text-base font-bold text-slate-900 leading-tight">
            {nombreCompleto}
          </h3>
          
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="font-mono text-sm font-bold text-brand-700 bg-brand-50/80 px-2.5 py-0.5 rounded-lg border border-brand-200/60">
              {alumno.matricula}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
              {alumno.grupoNombre || 'Sin Grupo'} • {alumno.turno || 'Matutino'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Código Oficial de Acceso PrepaQR</span>
          </div>
        </div>
      </div>

      {/* Botones de Acción (Descarga PNG / Imprimir) */}
      {showActions && (
        <div className="flex items-center justify-center gap-2.5 mt-4 w-full no-print">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleDownload}
            className="flex-1"
          >
            Descargar PNG
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={triggerPrint}
            className="flex-1"
          >
            Imprimir
          </Button>
        </div>
      )}
    </div>
  );
};
