/**
 * Constantes del CRM — Stages, priorities, currencies.
 * Centralizadas para consistencia entre componentes.
 */

export const STAGES = [
  'Lead nuevo',
  'Contactado',
  'Diagnóstico',
  'Propuesta enviada',
  'Negociación',
  'Ganado',
  'Perdido',
];

export const PRIORITIES = ['Baja', 'Media', 'Alta', 'Crítica'];

export const CURRENCIES = ['USD', 'COP', 'CLP', 'UF', 'EUR'];

// Colores para badges de prioridad
export const PRIORITY_COLORS = {
  Baja: 'secondary',
  Media: 'info',
  Alta: 'warning',
  Crítica: 'danger',
};

// Colores para badges de etapa
export const STAGE_COLORS = {
  'Lead nuevo': 'primary',
  Contactado: 'info',
  Diagnóstico: 'warning',
  'Propuesta enviada': 'secondary',
  Negociación: 'dark',
  Ganado: 'success',
  Perdido: 'danger',
};
