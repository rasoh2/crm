import axios from 'axios';

// En produccion, si VITE_API_URL no esta definida o apunta a localhost, usar el backend activo en Render
const API_URL = (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost'))
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.MODE === 'production'
      ? 'https://crm-bo95.onrender.com/api'
      : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para adjuntar automáticamente el token JWT de sesión
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta para redirigir al login si el token expira o es inválido (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if ((error.response?.status === 401 || error.response?.status === 403) && window.location.pathname !== '/login') {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================================
// Oportunidades
// ========================================
export const opportunityApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.stage) params.append('stage', filters.stage);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.owner) params.append('owner', filters.owner);
    return api.get(`/opportunities?${params.toString()}`);
  },

  getById: (id) => api.get(`/opportunities/${id}`),

  create: (data) => api.post('/opportunities', data),

  update: (id, data) => api.put(`/opportunities/${id}`, data),

  delete: (id) => api.delete(`/opportunities/${id}`),
};

// ========================================
// Chat con IA
// ========================================
export const chatApi = {
  sendMessage: (message, history = []) =>
    api.post('/chat', { message, history }),

  getHistory: (limit = 20) => api.get(`/chat/history?limit=${limit}`),
};

// ========================================
// Historial de Auditoría
// ========================================
export const auditApi = {
  getAllLogs: (limit = 100) => api.get(`/audit-logs?limit=${limit}`),
  getOpportunityLogs: (id, limit = 50) => api.get(`/audit-logs/opportunity/${id}?limit=${limit}`),
};

// ========================================
// Autenticación
// ========================================
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
};

export default api;
