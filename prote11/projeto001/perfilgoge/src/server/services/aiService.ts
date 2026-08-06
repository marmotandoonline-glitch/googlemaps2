import { prisma } from '../lib/prisma';
import { bullMqSupported, getQueueAvailabilityMessage } from '../lib/redis';

export async function enqueueAiJob(payload: any, leadId?: string) {
  const job = await prisma.aIJob.create({
    data: {
      leadId: leadId || undefined,
      payload,
      status: 'queued',
    },
  });

  if (!bullMqSupported) {
    const error = getQueueAvailabilityMessage();
    return prisma.aIJob.update({
      where: { id: job.id },
      data: { status: 'failed', result: { error } },
    });
  }

  // Importação tardia: BullMQ só é carregado quando o Redis é compatível.
  const { aiQueue } = await import('../lib/queue');
  await aiQueue.add('process', { jobId: job.id }, { attempts: 3 });

  return job;
}
