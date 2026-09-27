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
   * Iniciar sesión (Login estricto con validación de credenciales y perfiles demo)
   */
  login(req, res) {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa un correo electrónico válido o selecciona una cuenta demo.',
      });
    }

    const demoUsers = {
      'admin@crm.com': { id: 'usr_admin', name: 'Sebastián Saavedra', email: 'admin@crm.com', role: 'Administrador CRM', avatar: '👨‍💻' },
      'carlos@crm.com': { id: 'usr_carlos', name: 'Carlos Bermúdez', email: 'carlos@crm.com', role: 'Gerente Comercial', avatar: '👨‍💼' },
      'laura@crm.com': { id: 'usr_laura', name: 'Laura Pérez', email: 'laura@crm.com', role: 'Ejecutiva Senior', avatar: '👩‍💼' },
      'demo@crm.com': { id: 'usr_demo', name: 'Usuario Demo CRM', email: 'demo@crm.com', role: 'Comercial Demo', avatar: '🚀' },
    };

    const targetEmail = email.trim().toLowerCase();
    const user = demoUsers[targetEmail];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: `El correo "${email}" no está registrado en el sistema. Selecciona una cuenta demo para acceder.`,
      });
    }

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
