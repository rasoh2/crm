const Groq = require('groq-sdk');
require('dotenv').config();

/**
 * Configuración del cliente Groq Cloud.
 * Usamos llama-3.1-8b-instant como modelo primario optimizado para velocidad LPU y cuota gratuita.
 */

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const groqConfig = {
  model: process.env.GROQ_MODEL || 'groq/compound-mini',
  fallbackModel: 'groq/compound',
  generationConfig: {
    temperature: 0.3,
    top_p: 0.8,
    max_tokens: 1024,
  },
};

module.exports = { groq, groqConfig };
