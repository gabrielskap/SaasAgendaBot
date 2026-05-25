-- =============================================================================
-- AgendaBot — Migração: Tabela de Fluxo do Chatbot
-- Execute este script no SQL Editor do Supabase Dashboard
-- =============================================================================

CREATE TABLE IF NOT EXISTS "AgendaBot_ChatbotFlow" (
  tenant_id   TEXT        NOT NULL PRIMARY KEY,
  nodes       JSONB       NOT NULL DEFAULT '[]',
  connections JSONB       NOT NULL DEFAULT '[]',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_chatbot_flow_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES "AgendaBot_Tenant" (id)
    ON DELETE CASCADE
);

-- Permite que o service role leia e escreva (RLS desabilitado para service role por padrão)
ALTER TABLE "AgendaBot_ChatbotFlow" ENABLE ROW LEVEL SECURITY;

-- Política para service role (backend)
CREATE POLICY "service_role_all" ON "AgendaBot_ChatbotFlow"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
