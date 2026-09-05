const { Pool } = require('pg');
require('dotenv').config();

async function ensureDatabase() {
  if (process.env.DATABASE_URL) {
    console.log('⚡ DATABASE_URL detectada. Omitiendo comprobacion local de DB.');
    return;
  }
  const dbName = process.env.DB_NAME || 'crm_ai';
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });
  try {
    const result = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (result.rows.length === 0) {
      if (!/^[a-zA-Z0-9_]+$/.test(dbName)) throw new Error('Nombre invalido');
      console.log('Creando BD local...');
      await adminPool.query('CREATE DATABASE "' + dbName + '"');
    }
  } finally {
    await adminPool.end();
  }
}

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost')
        ? false
        : { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'crm_ai',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };

const pool = new Pool(poolConfig);
pool.on('connect', () => console.log('✅ Conectado a PostgreSQL'));
pool.on('error', (err) => console.error('❌ Error PG:', err.message));

module.exports = { pool, ensureDatabase };
