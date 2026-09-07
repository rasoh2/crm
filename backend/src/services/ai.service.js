const { groq, groqConfig } = require('../config/groq');
const { genAI, geminiConfig } = require('../config/gemini');
const OpportunityService = require('./opportunities.service');
const { searchDocuments } = require('../data/opportunity-documents');
const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

// ========================================
// Carga de System Prompt
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

// ========================================
// Caché de respuestas en memoria (60s)
// ========================================
const responseCache = new Map();

function getCachedResponse(query) {
  const normalized = query.toLowerCase().trim();
  const cached = responseCache.get(normalized);
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`⚡ [Cache Hit] Respondiendo consulta desde memoria sin consumir cuota API: "${query}"`);
    return cached.data;
  }
  return null;
}

function setCachedResponse(query, data) {
  const normalized = query.toLowerCase().trim();
  responseCache.set(normalized, {
    data,
    expiresAt: Date.now() + 60 * 1000, // 60 segundos
  });
}

// ========================================
// Formateo e Higienización del Historial
// ========================================
function formatChatHistory(conversationHistory) {
  if (!Array.isArray(conversationHistory)) return [];

  const recent = conversationHistory.slice(-6);

  const valid = recent
    .filter((msg) => msg && msg.role && msg.content)
    .map((msg) => {
      const isAssistant = msg.role === 'assistant' || msg.role === 'model';
      let content = String(msg.content).trim();

      // Compresión inteligente de respuestas pasadas del asistente
      if (isAssistant && content.length > 250) {
        content = content.substring(0, 250) + '... [Resumen de respuesta previa]';
      }

      return {
        role: isAssistant ? 'assistant' : 'user',
        content,
      };
    })
    .filter((msg) => msg.content.length > 0);

  while (valid.length > 0 && valid[0].role !== 'user') {
    valid.shift();
  }

  const clean = [];
  for (const msg of valid) {
    if (clean.length === 0) {
      clean.push(msg);
    } else {
      const prevRole = clean[clean.length - 1].role;
      if (msg.role !== prevRole) {
        clean.push(msg);
      }
    }
  }

  if (clean.length > 0 && clean[clean.length - 1].role === 'user') {
    clean.pop();
  }

  return clean;
}

