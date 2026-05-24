-- =============================================================================
-- AgendaBot — Migration inicial
-- Cole e execute no Supabase > SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

CREATE TYPE "AgendaBot_Plan" AS ENUM ('STARTER', 'PRO', 'BUSINESS');
CREATE TYPE "AgendaBot_UserRole" AS ENUM ('ADMIN', 'MANAGER', 'PROFESSIONAL', 'RECEPTIONIST');
CREATE TYPE "AgendaBot_AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "AgendaBot_BookedVia" AS ENUM ('WHATSAPP', 'MANUAL', 'ONLINE');
CREATE TYPE "AgendaBot_TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'COMMISSION');
CREATE TYPE "AgendaBot_PaymentMethod" AS ENUM ('PIX', 'CASH', 'CREDIT', 'DEBIT', 'PACKAGE');
CREATE TYPE "AgendaBot_TransactionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');
CREATE TYPE "AgendaBot_CommissionStatus" AS ENUM ('PENDING', 'PAID');
CREATE TYPE "AgendaBot_ConversationStatus" AS ENUM ('BOT', 'HUMAN', 'CLOSED');
CREATE TYPE "AgendaBot_MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE "AgendaBot_MessageType" AS ENUM ('TEXT', 'IMAGE', 'AUDIO', 'DOCUMENT');
CREATE TYPE "AgendaBot_CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED');
CREATE TYPE "AgendaBot_CampaignFilterType" AS ENUM ('INACTIVE', 'BIRTHDAY', 'VIP', 'ALL');
CREATE TYPE "AgendaBot_RecipientStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'RESPONDED', 'CONVERTED');
CREATE TYPE "AgendaBot_LoyaltyRewardType" AS ENUM ('DISCOUNT_PERCENT', 'FREE_SERVICE', 'GIFT');
CREATE TYPE "AgendaBot_WhatsappConsent" AS ENUM ('GRANTED', 'DENIED', 'PENDING');

-- -----------------------------------------------------------------------------
-- 1. TENANT
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_Tenant" (
  "id"              TEXT          NOT NULL DEFAULT gen_random_uuid()::text,
  "name"            TEXT          NOT NULL,
  "slug"            TEXT          NOT NULL,
  "logo_url"        TEXT,
  "phone"           TEXT,
  "email"           TEXT,
  "cnpj"            TEXT,
  "address"         TEXT,
  "city"            TEXT,
  "state"           TEXT,
  "zipcode"         TEXT,
  "plan"            "AgendaBot_Plan" NOT NULL DEFAULT 'STARTER',
  "plan_expires_at" TIMESTAMP(3),
  "timezone"        TEXT          NOT NULL DEFAULT 'America/Sao_Paulo',
  "currency"        TEXT          NOT NULL DEFAULT 'BRL',
  "is_active"       BOOLEAN       NOT NULL DEFAULT TRUE,
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at"      TIMESTAMP(3),
  CONSTRAINT "AgendaBot_Tenant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AgendaBot_Tenant_slug_key" ON "AgendaBot_Tenant"("slug");
CREATE UNIQUE INDEX "AgendaBot_Tenant_cnpj_key" ON "AgendaBot_Tenant"("cnpj");
CREATE INDEX "AgendaBot_Tenant_slug_idx" ON "AgendaBot_Tenant"("slug");
CREATE INDEX "AgendaBot_Tenant_is_active_idx" ON "AgendaBot_Tenant"("is_active");

-- -----------------------------------------------------------------------------
-- 2. TENANT HOURS
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_TenantHours" (
  "id"          TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"   TEXT    NOT NULL,
  "day_of_week" INTEGER NOT NULL,
  "open_time"   TEXT    NOT NULL,
  "close_time"  TEXT    NOT NULL,
  "is_closed"   BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT "AgendaBot_TenantHours_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_TenantHours_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "AgendaBot_TenantHours_tenant_id_day_of_week_key"
  ON "AgendaBot_TenantHours"("tenant_id", "day_of_week");
CREATE INDEX "AgendaBot_TenantHours_tenant_id_idx" ON "AgendaBot_TenantHours"("tenant_id");

