-- ========================================
-- CRM AI
-- Datos semilla (Nuevas Oportunidades Comerciales)
-- ========================================

-- Limpiar datos anteriores
TRUNCATE TABLE opportunities, chat_history, audit_logs RESTART IDENTITY CASCADE;

INSERT INTO opportunities (
  company_name, contact_name, contact_email, opportunity_name,
  description, estimated_value, currency, stage, priority,
  probability, owner, next_follow_up_date,
  last_interaction_summary, ai_recommendation
) VALUES
-- 1
(
  'Starlight Aerospace',
  'Elena Rostova',
  'elena.rostova@starlightaero.com',
  'Telemetría y Diagnóstico Térmico para Satélites',
  'Plataforma de procesamiento de señales en tiempo real para constelaciones de nanosatélites.',
  245000.00, 'USD', 'Diagnóstico', 'Alta', 70,
  'Sebastián Saavedra', '2026-09-12',
  'Reunión técnica aprobada con el departamento de operaciones espaciales.',
  'Presentar certificación de redundancia y pruebas de carga de telemetría.'
),
-- 2
(
  'Krono Logistics',
  'Mateo Benítez',
  'm.benitez@kronologistics.io',
  'Optimizador de Flotas Frías Autónomas',
  'Monitoreo térmico e itinerarios inteligentes para transporte de insumos médicos de alta sensibilidad.',
  118000.00, 'USD', 'Propuesta enviada', 'Crítica', 85,
  'Carlos Bermúdez', '2026-09-08',
  'Propuesta comercial enviada al directorio operativo.',
  'Cerrar negociación sobre garantía de uptime del 99.9% antes del viernes.'
),
-- 3
(
  'Nouveau BioTech',
  'Dra. Sofia Lin',
  'slin@nouveaubiotech.org',
  'Secuenciación Genómica Asistida',
  'Algoritmos de aceleración para procesamiento de grandes volúmenes de variantes genéticas.',
  310000.00, 'USD', 'Negociación', 'Crítica', 90,
  'Sebastián Saavedra', '2026-09-06',
  'Revisión de cláusulas de privacidad de datos bioinformáticos.',
  'Enviar anexo de cumplimiento HIPAA y seguridad de datos biomédicos.'
),
-- 4
(
  'UrbanGrid Energy',
  'Ignacio Silva',
  'isilva@urbangrid.cl',
  'Gestión Inteligente de Microredes Eléctricas',
  'Plataforma de predicción de demanda energética e integración de batería urbana.',
  185000.00, 'USD', 'Lead nuevo', 'Media', 20,
  'Equipo Comercial', '2026-09-18',
  'Primer contacto en la Expo Energía Sostenible 2026.',
  'Enviar brochure técnico enfocado en reducción de pérdidas de transmisión.'
),
-- 5
(
  'PixelCraft Studios',
  'Lucas Moretti',
  'lucas@pixelcraft.games',
  'Motor Anti-Cheat en Tiempo Real',
  'Sistema de detección comportamental de anomalías para videojuegos multijugador masivos.',
  76000.00, 'USD', 'Contactado', 'Alta', 45,
  'Equipo Comercial', '2026-09-14',
  'Reunión remota con el equipo de infraestructura de servidores.',
  'Agendar prueba de concepto (PoC) en servidor de staging.'
),
-- 6
(
  'Nexus Retail Solutions',
  'Camila Morales',
  'cmorales@nexusretail.com',
  'Prevención de Pérdidas por Visión Artificial',
  'Monitoreo automático de cajas de autocobro mediante cámaras de alta precisión.',
  155000.00, 'USD', 'Diagnóstico', 'Alta', 60,
  'Carlos Bermúdez', '2026-09-11',
  'Taller de arquitectura e integración de cámaras existente.',
  'Enviar informe de precisión de modelos en ambientes de iluminación variable.'
),
-- 7
(
  'OmniFood Systems',
  'Gabriel Zúñiga',
  'gzuniga@omnifood.com',
  'Trazabilidad de Cadena de Suministro Alimentaria',
  'Auditoría automatizada de temperatura y tiempo de transporte para productos frescos.',
  64000.00, 'USD', 'Ganado', 'Media', 100,
  'Sebastián Saavedra', '2026-09-04',
  'Contrato firmado por 12 meses. Inicio de despliegue programado.',
  'Iniciar kick-off técnico y nombrar líder de cuenta.'
),
-- 8
(
  'Vanguard Capital',
  'Beatriz Alarcón',
  'balarcon@vanguardcap.com',
  'Automatización de Due Diligence Financiero',
  'Extracción y análisis sintáctico de balances generales e informes de auditoría.',
  210000.00, 'USD', 'Propuesta enviada', 'Crítica', 75,
  'Carlos Bermúdez', '2026-09-07',
  'Presentación ejecutiva ante los socios del fondo de inversión.',
  'Ofrecer garantía de confidencialidad y procesamiento on-premise.'
),
-- 9
(
  'AeroTrans Global',
  'Hernán Castillo',
  'hcastillo@aerotrans.com',
  'Asignación Eficiente de Puertas de Embarque',
  'Algoritmo dinámico para minimizar demoras de aeronaves en tierra.',
  142000.00, 'USD', 'Contactado', 'Media', 35,
  'Equipo Comercial', '2026-09-16',
  'Llamada exploratoria con la gerencia de operaciones aeroportuarias.',
  'Enviar simulación con datos históricos de tráfico aéreo.'
),
-- 10
(
  'TerraVerde Agro',
  'Valeria Castro',
  'vcastro@terraverde.cl',
  'Detección Temprana de Plagas por Drones',
  'Procesamiento de imágenes multiespectrales para cultivos de exportación.',
  89000.00, 'USD', 'Diagnóstico', 'Baja', 50,
  'Sebastián Saavedra', '2026-09-15',
  'Muestra de datos recolectada en terreno.',
  'Presentar reporte comparativo antes y después de aplicar el modelo.'
),
-- 11
(
  'Solaris Health',
  'Dr. Andrés Molina',
  'amolina@solarishealth.com',
  'Sistema de Triaje Médico Asistido por IA',
  'Priorización automatizada de urgencias médicas según signos vitales.',
  275000.00, 'USD', 'Lead nuevo', 'Alta', 25,
  'Equipo Comercial', '2026-09-20',
  'Contacto inicial recibido a través del sitio web corporativo.',
  'Agendar demo comercial con el comité médico de la clínica.'
),
-- 12
(
  'EcoBuild Infraestructura',
  'Marcela Fuenzalida',
  'mfuenzalida@ecobuild.cl',
  'Monitoreo de Fatiga Estructural en Puentes',
  'Sensores IoT y análisis predictivo de deformaciones en obras viales.',
  195000.00, 'USD', 'Diagnóstico', 'Crítica', 65,
  'Carlos Bermúdez', '2026-09-13',
  'Reunión técnica realizada con ingenieros estructurales del MOP.',
  'Preparar estudio de factibilidad técnica y costos de instalación.'
),
-- 13
(
  'Fintech Evolution',
  'Rodrigo Valenzuela',
  'r.valenzuela@fintechev.com',
  'Motor de Detección de Fraude en Transacciones',
  'Análisis comportamental en tiempo real para pasarelas de pago digitales.',
  320000.00, 'USD', 'Propuesta enviada', 'Crítica', 80,
  'Sebastián Saavedra', '2026-09-09',
  'Revisión de SLA de respuesta menor a 50 milisegundos.',
  'Finalizar propuesta comercial con opciones de escalabilidad horizontal.'
),
-- 14
(
  'AquaPure Tech',
  'Loreto Reyes',
  'lreyes@aquapure.io',
  'Control Automático de Calidad de Agua Urbana',
  'Plataforma de detección temprana de contaminantes en plantas de tratamiento.',
  135000.00, 'USD', 'Contactado', 'Media', 40,
  'Equipo Comercial', '2026-09-17',
  'Conversación inicial con el gerente de sustentabilidad.',
  'Enviar casos de éxito en empresas del sector sanitario.'
),
-- 15
(
  'Minera Los Andes',
  'Joaquín Donoso',
  'jdonoso@mineralosandes.cl',
  'Mantenimiento Predictivo de Camiones de Extracción',
  'Telemetría de motores diésel de alto tonelaje para reducir paradas no programadas.',
  450000.00, 'USD', 'Negociación', 'Crítica', 85,
  'Carlos Bermúdez', '2026-09-10',
  'Reunión presencial en faena minera. Términos comerciales en ajuste.',
  'Enviar contrato borrador para revisión legal de la minera.'
),
-- 16
(
  'CloudScale Networks',
  'Daniela Vargas',
  'dvargas@cloudscale.net',
  'Optimización Automática de Costos Multicloud',
  'Recomendación inteligente de reserva de instancias y apagado de cargas ociosas.',
  98000.00, 'USD', 'Ganado', 'Alta', 100,
  'Sebastián Saavedra', '2026-09-03',
  'Orden de compra recibida y aprobada por finanzas.',
  'Configurar accesos de integración con AWS y Google Cloud.'
),
-- 17
(
  'BioPharma Innova',
  'Dr. Fernando Lagos',
  'flagos@biopharmainnova.org',
  'Gestión de Ensayos Clínicos Multicéntricos',
  'Trazabilidad segura de muestras y reportes de eventos adversos.',
  215000.00, 'USD', 'Lead nuevo', 'Baja', 15,
  'Equipo Comercial', '2026-09-22',
  'Contacto en simposio internacional de investigación farmacéutica.',
  'Enviar presentación ejecutiva sobre cumplimiento de normas GxP.'
),
-- 18
(
  'SmartFleet Delivery',
  'Francisca Tapia',
  'ftapia@smartfleet.cl',
  'Ruteo Dinámico para Última Milla',
  'Optimización en tiempo real considerando congestión vehicular y ventanas de entrega.',
  112000.00, 'USD', 'Diagnóstico', 'Media', 55,
  'Carlos Bermúdez', '2026-09-14',
  'Reunión de requerimientos con el jefe de operaciones logísticas.',
  'Realizar simulación de rutas con datos de los últimos 30 días.'
),
-- 19
(
  'Inmobiliaria Horizon',
  'Esteban Paredes',
  'eparedes@inmobiliariahorizon.cl',
  'Valoración Automatizada de Propiedades Urbanas',
  'Modelo econométrico predictivo basado en datos del mercado inmobiliario.',
  82000.00, 'USD', 'Contactado', 'Baja', 30,
  'Equipo Comercial', '2026-09-19',
  'Llamada telefónica con el gerente de desarrollo de proyectos.',
  'Agendar reunión presencial para demostración del sistema.'
),
-- 20
(
  'CyberGuard Solutions',
  'Constanza Ibáñez',
  'cibanez@cyberguard.com',
  'Orquestación de Respuesta a Incidentes (SOAR)',
  'Automatización de flujos de mitigación ante amenazas de ransomware.',
  290000.00, 'USD', 'Propuesta enviada', 'Alta', 70,
  'Sebastián Saavedra', '2026-09-11',
  'Demostración técnica en vivo realizada ante el CISO.',
  'Enviar cotización formal ajustada por volumen de endpoints.'
),
-- 21
(
  'AgroSmart Chile',
  'Gonzalo Araya',
  'garaya@agrosmart.cl',
  'Riego de Precisión por Sensado de Suelo',
  'Red de sensores inalámbricos de humedad para optimización hídrica.',
  68000.00, 'USD', 'Lead nuevo', 'Media', 20,
  'Equipo Comercial', '2026-09-25',
  'Solicitud de información a través del formulario de contacto.',
  'Enviar ficha técnica y tabla de ahorro estimado de agua.'
),
-- 22
(
  'EduTech Global',
  'Dra. Patricia Sotomayor',
  'psotomayor@edutech.edu',
  'Plataforma de Aprendizaje Adaptativo Universitario',
  'Personalización de contenidos según ritmo de aprendizaje del estudiante.',
  160000.00, 'USD', 'Diagnóstico', 'Media', 50,
  'Carlos Bermúdez', '2026-09-15',
  'Entrevista con la vicerrectoría académica.',
  'Preparar propuesta de piloto para 500 alumnos en el próximo semestre.'
),
-- 23
(
  'AeroCargo Express',
  'Tomás Orellana',
  'torellana@aerocargo.com',
  'Optimización de Estiba de Carga Aérea',
  'Algoritmo de distribución de peso y balance para aeronaves de carga.',
  178000.00, 'USD', 'Negociación', 'Alta', 85,
  'Sebastián Saavedra', '2026-09-08',
  'Revisión final de términos de garantía operativa.',
  'Cerrar acuerdo contractual y agendar capacitación del personal de rampa.'
),
-- 24
(
  'Portuaria Valparaíso',
  'Manuel Godoy',
  'mgodoy@portvalparaiso.cl',
  'Monitoreo de Contenedores por RFID e IA',
  'Control de inventario y ubicación en patio de maniobras portuarias.',
  340000.00, 'USD', 'Propuesta enviada', 'Crítica', 75,
  'Carlos Bermúdez', '2026-09-12',
  'Presentación al directorio portuario realizada.',
  'Enviar addendum sobre soporte técnico 24/7.'
),
-- 25
(
  'Alimentos del Sur',
  'Verónica Bravo',
  'vbravo@alimentosdelsur.cl',
  'Predicción de Demanda de Consumo Masivo',
  'Modelos de aprendizaje automático para evitar quiebres de stock en supermercados.',
  125000.00, 'USD', 'Ganado', 'Media', 100,
  'Sebastián Saavedra', '2026-09-02',
  'Acuerdo firmado. Sistema en fase de integración con SAP.',
  'Monitorear ingesta de datos iniciales del ERP.'
),
-- 26
(
  'Retail360 Analytics',
  'Felipe Navas',
  'fnavas@retail360.io',
  'Análisis de Flujo de Clientes en Tiendas',
  'Mapas de calor comportamentales en tiempo real mediante sensores ópticos.',
  94000.00, 'USD', 'Contactado', 'Baja', 35,
  'Equipo Comercial', '2026-09-18',
  'Reunión de prospección con la gerencia de marketing.',
  'Enviar catálogo de dashboards analíticos predefinidos.'
),
-- 27
(
  'EnergyClean Chile',
  'Andrea Carvajal',
  'acarvajal@energyclean.cl',
  'Diagnóstico Automatizado de Paneles Solares',
  'Termografía por dron e identificación de microfracturas fotovoltaicas.',
  148000.00, 'USD', 'Diagnóstico', 'Alta', 60,
  'Carlos Bermúdez', '2026-09-16',
  'Vuelo de prueba realizado en parque solar del norte.',
  'Presentar informe con hallazgos y celdas defectuosas detectadas.'
),
-- 28
(
  'BancaDigital Latam',
  'Javier Espinoza',
  'jespinoza@bancadigital.com',
  'Verificación de Identidad Biométrica Facial',
  'Onboarding digital con liveness detection para apertura de cuentas corrientes.',
  380000.00, 'USD', 'Negociación', 'Crítica', 90,
  'Sebastián Saavedra', '2026-09-05',
  'Pruebas de estrés y tasa de falsos positivos aprobadas por ciberseguridad.',
  'Enviar borrador final de contrato para firma gerencial.'
),
-- 29
(
  'FastShip Courier',
  'Guillermo Fuentes',
  'gfuentes@fastship.cl',
  'Sort Automatizado de Paquetes por OCR',
  'Lectura y clasificación de etiquetas de envío a alta velocidad.',
  165000.00, 'USD', 'Lead nuevo', 'Media', 20,
  'Equipo Comercial', '2026-09-24',
  'Solicitud de cotización para centro de distribución central.',
  'Enviar propuesta presupuestaria preliminar.'
),
-- 30
(
  'MedTech Solutions',
  'Dra. Claudia Salinas',
  'csalinas@medtech.org',
  'Asistente Quirúrgico de Navegación 3D',
  'Reconstrucción tridimensional de tomografías en tiempo real para cirugía laparoscópica.',
  410000.00, 'USD', 'Propuesta enviada', 'Crítica', 80,
  'Carlos Bermúdez', '2026-09-10',
  'Demostración en quirófano experimental con equipo de cirujanos.',
  'Enviar documentación de certificación CE/FDA para equipamiento médico.'
);

-- Insertar auditoría inicial para alimentar la línea de tiempo
INSERT INTO audit_logs (opportunity_id, action, changes, performed_by, created_at)
SELECT id, 'CREATED', jsonb_build_object('opportunity_name', opportunity_name, 'company_name', company_name, 'initial_stage', stage, 'initial_value', estimated_value), owner, created_at
FROM opportunities
LIMIT 10;