// ========================================
// Reintento con Groq Cloud
// ========================================
async function sendGroqCompletionWithRetry(messages, modelName, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await groq.chat.completions.create({
        messages,
        model: modelName,
        temperature: groqConfig.generationConfig.temperature,
        top_p: groqConfig.generationConfig.top_p,
        max_tokens: groqConfig.generationConfig.max_tokens,
      });
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      const isRateLimit = err.status === 429 || err.message?.includes('429') || err.message?.includes('Rate limit');
      const delay = isRateLimit ? 2000 * (i + 1) : 1000;
      console.warn(`⚠️ Reintento (${i + 1}/${maxRetries}) en Groq API (${modelName}): espere ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// ========================================
// Fallback de Emergencia con Google Gemini (Alta Disponibilidad Multi-Proveedor)
// ========================================
async function processMessageWithGeminiBackup(userMessage, crmContextText, conversationHistory) {
  console.log('🛡️ [HA Multi-Proveedor] Activando respaldo transparente con Google Gemini...');
  const model = genAI.getGenerativeModel({
    model: geminiConfig.model || 'gemini-1.5-flash',
    generationConfig: geminiConfig.generationConfig,
    systemInstruction: systemPrompt,
  });

  const formattedGeminiHistory = conversationHistory
    .filter((msg) => msg && (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'model'))
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(msg.content) }],
    }));

  while (formattedGeminiHistory.length > 0 && formattedGeminiHistory[0].role !== 'user') {
    formattedGeminiHistory.shift();
  }
  if (formattedGeminiHistory.length > 0 && formattedGeminiHistory[formattedGeminiHistory.length - 1].role === 'user') {
    formattedGeminiHistory.pop();
  }

  const chat = model.startChat({ history: formattedGeminiHistory });
  const fullPrompt = `${crmContextText}\n\nPREGUNTA DEL USUARIO:\n${userMessage}`;
  const result = await chat.sendMessage(fullPrompt);

  return result.response.text();
}

// ========================================
// Servicio Principal del Asistente IA
// ========================================
async function processMessage(userMessage, conversationHistory = []) {
  try {
    // 0. Verificar Caché en memoria
    const cached = getCachedResponse(userMessage);
    if (cached) {
      return cached;
    }

    // 1. Cargar contexto en tiempo real del CRM con Pruning Inteligente
    let crmContextText = '';
    try {
      const [opps, summary] = await Promise.all([
        OpportunityService.getAll({}),
        OpportunityService.getPipelineSummary(),
      ]);

      const docResults = searchDocuments(userMessage, '');

      // Context Pruning: si la pregunta es sobre una empresa específica, filtrar la lista
      const queryLower = userMessage.toLowerCase();
      const matchedOpps = opps.filter(
        (o) =>
          queryLower.includes(o.company_name.toLowerCase()) ||
          queryLower.includes(o.opportunity_name.toLowerCase()) ||
          queryLower.includes(o.owner.toLowerCase())
      );

      const targetOpps = matchedOpps.length > 0 ? matchedOpps : opps;

      const oppLines = targetOpps
        .map(
          (o) =>
            `- ${o.company_name} | ${o.opportunity_name} | $${o.estimated_value} ${o.currency} | Etapa: ${o.stage} | Prio: ${o.priority} | Prob: ${o.probability}% | Owner: ${o.owner}${o.next_follow_up_date ? ' | Seg: ' + o.next_follow_up_date : ''}`
        )
        .join('\n');

      crmContextText = `
=== DATOS DEL PIPELINE COMERCIAL (REALTIME) ===
Resumen General: Total=${summary.total_opportunities}, ValorTotal=$${summary.total_value}USD, ProbProm=${Math.round(summary.avg_probability || 0)}%, Ganadas=${summary.won}, Activas=${summary.active}, Criticas=${summary.critical_count}
Oportunidades (${targetOpps.length}):
${oppLines}
RAG Documentos: ${JSON.stringify(docResults)}
================================================
`;
    } catch (dbErr) {
      console.warn('⚠️ No se pudo cargar todo el contexto en tiempo real:', dbErr.message);
    }

    const formattedHistory = formatChatHistory(conversationHistory);
    const systemMessageContent = `${systemPrompt}\n\n${crmContextText}`;

    const messages = [
      { role: 'system', content: systemMessageContent },
      ...formattedHistory,
      { role: 'user', content: userMessage },
    ];

    let responseText = '';

    // 2. Ejecución con Multi-Proveedor (Groq Primary -> Groq Fallback -> Gemini Backup)
    try {
      let completion;
      try {
        completion = await sendGroqCompletionWithRetry(messages, groqConfig.model);
      } catch (errPrimary) {
        console.warn(`⚠️ Modelo Groq primario (${groqConfig.model}) ocupado/sin respuesta. Probando fallback Groq (${groqConfig.fallbackModel})...`);
        completion = await sendGroqCompletionWithRetry(messages, groqConfig.fallbackModel);
      }
      responseText = completion.choices[0]?.message?.content || '';
    } catch (groqErr) {
      // 3. Fallback de alta disponibilidad a Google Gemini ante límites de cuota (429) o fallos de red
      console.warn(`⚠️ Groq Cloud no disponible (${groqErr.message.substring(0, 60)}...). Ejecutando Respaldo con Gemini...`);
      try {
        responseText = await processMessageWithGeminiBackup(userMessage, crmContextText, conversationHistory);
      } catch (geminiErr) {
        throw new Error(`Ambos proveedores de IA (Groq + Gemini) están en cuota máxima. Detalle: ${geminiErr.message}`);
      }
    }

    const resultPayload = {
      response: responseText || 'Sin respuesta del modelo.',
      timestamp: new Date().toISOString(),
    };

    // Guardar en historial SQL y en caché de memoria
    await saveChatMessage('user', userMessage);
    await saveChatMessage('assistant', resultPayload.response);
    setCachedResponse(userMessage, resultPayload);

    return resultPayload;
  } catch (error) {
    console.error('❌ Error final en AI Service:', error);

    return {
      response: `Disculpas, los servicios de IA están experimentando alta demanda. Por favor intenta tu consulta en unos segundos. (Detalle: ${error.message})`,
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