-- -----------------------------------------------------------------------------
-- 3. USER
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_User" (
  "id"            TEXT                NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"     TEXT                NOT NULL,
  "name"          TEXT                NOT NULL,
  "email"         TEXT                NOT NULL,
  "phone"         TEXT,
  "password_hash" TEXT                NOT NULL,
  "avatar_url"    TEXT,
  "role"          "AgendaBot_UserRole" NOT NULL DEFAULT 'RECEPTIONIST',
  "is_active"     BOOLEAN             NOT NULL DEFAULT TRUE,
  "last_login_at" TIMESTAMP(3),
  "created_at"    TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"    TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at"    TIMESTAMP(3),
  CONSTRAINT "AgendaBot_User_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_User_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "AgendaBot_User_tenant_id_email_key" ON "AgendaBot_User"("tenant_id", "email");
CREATE INDEX "AgendaBot_User_tenant_id_idx" ON "AgendaBot_User"("tenant_id");
CREATE INDEX "AgendaBot_User_email_idx" ON "AgendaBot_User"("email");
CREATE INDEX "AgendaBot_User_role_idx" ON "AgendaBot_User"("role");

-- -----------------------------------------------------------------------------
-- 4. REFRESH TOKEN
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_RefreshToken" (
  "id"          TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id"     TEXT         NOT NULL,
  "token_hash"  TEXT         NOT NULL,
  "expires_at"  TIMESTAMP(3) NOT NULL,
  "revoked_at"  TIMESTAMP(3),
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_RefreshToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_RefreshToken_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "AgendaBot_User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "AgendaBot_RefreshToken_token_hash_key" ON "AgendaBot_RefreshToken"("token_hash");
CREATE INDEX "AgendaBot_RefreshToken_user_id_idx" ON "AgendaBot_RefreshToken"("user_id");
CREATE INDEX "AgendaBot_RefreshToken_token_hash_idx" ON "AgendaBot_RefreshToken"("token_hash");
CREATE INDEX "AgendaBot_RefreshToken_expires_at_idx" ON "AgendaBot_RefreshToken"("expires_at");

-- -----------------------------------------------------------------------------
-- 5. PROFESSIONAL
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_Professional" (
  "id"                 TEXT           NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"          TEXT           NOT NULL,
  "user_id"            TEXT           UNIQUE,
  "name"               TEXT           NOT NULL,
  "email"              TEXT,
  "phone"              TEXT,
  "avatar_url"         TEXT,
  "bio"                TEXT,
  "commission_percent" DECIMAL(5,2),
  "color"              TEXT,
  "is_active"          BOOLEAN        NOT NULL DEFAULT TRUE,
  "created_at"         TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"         TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at"         TIMESTAMP(3),
  CONSTRAINT "AgendaBot_Professional_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_Professional_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "AgendaBot_Professional_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "AgendaBot_User"("id") ON DELETE SET NULL
);

CREATE INDEX "AgendaBot_Professional_tenant_id_idx" ON "AgendaBot_Professional"("tenant_id");
CREATE INDEX "AgendaBot_Professional_is_active_idx" ON "AgendaBot_Professional"("is_active");

-- -----------------------------------------------------------------------------
-- 6. PROFESSIONAL HOURS
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_ProfessionalHours" (
  "id"              TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "professional_id" TEXT    NOT NULL,
  "day_of_week"     INTEGER NOT NULL,
  "start_time"      TEXT    NOT NULL,
  "end_time"        TEXT    NOT NULL,
  "is_day_off"      BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT "AgendaBot_ProfessionalHours_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_ProfessionalHours_professional_id_fkey"
    FOREIGN KEY ("professional_id") REFERENCES "AgendaBot_Professional"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "AgendaBot_ProfessionalHours_professional_id_day_of_week_key"
  ON "AgendaBot_ProfessionalHours"("professional_id", "day_of_week");
CREATE INDEX "AgendaBot_ProfessionalHours_professional_id_idx"
  ON "AgendaBot_ProfessionalHours"("professional_id");

