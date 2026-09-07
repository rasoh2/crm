# 🤖 Mini CRM con Asistente de IA

> Sistema de seguimiento comercial con asistente de inteligencia artificial integrado y capa de seguridad con autenticación JWT.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Tech Stack](#tech-stack)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Uso del sistema](#uso-del-sistema)
- [Asistente de IA](#asistente-de-ia)
- [Seguridad y Autenticación](#seguridad-y-autenticación)
- [Endpoints de la API](#endpoints-de-la-api)
- [Datos semilla](#datos-semilla)
- [Docker Compose](#docker-compose)
- [Documentación Adicional](#documentación-adicional)
- [Decisiones técnicas](#decisiones-técnicas)
- [Funcionalidades Avanazadas](#funcionalidades-avanzadas-implementadas)

---


## 📐 Arquitectura

```
┌─────────────────┐    HTTP / WebSockets    ┌─────────────────┐     SQL      ┌──────────────┐
│     Frontend    │ ──────────────────► │     Backend     │ ──────────► │  PostgreSQL  │
│ React 19 + BS5  │ ◄────────────────── │ Express + Socket│ ◄────────── │   Database   │
│ Vite + Socket.io│  (JWT Interceptor)  │ (Intent Router) │             │              │
└─────────────────┘                     └────────┬────────┘             └──────────────┘
                                                 │
                                                 │ Multi-Proveedor (Groq Primary ➔ Gemini Backup)
                                                 ▼
                                        ┌─────────────────────────┐
                                        │ Groq LPU / Gemini HA    │
                                        │ (groq/compound-mini)    │
                                        └─────────────────────────┘
```

**Tipo:** Monolito modular con frontend y backend separados.

**¿Por qué?** Demuestra separación de concerns sin la complejidad innecesaria de microservicios para este proyecto.

---

## 🛠 Tech Stack

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Frontend** | React 19 + Bootstrap 5 + Socket.io | Componentes rápidos para CRUD, paginación, tablas responsivas e indicador WebSockets en vivo |
| **Build tool** | Vite | Reemplazo moderno de CRA (deprecated), HMR instantáneo |
| **Backend** | Node.js + Express + Socket.io | Ecosistema maduro, simple para APIs REST y eventos en tiempo real |
| **Base de datos** | PostgreSQL 16 | ENUMs nativos, UUID, robustez para datos comerciales |
| **ORM** | pg (node-postgres) | Queries SQL directas, sin abstracción innecesaria para 1 tabla |
| **Asistente IA** | Google Gemini 3.1 Flash Lite | Function calling y RAG nativos, alta velocidad y cero errores de formato |
| **Seguridad** | jsonwebtoken (JWT) | Autenticación basada en tokens Bearer para proteger la API |
| **Validación** | express-validator + Regex | Validación declarativa de inputs y sanitización DDL de BD |
| **Contenedores** | Docker Compose | Un solo comando para levantar todo el entorno |

---

## ⚙️ Requisitos previos

- **Node.js** v18+ 
- **PostgreSQL** v14+ (o Docker)
- **API Key de Google Gemini** → [Obtener gratis en Google AI Studio](https://aistudio.google.com/)

---

## 🚀 Instalación y ejecución

### Opción A: Sin Docker (desarrollo local)

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd crm-ai

# 2. Configurar variables de entorno
cp .env.example backend/.env
# Editar backend/.env y agregar tu GEMINI_API_KEY y JWT_SECRET

# 3. Instalar dependencias e iniciar backend
cd backend
npm install
npm run dev
# El backend creará la BD, las tablas y cargará los datos semilla automáticamente

# 4. En otra terminal, instalar e iniciar frontend
cd frontend
npm install
npm run dev
```

**Abrir:** http://localhost:5173

### Opción B: Con Docker Compose

```bash
# 1. Configurar API key
export GEMINI_API_KEY=tu_api_key_aqui

# 2. Levantar todo
docker-compose up --build

# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

---

## 🔑 Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión PostgreSQL | `postgresql://postgres:postgres@localhost:5432/crm_ai` |
| `PORT` | Puerto del backend | `3001` |
| `CORS_ORIGIN` | Origin permitido para CORS | `http://localhost:5173` |
| `GEMINI_API_KEY` | API key de Google Gemini | *(requerido)* |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `super_secret_jwt_key_crm_ai_2026` |
| `DISABLE_AUTH` | Habilita/Deshabilita bypass de auth en dev | `false` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `VITE_API_URL` | URL de la API (frontend) | `http://localhost:3001/api` |

---

## 💻 Uso del sistema

### CRUD de Oportunidades
1. **Listar**: Página principal muestra las oportunidades con paginación de 10 en 10.
2. **Filtrar**: Panel de filtros por etapa, prioridad y responsable.
3. **Exportar**: Botón "Exportar CSV" genera reporte compatible con Excel.
4. **Crear**: Botón "Nueva Oportunidad" → formulario completo.
5. **Ver detalle**: Click en el ícono de ojo → vista completa con recomendación IA.
6. **Editar**: Click en el ícono de lápiz → formulario pre-cargado.
7. **Eliminar**: Click en el ícono de basura → confirmación con modal.

### Asistente de IA (Copilot Comercial)
- Acceder desde la navegación → **Copilot Comercial**.
- Incluye **botones de preguntas frecuentes (chips)** para consultar al instante sin tipear.

---

## 🤖 Asistente de IA (Groq Cloud LPU + Respaldo Google Gemini HA)

### Arquitectura de Alta Disponibilidad & Optimización de Tokens

El asistente cuenta con un motor **Multi-Proveedor** impulsado por **Groq Cloud (`groq/compound-mini`)** para respuestas de ultra-baja latencia (<1s) y **Google Gemini (`gemini-1.5-flash`)** como respaldo automático de emergencia.

```
Usuario pregunta ➔ Intent Router (<1ms) ➔ Prompt Optimizado TSV ➔ Groq LPU (ó Gemini Backup) ➔ Respuesta Ejecutiva
```

### Estrategias de Optimización de Tokens (Reducción del 70% de consumo)
1. **Intent-Based Context Routing**: Clasifica la consulta (`GREETING`, `METRICS`, `FOLLOWUP`, `DOCUMENT`, `COMPANY`) enviando solo los datos necesarios en lugar del catálogo entero.
2. **Serialización TSV Compacta**: Formateo de datos sin relleno sintáctico.
3. **Caché en Memoria RAM (60s)**: Entrega consultas repetidas en **0ms (0 tokens)**.
4. **Fail-Fast Inmediato (0ms)**: Omite reintentos en errores de autenticación (401/403) para conmutar sin latencia entre proveedores.
| "¿Qué clientes necesitan seguimiento esta semana?" | `getFollowUpsThisWeek` |
| "Resume las oportunidades en negociación" | `getOpportunities(stage='Negociación')` |
| "¿Cuál es el valor total del pipeline?" | `getPipelineSummary` |
| "¿Qué oportunidades son de prioridad crítica?" | `getOpportunitiesByPriority('Crítica')` |
| "Busca especificaciones o propuestas del satélite" | `searchOpportunityDocuments` (RAG) |
| "Genera un resumen ejecutivo" | `getPipelineSummary` + `getOpportunities` |

### Control de alucinaciones

1. **System prompt** que obliga a usar solo datos reales.
2. **Function calling & RAG**: Gemini debe llamar funciones para obtener datos.
3. **Sanitización de historial**: Limpieza estricta de turnos `user` / `model` (`formatChatHistory`).
4. **Prompt versionado**: Archivo `.md` separado en `config/prompts/`.

---

## 🛡️ Seguridad y Autenticación

El sistema cuenta con una capa de seguridad defensiva implementada:

1. **Autenticación con JWT (JSON Web Tokens):** Las rutas sensibles (`/api/opportunities`, `/api/chat`) requieren la cabecera `Authorization: Bearer <token>`.
2. **Interceptor Automático en Frontend:** El cliente en React obtiene e inyecta el token Bearer automáticamente de forma transparente para el usuario.
3. **Sanitización DDL en BD:** Prevención de inyección SQL mediante validaciones por expresiones regulares en la creación automática de bases de datos.

---

## 📡 Endpoints de la API

| Método | Ruta | Protección | Descripción |
|--------|------|------------|-------------|
| `POST` | `/api/auth/demo-token` | Pública | Obtener token JWT de sesión/demostración |
| `GET` | `/api/auth/me` | 🔐 JWT | Obtener perfil del usuario autenticado |
| `GET` | `/api/opportunities` | 🔐 JWT | Listar oportunidades (filtros: `?stage=`, `?priority=`, `?owner=`) |
| `GET` | `/api/opportunities/export/csv` | 🔐 JWT | Exportar la lista de oportunidades a formato CSV |
| `GET` | `/api/opportunities/:id` | 🔐 JWT | Obtener oportunidad por ID |
| `POST` | `/api/opportunities` | 🔐 JWT | Crear nueva oportunidad |
| `PUT` | `/api/opportunities/:id` | 🔐 JWT | Actualizar oportunidad existente |
| `DELETE` | `/api/opportunities/:id` | 🔐 JWT | Eliminar oportunidad |
| `POST` | `/api/chat` | 🔐 JWT | Enviar mensaje al asistente IA (Gemini 3.1 Flash Lite) |
| `GET` | `/api/chat/history` | 🔐 JWT | Obtener historial de conversaciones |
| `GET` | `/api/health` | Pública | Health check del servidor |

---

## 🌱 Datos semilla

El sistema incluye **30 oportunidades comerciales diversas** como datos semilla en PostgreSQL.


| Empresa | Oportunidad | Etapa | Prioridad | Valor |
|---------|-------------|-------|-----------|-------|
| Starlight Aerospace | Telemetría y Diagnóstico Térmico para Satélites | Diagnóstico | Alta | $245,000 |
| Krono Logistics | Optimizador de Flotas Frías Autónomas | Propuesta enviada | Crítica | $118,000 |
| Nouveau BioTech | Secuenciación Genómica Asistida | Negociación | Crítica | $310,000 |
| UrbanGrid Energy | Gestión Inteligente de Microredes Eléctricas | Lead nuevo | Media | $185,000 |
| PixelCraft Studios | Motor Anti-Cheat en Tiempo Real | Contactado | Alta | $76,000 |
| Nexus Retail Solutions | Prevención de Pérdidas por Visión Artificial | Diagnóstico | Alta | $155,000 |
| OmniFood Systems | Trazabilidad de Cadena de Suministro Alimentaria | Ganado | Media | $64,000 |
| Vanguard Capital | Automatización de Due Diligence Financiero | Propuesta enviada | Crítica | $210,000 |
| AeroTrans Global | Asignación Eficiente de Puertas de Embarque | Contactado | Media | $142,000 |
| TerraVerde Agro | Detección Temprana de Plagas por Drones | Diagnóstico | Baja | $89,000 |

---

## 📚 Documentación Adicional

- 🧠 **[Decisiones Técnicas](docs/technical-decisions.md)**: Justificación detallada del stack tecnológico y arquitectura.
- 🤖 **[Asistente IA](docs/ai-assistant.md)**: Especificaciones de Function Calling y Gemini API.
- 🔮 **[Mejoras Futuras](docs/future-improvements.md)**: Hoja de ruta y backlog del proyecto.

---

## 🐳 Docker Compose

```bash
# Levantar todo (PostgreSQL + Backend + Frontend)
docker-compose up --build

# Solo la base de datos
docker-compose up db

# Detener todo
docker-compose down
```

---

## 🧠 Decisiones técnicas

Ver [docs/technical-decisions.md](docs/technical-decisions.md) para la lista completa.

1. **Monolito modular** vs microservicios → Complejidad proporcional al problema.
2. **REST** vs GraphQL → Queries simples no justifican GraphQL.
3. **pg** vs Sequelize/Prisma → SQL directo para 1 tabla, sin ORM innecesario.
4. **Function Calling** vs Context Injection vs RAG → Precisión + escalabilidad.
5. **Vite** vs CRA → CRA deprecated, Vite es el estándar actual.
6. **ENUMs de PostgreSQL** → Validación a nivel de BD, no solo en backend.
7. **System prompt en archivo** → Versionable, modificable sin redeploy.

---

## ✨ Funcionalidades Avanazadas Implementadas

- 🔐 **Autenticación y Seguridad (JWT)**: Middleware de protección y tokens Bearer.
- 📊 **Dashboard de Métricas del Pipeline**: KPIs interactivos y gráficos con Chart.js.
- 🧪 **Pruebas Unitarias Backend**: Suite de tests con Vitest (`9/9` pasados).
- 🧠 **RAG de Documentos de Oportunidades**: Búsqueda contextual de archivos y especificaciones con `searchOpportunityDocuments`.
- 📥 **Exportación a CSV**: Generación de reportes compatibles con Excel con BOM UTF-8.
- 📄 **Paginación Dinámica**: Navegación de 10 en 10 registros con controles interactivos.
- ⚡ **WebSockets en Tiempo Real**: Sincronización instantánea de eventos con Socket.io.
- 💱 **Ticker Financiero y Convertidor Multidivisas**: Cotizaciones en tiempo real (USD, EUR, UF, BTC, ETH) y recalculado dinámico del pipeline.

