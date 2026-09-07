const OpportunityModel = require('../models/opportunity.model');
const AuditService = require('./audit.service');

/**
 * Servicio de Oportunidades — Lógica de negocio del CRM.
 * Capa intermedia: orquesta validaciones de negocio y llama al modelo.
 */
const OpportunityService = {
  async getAll(filters) {
    return OpportunityModel.findAll(filters);
  },

  async getById(id) {
    const opportunity = await OpportunityModel.findById(id);
    if (!opportunity) {
      const error = new Error('Oportunidad no encontrada');
      error.statusCode = 404;
      throw error;
    }
    return opportunity;
  },

  async create(data) {
    const created = await OpportunityModel.create(data);
    if (created) {
      await AuditService.logAction({
        opportunityId: created.id,
        action: 'CREATED',
        changes: {
          company_name: created.company_name,
          opportunity_name: created.opportunity_name,
          stage: created.stage,
          estimated_value: created.estimated_value,
          priority: created.priority,
        },
        performedBy: created.owner || 'Sistema',
      });
    }
    return created;
  },

  async update(id, data) {
    // Verificar que existe y obtener estado previo
    const existing = await this.getById(id);
    const updated = await OpportunityModel.update(id, data);

    if (updated) {
      const diffs = {};
      let isStageChanged = false;

      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && String(data[key]) !== String(existing[key])) {
          diffs[key] = {
            old: existing[key],
            new: data[key],
          };
          if (key === 'stage') isStageChanged = true;
        }
      });

      const action = isStageChanged ? 'STAGE_CHANGED' : 'UPDATED';
      await AuditService.logAction({
        opportunityId: updated.id,
        action,
        changes: diffs,
        performedBy: updated.owner || 'Sistema',
      });
    }

    return updated;
  },

  async delete(id) {
    const existing = await OpportunityModel.findById(id);
    const deleted = await OpportunityModel.delete(id);
    if (!deleted) {
      const error = new Error('Oportunidad no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (existing) {
      await AuditService.logAction({
        opportunityId: id,
        action: 'DELETED',
        changes: {
          company_name: existing.company_name,
          opportunity_name: existing.opportunity_name,
          last_stage: existing.stage,
        },
        performedBy: existing.owner || 'Sistema',
      });
    }

    return deleted;
  },

  // Métodos para el asistente IA
  async getByStage(stage) {
    return OpportunityModel.findByStage(stage);
  },

  async getByPriority(priority) {
    return OpportunityModel.findByPriority(priority);
  },

  async getFollowUps(startDate, endDate) {
    return OpportunityModel.findFollowUps(startDate, endDate);
  },

  async getPipelineSummary() {
    return OpportunityModel.getPipelineSummary();
  },

  async getByOwner(owner) {
    return OpportunityModel.findByOwner(owner);
  },

  async getTopByProbability(limit) {
    return OpportunityModel.findTopByProbability(limit);
  },
};

module.exports = OpportunityService;
