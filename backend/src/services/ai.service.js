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
  const promptPath = path.join(__dirname, '../config/prompts/system-prompt.md');
  systemPrompt = fs.readFileSync(promptPath, 'utf8');
} catch (err) {
  console.warn('⚠️ No se pudo cargar system-prompt.md, usando prompt por defecto');
  systemPrompt = 'Eres un Asistente Comercial IA experto en CRM. Responde usando solo datos reales del sistema.';
}

// ========================================
// Declaración de Herramientas (Tools / Function Calling)
// ========================================
const tools = [
  {
    functionDeclarations: [
      {
        name: 'getOpportunities',
        description: 'Obtiene todas las oportunidades del CRM o filtradas por etapa, prioridad o responsable.',
        parameters: {
          type: 'OBJECT',
          properties: {
            stage: { type: 'STRING', description: 'Etapa comercial' },
            priority: { type: 'STRING', description: 'Prioridad' },
            owner: { type: 'STRING', description: 'Responsable' },
          },
        },
      },
      {
        name: 'getOpportunityById',
        description: 'Obtiene el detalle completo de una oportunidad comercial específica por su ID.',
        parameters: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING', description: 'ID de la oportunidad' },
          },
          required: ['id'],
        },
      },
      {
        name: 'getTopByProbability',
        description: 'Obtiene las oportunidades activas con mayor probabilidad de cierre.',
        parameters: {
          type: 'OBJECT',
          properties: {
            limit: { type: 'NUMBER', description: 'Cantidad de oportunidades a retornar (default: 5)' },
          },
        },
      },
      {
        name: 'getFollowUpsThisWeek',
        description: 'Obtiene las oportunidades que requieren seguimiento durante la ventana de la semana actual.',
      },
      {
        name: 'getPipelineSummary',
        description: 'Obtiene un resumen cuantitativo completo de todo el pipeline comercial (totales, suma por etapa, promedios).',
      },
      {
        name: 'getOpportunitiesByPriority',
        description: 'Obtiene oportunidades filtradas por nivel de prioridad.',
        parameters: {
          type: 'OBJECT',
          properties: {
            priority: { type: 'STRING', description: 'Nivel de prioridad: Baja, Media, Alta, Crítica' },
          },
          required: ['priority'],
        },
      },
      {
        name: 'getOpportunitiesByOwner',
        description: 'Obtiene oportunidades asignadas a un responsable específico.',
        parameters: {
          type: 'OBJECT',
          properties: {
            owner: { type: 'STRING', description: 'Nombre del responsable' },
          },
          required: ['owner'],
        },
      },
      {
        name: 'searchOpportunityDocuments',
        description: 'Busca y recupera fragmentos relevantes de documentos técnicos, propuestas en PDF/texto, SLAs y requisitos.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'Término de búsqueda o palabras clave' },
            companyName: { type: 'STRING', description: 'Nombre opcional de la empresa u oportunidad' },
          },
          required: ['query'],
        },
      },
    ],
  },
];

async function executeFunctionCall(functionCall) {
  const { name, args } = functionCall;

  switch (name) {
    case 'getOpportunities':
      return await OpportunityService.getAll(args || {});
    case 'getOpportunityById':
      return await OpportunityService.getById(args.id);
    case 'getTopByProbability':
      return await OpportunityService.getTopByProbability(args.limit || 5);
    case 'getFollowUpsThisWeek': {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return await OpportunityService.getFollowUps(
        today.toISOString().split('T')[0],
        nextWeek.toISOString().split('T')[0]
      );
    }
    case 'getPipelineSummary':
      return await OpportunityService.getPipelineSummary();
    case 'getOpportunitiesByPriority':
      return await OpportunityService.getByPriority(args.priority);
    case 'getOpportunitiesByOwner':
      return await OpportunityService.getByOwner(args.owner);
    case 'searchOpportunityDocuments':
      return searchDocuments(args.query, args.companyName || '');
    default:
      return { error: `Función desconocida: ${name}` };
  }
}

function formatChatHistory(conversationHistory, currentUserMessage) {
  if (!Array.isArray(conversationHistory)) return [];

  let formatted = conversationHistory.map((msg) => ({
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

// ========================================
// Procesar mensaje del usuario
// ========================================
async function processMessage(userMessage, conversationHistory = []) {
  try {
    const model = genAI.getGenerativeModel({
      model: geminiConfig.model,
      ...geminiConfig.generationConfig,
      tools,
      systemInstruction: systemPrompt,
    });

    const chatHistory = formatChatHistory(conversationHistory, userMessage);
    const chat = model.startChat({ history: chatHistory });

    let result = await chat.sendMessage(userMessage);
    let response = result.response;

    let maxIterations = 5;
    while (maxIterations > 0) {
      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const functionCalls = parts.filter((p) => p.functionCall);

      if (functionCalls.length === 0) break;

      const functionResponses = [];
      for (const part of functionCalls) {
        console.log(`🤖 Function call: ${part.functionCall.name}`, part.functionCall.args);
        const data = await executeFunctionCall(part.functionCall);
        functionResponses.push({
          functionResponse: {
            name: part.functionCall.name,
            response: { data },
          },
        });
      }

      result = await chat.sendMessage(functionResponses);
      response = result.response;
      maxIterations--;
    }

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
