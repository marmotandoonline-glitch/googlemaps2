import { PrismaClient, Prisma } from '@prisma/client';

const logLevel: Prisma.LogLevel[] = process.env.NODE_ENV === 'production'
  ? ['error', 'warn']
  : ['error', 'warn', 'info'];

export const prisma = new PrismaClient({
  log: logLevel,
});

// Graceful shutdown
const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
