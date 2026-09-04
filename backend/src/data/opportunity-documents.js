/**
 * Base de conocimientos de Documentos Comerciales y Técnicos (RAG Data Source).
 * Vinculados a las oportunidades del CRM para consulta del Asistente de IA.
 */

const opportunityDocuments = [
  {
    id: 'doc-001',
    companyName: 'Starlight Aerospace',
    title: 'Anexo de Seguridad y Arquitectura Térmica para Satélites',
    category: 'Especificación Técnica',
    content: `
      PROPOSAL & TECHNICAL SPECIFICATION - STARLIGHT AEROSPACE
      Proyecto: Telemetría y Diagnóstico Térmico para Satélites LEO/GEO.
      Requisitos de Seguridad:
      - Transmisión encintada con cifrado gubernamental AES-256 en enlaces de bajada.
      - Servidores con arquitectura Air-Gapped (aislados de internet pública) en centros de control de misiones.
      - Cumplimiento de normativa ITAR (International Traffic in Arms Regulations).
      SLA de Disponibilidad: 99.99% en tiempo de procesamiento de telemetría en tiempo real.
      Presupuesto de Infraestructura: $245,000 USD.
    `,
  },
  {
    id: 'doc-002',
    companyName: 'Krono Logistics',
    title: 'Pliego de Términos IoT y SLA Flotas Autónomas Frías',
    category: 'Contrato y SLA',
    content: `
      ESPECIFICACIÓN TÉCNICA DE MONITOREO - KRONO LOGISTICS
      Proyecto: Optimizador de Flotas Frías Autónomas de Carga.
      Infraestructura IoT:
      - Sensores de temperatura y humedad en ruta transmitiendo cada 30 segundos por red celular 5G/LTE-M.
      - Gateway industrial IoT conectándose mediante protocolo MQTT sobre cifrado TLS 1.3.
      - Alertas automatizadas por ruptura de cadena de frío (< -18°C).
      SLA de Soporte: Respuesta a incidencias críticas en menos de 15 minutos (24/7).
    `,
  },
  {
    id: 'doc-003',
    companyName: 'Nouveau BioTech',
    title: 'Acuerdo de Privacidad de Datos Genómicos y Nube HIPAA',
    category: 'Seguridad y Cumplimiento',
    content: `
      ACUERDO DE CUMPLIMIENTO Y ARQUITECTURA - NOUVEAU BIOTECH
      Proyecto: Secuenciación Genómica Asistida por Inteligencia Artificial.
      Cumplimiento Normativo:
      - Arquitectura certificada bajo HIPAA (Health Insurance Portability and Accountability Act) e ISO 27001.
      - Anonimización automática de muestras de ADN antes de ingestión en modelos de IA.
      - Almacenamiento seguro en Cloud Storage multi-región con claves KMS gestionadas por el cliente (CMEK).
      SLA de Cómputo: Procesamiento de genoma completo en menos de 4 horas por paciente.
    `,
  },
  {
    id: 'doc-004',
    companyName: 'UrbanGrid Energy',
    title: 'Arquitectura de Microredes y Protocolo SCADA',
    category: 'Especificación Técnica',
    content: `
      DISPOSICIÓN TÉCNICA - URBANGRID ENERGY
      Proyecto: Gestión Inteligente de Microredes Eléctricas y Baterías.
      Integración Industrial:
      - Compatibilidad nativa con protocolos industriales Modbus TCP, DNP3 y IEC 61850.
      - Aislamiento de red para controladores de subestaciones eléctricas (Firewalls industriales Next-Gen).
      - Modelos predictivos de carga y despacho con frecuencia de actualización de 5 minutos.
    `,
  },
  {
    id: 'doc-005',
    companyName: 'PixelCraft Studios',
    title: 'Especificación de Latencia y Kernel Anti-Cheat',
    category: 'Especificación Técnica',
    content: `
      DETERMINACIÓN TÉCNICA ANTI-CHEAT - PIXELCRAFT STUDIOS
      Proyecto: Motor Anti-Cheat en Tiempo Real para eSports y Multijugador.
      Parámetros de Rendimiento:
      - Firma de driver en Ring 0 (Kernel level) para detección de inyección de memoria.
      - Latencia adicional máxima por paquete de juego: < 2 milisegundos.
      - Verificación heurística continua impulsada por aprendizaje automático en borde.
    `,
  },
  {
    id: 'doc-006',
    companyName: 'Nexus Retail Solutions',
    title: 'Política de Visión Artificial y Protección de Privacidad GDPR',
    category: 'Seguridad y Privacidad',
    content: `
      POLÍTICA DE TRATAMIENTO DE IMÁGENES - NEXUS RETAIL SOLUTIONS
      Proyecto: Prevención de Pérdidas por Visión Artificial en Tiendas.
      Privacidad y Regulaciones:
      - Procesamiento Edge en cámaras (Edge AI NPU) sin transmitir rostro ni imágenes brutas a la nube.
      - Difuminado facial instantáneo en memoria RAM cumplimiento norma GDPR / LPDP.
      - Detección de patrones anómalos en cajas de autocobro con tasa de falsos positivos < 0.5%.
    `,
  },
  {
    id: 'doc-007',
    companyName: 'OmniFood Systems',
    title: 'Estándar HACCP y Registro en Blockchain',
    category: 'Cumplimiento Normativo',
    content: `
      ESTÁNDAR DE TRAZABILIDAD - OMNIFOOD SYSTEMS
      Proyecto: Trazabilidad de Cadena de Suministro Alimentaria.
      Integración:
      - Firma digital inmutable de lotes de alimentos bajo estándar de inocuidad HACCP.
      - Códigos QR dinámicos para auditoría instantánea por parte del consumidor final en supermercados.
    `,
  },
  {
    id: 'doc-008',
    companyName: 'Vanguard Capital',
    title: 'Informe de Auditoría SOC2 Type II y Due Diligence',
    category: 'Seguridad y Compliance',
    content: `
      REQUISITOS AUDITORÍA Y SEGURIDAD - VANGUARD CAPITAL
      Proyecto: Automatización de Due Diligence Financiero con IA.
      Seguridad Financiera:
      - Certificación obligatoria SOC2 Type II y prueba de penetración anual sin hallazgos críticos.
      - Cifrado de datos financieros en reposo (AES-256) y en tránsito (TLS 1.3 con HSTS).
      - Audit trail inmutable que registra cada acceso y modificación de estados financieros.
    `,
  },
  {
    id: 'doc-009',
    companyName: 'AeroTrans Global',
    title: 'Integración API Eurocontrol y Asignación de Puertas',
    category: 'Especificación Técnica',
    content: `
      ESPECIFICACIÓN AEROPORTUARIA - AEROTRANS GLOBAL
      Proyecto: Asignación Eficiente de Puertas de Embarque.
      Sincronización:
      - Conexión mediante WebSockets y REST con la API oficial de Eurocontrol y radar de vuelos.
      - Re-asignación automática de puertas ante retrasos de vuelo superiores a 10 minutos.
    `,
  },
  {
    id: 'doc-010',
    companyName: 'TerraVerde Agro',
    title: 'Ficha de Imágenes Multiespectrales para Drones',
    category: 'Especificación Técnica',
    content: `
      FICHA DE PROCESAMIENTO - TERRAVERDE AGRO
      Proyecto: Detección Temprana de Plagas por Drones Agrícolas.
      Procesamiento Agrónomo:
      - Ingestión de capas multiespectrales (NDVI, NDRE) capturadas por drones agrícolas.
      - Diagnóstico de índices de estrés hídrico y plagas con precisión del 94%.
    `,
  },
];

/**
 * Función de recuperación RAG por palabras clave y filtro de empresa
 */
function searchDocuments(query, companyName = '') {
  if (!query) return [];

  const normalizedQuery = query.toLowerCase();
  const normalizedCompany = companyName ? companyName.toLowerCase() : '';

  return opportunityDocuments.filter((doc) => {
    const matchesCompany = normalizedCompany
      ? doc.companyName.toLowerCase().includes(normalizedCompany)
      : true;

    const matchesQuery =
      doc.title.toLowerCase().includes(normalizedQuery) ||
      doc.content.toLowerCase().includes(normalizedQuery) ||
      doc.category.toLowerCase().includes(normalizedQuery) ||
      doc.companyName.toLowerCase().includes(normalizedQuery);

    return matchesCompany && matchesQuery;
  });
}

module.exports = {
  opportunityDocuments,
  searchDocuments,
};
