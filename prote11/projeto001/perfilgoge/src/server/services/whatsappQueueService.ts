import { prisma } from '../lib/prisma';
import { sendWhatsAppMessage } from './whatsappService';

const MIN_DELAY_MS = Math.max(5_000, Number(process.env.WHATSAPP_MIN_DELAY_MS || 30_000));
const MAX_ATTEMPTS = Math.max(1, Number(process.env.WHATSAPP_MAX_ATTEMPTS || 3));

function normalizeIdempotencyKey(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9._:-]/g, '-').slice(0, 180);
}

export async function enqueueWhatsAppAttempt(params: {
  idempotencyKey: string;
  phone: string;
  text: string;
  leadId?: string;
}) {
  const idempotencyKey = normalizeIdempotencyKey(params.idempotencyKey);
  if (!idempotencyKey) throw new Error('idempotencyKey é obrigatório');
  if (!params.phone?.trim() || !params.text?.trim()) throw new Error('phone e text são obrigatórios');

  if (params.leadId) {
    const consent = await prisma.leadConsent.findUnique({
      where: { leadId_channel_purpose: { leadId: params.leadId, channel: 'whatsapp', purpose: 'prospecting' } },
    });
    if (consent?.status === 'revoked') throw new Error('Contato revogado para prospecção via WhatsApp');
    await prisma.leadConsent.upsert({
      where: { leadId_channel_purpose: { leadId: params.leadId, channel: 'whatsapp', purpose: 'prospecting' } },
      create: { leadId: params.leadId, channel: 'whatsapp', purpose: 'prospecting', status: 'pending', source: 'operator_approval' },
      update: {},
    });
  }

  const attempt = await prisma.whatsAppAttempt.upsert({
    where: { idempotencyKey },
    create: {
      idempotencyKey,
      phone: params.phone.trim(),
      text: params.text.trim(),
      leadId: params.leadId || null,
      scheduledAt: new Date(Date.now() + MIN_DELAY_MS),
      status: 'pending',
    },
    update: {},
  });
  if (params.leadId) {
    await prisma.domainEvent.create({
      data: { leadId: params.leadId, type: 'whatsapp_queued', payload: { idempotencyKey }, status: 'pending' },
    });
  }
  return attempt;
}

export async function approveWhatsAppAttempt(idempotencyKey: string) {
  const attempt = await prisma.whatsAppAttempt.findUnique({ where: { idempotencyKey } });
  if (!attempt) throw new Error('Tentativa de WhatsApp não encontrada');
  if (attempt.leadId) {
    const consent = await prisma.leadConsent.findUnique({
      where: { leadId_channel_purpose: { leadId: attempt.leadId, channel: 'whatsapp', purpose: 'prospecting' } },
    });
    if (consent?.status === 'revoked') throw new Error('Contato revogado para prospecção via WhatsApp');
  }
  if (attempt.status === 'sent') return attempt;
  if (attempt.status === 'cancelled') throw new Error('Tentativa cancelada não pode ser aprovada');

  const approved = await prisma.whatsAppAttempt.update({
    where: { idempotencyKey },
    data: {
      status: 'approved',
      approvedAt: new Date(),
      scheduledAt: new Date(Date.now() + MIN_DELAY_MS),
      error: null,
    },
  });
  if (approved.leadId) {
    await prisma.domainEvent.create({
      data: { leadId: approved.leadId, type: 'whatsapp_approved', payload: { idempotencyKey }, status: 'pending' },
    });
  }
  return approved;
}

export async function cancelWhatsAppAttempt(idempotencyKey: string) {
  return prisma.whatsAppAttempt.update({
    where: { idempotencyKey },
    data: { status: 'cancelled' },
  });
}

export async function processDueWhatsAppAttempt() {
  const candidate = await prisma.whatsAppAttempt.findFirst({
    where: {
      status: 'approved',
      scheduledAt: { lte: new Date() },
      attempts: { lt: MAX_ATTEMPTS },
    },
    orderBy: { scheduledAt: 'asc' },
  });
  if (!candidate) return null;

  const claimed = await prisma.whatsAppAttempt.updateMany({
    where: { idempotencyKey: candidate.idempotencyKey, status: 'approved' },
    data: { status: 'sending', attempts: { increment: 1 } },
  });
  if (claimed.count !== 1) return null;

  try {
    const sent = await sendWhatsAppMessage(candidate.phone, candidate.text);
    const completed = await prisma.whatsAppAttempt.update({
      where: { idempotencyKey: candidate.idempotencyKey },
      data: { status: 'sent', sentAt: new Date(), providerId: sent.messageId || null, error: null },
    });
    if (candidate.leadId) {
      await prisma.leadHistory.create({
        data: {
          leadId: candidate.leadId,
          type: 'whatsapp_sent',
          description: `Mensagem enviada via fila WhatsApp (${candidate.idempotencyKey})`,
        },
      });
    }
    return completed;
  } catch (error: any) {
    const nextStatus = candidate.attempts + 1 >= MAX_ATTEMPTS ? 'failed' : 'approved';
    return prisma.whatsAppAttempt.update({
      where: { idempotencyKey: candidate.idempotencyKey },
      data: {
        status: nextStatus,
        error: error?.message || 'Falha ao enviar mensagem',
        failedAt: new Date(),
        scheduledAt: new Date(Date.now() + MIN_DELAY_MS),
      },
    });
  }
}

export function startWhatsAppQueueWorker() {
  const interval = setInterval(() => {
    processDueWhatsAppAttempt().catch((error) => console.error('WhatsApp queue worker error:', error));
  }, Math.max(5_000, Number(process.env.WHATSAPP_QUEUE_POLL_MS || 15_000)));

  interval.unref?.();
  return interval;
}
