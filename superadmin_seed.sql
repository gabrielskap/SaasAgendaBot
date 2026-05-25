-- =============================================================================
-- AgendaBot — Seed: Super Admin (Supabase Auth)
-- =============================================================================
-- ATENÇÃO: Execute em TRÊS passos separados
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 1 — Adicionar valor SUPER_ADMIN ao enum (se ainda não existir)
-- Execute este bloco e aguarde a conclusão antes de prosseguir.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE "AgendaBot_UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 2 — Criar o usuário no Supabase Auth
-- Faça isso pelo Dashboard: Authentication → Users → "Add user"
--   Email: superadmin@agendabot.com.br
--   Senha: (defina uma senha segura)
--   Auto Confirm User: ativado
--
-- Após criar, copie o UUID gerado (coluna "UID") e substitua abaixo.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 3 — Inserir Tenant e User no banco vinculados ao auth_id
-- Substitua '<UUID-DO-SUPABASE-AUTH>' pelo UUID copiado no Passo 2.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "AgendaBot_Tenant" (id, name, slug, email, is_active, created_at, updated_at)
SELECT
  'system-superadmin-tenant',
  'Sistema AgendaBot',
  'sistema-agendabot',
  'sistema@agendabot.com.br',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "AgendaBot_Tenant" WHERE id = 'system-superadmin-tenant'
);

INSERT INTO "AgendaBot_User" (
  id,
  tenant_id,
  auth_id,
  name,
  email,
  role,
  is_active,
  created_at,
  updated_at
)
SELECT
  'superadmin-user-001',
  'system-superadmin-tenant',
  'c4164400-965b-4d43-b070-53b6a237c89c',   -- ← substitua pelo UUID do Passo 2
  'Super Administrador',
  'superadmin@agendabot.com.br',
  'SUPER_ADMIN'::"AgendaBot_UserRole",
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "AgendaBot_User"
  WHERE tenant_id = 'system-superadmin-tenant'
    AND email = 'superadmin@agendabot.com.br'
);

-- Verificação
SELECT u.name, u.email, u.role, u.auth_id, u.is_active, t.name AS tenant
FROM "AgendaBot_User" u
JOIN "AgendaBot_Tenant" t ON t.id = u.tenant_id
WHERE u.email = 'superadmin@agendabot.com.br';
