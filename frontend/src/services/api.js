import axios from 'axios';

// En produccin, si VITE_API_URL no est definida o apunta a localhost, usar el backend activo en Render
const API_URL = (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost'))
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.MODE === 'production'
      ? 'https://crm-bo95.onrender.com/api'
      : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para adjuntar automticamente el token JWT de sesin
let authToken = localStorage.getItem('crm_token');

api.interceptors.request.use(async (config) => {
  if (!authToken && !config.url.includes('/auth/demo-token')) {
    try {
      const res = await axios.post(`${API_URL}/auth/demo-token`, {});
      if (res.data?.data?.token) {
        authToken = res.data.data.token;
        localStorage.setItem('crm_token', authToken);
      }
    } catch (err) {
      console.warn('⚠️ No se pudo obtener token JWT automatico:', err.message);
    }
  }

  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }
  return config;
});

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

export default api;