-- -----------------------------------------------------------------------------
-- 7. PROFESSIONAL TIME OFF
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_ProfessionalTimeOff" (
  "id"              TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "professional_id" TEXT    NOT NULL,
  "start_date"      DATE    NOT NULL,
  "end_date"        DATE    NOT NULL,
  "reason"          TEXT,
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_ProfessionalTimeOff_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_ProfessionalTimeOff_professional_id_fkey"
    FOREIGN KEY ("professional_id") REFERENCES "AgendaBot_Professional"("id") ON DELETE CASCADE
);

CREATE INDEX "AgendaBot_ProfessionalTimeOff_professional_id_idx"
  ON "AgendaBot_ProfessionalTimeOff"("professional_id");
CREATE INDEX "AgendaBot_ProfessionalTimeOff_dates_idx"
  ON "AgendaBot_ProfessionalTimeOff"("start_date", "end_date");

-- -----------------------------------------------------------------------------
-- 8. SERVICE CATEGORY
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_ServiceCategory" (
  "id"         TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"  TEXT         NOT NULL,
  "name"       TEXT         NOT NULL,
  "color"      TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_ServiceCategory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_ServiceCategory_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE
);

CREATE INDEX "AgendaBot_ServiceCategory_tenant_id_idx" ON "AgendaBot_ServiceCategory"("tenant_id");

-- -----------------------------------------------------------------------------
-- 9. SERVICE
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_Service" (
  "id"               TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"        TEXT        NOT NULL,
  "category_id"      TEXT,
  "name"             TEXT        NOT NULL,
  "description"      TEXT,
  "duration_minutes" INTEGER     NOT NULL,
  "price"            DECIMAL(10,2) NOT NULL,
  "image_url"        TEXT,
  "is_active"        BOOLEAN     NOT NULL DEFAULT TRUE,
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at"       TIMESTAMP(3),
  CONSTRAINT "AgendaBot_Service_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_Service_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "AgendaBot_Service_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "AgendaBot_ServiceCategory"("id") ON DELETE SET NULL
);

CREATE INDEX "AgendaBot_Service_tenant_id_idx" ON "AgendaBot_Service"("tenant_id");
CREATE INDEX "AgendaBot_Service_category_id_idx" ON "AgendaBot_Service"("category_id");
CREATE INDEX "AgendaBot_Service_is_active_idx" ON "AgendaBot_Service"("is_active");

-- -----------------------------------------------------------------------------
-- 10. PROFESSIONAL SERVICE (N:M)
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_ProfessionalService" (
  "professional_id" TEXT          NOT NULL,
  "service_id"      TEXT          NOT NULL,
  "custom_price"    DECIMAL(10,2),
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_ProfessionalService_pkey" PRIMARY KEY ("professional_id", "service_id"),
  CONSTRAINT "AgendaBot_ProfessionalService_professional_id_fkey"
    FOREIGN KEY ("professional_id") REFERENCES "AgendaBot_Professional"("id") ON DELETE CASCADE,
  CONSTRAINT "AgendaBot_ProfessionalService_service_id_fkey"
    FOREIGN KEY ("service_id") REFERENCES "AgendaBot_Service"("id") ON DELETE CASCADE
);

CREATE INDEX "AgendaBot_ProfessionalService_service_id_idx"
  ON "AgendaBot_ProfessionalService"("service_id");

-- -----------------------------------------------------------------------------
-- 11. CLIENT
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_Client" (
  "id"               TEXT                       NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"        TEXT                       NOT NULL,
  "name"             TEXT                       NOT NULL,
  "phone"            TEXT,
  "email"            TEXT,
  "birthdate"        DATE,
  "avatar_url"       TEXT,
  "notes"            TEXT,
  "whatsapp_consent" "AgendaBot_WhatsappConsent" NOT NULL DEFAULT 'PENDING',
  "consent_date"     TIMESTAMP(3),
  "total_visits"     INTEGER                    NOT NULL DEFAULT 0,
  "total_spent"      DECIMAL(10,2)              NOT NULL DEFAULT 0,
  "loyalty_points"   INTEGER                    NOT NULL DEFAULT 0,
  "is_active"        BOOLEAN                    NOT NULL DEFAULT TRUE,
  "created_at"       TIMESTAMP(3)               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3)               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at"       TIMESTAMP(3),
  CONSTRAINT "AgendaBot_Client_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_Client_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "AgendaBot_Client_tenant_id_phone_key" ON "AgendaBot_Client"("tenant_id", "phone");
