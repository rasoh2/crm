import { describe, it, expect } from 'vitest';

describe('DB Config Security: Identificadores DDL (SEC-02)', () => {
  const dbNameRegex = /^[a-zA-Z0-9_]+$/;

  it('debe aceptar nombres de base de datos seguros válidos', () => {
    expect(dbNameRegex.test('crm_ai')).toBe(true);
    expect(dbNameRegex.test('crm_ai_2026')).toBe(true);
    expect(dbNameRegex.test('postgres')).toBe(true);
  });

  it('debe rechazar intentos de inyección SQL en el nombre de la BD', () => {
    expect(dbNameRegex.test('crm_ai; DROP TABLE opportunities;')).toBe(false);
    expect(dbNameRegex.test('crm_ai --')).toBe(false);
    expect(dbNameRegex.test('crm_ai" OR "1"="1')).toBe(false);
    expect(dbNameRegex.test('crm_ai; SELECT pg_sleep(5);')).toBe(false);
  });
});
