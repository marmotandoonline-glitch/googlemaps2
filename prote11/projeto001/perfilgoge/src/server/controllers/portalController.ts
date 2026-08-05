import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createPresignedPutUrl, makeKey } from '../services/uploadService';
import { validatePortalToken, createPortalToken } from '../services/tokenService';

// POST /api/client-portal/request-upload
export async function requestUpload(req: Request, res: Response) {
  const { token, files } = req.body || {};
  if (!token || !Array.isArray(files)) return res.status(400).json({ error: 'token and files array required' });

  const tokenRec = await validatePortalToken(token);
  if (!tokenRec) return res.status(401).json({ error: 'Invalid or expired token' });

  const bucket = process.env.S3_BUCKET || 'perfilpro-dev';
  const presigned = [] as any[];
  for (const f of files) {
    const key = makeKey(tokenRec.leadId || 'unknown', f.name.replace(/[^a-zA-Z0-9.\-_]/g, '_'));
    const url = await createPresignedPutUrl(bucket, key, f.type || 'application/octet-stream', 3600);
    presigned.push({ name: f.name, key, url });
  }
  res.json({ urls: presigned });
}

// POST /api/client-portal/complete
export async function completeUpload(req: Request, res: Response) {
  const { token, uploadedFiles, portalData } = req.body || {};
  if (!token || !Array.isArray(uploadedFiles)) return res.status(400).json({ error: 'token and uploadedFiles array required' });

  const tokenRec = await validatePortalToken(token);
  if (!tokenRec) return res.status(401).json({ error: 'Invalid or expired token' });

  // persist file references
  for (const f of uploadedFiles) {
    await prisma.file.create({ data: { leadId: tokenRec.leadId || undefined, key: f.key, url: f.url, mimeType: f.type || 'application/octet-stream' } as any });
  }

  // update lead
  await prisma.lead.update({ where: { id: tokenRec.leadId || '' }, data: { clientPortalData: portalData as any, stage: 'onboarding' } as any });

  await prisma.leadHistory.create({ data: { leadId: tokenRec.leadId || '', type: 'client_upload', description: 'Client uploaded files via portal' } });

  res.json({ success: true });
}
