/**
 * Convierte un arreglo de oportunidades a un archivo CSV y gatilla la descarga en el navegador.
 * Incluye la marca de orden de bytes UTF-8 (BOM \uFEFF) para compatibilidad perfecta con Microsoft Excel.
 */
export function exportOpportunitiesToCSV(opportunities, filename = 'oportunidades_crm.csv') {
  if (!opportunities || opportunities.length === 0) return;

  const headers = [
    'ID',
    'Empresa',
    'Nombre Oportunidad',
    'Etapa',
    'Prioridad',
    'Valor Estimado',
    'Moneda',
    'Probabilidad (%)',
    'Responsable',
    'Fecha Creación',
    'Próximo Seguimiento',
    'Notas',
  ];

  const escapeCSV = (field) => {
    if (field === null || field === undefined) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = opportunities.map((opp) => [
    escapeCSV(opp.id),
    escapeCSV(opp.company_name),
    escapeCSV(opp.opportunity_name),
    escapeCSV(opp.stage),
    escapeCSV(opp.priority),
    escapeCSV(opp.estimated_value),
    escapeCSV(opp.currency || 'USD'),
    escapeCSV(opp.probability),
    escapeCSV(opp.owner),
    escapeCSV(opp.created_at ? new Date(opp.created_at).toISOString().split('T')[0] : ''),
    escapeCSV(opp.next_follow_up_date ? new Date(opp.next_follow_up_date).toISOString().split('T')[0] : ''),
    escapeCSV(opp.notes || ''),
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
