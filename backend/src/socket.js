const { Server } = require('socket.io');

let io = null;

/**
 * Inicializa el servidor WebSocket adjuntandolo al servidor HTTP de Node.js.
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente WebSocket conectado: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Cliente WebSocket desconectado: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Obtiene la instancia actual de Socket.io. Si no existe, retorna una stub segura.
 */
function getIO() {
  if (!io) {
    return {
      emit: () => {},
    };
  }
  return io;
}

/**
 * Emite un evento a todos los clientes conectados de forma segura.
 */
function emitEvent(event, payload) {
  if (io) {
    io.emit(event, payload);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitEvent,
};
