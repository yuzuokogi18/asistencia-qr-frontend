export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://asistencia-qr-backend-iw6h.onrender.com/api',
  SCHOOL_NAME: import.meta.env.VITE_SCHOOL_NAME || 'Telebachillerato Comunitario',
  SCHOOL_LEMA: import.meta.env.VITE_SCHOOL_LEMA || 'Excelencia y Compromiso Educativo',
  SCHOOL_CYCLE: import.meta.env.VITE_CYCLE_NAME || '2026-2027',
};

export const getAuthToken = () => {
  return localStorage.getItem('prepa_qr_token');
};

export const setAuthSession = (token, user) => {
  localStorage.setItem('prepa_qr_token', token);
  localStorage.setItem('prepa_qr_user', JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem('prepa_qr_token');
  localStorage.removeItem('prepa_qr_user');
};

export const getAuthUser = () => {
  try {
    const u = localStorage.getItem('prepa_qr_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};
