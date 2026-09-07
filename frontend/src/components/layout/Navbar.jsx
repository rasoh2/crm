import { useState, useEffect } from 'react';
import { Navbar as BsNavbar, Container, Nav, Badge } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { BsStars, BsBriefcase, BsBroadcast } from 'react-icons/bs';
import { socket } from '../../services/socket';

export default function Navbar() {
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="fw-bold tracking-tight d-flex align-items-center me-auto me-lg-3 fs-6 fs-sm-5">
          <BsBriefcase className="me-2 text-primary flex-shrink-0" />
          <span className="text-nowrap">CRM Comercial</span>
          <Badge
            bg={isConnected ? 'success' : 'secondary'}
            className="ms-2 font-monospace fw-normal text-uppercase d-flex align-items-center opacity-75 flex-shrink-0"
            style={{ fontSize: '0.65rem', padding: '0.25em 0.45em' }}
            title={isConnected ? 'WebSocket Conectado en Tiempo Real' : 'Conectando WebSocket...'}
          >
            <BsBroadcast className="me-1" />
            <span className="d-none d-xs-inline">{isConnected ? 'En Vivo' : 'Offline'}</span>
          </Badge>
        </BsNavbar.Brand>
        <BsNavbar.Toggle />
        <BsNavbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              active={location.pathname === '/'}
            >
              Oportunidades
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/dashboard"
              active={location.pathname === '/dashboard'}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/opportunity/new"
              active={location.pathname === '/opportunity/new'}
            >
              + Nueva Oportunidad
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link
              as={Link}
              to="/chat"
              active={location.pathname === '/chat'}
              className="d-flex align-items-center"
            >
              <BsStars className="me-2 text-warning" />
              Copilot Comercial
            </Nav.Link>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}

