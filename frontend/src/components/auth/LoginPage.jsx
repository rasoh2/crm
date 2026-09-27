import { useState } from 'react';
import { Container, Card, Form, Button, Alert, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsBriefcase, BsKey, BsPersonCheck, BsStars, BsShieldCheck, BsCpu } from 'react-icons/bs';
import { authApi } from '../../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const demoAccounts = [
    { name: 'Carlos Bermúdez', email: 'carlos@crm.com', role: 'Gerente Comercial', avatar: '👨‍💼', color: 'primary' },
    { name: 'Laura Pérez', email: 'laura@crm.com', role: 'Ejecutiva Senior', avatar: '👩‍💼', color: 'info' },
    { name: 'Sebastián Saavedra', email: 'admin@crm.com', role: 'Administrador CRM', avatar: '👨‍💻', color: 'danger' },
    { name: 'Usuario Demo', email: 'demo@crm.com', role: 'Comercial Demo', avatar: '🚀', color: 'success' },
  ];

  const handleLogin = async (e, targetEmail = null) => {
    if (e) e.preventDefault();
    setError('');

    const emailToUse = targetEmail || email.trim();

    if (!emailToUse) {
      setError('Por favor ingresa tu correo electrónico o selecciona una cuenta demo.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.login({ email: emailToUse, password: password || '123456' });
      const { token, user } = res.data.data;

      localStorage.setItem('crm_token', token);
      localStorage.setItem('crm_user', JSON.stringify(user));

      navigate('/');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.response?.data?.message || 'Credenciales inválidas. Por favor selecciona una cuenta demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <Container style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary p-3 rounded-circle mb-3 shadow-2xs">
            <BsBriefcase size={36} />
          </div>
          <h2 className="fw-bold tracking-tight mb-1">CRM Comercial</h2>
          <p className="text-muted small">Asistente Analítico & Gestión de Oportunidades con IA</p>
        </div>

        <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
          <Card.Header className="bg-white border-bottom p-4 pb-3">
            <h5 className="fw-bold mb-0 text-dark d-flex align-items-center">
              <BsShieldCheck className="text-primary me-2" /> Iniciar Sesión
            </h5>
            <small className="text-muted fs-8">Ingresa tus credenciales para acceder a la plataforma</small>
          </Card.Header>

          <Card.Body className="p-4">
            {error && <Alert variant="danger" className="py-2 fs-7">{error}</Alert>}

            <Form onSubmit={(e) => handleLogin(e)}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold fs-7 text-secondary">Correo Electrónico</Form.Label>
                <div className="input-group">
                  <span className="input-group-text border-end-0 bg-light"><BsPersonCheck /></span>
                  <Form.Control
                    type="email"
                    placeholder="usuario@crm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-start-0"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold fs-7 text-secondary">Contraseña</Form.Label>
                <div className="input-group">
                  <span className="input-group-text border-end-0 bg-light"><BsKey /></span>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-start-0"
                  />
                </div>
              </Form.Group>

              <Button type="submit" variant="primary" size="lg" className="w-100 fw-bold shadow-sm fs-6 py-2 mb-3" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar a la Plataforma'}
              </Button>
            </Form>

            <div className="text-center my-3 position-relative">
              <hr className="opacity-25" />
              <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted fs-8">
                O ACCEDE CON UN PERFIL DEMO
              </span>
            </div>

            <div className="d-grid gap-2 mt-3">
              {demoAccounts.map((acc, idx) => (
                <Button
                  key={idx}
                  variant="outline-secondary"
                  size="sm"
                  className="text-start d-flex align-items-center justify-content-between p-2 rounded-3 border"
                  disabled={loading}
                  onClick={() => handleLogin(null, acc.email)}
                >
                  <div className="d-flex align-items-center text-truncate me-2">
                    <span className="me-2 fs-6">{acc.avatar}</span>
                    <div>
                      <strong className="d-block fs-8 text-dark text-truncate">{acc.name}</strong>
                      <small className="text-muted fs-8">{acc.email}</small>
                    </div>
                  </div>
                  <Badge bg={acc.color} className="font-monospace fw-normal fs-8">
                    {acc.role}
                  </Badge>
                </Button>
              ))}
            </div>
          </Card.Body>

          <Card.Footer className="bg-light border-top p-3 text-center text-muted fs-8 d-flex align-items-center justify-content-center gap-1">
            <BsCpu className="text-info me-1" />
            <span>CRM Comercial IA v2.5 • Conexión Segura JWT</span>
          </Card.Footer>
        </Card>
      </Container>
    </div>
  );
}
