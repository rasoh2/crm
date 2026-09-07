const AuditService = require('../services/audit.service');

const AuditController = {
  /**
   * GET /api/audit-logs
   * Obtener lista global de eventos de auditoría
   */
  async getAllLogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const logs = await AuditService.getAll(limit);
      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/opportunities/:id/audit-logs
   * Obtener registros de auditoría de una oportunidad específica
   */
  async getOpportunityLogs(req, res, next) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const logs = await AuditService.getByOpportunityId(id, limit);
      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = AuditController;
