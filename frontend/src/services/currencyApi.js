import axios from 'axios';

const CACHE_KEY = 'crm_currency_rates_cache';
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutos de caché

const FALLBACK_RATES = {
  USD_CLP: 945.5,
  EUR_CLP: 1020.0,
  UF_CLP: 38450.0,
  BTC_USD: 64200.0,
  ETH_USD: 3450.0,
  timestamp: new Date().toISOString(),
  isFallback: true,
};

/**
 * Obtiene las cotizaciones en tiempo real de monedas y criptomonedas.
 * Usa caché local de 10 minutos y fallback seguro en caso de fallo de red.
 */
export async function getCurrencyRates() {
  try {
    // 1. Revisar si hay caché válido
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const isFresh = Date.now() - new Date(parsed.timestamp).getTime() < CACHE_DURATION_MS;
      if (isFresh) {
        return parsed;
      }
    }

    // 2. Consultar APIs en paralelo
    const [mindicadorRes, cryptoRes] = await Promise.allSettled([
      axios.get('https://mindicador.cl/api', { timeout: 4000 }),
      axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd', {
        timeout: 4000,
      }),
    ]);

    const rates = { ...FALLBACK_RATES, isFallback: false, timestamp: new Date().toISOString() };

    if (mindicadorRes.status === 'fulfilled' && mindicadorRes.value.data) {
      const d = mindicadorRes.value.data;
      if (d.dolar?.valor) rates.USD_CLP = d.dolar.valor;
      if (d.euro?.valor) rates.EUR_CLP = d.euro.valor;
      if (d.uf?.valor) rates.UF_CLP = d.uf.valor;
    }

    if (cryptoRes.status === 'fulfilled' && cryptoRes.value.data) {
      const c = cryptoRes.value.data;
      if (c.bitcoin?.usd) rates.BTC_USD = c.bitcoin.usd;
      if (c.ethereum?.usd) rates.ETH_USD = c.ethereum.usd;
    }

    // Guardar en caché
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    return rates;
  } catch (err) {
    console.warn('Usando tipos de cambio de respaldo:', err.message);
    return FALLBACK_RATES;
  }
}

/**
 * Convierte un valor en USD a la moneda objetivo seleccionada.
 */
export function convertCurrency(valueInUSD, targetCurrency, rates) {
  const amount = parseFloat(valueInUSD) || 0;
  if (!rates) return { amount, symbol: '$', code: 'USD' };

  switch (targetCurrency) {
    case 'CLP':
      return {
        amount: amount * (rates.USD_CLP || 945.5),
        symbol: '$',
        code: 'CLP',
        formatted: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount * rates.USD_CLP),
      };
    case 'EUR':
      const eurRate = rates.USD_CLP / rates.EUR_CLP || 0.92;
      return {
        amount: amount * eurRate,
        symbol: '€',
        code: 'EUR',
        formatted: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount * eurRate),
      };
    case 'UF':
      const ufInUSD = rates.UF_CLP / rates.USD_CLP || 40.6;
      return {
        amount: amount / ufInUSD,
        symbol: 'UF',
        code: 'UF',
        formatted: `${(amount / ufInUSD).toFixed(2)} UF`,
      };
    case 'BTC':
      const btcAmount = amount / (rates.BTC_USD || 64200);
      return {
        amount: btcAmount,
        symbol: '₿',
        code: 'BTC',
        formatted: `₿ ${btcAmount.toFixed(4)}`,
      };
    case 'USD':
    default:
      return {
        amount,
        symbol: '$',
        code: 'USD',
        formatted: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount),
      };
  }
}
