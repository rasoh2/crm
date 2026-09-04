const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Configuración del cliente Gemini.
 * Separado de ai.service.js para permitir cambiar de modelo fácilmente.
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiConfig = {
  model: 'gemini-3.1-flash-lite',
  generationConfig: {
    temperature: 0.3, // Bajo para respuestas más precisas y menos creativas
    topP: 0.8,
    maxOutputTokens: 2048,
  },
};

module.exports = { genAI, geminiConfig };
