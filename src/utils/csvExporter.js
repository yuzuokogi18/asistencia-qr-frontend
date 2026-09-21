/**
 * Generador y exportador de archivos CSV en el cliente con soporte UTF-8 (BOM)
 */

export const exportAsistenciasToCSV = (asistencias, filename = `asistencias_prepa_${new Date().toISOString().split('T')[0]}.csv`) => {
  if (!asistencias || asistencias.length === 0) {
    throw new Error('No hay registros de asistencia para exportar.');
  }

  // Encabezados en español
  const headers = [
    'Matrícula',
    'Nombre del Alumno',
    'Grupo',
    'Turno',
    'Fecha',
    'Hora Entrada',
    'Hora Salida',
    'Estatus'
  ];

  // Filas escapadas
  const rows = asistencias.map(a => [
    `"${a.matricula || ''}"`,
    `"${(a.alumnoNombre || '').replace(/"/g, '""')}"`,
    `"${a.grupoNombre || ''}"`,
    `"${a.turno || ''}"`,
    `"${a.fecha || ''}"`,
    `"${a.horaEntrada || '--'}"`,
    `"${a.horaSalida || '--'}"`,
    `"${a.estatus || ''}"`
  ]);

  // Construir contenido CSV con salto de línea estándar CRLF
  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');

  // Añadir BOM (Byte Order Mark) UTF-8 (\uFEFF) para compatibilidad con Microsoft Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
