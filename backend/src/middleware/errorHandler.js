/**
 * Middleware centralizado de errores.
 * Captura todos los errores y devuelve una respuesta consistente.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`❌ [${new Date().toISOString()}] ${err.message}`);

  // Error de validación de PostgreSQL (ej: ENUM inválido)
  if (err.code === '22P02' || err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos: verifica los valores enviados',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Violación de constraint unique
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'El registro ya existe',
    });
  }

  // Error con statusCode personalizado (ej: 404)
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
