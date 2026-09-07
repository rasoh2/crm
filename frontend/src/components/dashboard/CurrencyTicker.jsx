import { Badge, Spinner } from 'react-bootstrap';
import { BsArrowUpRight, BsCurrencyDollar, BsCurrencyEuro, BsCurrencyBitcoin } from 'react-icons/bs';

export default function CurrencyTicker({ rates, loading }) {
  if (loading || !rates) {
    return (
      <div className="bg-dark text-white-50 p-2 rounded-3 mb-3 d-flex align-items-center justify-content-center gap-2 fs-7">
        <Spinner animation="border" size="sm" variant="light" />
        <span>Cargando cotizaciones financieras en tiempo real...</span>
      </div>
    );
  }

  const formatCLP = (val) => `$${Math.round(val).toLocaleString('es-CL')}`;
  const formatUSD = (val) => `$${Math.round(val).toLocaleString('en-US')}`;

  return (
    <div className="bg-dark text-white p-2 px-3 rounded-3 mb-3 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between shadow-sm fs-7 gap-2">
      <div className="d-flex align-items-center gap-1">
        <BsArrowUpRight className="text-success me-1" />
        <span className="fw-bold text-light tracking-tight text-nowrap">MERCADOS EN VIVO</span>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2 currency-ticker-badges">
        <Badge bg="secondary" className="bg-opacity-25 border border-secondary text-light px-2 py-1 font-monospace d-flex align-items-center">
          <BsCurrencyDollar className="text-success me-1" />
          <span>USD/CLP: <strong className="text-white ms-1">{formatCLP(rates.USD_CLP)}</strong></span>
        </Badge>

        <Badge bg="secondary" className="bg-opacity-25 border border-secondary text-light px-2 py-1 font-monospace d-flex align-items-center">
          <BsCurrencyEuro className="text-info me-1" />
          <span>EUR/CLP: <strong className="text-white ms-1">{formatCLP(rates.EUR_CLP)}</strong></span>
        </Badge>

        <Badge bg="secondary" className="bg-opacity-25 border border-secondary text-light px-2 py-1 font-monospace d-flex align-items-center">
          <span className="text-warning fw-bold me-1">UF</span>
          <span>UF: <strong className="text-white ms-1">{formatCLP(rates.UF_CLP)}</strong></span>
        </Badge>

        <Badge bg="secondary" className="bg-opacity-25 border border-secondary text-light px-2 py-1 font-monospace d-flex align-items-center">
          <BsCurrencyBitcoin className="text-warning me-1" />
          <span>BTC/USD: <strong className="text-white ms-1">{formatUSD(rates.BTC_USD)}</strong></span>
        </Badge>

        <Badge bg="secondary" className="bg-opacity-25 border border-secondary text-light px-2 py-1 font-monospace d-flex align-items-center">
          <span className="text-primary me-1 fw-bold">Ξ</span>
          <span>ETH/USD: <strong className="text-white ms-1">{formatUSD(rates.ETH_USD)}</strong></span>
        </Badge>
      </div>

      <div className="text-white-50 fs-8 d-none d-xl-block">
        {rates.isFallback ? '⚠️ Modo Offline' : `Actualizado: ${new Date(rates.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`}
      </div>
    </div>
  );
}
