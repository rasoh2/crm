const { genAI, geminiConfig } = require('../config/gemini');
const OpportunityService = require('./opportunities.service');
const { searchDocuments } = require('../data/opportunity-documents');
const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

/**
 * Servicio de IA — Lógica de integración con Gemini.
 * SEPARADO de la lógica de negocio del CRM (opportunities.service.js).
 * Implementa function calling para que Gemini consulte datos reales.
 */

// Cargar system prompt desde archivo (versionado)
const systemPrompt = fs.readFileSync(
  path.join(__dirname, '../config/prompts/system-prompt-v1.md'),
  'utf-8'
);

// ========================================
// Definición de funciones para Gemini
// (Function Calling / Tool Use)
// ========================================
const tools = [
  {
    functionDeclarations: [
      {
        name: 'getOpportunities',
        description:
          'Obtiene la lista de todas las oportunidades comerciales del CRM, opcionalmente filtradas por etapa, prioridad o responsable.',
        parameters: {
          type: 'OBJECT',
          properties: {
            stage: {
              type: 'STRING',
              description:
                'Filtrar por etapa: Lead nuevo, Contactado, Diagnóstico, Propuesta enviada, Negociación, Ganado, Perdido',
            },
            priority: {
              type: 'STRING',
              description: 'Filtrar por prioridad: Baja, Media, Alta, Crítica',
            },
            owner: {
              type: 'STRING',
              description: 'Filtrar por responsable (nombre parcial)',
            },
          },
        },
      },
      {
        name: 'getOpportunityById',
        description: 'Obtiene los detalles completos de una oportunidad específica por su ID.',
        parameters: {
          type: 'OBJECT',
          properties: {
            id: {
              type: 'STRING',
              description: 'UUID de la oportunidad',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'getTopByProbability',
        description:
          'Obtiene las oportunidades con mayor probabilidad de cierre, excluyendo las ganadas y perdidas.',
        parameters: {
          type: 'OBJECT',
          properties: {
            limit: {
              type: 'NUMBER',
              description: 'Número máximo de resultados (default 5)',
            },
          },
        },
      },
      {
        name: 'getFollowUpsThisWeek',
        description:
          'Obtiene las oportunidades que necesitan seguimiento esta semana (próximos 7 días).',
        parameters: {
          type: 'OBJECT',
          properties: {},
        },
      },
      {
        name: 'getPipelineSummary',
        description:
          'Obtiene un resumen ejecutivo del pipeline: total de oportunidades, valor total, promedio de probabilidad, conteos por estado y prioridad.',
        parameters: {
          type: 'OBJECT',
          properties: {},
        },
      },
      {
        name: 'getOpportunitiesByPriority',
        description: 'Obtiene oportunidades filtradas por nivel de prioridad.',
        parameters: {
          type: 'OBJECT',
          properties: {
            priority: {
              type: 'STRING',
              description: 'Nivel de prioridad: Baja, Media, Alta, Crítica',
            },
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
            owner: {
              type: 'STRING',
              description: 'Nombre del responsable (ej: LABS IA, Carlos, etc)',
            },
          },
          required: ['owner'],
        },
      },
      {
        name: 'searchOpportunityDocuments',
        description:
          'Busca y recupera fragmentos relevantes de documentos técnicos, propuestas en PDF/texto, SLAs, requisitos de seguridad y especificaciones de arquitectura asociados a las oportunidades comerciales.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: {
              type: 'STRING',
              description:
                'Término de búsqueda o palabras clave (ej: seguridad, sla, cifrado, hipaa, iot, latencia, soporte)',
            },
            companyName: {
              type: 'STRING',
              description:
                'Nombre opcional de la empresa u oportunidad para filtrar los documentos (ej: Starlight Aerospace, Nouveau BioTech)',
            },
          },
          required: ['query'],
        },
      },
    ],
  },
];

// ========================================
// Ejecutar funciones llamadas por Gemini
// ========================================
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

  // Mapear roles: 'assistant' -> 'model', 'user' -> 'user'
  let formatted = conversationHistory.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : msg.role,
    parts: [{ text: msg.content || '' }],
  }));

  // Eliminar el último mensaje si coincide con el mensaje actual del usuario o si es un 'user' al final
  if (formatted.length > 0 && formatted[formatted.length - 1].role === 'user') {
    const lastContent = formatted[formatted.length - 1].parts[0]?.text;
    if (lastContent === currentUserMessage || formatted.length % 2 !== 0) {
      formatted.pop();
    }
  }

  // Eliminar mensajes iniciales 'model' (Gemini exige que el historial comience con 'user')
  while (formatted.length > 0 && formatted[0].role !== 'user') {
    formatted.shift();
  }

  // Asegurar alternancia estricta entre 'user' y 'model'
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

  // Si termina en 'user', removerlo para que la llamada a sendMessage(userMessage) sea la siguiente
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

    // Construir historial de conversación sanitizado para Gemini
    const chatHistory = formatChatHistory(conversationHistory, userMessage);

    const chat = model.startChat({
      history: chatHistory,
    });

    // Enviar mensaje del usuario
    let result = await chat.sendMessage(userMessage);
    let response = result.response;

    // Loop de function calling: Gemini puede llamar múltiples funciones
    let maxIterations = 5; // Prevenir loops infinitos
    while (maxIterations > 0) {
      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      // Buscar function calls en la respuesta
      const functionCalls = parts.filter((p) => p.functionCall);

      if (functionCalls.length === 0) {
        // No hay más function calls — Gemini terminó
        break;
      }

      // Ejecutar todas las function calls
      const functionResponses = [];
      for (const part of functionCalls) {
        console.log(`🔧 Function call: ${part.functionCall.name}`, part.functionCall.args);
        const data = await executeFunctionCall(part.functionCall);
        functionResponses.push({
          functionResponse: {
            name: part.functionCall.name,
            response: { data },
          },
        });
      }

      // Enviar resultados de las funciones de vuelta a Gemini
      result = await chat.sendMessage(functionResponses);
      response = result.response;
      maxIterations--;
    }

    // Extraer texto de la respuesta final
    const textParts = response.candidates?.[0]?.content?.parts || [];
    const responseText = textParts
      .filter((p) => p.text)
      .map((p) => p.text)
      .join('\n');

    // Guardar en historial (bonus)
    await saveChatMessage('user', userMessage);
    await saveChatMessage('assistant', responseText);

    return {
      response: responseText,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error en AI Service:', error.message);

    // Respuesta controlada ante errores
    if (error.message.includes('API key')) {
      return {
        response:
          'No se pudo conectar con el asistente de IA. Verifica que la API key de Gemini esté configurada correctamente en el archivo .env.',
        error: true,
      };
    }

    return {
      response:
        'Ocurrió un error al procesar tu consulta. Por favor, intenta de nuevo.',
      error: true,
    };
  }
}

// ========================================
// Historial de conversaciones (bonus)
// ========================================
async function saveChatMessage(role, content) {
  try {
    await pool.query(
      'INSERT INTO chat_history (role, content) VALUES ($1, $2)',
      [role, content]
    );
  } catch (error) {
    // No fallar si el historial no se puede guardar
    console.warn('⚠️  No se pudo guardar el historial:', error.message);
  }
}

async function getChatHistory(limit = 20) {
  try {
    const result = await pool.query(
      'SELECT role, content, created_at FROM chat_history ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows.reverse(); // Más antiguo primero
  } catch (error) {
    return [];
  }
}

module.exports = {
  processMessage,
  getChatHistory,
  formatChatHistory,
};
