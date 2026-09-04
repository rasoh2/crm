require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { ensureDatabase } = require('./src/config/db');
const { runSeed } = require('./src/seed/run-seed');
const { initSocket } = require('./src/socket');

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    // 1. Crear la BD si no existe (totalmente automático)
    await ensureDatabase();

    // 2. Crear tablas e insertar datos semilla si es primera vez
    console.log('🔄 Inicializando base de datos...');
    await runSeed();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`\n🚀 Backend CRM AI corriendo en http://localhost:${PORT}`);
      console.log(`📋 API: http://localhost:${PORT}/api/opportunities`);
      console.log(`🤖 Chat: http://localhost:${PORT}/api/chat`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
      console.log(`⚡ WebSocket Server listo en http://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error('💥 Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

start();

