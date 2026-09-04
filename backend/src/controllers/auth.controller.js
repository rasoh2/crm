const jwt = require('jsonwebtoken');

const authController = {
  /**
   * Generar token de sesión / demo para testing y frontend
   */
  getDemoToken(req, res) {
    const payload = {
      id: 'usr_demo_101',
      name: 'Usuario Comercial',
      email: 'demo@crm-ai.com',
      role: 'sales_agent',
    };

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_crm_ai_2026';
    const token = jwt.sign(payload, secret, { expiresIn: '2h' });

    return res.json({
      success: true,
      data: {
        token,
        tokenType: 'Bearer',
        expiresIn: '2h',
        user: payload,
      },
    });
  },


  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile(req, res) {
    return res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  },
};

module.exports = authController;
