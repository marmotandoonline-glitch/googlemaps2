import { Request, Response } from 'express';
import { startWhatsAppSession, getWhatsAppStatus, disconnectWhatsApp, sendWhatsAppMessage } from '../services/whatsappService';

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
