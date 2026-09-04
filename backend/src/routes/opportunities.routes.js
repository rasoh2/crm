const express = require('express');
const router = express.Router();
const OpportunityController = require('../controllers/opportunities.controller');
const { validateId, validateCreate, validateUpdate } = require('../middleware/validation');

// CRUD de oportunidades
router.get('/', OpportunityController.getAll);
router.get('/export/csv', OpportunityController.exportCSV);
router.get('/:id', validateId, OpportunityController.getById);
router.post('/', validateCreate, OpportunityController.create);
router.put('/:id', validateUpdate, OpportunityController.update);
router.delete('/:id', validateId, OpportunityController.delete);

module.exports = router;

