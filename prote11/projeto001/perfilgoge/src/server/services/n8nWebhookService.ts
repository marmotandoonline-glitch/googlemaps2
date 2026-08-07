import crypto from 'node:crypto';
import { prisma } from '../lib/prisma';

const webhookUrl = process.env.N8N_WEBHOOK_URL?.trim();
const webhookSecret = process.env.N8N_WEBHOOK_SECRET?.trim();
const pollMs = Math.max(10_000, Number(process.env.N8N_WEBHOOK_POLL_MS || 30_000));

function signature(body: string) {
  return crypto.createHmac('sha256', webhookSecret || '').update(body).digest('hex');
}

export async function processPendingN8nEvent() {
  if (!webhookUrl || !webhookSecret) return null;
  const event = await prisma.domainEvent.findFirst({
    where: { status: 'pending', attempts: { lt: 5 } },
    orderBy: { occurredAt: 'asc' },
  });
  if (!event) return null;

  const claimed = await prisma.domainEvent.updateMany({
    where: { id: event.id, status: 'pending' },
    data: { status: 'sending', attempts: { increment: 1 } },
  });
  if (claimed.count !== 1) return null;

  const payload = JSON.stringify({
    id: event.id,
    type: event.type,
    leadId: event.leadId,
    payload: event.payload,
    occurredAt: event.occurredAt.toISOString(),
  });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-perfilpro-signature': signature(payload),
        'x-perfilpro-event': event.type,
      },
      body: payload,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`n8n respondeu HTTP ${response.status}`);
    return prisma.domainEvent.update({
      where: { id: event.id },
      data: { status: 'processed', processedAt: new Date(), error: null },
    });
  } catch (error: any) {
    return prisma.domainEvent.update({
      where: { id: event.id },
      data: {
        status: event.attempts + 1 >= 5 ? 'failed' : 'pending',
        error: error?.message || 'Falha no webhook n8n',
      },
    });
  }
}

export function startN8nWebhookWorker() {
  if (!webhookUrl || !webhookSecret) {
    console.log('ℹ️ n8n webhook worker desativado: configure N8N_WEBHOOK_URL e N8N_WEBHOOK_SECRET para ativá-lo.');
    return null;
  }
  const interval = setInterval(() => {
    processPendingN8nEvent().catch((error) => console.error('n8n webhook worker error:', error));
  }, pollMs);
  interval.unref?.();
  console.log(`🔗 n8n webhook worker enabled (${pollMs}ms polling)`);
  return interval;
}
