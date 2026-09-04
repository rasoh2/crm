const OpportunityService = require('../services/opportunities.service');
const { emitEvent } = require('../socket');

/**
 * Controller de Oportunidades — Maneja HTTP request/response.
 * Solo parsea inputs, llama al service, y formatea la respuesta.
 */
const OpportunityController = {
  // GET /api/opportunities
  async getAll(req, res, next) {
    try {
      const filters = {
        stage: req.query.stage || null,
        priority: req.query.priority || null,
        owner: req.query.owner || null,
      };

      // Limpiar filtros vacíos
      Object.keys(filters).forEach(
        (key) => filters[key] === null && delete filters[key]
      );

      const opportunities = await OpportunityService.getAll(filters);
      res.json({
        success: true,
        data: opportunities,
        count: opportunities.length,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/opportunities/export/csv
  async exportCSV(req, res, next) {
    try {
      const filters = {
        stage: req.query.stage || null,
        priority: req.query.priority || null,
        owner: req.query.owner || null,
      };

      Object.keys(filters).forEach(
        (key) => filters[key] === null && delete filters[key]
      );

      const opportunities = await OpportunityService.getAll(filters);

      const headers = [
        'ID',
        'Empresa',
        'Oportunidad',
        'Etapa',
        'Prioridad',
        'Valor Estimado',
        'Moneda',
        'Probabilidad',
        'Responsable',
        'Fecha Creacion',
        'Proximo Seguimiento',
        'Notas',
      ];

      const escapeCSV = (val) => {
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      };

      const rows = opportunities.map((opp) => [
        escapeCSV(opp.id),
        escapeCSV(opp.company_name),
        escapeCSV(opp.opportunity_name),
        escapeCSV(opp.stage),
        escapeCSV(opp.priority),
        escapeCSV(opp.estimated_value),
        escapeCSV(opp.currency || 'USD'),
        escapeCSV(opp.probability),
        escapeCSV(opp.owner),
        escapeCSV(opp.created_at ? new Date(opp.created_at).toISOString().split('T')[0] : ''),
        escapeCSV(opp.next_follow_up_date ? new Date(opp.next_follow_up_date).toISOString().split('T')[0] : ''),
        escapeCSV(opp.notes || ''),
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="oportunidades.csv"');
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  },


  // GET /api/opportunities/:id
  async getById(req, res, next) {
    try {
      const opportunity = await OpportunityService.getById(req.params.id);
      res.json({
        success: true,
        data: opportunity,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/opportunities
  async create(req, res, next) {
    try {
      const opportunity = await OpportunityService.create(req.body);
      emitEvent('opportunity:created', opportunity);
      res.status(201).json({
        success: true,
        data: opportunity,
        message: 'Oportunidad creada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/opportunities/:id
  async update(req, res, next) {
    try {
      const opportunity = await OpportunityService.update(
        req.params.id,
        req.body
      );
      emitEvent('opportunity:updated', opportunity);
      res.json({
        success: true,
        data: opportunity,
        message: 'Oportunidad actualizada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/opportunities/:id
  async delete(req, res, next) {
    try {
      const deleted = await OpportunityService.delete(req.params.id);
      emitEvent('opportunity:deleted', { id: req.params.id, ...deleted });
      res.json({
        success: true,
        data: deleted,
        message: 'Oportunidad eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = OpportunityController;

