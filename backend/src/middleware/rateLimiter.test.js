import { describe, it, expect } from 'vitest';
const { apiLimiter, chatRateLimiter } = require('./rateLimiter');

describe('Security Hardening: Rate Limiting Middleware', () => {
  it('debe exportar instancias válidas de express-rate-limit', () => {
    expect(apiLimiter).toBeDefined();
    expect(typeof apiLimiter).toBe('function');
    expect(chatRateLimiter).toBeDefined();
    expect(typeof chatRateLimiter).toBe('function');
  });
});
