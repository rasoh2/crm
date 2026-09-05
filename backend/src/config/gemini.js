const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Configuración del cliente Gemini.
 * Modelo oficial de Google Gemini API: gemini-1.5-flash
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const geminiConfig = {
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.3, // Bajo para respuestas más precisas y menos creativas
    topP: 0.8,
    maxOutputTokens: 2048,
  },
};

module.exports = { genAI, geminiConfig };