CREATE INDEX "AgendaBot_Client_tenant_id_idx" ON "AgendaBot_Client"("tenant_id");
CREATE INDEX "AgendaBot_Client_phone_idx" ON "AgendaBot_Client"("phone");
CREATE INDEX "AgendaBot_Client_email_idx" ON "AgendaBot_Client"("email");
CREATE INDEX "AgendaBot_Client_whatsapp_consent_idx" ON "AgendaBot_Client"("whatsapp_consent");

-- -----------------------------------------------------------------------------
-- 12. APPOINTMENT
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_Appointment" (
  "id"               TEXT                        NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"        TEXT                        NOT NULL,
  "client_id"        TEXT                        NOT NULL,
  "professional_id"  TEXT                        NOT NULL,
  "service_id"       TEXT                        NOT NULL,
  "scheduled_at"     TIMESTAMP(3)                NOT NULL,
  "end_at"           TIMESTAMP(3)                NOT NULL,
  "duration_minutes" INTEGER                     NOT NULL,
  "status"           "AgendaBot_AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  "price"            DECIMAL(10,2)               NOT NULL,
  "deposit_amount"   DECIMAL(10,2),
  "deposit_paid"     BOOLEAN                     NOT NULL DEFAULT FALSE,
  "notes"            TEXT,
  "cancelled_reason" TEXT,
  "cancelled_at"     TIMESTAMP(3),
  "booked_via"       "AgendaBot_BookedVia"       NOT NULL DEFAULT 'MANUAL',
  "created_by"       TEXT,
  "created_at"       TIMESTAMP(3)                NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3)                NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_Appointment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_Appointment_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "AgendaBot_Appointment_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "AgendaBot_Client"("id") ON DELETE RESTRICT,
  CONSTRAINT "AgendaBot_Appointment_professional_id_fkey"
    FOREIGN KEY ("professional_id") REFERENCES "AgendaBot_Professional"("id") ON DELETE RESTRICT,
  CONSTRAINT "AgendaBot_Appointment_service_id_fkey"
    FOREIGN KEY ("service_id") REFERENCES "AgendaBot_Service"("id") ON DELETE RESTRICT,
  CONSTRAINT "AgendaBot_Appointment_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "AgendaBot_User"("id") ON DELETE SET NULL
);

CREATE INDEX "AgendaBot_Appointment_tenant_id_idx" ON "AgendaBot_Appointment"("tenant_id");
CREATE INDEX "AgendaBot_Appointment_client_id_idx" ON "AgendaBot_Appointment"("client_id");
CREATE INDEX "AgendaBot_Appointment_professional_id_idx" ON "AgendaBot_Appointment"("professional_id");
CREATE INDEX "AgendaBot_Appointment_service_id_idx" ON "AgendaBot_Appointment"("service_id");
CREATE INDEX "AgendaBot_Appointment_scheduled_at_idx" ON "AgendaBot_Appointment"("scheduled_at");
CREATE INDEX "AgendaBot_Appointment_status_idx" ON "AgendaBot_Appointment"("status");
CREATE INDEX "AgendaBot_Appointment_tenant_scheduled_idx" ON "AgendaBot_Appointment"("tenant_id", "scheduled_at");
CREATE INDEX "AgendaBot_Appointment_tenant_status_idx" ON "AgendaBot_Appointment"("tenant_id", "status");

-- -----------------------------------------------------------------------------
-- 13. APPOINTMENT LOG
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_AppointmentLog" (
  "id"             TEXT                          NOT NULL DEFAULT gen_random_uuid()::text,
  "appointment_id" TEXT                          NOT NULL,
  "changed_by"     TEXT,
  "old_status"     "AgendaBot_AppointmentStatus",
  "new_status"     "AgendaBot_AppointmentStatus",
  "note"           TEXT,
  "created_at"     TIMESTAMP(3)                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_AppointmentLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_AppointmentLog_appointment_id_fkey"
    FOREIGN KEY ("appointment_id") REFERENCES "AgendaBot_Appointment"("id") ON DELETE CASCADE,
  CONSTRAINT "AgendaBot_AppointmentLog_changed_by_fkey"
    FOREIGN KEY ("changed_by") REFERENCES "AgendaBot_User"("id") ON DELETE SET NULL
);

