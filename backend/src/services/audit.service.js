const { pool } = require('../config/db');

/**
 * Servicio de Auditoría y Trazabilidad Comercial (Audit Logs)
 */
const AuditService = {
  /**
   * Registrar una acción de auditoría
   */
  async logAction({ opportunityId, action, changes = {}, performedBy = 'Sistema', ipAddress = null }) {
    try {
      const query = `
        INSERT INTO audit_logs (opportunity_id, action, changes, performed_by, ip_address)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const values = [
        opportunityId || null,
        action,
        JSON.stringify(changes),
        performedBy || 'Sistema',
        ipAddress || null,
      ];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error al guardar registro de auditoría:', error.message);
      return null;
    }
  },

  /**
   * Obtener registros de auditoría de una oportunidad específica
   */
  async getByOpportunityId(opportunityId, limit = 50) {
    try {
      const query = `
        SELECT a.*, o.opportunity_name, o.company_name
        FROM audit_logs a
        LEFT JOIN opportunities o ON a.opportunity_id = o.id
        WHERE a.opportunity_id = $1
        ORDER BY a.created_at DESC
        LIMIT $2;
      `;
      const result = await pool.query(query, [opportunityId, limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error al consultar auditoría por oportunidad:', error.message);
      throw error;
    }
  },

  /**
   * Obtener historial global de auditoría del CRM
   */
  async getAll(limit = 100) {
    try {
      const query = `
        SELECT a.*, o.opportunity_name, o.company_name
        FROM audit_logs a
        LEFT JOIN opportunities o ON a.opportunity_id = o.id
        ORDER BY a.created_at DESC
        LIMIT $1;
      `;
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error al consultar historial global de auditoría:', error.message);
      throw error;
    }
  },
};

module.exports = AuditService;
