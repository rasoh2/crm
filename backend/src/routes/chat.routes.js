const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const { validateChat } = require('../middleware/validation');

// Chat con el asistente IA
router.post('/', validateChat, ChatController.sendMessage);
router.get('/history', ChatController.getHistory);

module.exports = router;
