import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

/**
 * Escucha eventos de cambios en oportunidades y ejecuta un callback.
 * Devuelve la función de limpieza (unsubscribe) para usar en useEffect.
 */
export function subscribeToOpportunityEvents(callback) {
  const handleCreated = (data) => callback({ type: 'created', data });
  const handleUpdated = (data) => callback({ type: 'updated', data });
  const handleDeleted = (data) => callback({ type: 'deleted', data });

  socket.on('opportunity:created', handleCreated);
  socket.on('opportunity:updated', handleUpdated);
  socket.on('opportunity:deleted', handleDeleted);

  return () => {
    socket.off('opportunity:created', handleCreated);
    socket.off('opportunity:updated', handleUpdated);
    socket.off('opportunity:deleted', handleDeleted);
  };
}
