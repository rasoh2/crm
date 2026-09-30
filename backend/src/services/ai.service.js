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
      const isAuthErr = err.status === 401 || err.message?.includes('401') || err.message?.includes('invalid_api_key');
      if (isAuthErr || i === maxRetries - 1) throw err;
      const isRateLimit = err.status === 429 || err.message?.includes('429') || err.message?.includes('Rate limit');
      const delay = isRateLimit ? 1000 * (i + 1) : 500;
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

    // 1. Clasificador de Intenciones (Intent Router) para Context Routing (<1ms)
    const queryLower = userMessage.toLowerCase().trim();
    const isGreeting = /^(hola|buenas|buenos días|buenas tardes|buenas noches|saludos|gracias|ayuda|qué puedes hacer)\b/i.test(queryLower) && queryLower.length < 35;
    const isMetricsOnly = /(resumen|total|métricas|métrico|cuánto|monto|acumulado|valor total|promedio|ganadas|activas|críticas|pipeline general)/i.test(queryLower) && !queryLower.includes('empresa') && !queryLower.includes('cliente');
    const isFollowupOnly = /(seguimiento|llamar|agenda|hoy|próximo|tarea|contacto|pendiente)/i.test(queryLower);
    const isDocOnly = /(propuesta|documento|contrato|archivo|pdf|minuta|requerimiento)/i.test(queryLower);

    if (isGreeting) {
      // Intent 1: GREETING (~20 tokens)
      crmContextText = `=== CONTEXTO RÁPIDO ===\nEl sistema es un CRM comercial activo. Saluda de forma ejecutiva, breve y cordial.`;
    } else {
      try {
        const [opps, summary] = await Promise.all([
          OpportunityService.getAll({}),
          OpportunityService.getPipelineSummary(),
        ]);

        const hasCompanyFilter = opps.some((o) =>
          queryLower.includes(o.company_name.toLowerCase()) ||
          queryLower.includes(o.opportunity_name.toLowerCase())
        );

        let relevantOpps = opps;
        if (hasCompanyFilter) {
          relevantOpps = opps.filter(
            (o) =>
              queryLower.includes(o.company_name.toLowerCase()) ||
              queryLower.includes(o.opportunity_name.toLowerCase()) ||
              queryLower.includes(o.owner.toLowerCase())
          );
        }

        const oppLines = relevantOpps
          .map(
            (o) =>
              `${o.company_name} | ${o.opportunity_name} | $${Number(o.estimated_value).toLocaleString('es-CL')} ${o.currency} | Etapa:${o.stage} | Prio:${o.priority} | Prob:${o.probability}% | Resp:${o.owner} | PróxSeguimiento:${o.next_follow_up_date ? new Date(o.next_follow_up_date).toLocaleDateString('es-CL') : 'Sin fecha'} | ÚltimaInteracción:${o.last_interaction_summary || 'N/A'} | Recomendación:${o.ai_recommendation || 'N/A'}`
          )
          .join('\n');

        let docsSection = '';
        if (isDocOnly || /(sla|cifrado|normativa|seguridad|contrato|anexo|especificaci)/i.test(queryLower)) {
          const docResults = searchDocuments(userMessage, '');
          if (Array.isArray(docResults) && docResults.length > 0) {
            docsSection = `\n=== DOCUMENTOS TÉCNICOS Y ANEXOS (RAG) ===\n` +
              docResults.map(d => `- ${d.title || d.name}: ${d.content || d.snippet}`).join('\n') +
              `\n=========================================\n`;
          }
        }

        crmContextText = `
=== RESUMEN GLOBAL DEL PIPELINE COMERCIAL ===
Total Oportunidades: ${summary.total_opportunities} | Valor Acumulado: $${Number(summary.total_value).toLocaleString('es-CL')} USD | Prob. Promedio: ${Math.round(summary.avg_probability || 0)}%
Estado de Cartera: Ganadas=${summary.won} | Activas=${summary.active} | Críticas=${summary.critical_count}
============================================

=== LISTADO DE OPORTUNIDADES (${relevantOpps.length} Registros) ===
${oppLines}
============================================================
${docsSection}
*REGLA DE FORMATO ESTRICTA*: Si tu respuesta incluye o compara 2 o más oportunidades, métricas o seguimientos, preséntalos OBLIGATORIAMENTE en una TABLA Markdown bien estructurada con columnas claras, precedida y seguida por una línea en blanco.
`;
      } catch (dbErr) {
        console.warn('⚠️ No se pudo cargar el contexto por intención:', dbErr.message);
      }
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
        const isAuthErr = errPrimary.status === 401 || errPrimary.message?.includes('401') || errPrimary.message?.includes('invalid_api_key');
        if (isAuthErr) throw errPrimary;
        console.warn(`⚠️ Modelo Groq primario (${groqConfig.model}) ocupado/sin respuesta. Probando fallback Groq (${groqConfig.fallbackModel})...`);
        completion = await sendGroqCompletionWithRetry(messages, groqConfig.fallbackModel);
      }
      responseText = completion.choices[0]?.message?.content || '';
      if (!responseText.trim()) {
        console.warn('⚠️ Groq devolvió respuesta vacía. Activando respaldo con Gemini...');
        responseText = await processMessageWithGeminiBackup(userMessage, crmContextText, conversationHistory);
      }
    } catch (groqErr) {
      // 3. Fallback de alta disponibilidad a Google Gemini ante límites de cuota (429) o fallos de red
      console.warn(`⚠️ Groq Cloud no disponible (${groqErr.message?.substring(0, 60)}...). Ejecutando Respaldo con Gemini...`);
      try {
        responseText = await processMessageWithGeminiBackup(userMessage, crmContextText, conversationHistory);
      } catch (geminiErr) {
        throw new Error('Las API Keys de los proveedores (Groq / Gemini) requieren ser actualizadas o alcanzaron su límite de cuotas.');
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
    console.error('❌ Error final en AI Service:', error.message);

    return {
      response: `⚠️ **Servicio de Copilot IA no disponible temporalmente**\n\nLas claves de API de los proveedores de IA (Groq Cloud / Google Gemini) están alcanzando su límite de cuotas o no están configuradas correctamente en el archivo \`.env\`.\n\n*Por favor, actualiza la variable \`GROQ_API_KEY\` o \`GEMINI_API_KEY\` para reanudar el asistente.*`,
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
