const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter General para todas las rutas de la API (/api/).
 * Limita cada IP a 200 peticiones por ventana de 15 minutos.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes desde esta IP. Por favor reintente en unos minutos.',
  },
});

/**
 * Rate Limiter Estricto para el Asistente de IA (/api/chat).
 * Limita a 20 consultas por ventana de 15 minutos por IP para proteger el presupuesto de la API de Gemini.
 */
const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 50 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Límite de consultas al Asistente de IA alcanzado (máximo de consultas por 15 min). Por favor espera unos minutos.',
  },
});

module.exports = {
  apiLimiter,
  chatRateLimiter,
};
