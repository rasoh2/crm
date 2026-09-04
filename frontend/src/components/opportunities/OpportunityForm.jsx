import { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { opportunityApi } from '../../services/api';
import { STAGES, PRIORITIES, CURRENCIES } from '../../constants/crm';

export default function OpportunityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    opportunity_name: '',
    description: '',
    estimated_value: '',
    currency: 'USD',
    stage: 'Lead nuevo',
    priority: 'Media',
    probability: '',
    owner: '',
    next_follow_up_date: '',
    last_interaction_summary: '',
    ai_recommendation: '',
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadOpportunity();
    }
  }, [id]);

  const loadOpportunity = async () => {
    try {
      const res = await opportunityApi.getById(id);
      const opp = res.data.data;
      setFormData({
        ...opp,
        estimated_value: opp.estimated_value || '',
        probability: opp.probability || '',
        next_follow_up_date: opp.next_follow_up_date
          ? opp.next_follow_up_date.split('T')[0]
          : '',
      });
    } catch (err) {
      setError('Error al cargar la oportunidad');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        estimated_value: parseFloat(formData.estimated_value) || 0,
        probability: parseInt(formData.probability) || 0,
        next_follow_up_date: formData.next_follow_up_date || null,
      };

      if (isEdit) {
        await opportunityApi.update(id, payload);
      } else {
        await opportunityApi.create(payload);
      }
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Error al guardar la oportunidad';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h2>{isEdit ? '✏️ Editar Oportunidad' : '➕ Nueva Oportunidad'}</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mt-3">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* Datos de la empresa */}
            <h5 className="mb-3 text-muted">Datos del cliente</h5>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Empresa *</Form.Label>
                  <Form.Control
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    placeholder="Nombre de la empresa"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Contacto *</Form.Label>
                  <Form.Control
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    required
                    placeholder="Nombre del contacto"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    required
                    placeholder="email@empresa.com"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Datos de la oportunidad */}
            <h5 className="mb-3 text-muted">Datos de la oportunidad</h5>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nombre de la oportunidad *</Form.Label>
                  <Form.Control
                    name="opportunity_name"
                    value={formData.opportunity_name}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Asistente IA para atención interna"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Responsable *</Form.Label>
                  <Form.Control
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    required
                    placeholder="Nombre del responsable"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción breve del proyecto o necesidad"
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Valor estimado</Form.Label>
                  <Form.Control
                    type="number"
                    name="estimated_value"
                    value={formData.estimated_value}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Moneda</Form.Label>
                  <Form.Select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Etapa</Form.Label>
                  <Form.Select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Prioridad</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Probabilidad (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="probability"
                    value={formData.probability}
                    onChange={handleChange}
                    min="0"
                    max="100"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Próximo seguimiento</Form.Label>
                  <Form.Control
                    type="date"
                    name="next_follow_up_date"
                    value={formData.next_follow_up_date}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Resumen última interacción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="last_interaction_summary"
                value={formData.last_interaction_summary || ''}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear oportunidad'}
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate('/')}>
                Cancelar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
