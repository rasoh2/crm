import { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Modal, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsEyeFill, BsPencilSquare, BsTrash3Fill, BsDownload } from 'react-icons/bs';
import { opportunityApi } from '../../services/api';
import PipelineDashboard from '../dashboard/PipelineDashboard';
import FilterPanel from '../filters/FilterPanel';
import { subscribeToOpportunityEvents } from '../../services/socket';
import { exportOpportunitiesToCSV } from '../../utils/csv';
import { StageBadge, PriorityBadge } from '../common/CrmBadges';

export default function OpportunityList() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchOpportunities = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
      setError(null);
      const res = await opportunityApi.getAll(filters);
      setOpportunities(res.data.data);
    } catch (err) {
      setError('Error al cargar las oportunidades. ¿Está el backend corriendo?');
      console.error(err);
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOpportunities();

    const unsubscribe = subscribeToOpportunityEvents(() => {
      fetchOpportunities(true);
    });

    return () => unsubscribe();
  }, [filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, opportunities.length]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await opportunityApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchOpportunities();
    } catch (err) {
      setError('Error al eliminar la oportunidad');
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
        <p className="mt-2">Cargando oportunidades...</p>
      </div>
    );
  }

  // Cálculos de Paginación
  const totalPages = Math.ceil(opportunities.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOpportunities = opportunities.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold tracking-tight">📋 Oportunidades Comerciales</h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => setShowDashboard(!showDashboard)}
            className="fw-medium"
          >
            {showDashboard ? '📊 Ocultar Dashboard' : '📊 Ver Dashboard'}
          </Button>
          <Button
            variant="outline-success"
            onClick={() => exportOpportunitiesToCSV(opportunities)}
            disabled={opportunities.length === 0}
            title="Exportar la lista actual de oportunidades a formato CSV"
            className="fw-medium"
          >
            <BsDownload className="me-1" /> Exportar CSV
          </Button>
          <Button variant="primary" onClick={() => navigate('/opportunity/new')} className="fw-semibold">
            + Nueva Oportunidad
          </Button>
        </div>
      </div>

      {showDashboard && <PipelineDashboard opportunities={opportunities} />}

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onClear={() => setFilters({})}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {opportunities.length === 0 ? (
        <Alert variant="info">
          No se encontraron oportunidades
          {Object.keys(filters).length > 0 ? ' con los filtros seleccionados.' : '.'}
        </Alert>
      ) : (
        <>
          <small className="text-muted mb-2 d-block fw-medium">
            {opportunities.length} oportunidad{opportunities.length !== 1 ? 'es' : ''} encontrada{opportunities.length !== 1 ? 's' : ''}
          </small>
          <Table responsive hover className="table-crm align-middle">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Oportunidad</th>
                <th>Etapa</th>
                <th>Prioridad</th>
                <th>Valor</th>
                <th>Prob.</th>
                <th>Responsable</th>
                <th>Seguimiento</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentOpportunities.map((opp) => (
                <tr key={opp.id}>
                  <td className="fw-bold text-dark">{opp.company_name}</td>
                  <td>{opp.opportunity_name}</td>
                  <td>
                    <StageBadge stage={opp.stage} />
                  </td>
                  <td>
                    <PriorityBadge priority={opp.priority} />
                  </td>
                  <td className="fw-semibold">{formatCurrency(opp.estimated_value, opp.currency)}</td>
                  <td>
                    <span className="fw-medium">{opp.probability}%</span>
                  </td>
                  <td>{opp.owner}</td>
                  <td>
                    {opp.next_follow_up_date
                      ? new Date(opp.next_follow_up_date).toLocaleDateString('es-CL')
                      : '—'}
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-1">
                      <Link
                        to={`/opportunity/${opp.id}`}
                        className="btn-action-icon btn-action-view"
                        title="Ver detalle"
                      >
                        <BsEyeFill size={15} />
                      </Link>
                      <Link
                        to={`/opportunity/${opp.id}/edit`}
                        className="btn-action-icon btn-action-edit"
                        title="Editar"
                      >
                        <BsPencilSquare size={15} />
                      </Link>
                      <button
                        type="button"
                        className="btn-action-icon btn-action-delete"
                        title="Eliminar"
                        onClick={() => setDeleteTarget(opp)}
                      >
                        <BsTrash3Fill size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>


          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, opportunities.length)} de {opportunities.length} oportunidades (Página {currentPage} de {totalPages})
              </small>
              <Pagination className="mb-0">
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación para eliminar */}
      <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar la oportunidad{' '}
          <strong>"{deleteTarget?.opportunity_name}"</strong> de{' '}
          <strong>{deleteTarget?.company_name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

