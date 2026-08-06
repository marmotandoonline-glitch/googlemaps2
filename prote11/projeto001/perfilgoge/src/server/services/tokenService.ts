import { prisma } from '../lib/prisma';
import crypto from 'crypto';

// Generate a cryptographically secure random UUID v4 without external dependency
function generateUUID(): string {
  return crypto.randomUUID();
}

export async function createPortalToken(leadId: string, ttlHours = 168) {
  // Generate a cryptographically secure token
  const token = generateUUID();
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000);

  await prisma.portalToken.create({
    data: {
      leadId,
      tokenHash: hash,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function validatePortalToken(token: string) {
  if (!token || typeof token !== 'string') return null;

  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const rec = await prisma.portalToken.findUnique({ where: { tokenHash: hash } });
  if (!rec) return null;

  // Check if token has expired
  if (rec.expiresAt < new Date()) return null;

  return rec;
}
