const OpportunityModel = require('../models/opportunity.model');

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
    return OpportunityModel.create(data);
  },

  async update(id, data) {
    // Verificar que existe antes de actualizar
    await this.getById(id);
    return OpportunityModel.update(id, data);
  },

  async delete(id) {
    const deleted = await OpportunityModel.delete(id);
    if (!deleted) {
      const error = new Error('Oportunidad no encontrada');
      error.statusCode = 404;
      throw error;
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
