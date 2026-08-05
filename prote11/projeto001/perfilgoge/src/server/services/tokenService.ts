import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export async function createPortalToken(leadId: string, ttlHours = 168) {
  const token = uuidv4();
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000);
  await prisma.portalToken.create({ data: { leadId, tokenHash: hash, expiresAt } });
  return { token, expiresAt };
}

export async function validatePortalToken(token: string) {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const rec = await prisma.portalToken.findUnique({ where: { tokenHash: hash } });
  if (!rec) return null;
  if (rec.expiresAt < new Date()) return null;
  return rec;
}
