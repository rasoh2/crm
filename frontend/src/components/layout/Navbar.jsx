import { useState, useEffect } from 'react';
import { Navbar as BsNavbar, Container, Nav, Badge, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BsStars, BsBriefcase, BsBroadcast, BsSunFill, BsMoonStarsFill, BsCpu, BsPersonCircle, BsBoxArrowRight } from 'react-icons/bs';
import { socket } from '../../services/socket';
import LoginModal from '../common/LoginModal';

export default function Navbar() {
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('crm_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('crm_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      localStorage.setItem('crm_theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light');
      localStorage.setItem('crm_theme', 'light');
    }
  }, [darkMode]);

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

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <>
      <BsNavbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm border-bottom border-dark-subtle">
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
            <Nav className="align-items-center gap-2 mt-2 mt-lg-0">
              {/* Indicador de Modelo IA Activo */}
              <Badge
                bg="dark"
                text="light"
                className="border border-secondary px-2 py-1 font-monospace fw-normal d-flex align-items-center shadow-2xs"
                title="Modelo primario activo: Groq LPU (GPT-OSS-20B) | Respaldo: Gemini 3.8 Flash"
                style={{ fontSize: '0.75rem' }}
              >
                <BsCpu className="me-1 text-info" />
                <span>Groq LPU (GPT-OSS-20B)</span>
              </Badge>

              {/* Botón de Modo Noche / Día */}
              <Button
                variant={darkMode ? 'outline-light' : 'outline-secondary'}
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="d-flex align-items-center justify-content-center p-1 px-2 rounded-3"
                title={darkMode ? 'Cambiar a Modo Día (Claro)' : 'Cambiar a Modo Noche (Oscuro)'}
              >
                {darkMode ? (
                  <>
                    <BsSunFill className="text-warning me-1" /> <small>Modo Día</small>
                  </>
                ) : (
                  <>
                    <BsMoonStarsFill className="text-info me-1" /> <small>Modo Noche</small>
                  </>
                )}
              </Button>

              <Nav.Link
                as={Link}
                to="/chat"
                active={location.pathname === '/chat'}
                className="d-flex align-items-center"
              >
                <BsStars className="me-1 text-warning" />
                Copilot
              </Nav.Link>

              {/* Autenticación & Perfil del Usuario */}
              {currentUser ? (
                <div className="d-flex align-items-center gap-1 border-start border-secondary ps-2 ms-lg-1">
                  <Badge
                    bg="secondary"
                    className="bg-opacity-25 border border-secondary text-light px-2 py-1 d-flex align-items-center"
                    title={`Usuario activo: ${currentUser.name} (${currentUser.role || 'Ejecutivo'})`}
                  >
                    <span className="me-1">{currentUser.avatar || '👤'}</span>
                    <span className="fw-semibold text-truncate" style={{ maxWidth: '110px' }}>
                      {currentUser.name}
                    </span>
                  </Badge>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleLogout}
                    className="p-1 px-2 d-flex align-items-center rounded-3"
                    title="Cerrar Sesión"
                  >
                    <BsBoxArrowRight />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowLoginModal(true)}
                  className="fw-bold px-3 py-1 d-flex align-items-center ms-lg-1 rounded-3 shadow-2xs"
                >
                  <BsPersonCircle className="me-1" /> Iniciar Sesión
                </Button>
              )}
            </Nav>
          </BsNavbar.Collapse>
        </Container>
      </BsNavbar>

      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    </>
  );
}

