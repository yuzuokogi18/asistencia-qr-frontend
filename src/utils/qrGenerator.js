/**
 * Formateo del contenido del QR y exportación de credenciales a PNG/Impresión
 */

/**
 * Genera el payload de texto que irá dentro del código QR
 * Formato: "MATRICULA|APELLIDO_PATERNO"
 */
export const formatQRPayload = (alumno) => {
  if (!alumno) return '';
  const matricula = String(alumno.matricula || '').trim();
  const apellido = String(alumno.apellidoPaterno || '').trim();
  return `${matricula}|${apellido}`;
};

/**
 * Descarga el elemento Canvas con el código QR como imagen PNG
 */
export const downloadQRAsPNG = (canvasElement, fileName = 'qr_alumno.png') => {
  if (!canvasElement) return false;
  
  try {
    const pngUrl = canvasElement.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    return true;
  } catch (error) {
    console.error('Error al descargar código QR:', error);
    return false;
  }
};

/**
 * Dispara la orden de impresión nativa del navegador
 */
export const triggerPrint = () => {
  window.print();
};
