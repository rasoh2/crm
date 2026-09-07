const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/audit.controller');

// Rutas de Auditoría
router.get('/', AuditController.getAllLogs);
router.get('/opportunity/:id', AuditController.getOpportunityLogs);

module.exports = router;
