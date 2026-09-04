const { pool } = require('../config/db');

/**
 * Modelo de Oportunidades — Acceso a datos con queries SQL parametrizadas.
 * Capa más baja: solo habla con la BD, no tiene lógica de negocio.
 */
const OpportunityModel = {
  /**
   * Obtener todas las oportunidades con filtros opcionales
   */
  async findAll(filters = {}) {
    let query = 'SELECT * FROM opportunities';
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (filters.stage) {
      conditions.push(`stage = $${paramIndex++}`);
      values.push(filters.stage);
    }
    if (filters.priority) {
      conditions.push(`priority = $${paramIndex++}`);
      values.push(filters.priority);
    }
    if (filters.owner) {
      conditions.push(`owner ILIKE $${paramIndex++}`);
      values.push(`%${filters.owner}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY updated_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  },

  /**
   * Obtener una oportunidad por ID
   */
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM opportunities WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Crear una nueva oportunidad
   */
  async create(data) {
    const result = await pool.query(
      `INSERT INTO opportunities (
        company_name, contact_name, contact_email, opportunity_name,
        description, estimated_value, currency, stage, priority,
        probability, owner, next_follow_up_date,
        last_interaction_summary, ai_recommendation
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        data.company_name,
        data.contact_name,
        data.contact_email,
        data.opportunity_name,
        data.description || null,
        data.estimated_value || 0,
        data.currency || 'USD',
        data.stage || 'Lead nuevo',
        data.priority || 'Media',
        data.probability || 0,
        data.owner,
        data.next_follow_up_date || null,
        data.last_interaction_summary || null,
        data.ai_recommendation || null,
      ]
    );
    return result.rows[0];
  },

  /**
   * Actualizar una oportunidad existente
   */
  async update(id, data) {
    // Construir SET dinámico solo con campos proporcionados
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'company_name', 'contact_name', 'contact_email', 'opportunity_name',
      'description', 'estimated_value', 'currency', 'stage', 'priority',
      'probability', 'owner', 'next_follow_up_date',
      'last_interaction_summary', 'ai_recommendation',
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    // Siempre actualizar updated_at
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE opportunities SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  /**
   * Eliminar una oportunidad
   */
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM opportunities WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },

  // ========================================
  // Métodos para el Asistente IA
  // ========================================

  /**
   * Obtener oportunidades por etapa
   */
  async findByStage(stage) {
    const result = await pool.query(
      'SELECT * FROM opportunities WHERE stage = $1 ORDER BY probability DESC',
      [stage]
    );
    return result.rows;
  },

  /**
   * Obtener oportunidades por prioridad
   */
  async findByPriority(priority) {
    const result = await pool.query(
      'SELECT * FROM opportunities WHERE priority = $1 ORDER BY estimated_value DESC',
      [priority]
    );
    return result.rows;
  },

  /**
   * Obtener seguimientos pendientes en un rango de fechas
   */
  async findFollowUps(startDate, endDate) {
    const result = await pool.query(
      `SELECT * FROM opportunities 
       WHERE next_follow_up_date BETWEEN $1 AND $2 
       ORDER BY next_follow_up_date ASC`,
      [startDate, endDate]
    );
    return result.rows;
  },

  /**
   * Obtener resumen del pipeline
   */
  async getPipelineSummary() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_opportunities,
        SUM(estimated_value) as total_value,
        AVG(probability) as avg_probability,
        COUNT(*) FILTER (WHERE stage = 'Ganado') as won,
        COUNT(*) FILTER (WHERE stage = 'Perdido') as lost,
        COUNT(*) FILTER (WHERE stage NOT IN ('Ganado', 'Perdido')) as active,
        COUNT(*) FILTER (WHERE priority = 'Crítica') as critical_count,
        COUNT(*) FILTER (WHERE priority = 'Alta') as high_count
      FROM opportunities
    `);
    return result.rows[0];
  },

  /**
   * Obtener oportunidades por responsable
   */
  async findByOwner(owner) {
    const result = await pool.query(
      'SELECT * FROM opportunities WHERE owner ILIKE $1 ORDER BY priority DESC, probability DESC',
      [`%${owner}%`]
    );
    return result.rows;
  },

  /**
   * Obtener las top oportunidades por probabilidad de cierre
   */
  async findTopByProbability(limit = 5) {
    const result = await pool.query(
      `SELECT * FROM opportunities 
       WHERE stage NOT IN ('Ganado', 'Perdido')
       ORDER BY probability DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },
};

module.exports = OpportunityModel;
