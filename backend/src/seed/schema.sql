-- ========================================
-- CRM AI
-- Schema de la base de datos
-- ========================================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMs para validación a nivel de BD
DO $$ BEGIN
  CREATE TYPE opportunity_stage AS ENUM (
    'Lead nuevo',
    'Contactado',
    'Diagnóstico',
    'Propuesta enviada',
    'Negociación',
    'Ganado',
    'Perdido'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_priority AS ENUM (
    'Baja',
    'Media',
    'Alta',
    'Crítica'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tabla principal de oportunidades
CREATE TABLE IF NOT EXISTS opportunities (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name            VARCHAR(255) NOT NULL,
  contact_name            VARCHAR(255) NOT NULL,
  contact_email           VARCHAR(255) NOT NULL,
  opportunity_name        VARCHAR(255) NOT NULL,
  description             TEXT,
  estimated_value         DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency                VARCHAR(10) NOT NULL DEFAULT 'USD',
  stage                   opportunity_stage NOT NULL DEFAULT 'Lead nuevo',
  priority                opportunity_priority NOT NULL DEFAULT 'Media',
  probability             INTEGER CHECK (probability >= 0 AND probability <= 100) DEFAULT 0,
  owner                   VARCHAR(255) NOT NULL,
  next_follow_up_date     DATE,
  last_interaction_summary TEXT,
  ai_recommendation       TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para los filtros del frontend
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_priority ON opportunities(priority);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner ON opportunities(owner);
CREATE INDEX IF NOT EXISTS idx_opportunities_follow_up ON opportunities(next_follow_up_date);

-- Tabla para historial de conversaciones con el asistente (bonus)
CREATE TABLE IF NOT EXISTS chat_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role        VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_created ON chat_history(created_at DESC);

-- Tabla para historial de auditoría y trazabilidad comercial
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id  UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  action          VARCHAR(50) NOT NULL, -- 'CREATED', 'UPDATED', 'STAGE_CHANGED', 'DELETED'
  entity_type     VARCHAR(50) NOT NULL DEFAULT 'OPPORTUNITY',
  changes         JSONB,
  performed_by    VARCHAR(255) NOT NULL DEFAULT 'Sistema',
  ip_address      VARCHAR(45),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_opp_id ON audit_logs(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

