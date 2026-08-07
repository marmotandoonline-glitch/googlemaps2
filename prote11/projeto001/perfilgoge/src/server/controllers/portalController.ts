import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createPresignedPutUrl, makeKey } from '../services/uploadService';
import { validatePortalToken, createPortalToken } from '../services/tokenService';

// POST /api/client-portal/request-upload
// Validates token and returns presigned URLs for file upload to S3/MinIO
export async function requestUpload(req: Request, res: Response) {
  const { token, files } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Token is required' });

  const tokenRec = await validatePortalToken(token);
  if (!tokenRec) return res.status(401).json({ error: 'Invalid or expired token' });

  // If no files array provided, just validate the token (used for initial portal validation)
  if (!Array.isArray(files) || files.length === 0) {
    return res.json({ valid: true, leadId: tokenRec.leadId });
  }

  const bucket = process.env.S3_BUCKET || 'perfilpro-dev';
  const presigned = [] as any[];
  for (const f of files) {
    const key = makeKey(tokenRec.leadId || 'unknown', f.name.replace(/[^a-zA-Z0-9.\-_]/g, '_'));
    const url = await createPresignedPutUrl(bucket, key, f.type || 'application/octet-stream', 3600);
    presigned.push({ name: f.name, key, url });
  }
  res.json({ urls: presigned, leadId: tokenRec.leadId });
}

// POST /api/client-portal/complete
// Receives portal data from the client form and updates the lead
export async function completeUpload(req: Request, res: Response) {
  const { token, uploadedFiles, portalData } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Token is required' });

  const tokenRec = await validatePortalToken(token);
  if (!tokenRec) return res.status(401).json({ error: 'Invalid or expired token' });

  // If portalData is missing or empty, return error
  if (!portalData || typeof portalData !== 'object') {
    return res.status(400).json({ error: 'Portal data is required' });
  }

  const leadId = tokenRec.leadId || '';
  if (!leadId) {
    return res.status(400).json({ error: 'Lead not associated with this token' });
  }

  // Persist file references if uploadedFiles are provided
  if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
    for (const f of uploadedFiles) {
      if (f.key && f.url) {
        await prisma.file.create({
          data: {
            leadId,
            key: f.key,
            url: f.url,
            mimeType: f.type || 'application/octet-stream',
          } as any,
        }).catch((err) => {
          console.warn('Failed to create file record:', err);
        });
      }
    }
  }

  // Update lead with portal data and move to onboarding stage
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      clientPortalData: portalData as any,
      stage: 'onboarding',
    } as any,
  });

  await prisma.leadTask.create({
    data: {
      leadId,
      type: 'gbp_manager_invite',
      status: 'pending',
      title: 'Convidar gerente no Google Business Profile',
      description: 'Revisar os dados recebidos no Portal e enviar o convite de gerente no GBP somente após confirmação do operador e do cliente.',
      dueAt: new Date(),
      metadata: { requiresApproval: true, source: 'client_portal', portalData },
    },
  });
  await prisma.domainEvent.create({
    data: {
      leadId,
      type: 'portal_completed',
      payload: { nextAction: 'gbp_manager_invite', stage: 'onboarding' },
      status: 'pending',
    },
  });

  // Record history
  await prisma.leadHistory.create({
    data: {
      leadId,
      type: 'client_upload',
      description: 'Cliente enviou fotos, horários e informações através do Portal do Cliente.',
      fromStage: 'fechado',
      toStage: 'onboarding',
    },
  });

  res.json({ success: true, message: 'Dados recebidos com sucesso' });
}
