-- Fase 1: score versionado, consentimento, tarefas, tentativas e eventos.
-- Esta migração é incremental e não remove dados existentes.

ALTER TABLE "Lead"
  ADD COLUMN IF NOT EXISTS "scoreVersion" TEXT,
  ADD COLUMN IF NOT EXISTS "scoreDetails" JSONB,
  ADD COLUMN IF NOT EXISTS "scoreCalculatedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "LeadConsent" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "source" TEXT,
  "grantedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LeadConsent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LeadConsent_leadId_channel_purpose_idx"
  ON "LeadConsent"("leadId", "channel", "purpose");

CREATE TABLE IF NOT EXISTS "LeadTask" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LeadTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LeadTask_status_dueAt_idx" ON "LeadTask"("status", "dueAt");
CREATE INDEX IF NOT EXISTS "LeadTask_leadId_type_status_idx" ON "LeadTask"("leadId", "type", "status");

CREATE TABLE IF NOT EXISTS "WhatsAppAttempt" (
  "idempotencyKey" TEXT NOT NULL,
  "leadId" TEXT,
  "phone" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "approvedAt" TIMESTAMP(3),
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "sentAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "error" TEXT,
  "providerId" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WhatsAppAttempt_pkey" PRIMARY KEY ("idempotencyKey")
);

CREATE INDEX IF NOT EXISTS "WhatsAppAttempt_status_scheduledAt_idx"
  ON "WhatsAppAttempt"("status", "scheduledAt");
CREATE INDEX IF NOT EXISTS "WhatsAppAttempt_leadId_createdAt_idx"
  ON "WhatsAppAttempt"("leadId", "createdAt");

CREATE TABLE IF NOT EXISTS "DomainEvent" (
  "id" TEXT NOT NULL,
  "leadId" TEXT,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "payload" JSONB NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "error" TEXT,
  CONSTRAINT "DomainEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DomainEvent_status_occurredAt_idx" ON "DomainEvent"("status", "occurredAt");
CREATE INDEX IF NOT EXISTS "DomainEvent_leadId_occurredAt_idx" ON "DomainEvent"("leadId", "occurredAt");

DO $$ BEGIN
  ALTER TABLE "LeadConsent" ADD CONSTRAINT "LeadConsent_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "LeadTask" ADD CONSTRAINT "LeadTask_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "WhatsAppAttempt" ADD CONSTRAINT "WhatsAppAttempt_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "DomainEvent" ADD CONSTRAINT "DomainEvent_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
