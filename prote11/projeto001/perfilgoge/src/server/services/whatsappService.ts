import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode';
import path from 'path';
import fs from 'fs';

let sock: any = null;
let qrCodeDataUrl: string | null = null;
let connectionStatus: 'disconnected' | 'connecting' | 'qr_ready' | 'connected' = 'disconnected';
let lastError: string | null = null;

const authFolder = path.resolve(process.cwd(), 'baileys_auth_info');

export async function startWhatsAppSession() {
  if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
    return { status: connectionStatus, qrCodeDataUrl };
  }

  connectionStatus = 'connecting';
  qrCodeDataUrl = null;
  lastError = null;

  try {
    if (!fs.existsSync(authFolder)) {
      fs.mkdirSync(authFolder, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['PerfilPro SaaS', 'Chrome', '10.0'],
    });

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          qrCodeDataUrl = await qrcode.toDataURL(qr);
          connectionStatus = 'qr_ready';
          console.log('📱 QR Code do WhatsApp gerado com sucesso!');
        } catch (err) {
          console.error('Erro ao gerar QR Code image:', err);
        }
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log('Conexão WhatsApp fechada. Motivo:', lastDisconnect?.error, 'Reconectar:', shouldReconnect);
        
        connectionStatus = 'disconnected';
        qrCodeDataUrl = null;
        sock = null;

        if (shouldReconnect) {
          setTimeout(() => startWhatsAppSession(), 3000);
        }
      } else if (connection === 'open') {
        console.log('✅ WhatsApp conectado com sucesso!');
        connectionStatus = 'connected';
        qrCodeDataUrl = null;
        lastError = null;
      }
    });

    sock.ev.on('creds.update', saveCreds);

    return { status: connectionStatus, qrCodeDataUrl };
  } catch (err: any) {
    console.error('Erro ao iniciar sessão WhatsApp:', err);
    connectionStatus = 'disconnected';
    lastError = err?.message || 'Erro desconhecido';
    return { status: connectionStatus, error: lastError };
  }
}

export function getWhatsAppStatus() {
  return {
    status: connectionStatus,
    qrCodeDataUrl,
    lastError,
  };
}

export async function disconnectWhatsApp() {
  try {
    if (sock) {
      await sock.logout();
      sock.end(undefined);
    }
    sock = null;
    qrCodeDataUrl = null;
    connectionStatus = 'disconnected';
    
    // Clean auth folder
    if (fs.existsSync(authFolder)) {
      fs.rmSync(authFolder, { recursive: true, force: true });
    }

    return { success: true, status: 'disconnected' };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function sendWhatsAppMessage(phone: string, text: string) {
  if (!sock || connectionStatus !== 'connected') {
    throw new Error('WhatsApp não está conectado. Escaneie o QR Code primeiro.');
  }

  // Clean phone number: remove non-digits
  const cleanPhone = phone.replace(/\D/g, '');
  const jid = `${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}@s.whatsapp.net`;

  const sent = await sock.sendMessage(jid, { text });
  return { success: true, messageId: sent?.key?.id };
}
