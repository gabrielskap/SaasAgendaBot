-- =============================================================================
-- AgendaBot — Migração: Webhook, Instâncias WhatsApp e Sessões de Conversa
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tabela de instâncias WhatsApp (mapeia token UAZAPI → tenant)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AgendaBot_WhatsappInstance" (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id      TEXT        NOT NULL,
  instance_name  TEXT        NOT NULL,
  instance_token TEXT        NOT NULL,
  owner_phone    TEXT,
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_whatsapp_instance_token UNIQUE (instance_token),

  CONSTRAINT fk_whatsapp_instance_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES "AgendaBot_Tenant" (id)
    ON DELETE CASCADE
);

ALTER TABLE "AgendaBot_WhatsappInstance" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON "AgendaBot_WhatsappInstance"
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 2. Tabela de conversas (cria se não existir)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AgendaBot_Conversation" (
  id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id        TEXT        NOT NULL,
  client_name      TEXT        NOT NULL DEFAULT '',
  client_phone     TEXT        NOT NULL DEFAULT '',
  status           TEXT        NOT NULL DEFAULT 'bot' CHECK (status IN ('bot', 'human', 'closed')),
  last_message     TEXT        NOT NULL DEFAULT '',
  last_message_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_node_id  TEXT,
  flow_id          UUID,
  session_data     JSONB       NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_conversation_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES "AgendaBot_Tenant" (id)
    ON DELETE CASCADE
);

-- Se a tabela já existe, adicione apenas as colunas novas:
ALTER TABLE "AgendaBot_Conversation" ADD COLUMN IF NOT EXISTS client_name     TEXT NOT NULL DEFAULT '';
ALTER TABLE "AgendaBot_Conversation" ADD COLUMN IF NOT EXISTS client_phone    TEXT NOT NULL DEFAULT '';
ALTER TABLE "AgendaBot_Conversation" ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'bot';
ALTER TABLE "AgendaBot_Conversation" ADD COLUMN IF NOT EXISTS last_message    TEXT NOT NULL DEFAULT '';
ALTER TABLE "AgendaBot_Conversation" ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE "AgendaBot_Conversation" ADD COLUMN IF NOT EXISTS current_node_id TEXT;
ALTER TABLE "AgendaBot_Conversation" ADD COLUMN IF NOT EXISTS flow_id         UUID;
ALTER TABLE "AgendaBot_Conversation" ADD COLUMN IF NOT EXISTS session_data    JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_conversation_tenant_phone
  ON "AgendaBot_Conversation" (tenant_id, client_phone);

ALTER TABLE "AgendaBot_Conversation" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON "AgendaBot_Conversation"
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 3. Tabela de mensagens (cria se não existir)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AgendaBot_Message" (
  id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id  UUID        NOT NULL,
  sender           TEXT        NOT NULL CHECK (sender IN ('client', 'bot', 'human')),
  text             TEXT        NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_message_conversation
    FOREIGN KEY (conversation_id)
    REFERENCES "AgendaBot_Conversation" (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_message_conversation
  ON "AgendaBot_Message" (conversation_id, created_at);

ALTER TABLE "AgendaBot_Message" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON "AgendaBot_Message"
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 4. Inserir instância padrão (ajuste os valores antes de executar)
-- ---------------------------------------------------------------------------
-- INSERT INTO "AgendaBot_WhatsappInstance"
--   (tenant_id, instance_name, instance_token, owner_phone)
-- VALUES
--   ('<seu-tenant-id>', 'quantumtecnologia01', '<UAZAPI_TOKEN_INSTANCE>', '553183297273');
