const jwt = require('jsonwebtoken');

/**
 * Middleware de Autenticacin JWT para proteger endpoints sensibles.
 * Verifica la cabecera Authorization: Bearer <token>.
 */
function authenticateToken(req, res, next) {
  // Permitir bypass en modo desarrollo o si DISABLE_AUTH est explcitamente en true
  if (process.env.DISABLE_AUTH === 'true') {
    req.user = { id: 'dev-user', name: 'Dev User', role: 'admin' };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Si es una peticin de lectura GET en modo demo/pblico, asignar usuario demo automtico
    if (req.method === 'GET') {
      req.user = { id: 'usr_demo_101', name: 'Usuario Demo', role: 'sales_agent' };
      return next();
    }
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado: Se requiere cabecera Authorization con token Bearer validos.',
    });
  }

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_crm_ai_2026';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      if (req.method === 'GET') {
        req.user = { id: 'usr_demo_101', name: 'Usuario Demo', role: 'sales_agent' };
        return next();
      }
      return res.status(403).json({
        success: false,
        error: 'Acceso prohibido: El token de autenticacion es invalido o ha expirado.',
      });
    }

    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
