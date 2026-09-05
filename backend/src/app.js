const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const opportunitiesRoutes = require('./routes/opportunities.routes');
const chatRoutes = require('./routes/chat.routes');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth.middleware');
const { apiLimiter, chatRateLimiter } = require('./middleware/rateLimiter');

const app = express();

// ========================================
// 1. Cabeceras de Seguridad HTTP (Helmet)
// Permite solicitudes Cross-Origin entre Netlify y Render
// ========================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ========================================
// 2. CORS y Middlewares globales
// ========================================
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ========================================
// 3. Rate Limiter General (/api/)
// ========================================
app.use('/api', apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log de requests en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path}`);
    next();
  });
}

// ========================================
// 4. Rutas Públicas y de Autenticación
// ========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);

// ========================================
// 5. Rutas Protegidas (JWT + Rate Limiter de IA)
// ========================================
app.use('/api/opportunities', authenticateToken, opportunitiesRoutes);
app.use('/api/chat', authenticateToken, chatRateLimiter, chatRoutes);

// ========================================
// 6. Manejo de rutas no encontradas
// ========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
});

// ========================================
// 7. Manejo centralizado de errores
// ========================================
app.use(errorHandler);

module.exports = app;
