import { Badge } from 'react-bootstrap';
import { BsPlusCircle, BsArrowRepeat, BsPencilSquare, BsTrash, BsClock, BsPerson } from 'react-icons/bs';

/**
 * Componente AuditTimeline — Renderiza una línea de tiempo visual con los cambios de auditoría
 */
export default function AuditTimeline({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-4 text-muted fs-7">
        <BsClock className="mb-2 fs-4 text-secondary d-block mx-auto" />
        No hay registros de auditoría registrados aún para esta oportunidad.
      </div>
    );
  }

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATED':
        return <Badge bg="success" className="d-inline-flex align-items-center gap-1"><BsPlusCircle /> Creado</Badge>;
      case 'STAGE_CHANGED':
        return <Badge bg="primary" className="d-inline-flex align-items-center gap-1"><BsArrowRepeat /> Cambio de Etapa</Badge>;
      case 'UPDATED':
        return <Badge bg="warning" text="dark" className="d-inline-flex align-items-center gap-1"><BsPencilSquare /> Actualizado</Badge>;
      case 'DELETED':
        return <Badge bg="danger" className="d-inline-flex align-items-center gap-1"><BsTrash /> Eliminado</Badge>;
      default:
        return <Badge bg="secondary">{action}</Badge>;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderChanges = (changes) => {
    if (!changes || typeof changes !== 'object') return null;

    return (
      <div className="bg-light p-2 rounded-3 mt-1.5 border fs-8 text-secondary">
        {Object.entries(changes).map(([field, val]) => {
          if (val && typeof val === 'object' && 'old' in val && 'new' in val) {
            return (
              <div key={field} className="mb-1">
                <strong className="text-dark">{field}:</strong>{' '}
                <span className="text-danger text-decoration-line-through me-1">{String(val.old)}</span> ➔{' '}
                <span className="text-success fw-bold ms-1">{String(val.new)}</span>
              </div>
            );
          }
          return (
            <div key={field}>
              <strong className="text-dark">{field}:</strong> {String(val)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="timeline-container py-2">
      {logs.map((log) => (
        <div key={log.id} className="d-flex gap-3 mb-3 align-items-start border-bottom pb-2.5">
          <div className="mt-1">{getActionBadge(log.action)}</div>
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold text-dark fs-7">
                {log.opportunity_name || log.company_name ? (
                  <>
                    <strong className="text-primary">{log.company_name}</strong> - {log.opportunity_name}
                  </>
                ) : (
                  'Oportunidad'
                )}
              </span>
              <small className="text-muted font-monospace fs-8">
                <BsClock className="me-1" />
                {formatDate(log.created_at)}
              </small>
            </div>
            <div className="d-flex align-items-center gap-1 text-muted fs-8 mt-0.5">
              <BsPerson className="text-secondary" />
              <span>Por: <strong>{log.performed_by || 'Sistema'}</strong></span>
            </div>
            {renderChanges(log.changes)}
          </div>
        </div>
      ))}
    </div>
  );
}
