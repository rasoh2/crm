# Decisiones Técnicas

## 1. Arquitectura: Monolito modular
**Decisión:** Separar frontend y backend en carpetas, no en microservicios.
**Justificación:** Para un CRM de prueba técnica, microservicios agregarían complejidad sin beneficio. La separación en carpetas demuestra entendimiento de capas sin over-engineering.

## 2. API: REST sobre GraphQL
**Decisión:** Usar API REST con Express.
**Justificación:** Las operaciones del CRM son CRUD simples. GraphQL agrega complejidad (schema, resolvers, tooling) sin resolver problemas reales de over-fetching/under-fetching en este caso.

## 3. Base de datos: pg directo sin ORM
**Decisión:** Usar `pg` (node-postgres) con queries SQL parametrizadas y sanitización estricta.
**Justificación:** Con una tabla principal, un ORM como Sequelize o Prisma agregaría una capa de abstracción innecesaria. SQL directo permite mejor control y demuestra conocimiento real de SQL.

## 4. Asistente IA: Function Calling + RAG con Google Gemini 3.1 Flash Lite
**Decisión:** Usar **Google Gemini 3.1 Flash Lite** (`gemini-3.1-flash-lite`) combinando Function Calling y RAG (Retrieval-Augmented Generation).
**Justificación:**
- **Function Calling (8 Tools)** permite que Gemini consulte datos tabulares exactos de la BD en tiempo real.
- **RAG (`searchOpportunityDocuments`)** permite realizar búsquedas semánticas y de contenido en documentos técnicos, propuestas y archivos adjuntos a las oportunidades.
- **`gemini-3.1-flash-lite`** ofrece baja latencia, cero errores de formato JSON y respuestas factuales de alto rendimiento.

## 5. Frontend: Vite sobre CRA
**Decisión:** Usar Vite como build tool.
**Justificación:** Create React App está deprecated desde 2023. Vite ofrece HMR instantáneo, bundles más pequeños y mejor DX.

## 6. Validación: ENUMs de PostgreSQL + express-validator
**Decisión:** Validar a nivel de BD (ENUMs, CHECK constraints) Y a nivel de backend (middleware).
**Justificación:** Doble validación garantiza integridad de datos incluso si alguien accede directamente a la BD.

## 7. Prompt versionado en archivo
**Decisión:** Almacenar el system prompt en `config/prompts/system-prompt-v1.md`.
**Justificación:** Permite modificar el comportamiento del asistente sin cambiar código, facilita A/B testing y es una buena práctica de MLOps.

## 8. IDs: UUID sobre autoincrement
**Decisión:** Usar UUID como primary key.
**Justificación:** No exponen cantidad de registros (seguridad), permiten generación en el cliente sin colisiones, y son estándar en APIs modernas.

## 9. Temperatura baja del modelo (0.3)
**Decisión:** Configurar Gemini con temperature=0.3.
**Justificación:** Para un asistente CRM que debe dar datos precisos, queremos respuestas factuales y predecibles, no creativas. Temperatura baja reduce alucinaciones.

## 10. Separación ai.service.js de opportunities.service.js
**Decisión:** Mantener la lógica de IA completamente separada de la lógica de negocio.
**Justificación:** La prueba lo exige explícitamente. Además, si mañana se cambia de Gemini a OpenAI o Claude, solo se modifica `ai.service.js`.

## 11. Comunicación en Tiempo Real: Socket.io
**Decisión:** Integrar Socket.io en Backend Express y Frontend React.
**Justificación:** Permite la sincronización automática de mutaciones (crear, actualizar, eliminar) entre múltiples pestañas y usuarios en tiempo real sin requerir polling constante.

## 12. Exportación a CSV con BOM UTF-8
**Decisión:** Generar archivos CSV con anteposición de BOM UTF-8 (`\uFEFF`).
**Justificación:** Evita problemas de codificación de caracteres en español (tildes, ñ) al abrir los reportes en Microsoft Excel en sistemas operativos Windows.
