import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// POST /api/ai/generate -> enqueue job
export async function enqueueAiGeneration(req: Request, res: Response) {
  const { leadId, companyName, category, city, neighborhood, existingServices, clientNotes } = req.body || {};

  const job = await prisma.aIJob.create({
    data: {
      leadId: leadId || undefined,
      payload: { companyName, category, city, neighborhood, existingServices, clientNotes },
      status: 'queued',
    },
  });

  // In a real system, we would also push to a queue like BullMQ here.

  res.status(202).json({ jobId: job.id, status: job.status });
}

export async function getAiJob(req: Request, res: Response) {
  const { id } = req.params;
  const job = await prisma.aIJob.findUnique({ where: { id } });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
}
