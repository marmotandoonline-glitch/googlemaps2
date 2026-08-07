-- Campos usados pelo fluxo de propostas no CRM.
-- A migração é incremental e não remove dados existentes.
ALTER TABLE "Lead"
  ADD COLUMN IF NOT EXISTS "videoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "customProposalMsg" TEXT;
