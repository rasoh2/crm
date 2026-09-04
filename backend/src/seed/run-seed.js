const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runSeed() {
  const client = await pool.connect();
  try {
    console.log('🔄 Ejecutando schema...');
    const schema = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf-8'
    );
    await client.query(schema);
    console.log('✅ Schema creado/verificado correctamente');

    console.log('🔄 Reemplazando datos semilla (nuevas oportunidades)...');
    const seed = fs.readFileSync(
      path.join(__dirname, 'seed.sql'),
      'utf-8'
    );
    await client.query(seed);
    const afterCount = await client.query('SELECT COUNT(*) FROM opportunities');
    console.log(`✅ Nuevos datos semilla insertados. Total en BD: ${afterCount.rows[0].count}`);
  } catch (error) {
    // Si los tipos/tablas ya existen (42710 = tipo duplicado, 42P07 = tabla duplicada)
    if (error.code === '42710' || error.code === '42P07') {
      console.log('⚠️  Schema ya existe, omitiendo creación de tipos/tablas...');
    } else {
      console.error('❌ Error en seed:', error.message);
      throw error;
    }
  } finally {
    client.release();
  }
}

// Ejecutar si se llama directamente: node src/seed/run-seed.js
if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
  runSeed()
    .then(() => {
      console.log('🎉 Seed completado');
      process.exit(0);
    })
    .catch((err) => {
      console.error('💥 Seed fallido:', err);
      process.exit(1);
    });
}

module.exports = { runSeed };
