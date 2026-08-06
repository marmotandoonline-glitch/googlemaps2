import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { enqueueAiJob } from '../services/aiService';

// POST /api/ai/generate -> enqueue job
export async function enqueueAiGeneration(req: Request, res: Response) {
  const { leadId, companyName, category, city, neighborhood, existingServices, clientNotes } = req.body || {};

  if (!companyName || !category) {
    return res.status(400).json({ error: 'companyName e category são obrigatórios.' });
  }

  const job = await enqueueAiJob(
    { companyName, category, city, neighborhood, existingServices, clientNotes },
    leadId || undefined,
  );

  res.status(202).json({ jobId: job.id, status: job.status });
}

export async function getAiJob(req: Request, res: Response) {
  const { id } = req.params;
  const job = await prisma.aIJob.findUnique({ where: { id } });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
}
