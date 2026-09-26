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
    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    return res.json({
      success: true,
      data: {
        token,
        tokenType: 'Bearer',
        expiresIn: '24h',
        user: payload,
      },
    });
  },

  /**
   * Iniciar sesión (Login con credenciales o roles demo)
   */
  login(req, res) {
    const { email } = req.body;

    const demoUsers = {
      'admin@crm.com': { id: 'usr_admin', name: 'Sebastián Saavedra', email: 'admin@crm.com', role: 'Administrador CRM', avatar: '👨‍💻' },
      'carlos@crm.com': { id: 'usr_carlos', name: 'Carlos Bermúdez', email: 'carlos@crm.com', role: 'Gerente Comercial', avatar: '👨‍💼' },
      'laura@crm.com': { id: 'usr_laura', name: 'Laura Pérez', email: 'laura@crm.com', role: 'Ejecutiva Senior', avatar: '👩‍💼' },
      'demo@crm.com': { id: 'usr_demo', name: 'Usuario Demo CRM', email: 'demo@crm.com', role: 'Comercial Demo', avatar: '🚀' },
    };

    const targetEmail = (email || 'demo@crm.com').toLowerCase();
    const user = demoUsers[targetEmail] || {
      id: `usr_${Date.now().toString(36)}`,
      name: email ? email.split('@')[0] : 'Usuario Comercial',
      email: email || 'usuario@crm-ai.com',
      role: 'Ejecutivo Comercial',
      avatar: '👤',
    };

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_crm_ai_2026';
    const token = jwt.sign(user, secret, { expiresIn: '24h' });

    return res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        tokenType: 'Bearer',
        user,
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
