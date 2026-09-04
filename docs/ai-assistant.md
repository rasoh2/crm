# Asistente de IA — Documentación Técnica

## Arquitectura

El asistente utiliza **Google Gemini 3.1 Flash Lite** (`gemini-3.1-flash-lite`) con **Function Calling** (Tool Declarations) y arquitectura **RAG (Retrieval-Augmented Generation)** para consultar datos reales de oportunidades y documentos adjuntos del CRM.

### Flujo de una consulta

```
1. Usuario envía mensaje → POST /api/chat
2. chat.controller.js recibe y delega a ai.service.js
3. ai.service.js envía a Gemini con:
   - System prompt (config/prompts/system-prompt-v1.md)
   - Historial de conversación (memoria sanitizada)
   - 8 declarations de herramientas (funciones que puede llamar)
4. Gemini analiza la pregunta y decide qué función(es) llamar
5. ai.service.js ejecuta las funciones contra la BD PostgreSQL / RAG Data
6. Los resultados se envían de vuelta a Gemini
7. Gemini genera una respuesta en lenguaje natural con datos reales
8. Se guarda en chat_history
9. Se devuelve al frontend
```

### Separación de responsabilidades

| Archivo | Responsabilidad |
|---------|----------------|
| `config/gemini.js` | Configuración del cliente (`gemini-3.1-flash-lite`, temperatura=0.3) |
| `config/prompts/system-prompt-v1.md` | Instrucciones de tono corporativo del asistente (versionado) |
| `services/ai.service.js` | Lógica de integración: function calling, RAG, sanitización de historial |
| `services/opportunities.service.js` | Lógica de negocio del CRM |
| `controllers/chat.controller.js` | Manejo HTTP de los endpoints de chat |

### Funciones disponibles (8 tools)

Gemini puede invocar estas funciones para obtener datos reales en tiempo real:

1. **getOpportunities** — Lista todas con filtros opcionales (stage, priority, owner)
2. **getOpportunityById** — Detalle completo de una oportunidad por UUID
3. **getTopByProbability** — Top N oportunidades por probabilidad de cierre
4. **getFollowUpsThisWeek** — Oportunidades con seguimiento en los próximos 7 días
5. **getPipelineSummary** — Resumen: total, valor, promedios, conteos
6. **getOpportunitiesByPriority** — Filtrar por nivel de prioridad
7. **getOpportunitiesByOwner** — Filtrar por responsable
8. **searchOpportunityDocuments** — RAG de búsqueda en documentos técnicos y propuestas adjuntas

### Control de alucinaciones

1. **System prompt restrictivo**: "Solo usa datos reales obtenidos de las funciones"
2. **Function calling obligatorio**: Gemini DEBE llamar funciones para obtener datos
3. **Temperatura baja (0.3)**: Respuestas factuales y sobrias
4. **Respuesta controlada**: Preguntas fuera del CRM → mensaje de alcance limitado
5. **Max iterations (5)**: Previene loops infinitos de function calling

### Memoria conversacional

- Se implementa usando `chat.sendMessage()` de Gemini que mantiene contexto
- El frontend envía los últimos 10 mensajes como historial
- La función `formatChatHistory` garantiza alternancia estricta entre `user` y `model`, asegurando que el primer mensaje siempre sea del rol `user`.
- Cada mensaje (user + assistant) se guarda en la tabla `chat_history`.

### Prompt versionado

El system prompt se almacena en `backend/src/config/prompts/system-prompt-v1.md`.
