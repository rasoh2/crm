const { genAI, geminiConfig } = require('../config/gemini');
const OpportunityService = require('./opportunities.service');
const { searchDocuments } = require('../data/opportunity-documents');
const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

// ========================================
// Cargar System Prompt desde archivo .md
// ========================================
let systemPrompt = '';
try {
  let promptPath = path.join(__dirname, '../config/prompts/system-prompt.md');
  if (!fs.existsSync(promptPath)) {
    promptPath = path.join(__dirname, '../config/prompts/system-prompt-v1.md');
  }
  systemPrompt = fs.readFileSync(promptPath, 'utf8');
} catch (err) {
  console.warn('⚠️ No se pudo cargar system-prompt.md, usando prompt por defecto');
  systemPrompt = 'Eres un Asistente Comercial IA experto en CRM. Responde usando solo datos reales del sistema.';
}

function formatChatHistory(conversationHistory, currentUserMessage) {
  if (!Array.isArray(conversationHistory)) return [];

  let formatted = conversationHistory
    .filter((msg) => msg && (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'model'))
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content || '' }],
    }));

  if (formatted.length > 0 && formatted[formatted.length - 1].role === 'user') {
    const lastContent = formatted[formatted.length - 1].parts[0]?.text;
    if (lastContent === currentUserMessage || formatted.length % 2 !== 0) {
      formatted.pop();
    }
  }

  while (formatted.length > 0 && formatted[0].role !== 'user') {
    formatted.shift();
  }

  const cleanHistory = [];
  for (const item of formatted) {
    if (cleanHistory.length === 0) {
      if (item.role === 'user') cleanHistory.push(item);
    } else {
      const prevRole = cleanHistory[cleanHistory.length - 1].role;
      if (item.role !== prevRole) {
        cleanHistory.push(item);
      }
    }
  }

  if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === 'user') {
    cleanHistory.pop();
  }

  return cleanHistory;
}

/**
 * Reintento automatico con backoff para tolerancia a fallos temporales de Google API (429 / 503).
 */
async function sendMessageWithRetry(chat, messagePayload, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await chat.sendMessage(messagePayload);
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      const isQuota = err.message.includes('429') || err.message.includes('Quota exceeded');
      const delay = isQuota ? 3000 * (i + 1) : 1000 * (i + 1);
      console.warn(`⚠️ Reintento (${i + 1}/${maxRetries}) tras advertencia en API Gemini (${err.message.substring(0, 80)}...): espere ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// ========================================
// Procesar mensaje del usuario
// ========================================
async function processMessage(userMessage, conversationHistory = []) {
  try {
    // 1. Cargar contexto en tiempo real del CRM (Oportunidades + Resumen + RAG de documentos)
    let crmContextText = '';
    try {
      const [opps, summary] = await Promise.all([
        OpportunityService.getAll({}),
        OpportunityService.getPipelineSummary(),
      ]);

      const docResults = searchDocuments(userMessage, '');

      crmContextText = `
=== DATOS DEL PIPELINE COMERCIAL (REALTIME) ===
- Resumen Quantitative: ${JSON.stringify(summary, null, 2)}
- Oportunidades Registradas (${opps.length}): ${JSON.stringify(opps, null, 2)}
- Documentos / Normativas / SLAs Relacionados (RAG): ${JSON.stringify(docResults, null, 2)}
================================================
`;
    } catch (dbErr) {
      console.warn('⚠️ No se pudo cargar todo el contexto en tiempo real:', dbErr.message);
    }

    const selectedModelName = geminiConfig.model;
    const model = genAI.getGenerativeModel({
      model: selectedModelName,
      ...geminiConfig.generationConfig,
      systemInstruction: systemPrompt,
    });

    const chatHistory = formatChatHistory(conversationHistory, userMessage);
    const chat = model.startChat({ history: chatHistory });

    const fullPrompt = `${crmContextText}\n\nPREGUNTA DEL USUARIO:\n${userMessage}`;

    const result = await sendMessageWithRetry(chat, fullPrompt);
    const response = result.response;

    const textParts = response.candidates?.[0]?.content?.parts || [];
    const responseText = textParts
      .filter((p) => p.text)
      .map((p) => p.text)
      .join('\n');

    await saveChatMessage('user', userMessage);
    await saveChatMessage('assistant', responseText);

    return {
      response: responseText || 'Sin respuesta del modelo.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error en AI Service:', error);

    if (error.message.includes('429') || error.message.includes('Quota exceeded')) {
      return {
        response: '⚠️ Has alcanzado temporalmente el límite de consultas gratuitas de la API de Google Gemini (5 por minuto). Por favor espera unos 20 segundos e intenta tu consulta nuevamente.',
        error: true,
      };
    }

    return {
      response: `Detalle del error devuelto por la API de Gemini: ${error.message}`,
      error: true,
    };
  }
}

async function saveChatMessage(role, content) {
  try {
    await pool.query(
      'INSERT INTO chat_history (role, content) VALUES ($1, $2)',
      [role, content]
    );
  } catch (error) {
    console.warn('⚠️ No se pudo guardar el historial:', error.message);
  }
}

async function getChatHistory(limit = 20) {
  try {
    const result = await pool.query(
      'SELECT role, content, created_at FROM chat_history ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows.reverse();
  } catch (error) {
    return [];
  }
}

module.exports = {
  processMessage,
  getChatHistory,
  formatChatHistory,
};
