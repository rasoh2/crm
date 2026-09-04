const { body, param, validationResult } = require('express-validator');

/**
 * Middleware de validación — Valida inputs antes de llegar al controller.
 * Usa express-validator para reglas declarativas.
 */

// Extrae errores de validación y responde 400 si hay alguno
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// Validación para UUID en params
const validateId = [
  param('id')
    .isUUID()
    .withMessage('El ID debe ser un UUID válido'),
  handleValidationErrors,
];

// Validación para crear oportunidad
const validateCreate = [
  body('company_name')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la empresa es requerido')
    .isLength({ max: 255 })
    .withMessage('Máximo 255 caracteres'),
  body('contact_name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del contacto es requerido'),
  body('contact_email')
    .trim()
    .notEmpty()
    .withMessage('El email del contacto es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido'),
  body('opportunity_name')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la oportunidad es requerido'),
  body('owner')
    .trim()
    .notEmpty()
    .withMessage('El responsable es requerido'),
  body('estimated_value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor estimado debe ser un número positivo'),
  body('probability')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('La probabilidad debe estar entre 0 y 100'),
  body('stage')
    .optional()
    .isIn([
      'Lead nuevo', 'Contactado', 'Diagnóstico',
      'Propuesta enviada', 'Negociación', 'Ganado', 'Perdido',
    ])
    .withMessage('Etapa no válida'),
  body('priority')
    .optional()
    .isIn(['Baja', 'Media', 'Alta', 'Crítica'])
    .withMessage('Prioridad no válida'),
  body('currency')
    .optional()
    .isLength({ max: 10 })
    .withMessage('La moneda no puede tener más de 10 caracteres'),
  body('next_follow_up_date')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Fecha de seguimiento debe ser una fecha válida'),
  body('contact_email')
    .optional()
    .normalizeEmail(),
  handleValidationErrors,
];

// Validación para actualizar (todos los campos opcionales)
const validateUpdate = [
  param('id').isUUID().withMessage('El ID debe ser un UUID válido'),
  body('company_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre de la empresa no puede estar vacío'),
  body('contact_email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido'),
  body('estimated_value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor estimado debe ser un número positivo'),
  body('probability')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('La probabilidad debe estar entre 0 y 100'),
  body('stage')
    .optional()
    .isIn([
      'Lead nuevo', 'Contactado', 'Diagnóstico',
      'Propuesta enviada', 'Negociación', 'Ganado', 'Perdido',
    ])
    .withMessage('Etapa no válida'),
  body('priority')
    .optional()
    .isIn(['Baja', 'Media', 'Alta', 'Crítica'])
    .withMessage('Prioridad no válida'),
  handleValidationErrors,
];

// Validación para mensaje del chat
const validateChat = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('El mensaje no puede estar vacío')
    .isLength({ max: 2000 })
    .withMessage('El mensaje no puede exceder 2000 caracteres'),
  handleValidationErrors,
];

module.exports = {
  validateId,
  validateCreate,
  validateUpdate,
  validateChat,
};
