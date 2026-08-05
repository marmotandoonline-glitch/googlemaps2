import { prisma } from '../lib/prisma';
import { aiQueue } from '../lib/queue';

export async function enqueueAiJob(payload: any, leadId?: string) {
  const job = await prisma.aIJob.create({
    data: {
      leadId: leadId || undefined,
      payload,
      status: 'queued',
    },
  });

  // push to bullmq queue with reference to DB job id
  await aiQueue.add('process', { jobId: job.id }, { attempts: 3 });

  return job;
}