CREATE INDEX "AgendaBot_AppointmentLog_appointment_id_idx" ON "AgendaBot_AppointmentLog"("appointment_id");
CREATE INDEX "AgendaBot_AppointmentLog_changed_by_idx" ON "AgendaBot_AppointmentLog"("changed_by");

-- -----------------------------------------------------------------------------
-- 14. TRANSACTION
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_Transaction" (
  "id"              TEXT                          NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"       TEXT                          NOT NULL,
  "appointment_id"  TEXT,
  "professional_id" TEXT,
  "type"            "AgendaBot_TransactionType"   NOT NULL,
  "category"        TEXT,
  "description"     TEXT,
  "amount"          DECIMAL(10,2)                 NOT NULL,
  "payment_method"  "AgendaBot_PaymentMethod",
  "status"          "AgendaBot_TransactionStatus" NOT NULL DEFAULT 'PENDING',
  "paid_at"         TIMESTAMP(3),
  "due_at"          TIMESTAMP(3),
  "created_by"      TEXT,
  "created_at"      TIMESTAMP(3)                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_Transaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_Transaction_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "AgendaBot_Transaction_appointment_id_fkey"
    FOREIGN KEY ("appointment_id") REFERENCES "AgendaBot_Appointment"("id") ON DELETE SET NULL,
  CONSTRAINT "AgendaBot_Transaction_professional_id_fkey"
    FOREIGN KEY ("professional_id") REFERENCES "AgendaBot_Professional"("id") ON DELETE SET NULL,
  CONSTRAINT "AgendaBot_Transaction_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "AgendaBot_User"("id") ON DELETE SET NULL
);

CREATE INDEX "AgendaBot_Transaction_tenant_id_idx" ON "AgendaBot_Transaction"("tenant_id");
CREATE INDEX "AgendaBot_Transaction_appointment_id_idx" ON "AgendaBot_Transaction"("appointment_id");
CREATE INDEX "AgendaBot_Transaction_professional_id_idx" ON "AgendaBot_Transaction"("professional_id");
CREATE INDEX "AgendaBot_Transaction_type_idx" ON "AgendaBot_Transaction"("type");
CREATE INDEX "AgendaBot_Transaction_status_idx" ON "AgendaBot_Transaction"("status");
CREATE INDEX "AgendaBot_Transaction_paid_at_idx" ON "AgendaBot_Transaction"("paid_at");
CREATE INDEX "AgendaBot_Transaction_tenant_paid_idx" ON "AgendaBot_Transaction"("tenant_id", "paid_at");

-- -----------------------------------------------------------------------------
-- 15. CASH REGISTER
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_CashRegister" (
  "id"              TEXT          NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"       TEXT          NOT NULL,
  "date"            DATE          NOT NULL,
  "opened_by"       TEXT,
  "closed_by"       TEXT,
  "opening_balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "closing_balance" DECIMAL(10,2),
  "total_income"    DECIMAL(10,2) NOT NULL DEFAULT 0,
  "total_expense"   DECIMAL(10,2) NOT NULL DEFAULT 0,
  "opened_at"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closed_at"       TIMESTAMP(3),
  "notes"           TEXT,
  CONSTRAINT "AgendaBot_CashRegister_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_CashRegister_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "AgendaBot_CashRegister_opened_by_fkey"
    FOREIGN KEY ("opened_by") REFERENCES "AgendaBot_User"("id") ON DELETE SET NULL,
  CONSTRAINT "AgendaBot_CashRegister_closed_by_fkey"
    FOREIGN KEY ("closed_by") REFERENCES "AgendaBot_User"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX "AgendaBot_CashRegister_tenant_id_date_key"
  ON "AgendaBot_CashRegister"("tenant_id", "date");
CREATE INDEX "AgendaBot_CashRegister_tenant_id_idx" ON "AgendaBot_CashRegister"("tenant_id");
CREATE INDEX "AgendaBot_CashRegister_date_idx" ON "AgendaBot_CashRegister"("date");

