import { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { BsClockHistory, BsArrowRepeat } from 'react-icons/bs';
import { auditApi } from '../../services/api';
import AuditTimeline from './AuditTimeline';

/**
 * Componente AuditModal — Modal global para consultar el historial completo de auditoría del CRM
 */
export default function AuditModal({ show, onHide, opportunityId = null, companyName = null }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (opportunityId) {
        res = await auditApi.getOpportunityLogs(opportunityId);
      } else {
        res = await auditApi.getAllLogs(100);
      }
      setLogs(res.data?.data || []);
    } catch (err) {
      console.error('Error al cargar auditoría:', err);
      setError('No se pudo cargar el historial de auditoría.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchLogs();
    }
  }, [show, opportunityId]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
          <BsClockHistory className="text-warning" />
          <span>
            {opportunityId
              ? `Historial de Auditoría: ${companyName || 'Oportunidad'}`
              : 'Historial General de Auditoría del CRM'}
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted fs-7">Cargando eventos de auditoría...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <AuditTimeline logs={logs} />
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" size="sm" onClick={fetchLogs} disabled={loading}>
          <BsArrowRepeat className="me-1" /> Actualizar
        </Button>
        <Button variant="secondary" size="sm" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
