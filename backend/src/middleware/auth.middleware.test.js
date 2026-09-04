import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './auth.middleware';

describe('Middleware: authenticateToken (QA Tests)', () => {
  const secret = 'test_jwt_secret_key_123';

  it('debe responder 401 Unauthorized si no existe la cabecera Authorization', () => {
    const req = { headers: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Acceso no autorizado'),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('debe responder 403 Forbidden cuando se proporciona un token malformado o corrupto', () => {
    const req = {
      headers: { authorization: 'Bearer token_invalido_123' },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Acceso prohibido'),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('debe llamar a next() y adjuntar req.user cuando el token JWT es válido', () => {
    process.env.JWT_SECRET = secret;
    const payload = { id: 'usr_100', name: 'Agente QA', role: 'tester' };
    const validToken = jwt.sign(payload, secret);

    const req = {
      headers: { authorization: `Bearer ${validToken}` },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.name).toBe('Agente QA');
  });
});
