import { useState } from 'react';
import { Modal, Form, Button, Alert, Badge, Card } from 'react-bootstrap';
import { BsLock, BsPersonCheck, BsKey, BsBriefcase, BsStars, BsShieldLock } from 'react-icons/bs';
import { authApi } from '../../services/api';

export default function LoginModal({ show, onHide, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { name: 'Carlos Bermúdez', email: 'carlos@crm.com', role: 'Gerente Comercial', avatar: '👨‍💼', color: 'primary' },
    { name: 'Laura Pérez', email: 'laura@crm.com', role: 'Ejecutiva Senior', avatar: '👩‍💼', color: 'info' },
    { name: 'Sebastián Saavedra', email: 'admin@crm.com', role: 'Administrador CRM', avatar: '👨‍💻', color: 'danger' },
    { name: 'Usuario Demo', email: 'demo@crm.com', role: 'Comercial Demo', avatar: '🚀', color: 'success' },
  ];

  const handleLogin = async (e, targetEmail = null) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const emailToUse = targetEmail || email || 'demo@crm.com';

    try {
      const res = await authApi.login({ email: emailToUse, password: password || '123456' });
      const { token, user } = res.data.data;

      localStorage.setItem('crm_token', token);
      localStorage.setItem('crm_user', JSON.stringify(user));

      if (onLoginSuccess) onLoginSuccess(user);
      onHide();
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.response?.data?.message || 'Error al autenticar credenciales. Reintente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" className="login-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold tracking-tight d-flex align-items-center fs-5">
          <BsBriefcase className="text-primary me-2" />
          <span>Acceso al CRM Comercial</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p className="text-muted small mb-4">
          Ingresa tus credenciales comerciales o selecciona una cuenta demo para iniciar sesión con token JWT.
        </p>

        {error && <Alert variant="danger" className="py-2 fs-7">{error}</Alert>}

        <Form onSubmit={(e) => handleLogin(e)}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold fs-7 text-secondary">Correo Electrónico</Form.Label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><BsPersonCheck /></span>
              <Form.Control
                type="email"
                placeholder="ejemplo@crm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-start-0"
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold fs-7 text-secondary">Contraseña</Form.Label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><BsKey /></span>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-start-0"
              />
            </div>
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100 fw-bold py-2 mb-3 shadow-sm" disabled={loading}>
            {loading ? 'Autenticando...' : 'Iniciar Sesión'}
          </Button>
        </Form>

        <hr className="my-3 opacity-25" />

        <div className="mb-2">
          <small className="text-uppercase fw-bold text-muted d-block mb-2 fs-8 d-flex align-items-center">
            <BsStars className="me-1 text-warning" /> Acceso Rápido con Perfiles Demo:
          </small>
          <div className="d-grid gap-2">
            {demoAccounts.map((acc, idx) => (
              <Button
                key={idx}
                variant="outline-secondary"
                size="sm"
                className="text-start d-flex align-items-center justify-content-between p-2 rounded-3"
                disabled={loading}
                onClick={() => handleLogin(null, acc.email)}
              >
                <div className="d-flex align-items-center text-truncate me-2">
                  <span className="me-2 fs-6">{acc.avatar}</span>
                  <div>
                    <strong className="d-block fs-8 text-truncate">{acc.name}</strong>
                    <small className="text-muted fs-8">{acc.email}</small>
                  </div>
                </div>
                <Badge bg={acc.color} className="font-monospace fw-normal fs-8">
                  {acc.role}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
