const jwt = require('jsonwebtoken');

/**
 * Middleware de Autenticación JWT para proteger endpoints sensibles.
 * Verifica la cabecera Authorization: Bearer <token>.
 */
function authenticateToken(req, res, next) {
  // Permitir bypass en modo desarrollo solo si la variable DISABLE_AUTH está explícitamente en true
  if (process.env.DISABLE_AUTH === 'true') {
    req.user = { id: 'dev-user', name: 'Dev User', role: 'admin' };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado: Se requiere cabecera Authorization con token Bearer válidos.',
    });
  }

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_crm_ai_2026';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Acceso prohibido: El token de autenticación es inválido o ha expirado.',
      });
    }

    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
