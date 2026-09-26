const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Endpoint de inicio de sesión
router.post('/login', authController.login);

// Endpoint público para obtener un token demo
router.post('/demo-token', authController.getDemoToken);

// Endpoint protegido para verificar estado del usuario
router.get('/me', authenticateToken, authController.getProfile);

module.exports = router;
