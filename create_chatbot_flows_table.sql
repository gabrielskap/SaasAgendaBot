-- =============================================================================
-- AgendaBot — Migração: Tabela de Múltiplos Fluxos do Chatbot
-- Execute este script no SQL Editor do Supabase Dashboard
-- =============================================================================

CREATE TABLE IF NOT EXISTS "AgendaBot_ChatbotFlows" (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id   TEXT        NOT NULL,
  name        TEXT        NOT NULL DEFAULT 'Novo Fluxo',
  nodes       JSONB       NOT NULL DEFAULT '[]',
  connections JSONB       NOT NULL DEFAULT '[]',
  is_active   BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_chatbot_flows_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES "AgendaBot_Tenant" (id)
    ON DELETE CASCADE
);

-- Run this if the table already exists:
-- ALTER TABLE "AgendaBot_ChatbotFlows" ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "AgendaBot_ChatbotFlows" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON "AgendaBot_ChatbotFlows"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
