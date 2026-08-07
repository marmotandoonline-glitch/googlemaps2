import { Request, Response } from 'express';
import { startWhatsAppSession, getWhatsAppStatus, disconnectWhatsApp, sendWhatsAppMessage } from '../services/whatsappService';
import { approveWhatsAppAttempt, cancelWhatsAppAttempt, enqueueWhatsAppAttempt } from '../services/whatsappQueueService';
import { prisma } from '../lib/prisma';

export async function connectWhatsApp(req: Request, res: Response) {
  try {
    const result = await startWhatsAppSession();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erro ao conectar WhatsApp' });
  }
}

export async function statusWhatsApp(req: Request, res: Response) {
  try {
    const result = getWhatsAppStatus();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erro ao obter status do WhatsApp' });
  }
}

export async function logoutWhatsApp(req: Request, res: Response) {
  try {
    const result = await disconnectWhatsApp();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erro ao desconectar WhatsApp' });
  }
}

export async function queueMsgWhatsApp(req: Request, res: Response) {
  try {
    const { idempotencyKey, phone, text, leadId } = req.body || {};
    if (!idempotencyKey || !phone || !text) {
      return res.status(400).json({ error: 'idempotencyKey, phone e text são obrigatórios' });
    }
    const result = await enqueueWhatsAppAttempt({ idempotencyKey, phone, text, leadId });
    res.status(202).json({ success: true, attempt: result, requiresApproval: true });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Erro ao enfileirar mensagem WhatsApp' });
  }
}

export async function approveMsgWhatsApp(req: Request, res: Response) {
  try {
    const result = await approveWhatsAppAttempt(req.params.idempotencyKey);
    res.json({ success: true, attempt: result });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Erro ao aprovar mensagem WhatsApp' });
  }
}

export async function cancelMsgWhatsApp(req: Request, res: Response) {
  try {
    const result = await cancelWhatsAppAttempt(req.params.idempotencyKey);
    res.json({ success: true, attempt: result });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Erro ao cancelar mensagem WhatsApp' });
  }
}

export async function listWhatsAppAttempts(req: Request, res: Response) {
  const leadId = typeof req.query.leadId === 'string' ? req.query.leadId : undefined;
  const attempts = await prisma.whatsAppAttempt.findMany({
    where: leadId ? { leadId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(attempts);
}

export async function sendMsgWhatsApp(req: Request, res: Response) {
  try {
    const { phone, text } = req.body || {};
    if (!phone || !text) {
      return res.status(400).json({ error: 'phone e text são obrigatórios' });
    }
    const result = await sendWhatsAppMessage(phone, text);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erro ao enviar mensagem via WhatsApp' });
  }
}
