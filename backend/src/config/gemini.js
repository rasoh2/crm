const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Configuracion del cliente Gemini.
 * Usamos gemini-3.5-flash-lite como modelo primario optimizado para velocidad y cuota free.
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const geminiConfig = {
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  fallbackModel: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.3,
    topP: 0.8,
    maxOutputTokens: 1024,
  },
};

module.exports = { genAI, geminiConfig };