-- -----------------------------------------------------------------------------
-- 16. COMMISSION
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_Commission" (
  "id"              TEXT                       NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"       TEXT                       NOT NULL,
  "professional_id" TEXT                       NOT NULL,
  "appointment_id"  TEXT,
  "transaction_id"  TEXT,
  "amount"          DECIMAL(10,2)              NOT NULL,
  "percent"         DECIMAL(5,2)               NOT NULL,
  "status"          "AgendaBot_CommissionStatus" NOT NULL DEFAULT 'PENDING',
  "paid_at"         TIMESTAMP(3),
  "created_at"      TIMESTAMP(3)               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_Commission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_Commission_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "AgendaBot_Commission_professional_id_fkey"
    FOREIGN KEY ("professional_id") REFERENCES "AgendaBot_Professional"("id") ON DELETE RESTRICT,
  CONSTRAINT "AgendaBot_Commission_appointment_id_fkey"
    FOREIGN KEY ("appointment_id") REFERENCES "AgendaBot_Appointment"("id") ON DELETE SET NULL,
  CONSTRAINT "AgendaBot_Commission_transaction_id_fkey"
    FOREIGN KEY ("transaction_id") REFERENCES "AgendaBot_Transaction"("id") ON DELETE SET NULL
);

CREATE INDEX "AgendaBot_Commission_tenant_id_idx" ON "AgendaBot_Commission"("tenant_id");
CREATE INDEX "AgendaBot_Commission_professional_id_idx" ON "AgendaBot_Commission"("professional_id");
CREATE INDEX "AgendaBot_Commission_appointment_id_idx" ON "AgendaBot_Commission"("appointment_id");
CREATE INDEX "AgendaBot_Commission_status_idx" ON "AgendaBot_Commission"("status");

-- -----------------------------------------------------------------------------
-- 17. CHATBOT CONFIG
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_ChatbotConfig" (
  "id"                   TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"            TEXT    NOT NULL,
  "whatsapp_number"      TEXT,
  "instance_name"        TEXT,
  "is_active"            BOOLEAN NOT NULL DEFAULT FALSE,
  "welcome_message"      TEXT,
  "menu_message"         TEXT,
  "confirmation_message" TEXT,
  "reminder_24h_message" TEXT,
  "reminder_2h_message"  TEXT,
  "post_service_message" TEXT,
  "out_of_hours_message" TEXT,
  "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_ChatbotConfig_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_ChatbotConfig_tenant_id_key" UNIQUE ("tenant_id"),
  CONSTRAINT "AgendaBot_ChatbotConfig_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 18. CONVERSATION
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_Conversation" (
  "id"             TEXT                         NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"      TEXT                         NOT NULL,
  "client_id"      TEXT,
  "phone"          TEXT                         NOT NULL,
  "status"         "AgendaBot_ConversationStatus" NOT NULL DEFAULT 'BOT',
  "assigned_to"    TEXT,
  "last_message_at" TIMESTAMP(3),
  "created_at"     TIMESTAMP(3)                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_Conversation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_Conversation_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "AgendaBot_Conversation_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "AgendaBot_Client"("id") ON DELETE SET NULL,
  CONSTRAINT "AgendaBot_Conversation_assigned_to_fkey"
    FOREIGN KEY ("assigned_to") REFERENCES "AgendaBot_User"("id") ON DELETE SET NULL
);

CREATE INDEX "AgendaBot_Conversation_tenant_id_idx" ON "AgendaBot_Conversation"("tenant_id");
CREATE INDEX "AgendaBot_Conversation_client_id_idx" ON "AgendaBot_Conversation"("client_id");
CREATE INDEX "AgendaBot_Conversation_phone_idx" ON "AgendaBot_Conversation"("phone");
CREATE INDEX "AgendaBot_Conversation_status_idx" ON "AgendaBot_Conversation"("status");
CREATE INDEX "AgendaBot_Conversation_last_message_at_idx" ON "AgendaBot_Conversation"("last_message_at");

