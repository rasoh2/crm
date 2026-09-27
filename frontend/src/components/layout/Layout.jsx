import { Container, Button } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BsStars } from 'react-icons/bs';
import Navbar from './Navbar';

export default function Layout() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="d-flex flex-column min-vh-100 position-relative">
      <Navbar />
      <Container className="py-4 flex-grow-1">
        <Outlet />
      </Container>

      {/* Botón Flotante del Asistente IA visible en todas las pantallas */}
      {!isChatPage && (
        <Button
          as={Link}
          to="/chat"
          variant="warning"
          className="position-fixed bottom-0 end-0 m-4 shadow-lg rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 z-3 animate-ai-btn"
          style={{ cursor: 'pointer' }}
          title="Abrir Asistente Comercial con Inteligencia Artificial"
        >
          <BsStars className="fs-5 text-dark" />
          <span className="text-dark">✨ Asistente IA</span>
        </Button>
      )}

      <footer className="bg-light text-center py-3 mt-auto border-top">
        <small className="text-muted">
          CRM Comercial • Inteligencia Artificial para Ventas © {new Date().getFullYear()}
        </small>
      </footer>
    </div>
  );
}
