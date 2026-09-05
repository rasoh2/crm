const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Configuración del cliente Gemini.
 * Modelo oficial activo de Google Gemini API: gemini-3.6-flash
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const geminiConfig = {
  model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  generationConfig: {
    temperature: 0.3, // Bajo para respuestas más precisas
    topP: 0.8,
    maxOutputTokens: 2048,
  },
};

module.exports = { genAI, geminiConfig };
