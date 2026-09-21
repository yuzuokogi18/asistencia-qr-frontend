/**
 * Utilidades para formateo de fechas y horas en español (México)
 */

export const formatDateSpanish = (dateInput) => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const formatTime12h = (time24h) => {
  if (!time24h) return '--:--';
  const parts = time24h.split(':');
  if (parts.length < 2) return time24h;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const seconds = parts[2] ? `:${parts[2]}` : '';
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 debe ser 12
  const formattedHours = String(hours).padStart(2, '0');
  
  return `${formattedHours}:${minutes}${seconds} ${ampm}`;
};

export const getTodayDateInput = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
