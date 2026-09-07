import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Form, ButtonGroup, Button } from 'react-bootstrap';
import {
  BsCurrencyDollar,
  BsGraphUp,
  BsExclamationTriangle,
  BsAward,
} from 'react-icons/bs';
import { opportunityApi } from '../../services/api';
import { subscribeToOpportunityEvents } from '../../services/socket';
import { getCurrencyRates, convertCurrency } from '../../services/currencyApi';
import CurrencyTicker from './CurrencyTicker';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Registrar elementos de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function PipelineDashboard({ opportunities: initialOpps = null }) {
  const [opportunities, setOpportunities] = useState(initialOpps || []);
  const [loading, setLoading] = useState(!initialOpps);
  const [rates, setRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState('USD');

  useEffect(() => {
    if (!initialOpps) {
      loadData();
    } else {
      setOpportunities(initialOpps);
    }

    const unsubscribe = subscribeToOpportunityEvents(() => {
      loadData();
    });

    return () => unsubscribe();
  }, [initialOpps]);

  useEffect(() => {
    async function fetchRates() {
      setRatesLoading(true);
      const data = await getCurrencyRates();
      setRates(data);
      setRatesLoading(false);
    }
    fetchRates();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await opportunityApi.getAll();
      setOpportunities(res.data?.data || []);
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Cargando métricas del pipeline...</p>
      </div>
    );
  }

  // Cálculos de KPIs en USD base
  const totalValueUSD = opportunities.reduce(
    (acc, opp) => acc + (parseFloat(opp.estimated_value) || 0),
    0
  );

  const convertedTotal = convertCurrency(totalValueUSD, displayCurrency, rates);

  const activeOpps = opportunities.filter(
    (o) => o.stage !== 'Ganado' && o.stage !== 'Perdido'
  );

  const criticalCount = opportunities.filter(
    (o) => o.priority === 'Crítica' || o.priority === 'Alta'
  ).length;

  const avgProb = opportunities.length
    ? Math.round(
        opportunities.reduce((acc, o) => acc + (o.probability || 0), 0) /
          opportunities.length
      )
    : 0;

  // Datos para gráfico por Etapas (Doughnut)
  const stages = [
    'Lead nuevo',
    'Contactado',
    'Diagnóstico',
    'Propuesta enviada',
    'Negociación',
    'Ganado',
    'Perdido',
  ];

  const stageCounts = stages.map(
    (stage) => opportunities.filter((o) => o.stage === stage).length
  );

  const doughnutData = {
    labels: stages,
    datasets: [
      {
        data: stageCounts,
        backgroundColor: [
          '#6c757d', // Lead nuevo (Gris)
          '#0dcaf0', // Contactado (Cyan)
          '#0d6efd', // Diagnóstico (Azul)
          '#ffc107', // Propuesta enviada (Amarillo)
          '#fd7e14', // Negociación (Naranja)
          '#198754', // Ganado (Verde)
          '#dc3545', // Perdido (Rojo)
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 15, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw} oportunidades`,
        },
      },
    },
  };

  // Datos para gráfico por Prioridad convertidos a la moneda seleccionada
  const priorities = ['Baja', 'Media', 'Alta', 'Crítica'];
  const valueByPriorityConverted = priorities.map((p) => {
    const sumUSD = opportunities
      .filter((o) => o.priority === p)
      .reduce((acc, o) => acc + (parseFloat(o.estimated_value) || 0), 0);
    return convertCurrency(sumUSD, displayCurrency, rates).amount;
  });

  const barData = {
    labels: priorities,
    datasets: [
      {
        label: `Valor (${displayCurrency})`,
        data: valueByPriorityConverted,
        backgroundColor: [
          'rgba(108, 117, 125, 0.75)', // Baja
          'rgba(13, 202, 240, 0.75)',  // Media
          'rgba(255, 193, 7, 0.75)',   // Alta
          'rgba(220, 53, 69, 0.75)',   // Crítica
        ],
        borderColor: ['#6c757d', '#0dcaf0', '#ffc107', '#dc3545'],
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw;
            if (displayCurrency === 'BTC') return ` Valor: ₿ ${val.toFixed(4)}`;
            if (displayCurrency === 'UF') return ` Valor: ${val.toFixed(2)} UF`;
            return ` Valor: ${new Intl.NumberFormat().format(Math.round(val))} ${displayCurrency}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            if (displayCurrency === 'BTC') return `₿${value.toFixed(2)}`;
            if (displayCurrency === 'UF') return `${Math.round(value)} UF`;
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
            return value;
          },
        },
      },
    },
  };

  return (
    <div className="mb-4">
      {/* Ticker Financiero en Tiempo Real */}
      <CurrencyTicker rates={rates} loading={ratesLoading} />

      {/* Selector de Moneda de Visualización */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3 bg-light p-2 px-3 rounded-3 border">
        <span className="fw-semibold text-secondary fs-7 text-nowrap">
          💱 Convertidor de Moneda del Pipeline:
        </span>
        <ButtonGroup size="sm" className="w-100 w-sm-auto">
          {['USD', 'CLP', 'EUR', 'UF', 'BTC'].map((curr) => (
            <Button
              key={curr}
              variant={displayCurrency === curr ? 'primary' : 'outline-secondary'}
              onClick={() => setDisplayCurrency(curr)}
              className="fw-bold px-2 py-1 flex-fill flex-sm-grow-0"
            >
              {curr}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Fila de Tarjetas KPIs */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 bg-primary text-white">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <small className="text-white-50 text-uppercase fw-bold">
                  Valor Total ({displayCurrency})
                </small>
                <h3 className="mb-0 fw-bold mt-1 fs-4 text-truncate" title={convertedTotal.formatted}>
                  {convertedTotal.formatted}
                </h3>
              </div>
              <div className="bg-white bg-opacity-25 rounded-circle p-3 ms-2">
                <BsCurrencyDollar size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 bg-white">
            <Card.Body className="d-flex align-items-center justify-content-between p-3 border-start border-4 border-info rounded-start">
              <div>
                <small className="text-muted text-uppercase fw-bold">
                  Oportunidades Activas
                </small>
                <h3 className="mb-0 fw-bold mt-1 text-dark">
                  {activeOpps.length}{' '}
                  <small className="fs-6 text-muted">/ {opportunities.length}</small>
                </h3>
              </div>
              <div className="bg-info bg-opacity-10 text-info rounded-circle p-3">
                <BsGraphUp size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 bg-white">
            <Card.Body className="d-flex align-items-center justify-content-between p-3 border-start border-4 border-warning rounded-start">
              <div>
                <small className="text-muted text-uppercase fw-bold">
                  Alta / Crítica
                </small>
                <h3 className="mb-0 fw-bold mt-1 text-dark">
                  {criticalCount}
                </h3>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3">
                <BsExclamationTriangle size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 bg-white">
            <Card.Body className="d-flex align-items-center justify-content-between p-3 border-start border-4 border-success rounded-start">
              <div>
                <small className="text-muted text-uppercase fw-bold">
                  Probabilidad Prom.
                </small>
                <h3 className="mb-0 fw-bold mt-1 text-dark">{avgProb}%</h3>
              </div>
              <div className="bg-success bg-opacity-10 text-success rounded-circle p-3">
                <BsAward size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Fila de Gráficos Analíticos */}
      <Row className="g-3">
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-0 pt-3 pb-0">
              <h6 className="fw-bold mb-0 text-secondary">
                Distribución por Etapa Comercial
              </h6>
            </Card.Header>
            <Card.Body style={{ height: '280px' }} className="position-relative">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-0 pt-3 pb-0">
              <h6 className="fw-bold mb-0 text-secondary">
                Valor Acumulado por Prioridad ({displayCurrency})
              </h6>
            </Card.Header>
            <Card.Body style={{ height: '280px' }} className="position-relative">
              <Bar data={barData} options={barOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
