import { Form, Row, Col, Button } from 'react-bootstrap';
import { STAGES, PRIORITIES } from '../../constants/crm';

export default function FilterPanel({ filters, onFilterChange, onClear }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const hasFilters = filters.stage || filters.priority || filters.owner;

  return (
    <Form className="bg-light p-3 rounded mb-3">
      <Row className="g-2 align-items-end">
        <Col md={3}>
          <Form.Label className="small fw-bold">Etapa</Form.Label>
          <Form.Select
            name="stage"
            size="sm"
            value={filters.stage || ''}
            onChange={handleChange}
          >
            <option value="">Todas</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Label className="small fw-bold">Prioridad</Form.Label>
          <Form.Select
            name="priority"
            size="sm"
            value={filters.priority || ''}
            onChange={handleChange}
          >
            <option value="">Todas</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Label className="small fw-bold">Responsable</Form.Label>
          <Form.Control
            name="owner"
            size="sm"
            type="text"
            placeholder="Buscar responsable..."
            value={filters.owner || ''}
            onChange={handleChange}
          />
        </Col>
        <Col md={3}>
          {hasFilters && (
            <Button variant="outline-secondary" size="sm" onClick={onClear}>
              Limpiar filtros
            </Button>
          )}
        </Col>
      </Row>
    </Form>
  );
}
