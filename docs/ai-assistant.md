# Asistente de IA — Documentación Técnica

## Arquitectura de Alta Disponibilidad (HA Multi-Proveedor)

El Copilot Comercial utiliza una arquitectura **Multi-Proveedor de Alta Disponibilidad** que combina la velocidad de **Groq Cloud (LPU)** como motor primario con **Google Gemini** como motor de respaldo automático, integrado con **Context Pruning**, **Caché de Respuestas** y **RAG (Retrieval-Augmented Generation)**.

---

### Flujo de Ejecución e Inferencia

```
1. Usuario envía mensaje → POST /api/chat
2. chat.controller.js recibe la solicitud y delega a ai.service.js
3. ai.service.js evalúa el estado del sistema:
   a. ¿Consulta presente en Caché (<60s)? ➔ Retorna respuesta inmediata (0ms)
   b. Si es nueva: Consulta a PostgreSQL + RAG en tiempo real
4. Aplica Context Pruning (filtra oportunidades relevantes) y Compresión de Historial (<250 caracteres por turno)
5. Envía la solicitud al Motor Primario: Groq Cloud (groq/compound-mini)
6. Si Groq Cloud responde OK (<500ms) ➔ Procesa respuesta
7. Si Groq Cloud devuelve 429 Rate Limit / Timeout ➔ Conmutación Transparente HA a Google Gemini (gemini-1.5-flash)
8. Se almacena el resultado en chat_history y en la Caché en Memoria
9. Se envía respuesta formateada en Markdown al Frontend
```

---

### Separación de Responsabilidades

| Archivo | Responsabilidad |
|---------|----------------|
| `config/groq.js` | Configuración del cliente principal Groq Cloud (`groq/compound-mini`, temp=0.3) |
| `config/gemini.js` | Configuración del motor de respaldo Google Gemini (`gemini-1.5-flash`) |
| `config/prompts/system-prompt-v1.md` | System prompt corporativo con directivas de conducta y formato (versionado) |
| `services/ai.service.js` | Orquestación HA: caché, context pruning, sanitización de historial y conmutación de proveedor |
| `services/opportunities.service.js` | Servicio de negocio CRM que consulta PostgreSQL |
| `controllers/chat.controller.js` | Controlador Express para endpoints REST del chat |

---

### Técnicas de Rendimiento y Prevención de Errores

1. **Context Pruning (Filtrado de Contexto)**: Si el usuario consulta por una empresa específica (ej: *"BancaDigital"*), se envía solo esa empresa en lugar de las 30 oportunidades, reduciendo el consumo de tokens en un 85%.
2. **Compresión de Historial Conversacional**: Se conservan solo los últimos 6 mensajes y las respuestas pasadas del asistente se resumen a 250 caracteres, evitando el error `429 TPM Rate Limit`.
3. **Alternancia Estricta de Roles**: `formatChatHistory` asegura que el historial siempre comience con el rol `user` y alterne en estricto orden `user` ➔ `assistant`.
4. **Caché LRU en Memoria (60s)**: Atiende peticiones idénticas repetidas en 0ms sin consumir cuota de las APIs de IA.
5. **Temperatura Baja (0.3)**: Garantiza respuestas estrictamente factuales sobre los datos reales del CRM.
