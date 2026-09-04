const AIService = require('../services/ai.service');

/**
 * Controller del Chat — Maneja las interacciones con el asistente IA.
 */
const ChatController = {
  // POST /api/chat
  async sendMessage(req, res, next) {
    try {
      const { message, history } = req.body;

      // Convertir historial del frontend al formato esperado
      const conversationHistory = (history || []).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content,
      }));

      const result = await AIService.processMessage(message, conversationHistory);

      res.json({
        success: true,
        data: {
          message: result.response,
          timestamp: result.timestamp,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/chat/history
  async getHistory(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const history = await AIService.getChatHistory(limit);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ChatController;