-- -----------------------------------------------------------------------------
-- 19. MESSAGE
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_Message" (
  "id"              TEXT                       NOT NULL DEFAULT gen_random_uuid()::text,
  "conversation_id" TEXT                       NOT NULL,
  "direction"       "AgendaBot_MessageDirection" NOT NULL,
  "content"         TEXT                       NOT NULL,
  "type"            "AgendaBot_MessageType"    NOT NULL DEFAULT 'TEXT',
  "whatsapp_id"     TEXT,
  "sent_at"         TIMESTAMP(3),
  "delivered_at"    TIMESTAMP(3),
  "read_at"         TIMESTAMP(3),
  "created_at"      TIMESTAMP(3)               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_Message_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_Message_conversation_id_fkey"
    FOREIGN KEY ("conversation_id") REFERENCES "AgendaBot_Conversation"("id") ON DELETE CASCADE
);

CREATE INDEX "AgendaBot_Message_conversation_id_idx" ON "AgendaBot_Message"("conversation_id");
CREATE INDEX "AgendaBot_Message_whatsapp_id_idx" ON "AgendaBot_Message"("whatsapp_id");
CREATE INDEX "AgendaBot_Message_created_at_idx" ON "AgendaBot_Message"("created_at");

-- -----------------------------------------------------------------------------
-- 20. LOYALTY CONFIG
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_LoyaltyConfig" (
  "id"             TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"      TEXT         NOT NULL,
  "is_active"      BOOLEAN      NOT NULL DEFAULT FALSE,
  "points_per_real" DECIMAL(8,2) NOT NULL DEFAULT 1,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_LoyaltyConfig_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_LoyaltyConfig_tenant_id_key" UNIQUE ("tenant_id"),
  CONSTRAINT "AgendaBot_LoyaltyConfig_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 21. LOYALTY REWARD
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_LoyaltyReward" (
  "id"              TEXT                       NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"       TEXT                       NOT NULL,
  "name"            TEXT                       NOT NULL,
  "description"     TEXT,
  "points_required" INTEGER                    NOT NULL,
  "type"            "AgendaBot_LoyaltyRewardType" NOT NULL,
  "value"           DECIMAL(10,2)              NOT NULL,
  "is_active"       BOOLEAN                    NOT NULL DEFAULT TRUE,
  "created_at"      TIMESTAMP(3)               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP(3)               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_LoyaltyReward_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_LoyaltyReward_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE
);

CREATE INDEX "AgendaBot_LoyaltyReward_tenant_id_idx" ON "AgendaBot_LoyaltyReward"("tenant_id");
CREATE INDEX "AgendaBot_LoyaltyReward_is_active_idx" ON "AgendaBot_LoyaltyReward"("is_active");

-- -----------------------------------------------------------------------------
-- 22. LOYALTY REDEMPTION
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_LoyaltyRedemption" (
  "id"             TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"      TEXT         NOT NULL,
  "client_id"      TEXT         NOT NULL,
  "reward_id"      TEXT         NOT NULL,
  "appointment_id" TEXT,
  "points_used"    INTEGER      NOT NULL,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_LoyaltyRedemption_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_LoyaltyRedemption_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "AgendaBot_LoyaltyRedemption_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "AgendaBot_Client"("id") ON DELETE RESTRICT,
  CONSTRAINT "AgendaBot_LoyaltyRedemption_reward_id_fkey"
    FOREIGN KEY ("reward_id") REFERENCES "AgendaBot_LoyaltyReward"("id") ON DELETE RESTRICT,
  CONSTRAINT "AgendaBot_LoyaltyRedemption_appointment_id_fkey"
    FOREIGN KEY ("appointment_id") REFERENCES "AgendaBot_Appointment"("id") ON DELETE SET NULL
);

CREATE INDEX "AgendaBot_LoyaltyRedemption_tenant_id_idx" ON "AgendaBot_LoyaltyRedemption"("tenant_id");
CREATE INDEX "AgendaBot_LoyaltyRedemption_client_id_idx" ON "AgendaBot_LoyaltyRedemption"("client_id");
CREATE INDEX "AgendaBot_LoyaltyRedemption_reward_id_idx" ON "AgendaBot_LoyaltyRedemption"("reward_id");

