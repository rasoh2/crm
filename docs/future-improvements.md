# Estado de Características y Mejoras

Lista de funcionalidades avanzadas implementadas y hoja de ruta futura para producción.

## ✅ Funcionalidades Completadas e Implementadas

- **Autenticación y Seguridad JWT**: Middleware de protección, firma y tokens Bearer (`/api/auth/demo-token`).
- **Dashboard de Métricas**: Gráficos interactivos de pipeline por etapa (Doughnut) y valor acumulado por prioridad (Bar) con Chart.js.
- **Paginación Dinámica**: Vista paginada de 10 elementos por página con 30 registros semilla en PostgreSQL.
- **Tests Unitarios Backend**: Pruebas con Vitest pasadas al 100% (`9/9` tests).
- **Exportación a CSV**: Reportes descargables desde Frontend y Backend (`GET /api/opportunities/export/csv`) con soporte BOM UTF-8.
- **RAG de Documentos**: Búsqueda semántica en especificaciones y propuestas adjuntas (`searchOpportunityDocuments`).
- **WebSockets en Tiempo Real**: Sincronización instantánea de eventos CRUD con Socket.io e indicador `🟢 En Vivo`.

---

## 🔮 Mejoras Futuras en Hoja de Ruta (Producción)

### Media / Baja Prioridad (Nice to Have)
- **Historial de auditoría (Audit log)**: Registro de auditoría de quién modificó qué campo y en qué momento.
- **Notificaciones por Email**: Recordatorios automáticos de seguimiento pre-fecha.
- **Caché con Redis**: Almacenamiento en caché de métricas de dashboard para alto tráfico.
- **CI/CD Automatizado**: Pipeline con GitHub Actions para despliegue continuo.
