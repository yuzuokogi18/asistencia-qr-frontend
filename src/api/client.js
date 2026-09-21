import { API_CONFIG, getAuthToken, clearAuthSession } from './config';

/**
 * Cliente HTTP unificado para el backend REST en Node.js + Express
 */
class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr) {
    throw new ApiError('No se pudo conectar con el servidor. Verifique que la API esté corriendo.', 0);
  }

  // Manejo de expiración de sesión (401)
  if (response.status === 401) {
    clearAuthSession();
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new ApiError('Sesión expirada o credenciales inválidas', 401);
  }

  // Manejo de permisos insuficientes (403)
  if (response.status === 403) {
    throw new ApiError('No tienes permisos suficientes para realizar esta acción', 403);
  }

  // Si es respuesta binaria (PDF, PNG)
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/pdf') || contentType.includes('image/')) {
    if (!response.ok) {
      throw new ApiError('Error al descargar archivo binario', response.status);
    }
    return response.blob();
  }

  // Respuesta JSON
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const errorMsg = data.message || `Error en la petición (código ${response.status})`;
    throw new ApiError(errorMsg, response.status, data.errors);
  }

  return data;
}

export const apiClient = {
  // --- HEALTH CHECK ---
  async checkHealth() {
    try {
      const res = await request('/health');
      return res.success;
    } catch {
      return false;
    }
  },

  // --- AUTENTICACIÓN ---
  async login(usuario, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password }),
    });
    return res.data; // { token, usuario: { id, nombre, usuario, rol } }
  },

  async me() {
    const res = await request('/auth/me');
    return res.data;
  },

  async getCuposRegistro() {
    const res = await request('/auth/cupos');
    return res.data; // { total, maxTotal, admin, maxAdmin, operador, maxOperador, adminDisponible, operadorDisponible, registroAbierto }
  },

  async registrarUsuario(userData) {
    const res = await request('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res.data; // { token, usuario }
  },

  async crearUsuario(userData) {
    const res = await request('/auth/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res.data;
  },

  // --- GRUPOS ---
  async getGrupos() {
    const res = await request('/grupos');
    return res.data || [];
  },

  async getCumplimiento(fecha) {
    const q = fecha ? `?fecha=${fecha}` : '';
    const res = await request(`/grupos/cumplimiento${q}`);
    return res.data?.ranking || [];
  },

  async getGrupo(id) {
    const res = await request(`/grupos/${id}`);
    return res.data;
  },

  async crearGrupo(grupoData) {
    const res = await request('/grupos', {
      method: 'POST',
      body: JSON.stringify(grupoData),
    });
    return res.data;
  },

  async actualizarGrupo(id, grupoData) {
    const res = await request(`/grupos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(grupoData),
    });
    return res.data;
  },

  async eliminarGrupo(id) {
    const res = await request(`/grupos/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async getAlumnosPorGrupo(grupoId) {
    const res = await request(`/grupos/${grupoId}/alumnos`);
    return res.data || [];
  },

  // --- ALUMNOS ---
  async getAlumnos() {
    // Para listar todos los alumnos, consultamos los grupos y sus alumnos
    const grupos = await this.getGrupos();
    const promesas = grupos.map(g => this.getAlumnosPorGrupo(g.id));
    const resultados = await Promise.all(promesas);
    return resultados.flat();
  },

  async getAlumno(id) {
    const res = await request(`/alumnos/${id}`);
    return res.data;
  },

  async crearAlumno(alumnoData) {
    const res = await request('/alumnos', {
      method: 'POST',
      body: JSON.stringify(alumnoData),
    });
    return res.data;
  },

  async actualizarAlumno(id, alumnoData) {
    const res = await request(`/alumnos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(alumnoData),
    });
    return res.data;
  },

  async eliminarAlumno(id) {
    const res = await request(`/alumnos/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async buscarAlumnos(query) {
    if (!query || query.trim().length === 0) return [];
    const res = await request(`/alumnos/buscar?q=${encodeURIComponent(query)}`);
    return res.data || [];
  },

  getQrUrl(matricula) {
    return `${API_CONFIG.BASE_URL}/alumnos/${matricula}/qr`;
  },

  async descargarQr(matricula, nombreArchivo = 'credencial_qr.png') {
    const blob = await request(`/alumnos/${matricula}/qr`);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  // --- ASISTENCIA Y ESCANEO QR ---
  async escanear(matricula) {
    const res = await request('/asistencia/escanear', {
      method: 'POST',
      body: JSON.stringify({ matricula: matricula.trim() }),
    });
    return res.data; // { tipo, mensaje, estatus, hora, alumno, grupo, alerta }
  },

  async getAsistencias(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.fecha) params.append('fecha', filtros.fecha);
    if (filtros.grupo_id) params.append('grupo_id', filtros.grupo_id);
    if (filtros.estatus) params.append('estatus', filtros.estatus);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await request(`/asistencias${query}`);
    return res.data || [];
  },

  async getResumenHoy() {
    const res = await request('/asistencias/resumen-hoy');
    return res.data;
  },

  async getHistorialSemanal(fecha) {
    const q = fecha ? `?fecha=${fecha}` : '';
    const res = await request(`/asistencias/historial-semanal${q}`);
    return res.data;
  },

  async cierreDiario(fecha) {
    const res = await request('/asistencias/cierre-diario', {
      method: 'POST',
      body: JSON.stringify({ fecha }),
    });
    return res.data;
  },

  // --- ALERTAS ---
  async getAlertasRecientes(limite = 5) {
    const res = await request(`/alertas/recientes?limite=${limite}`);
    return res.data || [];
  },

  async resolverAlerta(id) {
    const res = await request(`/alertas/${id}/resolver`, {
      method: 'PUT',
    });
    return res.data;
  },

  // --- REPORTES ---
  async descargarReporteDiarioPdf(fecha) {
    const f = fecha || new Date().toISOString().split('T')[0];
    const blob = await request(`/reportes/diario?fecha=${f}&formato=pdf`);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `reporte_asistencia_${f}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};
