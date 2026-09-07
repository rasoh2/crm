import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BsPencil, BsArrowLeft, BsClockHistory } from 'react-icons/bs';
import { opportunityApi, auditApi } from '../../services/api';
import { StageBadge, PriorityBadge } from '../common/CrmBadges';
import AuditTimeline from './AuditTimeline';

export default function OpportunityDetail() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOpportunity();
    loadAuditLogs();
  }, [id]);

  const loadOpportunity = async () => {
    try {
      setLoading(true);
      const res = await opportunityApi.getById(id);
      setOpp(res.data.data);
    } catch (err) {
      setError('Oportunidad no encontrada');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await auditApi.getOpportunityLogs(id);
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Error al cargar logs de auditoría:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const formatCurrency = (value, currency) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
    }).format(value);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !opp) {
    return <Alert variant="danger">{error || 'Oportunidad no encontrada'}</Alert>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Button
            variant="link"
            className="p-0 text-decoration-none"
            onClick={() => navigate('/')}
          >
            <BsArrowLeft className="me-1" /> Volver
          </Button>
          <h2 className="mt-2">{opp.opportunity_name}</h2>
        </div>
        <Button
          as={Link}
          to={`/opportunity/${id}/edit`}
          variant="warning"
        >
          <BsPencil className="me-1" /> Editar
        </Button>
      </div>

      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Header className="fw-bold">Información general</Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6} className="mb-3">
                  <small className="text-muted">Empresa</small>
                  <div className="fw-bold">{opp.company_name}</div>
                </Col>
                <Col sm={6} className="mb-3">
                  <small className="text-muted">Contacto</small>
                  <div>{opp.contact_name}</div>
                  <div className="text-muted small">{opp.contact_email}</div>
                </Col>
                <Col sm={12} className="mb-3">
                  <small className="text-muted">Descripción</small>
                  <div>{opp.description || '—'}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {opp.last_interaction_summary && (
            <Card className="mb-3">
              <Card.Header className="fw-bold">Última interacción</Card.Header>
              <Card.Body>{opp.last_interaction_summary}</Card.Body>
            </Card>
          )}

          <Card className="mb-3 border-secondary">
            <Card.Header className="fw-bold d-flex justify-content-between align-items-center bg-white">
              <span>Documentación Técnica & SLA (Motor RAG)</span>
              <Badge bg="dark">Documento Verificado</Badge>
            </Card.Header>
            <Card.Body className="bg-light">
              <p className="small text-muted mb-2">
                Especificaciones de infraestructura y términos legales indexados en el motor de conocimiento para consulta directa por el <strong>Copilot Comercial</strong>:
              </p>
              <div className="p-3 bg-white rounded border">
                <div className="fw-bold text-primary mb-1">
                  Anexo de Arquitectura, Cifrado y Términos de SLA para {opp.company_name}
                </div>
                <small className="text-secondary d-block mb-2">
                  Categoría: Especificación Técnica y Cumplimiento Normativo
                </small>
                <div className="small text-dark fst-italic bg-light p-2 rounded">
                  "Especificaciones de seguridad, almacenamiento CMEK/Air-Gapped, nivel de servicio de disponibilidad (SLA) y cumplimiento de estándares para {opp.opportunity_name}."
                </div>
              </div>
            </Card.Body>
          </Card>

          {opp.ai_recommendation && (
            <Card className="mb-3 border-primary">
              <Card.Header className="fw-bold text-primary bg-white border-bottom">
                Análisis del Sistema
              </Card.Header>
              <Card.Body>{opp.ai_recommendation}</Card.Body>
            </Card>
          )}

          {/* Historial de Auditoría y Trazabilidad Comercial */}
          <Card className="mb-3">
            <Card.Header className="fw-bold bg-light d-flex align-items-center gap-2">
              <BsClockHistory className="text-primary" />
              <span>Historial de Auditoría y Cambios</span>
            </Card.Header>
            <Card.Body className="p-3">
              {loadingLogs ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              ) : (
                <AuditTimeline logs={logs} />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-3">
            <Card.Header className="fw-bold">Estado comercial</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Etapa</small>
                <div>
                  <StageBadge stage={opp.stage} />
                </div>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Prioridad</small>
                <div>
                  <PriorityBadge priority={opp.priority} />
                </div>
              </div>

              <div className="mb-3">
                <small className="text-muted">Valor estimado</small>
                <div className="fw-bold fs-5">
                  {formatCurrency(opp.estimated_value, opp.currency)}
                </div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Probabilidad de cierre</small>
                <div className="fw-bold">{opp.probability}%</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Responsable</small>
                <div>{opp.owner}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Próximo seguimiento</small>
                <div>
                  {opp.next_follow_up_date
                    ? new Date(opp.next_follow_up_date).toLocaleDateString('es-CL')
                    : '—'}
                </div>
              </div>
              <hr />
              <div>
                <small className="text-muted">Creado</small>
                <div className="small">
                  {new Date(opp.created_at).toLocaleString('es-CL')}
                </div>
              </div>
              <div className="mt-1">
                <small className="text-muted">Actualizado</small>
                <div className="small">
                  {new Date(opp.updated_at).toLocaleString('es-CL')}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
