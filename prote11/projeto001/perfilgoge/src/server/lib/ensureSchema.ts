import { prisma } from './prisma';

/**
 * Compatibilidade para bancos antigos que foram criados antes das migrações
 * financeiras. ADD COLUMN IF NOT EXISTS é seguro em cada reinicialização.
 */
export async function ensureProductionSchema() {
  await prisma.$executeRawUnsafe('ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "estimatedLoss" INTEGER');
  await prisma.$executeRawUnsafe('ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "financialExplanation" TEXT');
}