-- -----------------------------------------------------------------------------
-- 23. CAMPAIGN
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_Campaign" (
  "id"               TEXT                         NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"        TEXT                         NOT NULL,
  "name"             TEXT                         NOT NULL,
  "message_template" TEXT                         NOT NULL,
  "status"           "AgendaBot_CampaignStatus"   NOT NULL DEFAULT 'DRAFT',
  "filter_type"      "AgendaBot_CampaignFilterType" NOT NULL,
  "filter_value"     TEXT,
  "scheduled_at"     TIMESTAMP(3),
  "sent_at"          TIMESTAMP(3),
  "total_sent"       INTEGER                      NOT NULL DEFAULT 0,
  "total_responded"  INTEGER                      NOT NULL DEFAULT 0,
  "total_converted"  INTEGER                      NOT NULL DEFAULT 0,
  "created_by"       TEXT,
  "created_at"       TIMESTAMP(3)                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3)                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaBot_Campaign_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_Campaign_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "AgendaBot_Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "AgendaBot_Campaign_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "AgendaBot_User"("id") ON DELETE SET NULL
);

CREATE INDEX "AgendaBot_Campaign_tenant_id_idx" ON "AgendaBot_Campaign"("tenant_id");
CREATE INDEX "AgendaBot_Campaign_status_idx" ON "AgendaBot_Campaign"("status");
CREATE INDEX "AgendaBot_Campaign_scheduled_at_idx" ON "AgendaBot_Campaign"("scheduled_at");

-- -----------------------------------------------------------------------------
-- 24. CAMPAIGN RECIPIENT
-- -----------------------------------------------------------------------------

CREATE TABLE "AgendaBot_CampaignRecipient" (
  "id"           TEXT                       NOT NULL DEFAULT gen_random_uuid()::text,
  "campaign_id"  TEXT                       NOT NULL,
  "client_id"    TEXT                       NOT NULL,
  "phone"        TEXT                       NOT NULL,
  "status"       "AgendaBot_RecipientStatus" NOT NULL DEFAULT 'PENDING',
  "sent_at"      TIMESTAMP(3),
  "responded_at" TIMESTAMP(3),
  "converted_at" TIMESTAMP(3),
  CONSTRAINT "AgendaBot_CampaignRecipient_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgendaBot_CampaignRecipient_campaign_id_client_id_key"
    UNIQUE ("campaign_id", "client_id"),
  CONSTRAINT "AgendaBot_CampaignRecipient_campaign_id_fkey"
    FOREIGN KEY ("campaign_id") REFERENCES "AgendaBot_Campaign"("id") ON DELETE CASCADE,
  CONSTRAINT "AgendaBot_CampaignRecipient_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "AgendaBot_Client"("id") ON DELETE RESTRICT
);

CREATE INDEX "AgendaBot_CampaignRecipient_campaign_id_idx" ON "AgendaBot_CampaignRecipient"("campaign_id");
CREATE INDEX "AgendaBot_CampaignRecipient_client_id_idx" ON "AgendaBot_CampaignRecipient"("client_id");
CREATE INDEX "AgendaBot_CampaignRecipient_status_idx" ON "AgendaBot_CampaignRecipient"("status");

-- -----------------------------------------------------------------------------
-- Trigger: atualiza updated_at automaticamente
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenant_updated_at
  BEFORE UPDATE ON "AgendaBot_Tenant"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_updated_at
  BEFORE UPDATE ON "AgendaBot_User"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_professional_updated_at
  BEFORE UPDATE ON "AgendaBot_Professional"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_service_updated_at
  BEFORE UPDATE ON "AgendaBot_Service"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointment_updated_at
  BEFORE UPDATE ON "AgendaBot_Appointment"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_chatbot_config_updated_at
  BEFORE UPDATE ON "AgendaBot_ChatbotConfig"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_loyalty_config_updated_at
  BEFORE UPDATE ON "AgendaBot_LoyaltyConfig"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_loyalty_reward_updated_at
  BEFORE UPDATE ON "AgendaBot_LoyaltyReward"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_campaign_updated_at
  BEFORE UPDATE ON "AgendaBot_Campaign"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
