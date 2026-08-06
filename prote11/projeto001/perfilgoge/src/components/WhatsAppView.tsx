import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, CheckCircle2, XCircle, Smartphone, Send, ShieldCheck, Power } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

export const WhatsAppView: React.FC = () => {
  const { apiFetch } = useAuth();
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'qr_ready' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await apiFetch('/api/whatsapp/status');
      const data = await res.json();
      setStatus(data.status);
      if (data.qrCodeDataUrl) setQrCode(data.qrCodeDataUrl);
      if (data.lastError) setError(data.lastError);
    } catch (err) {
      console.error('Erro ao verificar status do WhatsApp:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      if (status === 'connecting' || status === 'qr_ready') {
        fetchStatus();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [status]);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/whatsapp/connect', { method: 'POST' });
      const data = await res.json();
      setStatus(data.status);
      if (data.qrCodeDataUrl) setQrCode(data.qrCodeDataUrl);
      if (data.error) setError(data.error);
    } catch (err: any) {
      setError(err?.message || 'Erro ao iniciar conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/whatsapp/logout', { method: 'POST' });
      const data = await res.json();
      setStatus(data.status);
      setQrCode(null);
    } catch (err: any) {
      setError(err?.message || 'Erro ao desconectar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-emerald-500" size={24} /> Conexão WhatsApp Oficial (Baileys)
          </h2>
          <p className="text-xs text-slate-500">
            Escaneie o QR Code com o WhatsApp da sua agência para habilitar disparos automáticos e propostas em lote.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status === 'connected' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 size={14} /> Conectado
            </span>
          ) : status === 'qr_ready' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <RefreshCw size={14} className="animate-spin" /> Escaneie o QR Code
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <XCircle size={14} /> Desconectado
            </span>
          )}
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status & Actions Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" /> Status da Sessão Baileys
            </h3>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Protocolo:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Multi-Device Web JS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado Atual:</span>
                <span className="font-semibold uppercase text-indigo-600">{status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Servidor:</span>
                <span className="font-semibold text-emerald-600">Ativo na Render</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {status !== 'connected' ? (
              <button
                onClick={handleConnect}
                disabled={loading || status === 'connecting'}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading || status === 'connecting' ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Gerando QR Code...
                  </>
                ) : (
                  <>
                    <Smartphone size={16} /> Conectar WhatsApp (Gerar QR Code)
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Power size={16} /> Desconectar WhatsApp
              </button>
            )}

            <button
              onClick={fetchStatus}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} /> Atualizar Status
            </button>
          </div>
        </div>

        {/* QR Code Display Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Leitor de QR Code</h3>

          {status === 'connected' ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-12">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">WhatsApp Conectado com Sucesso!</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Seu número está pronto para disparar propostas comerciais automaticamente pelo PerfilPro.
              </p>
            </div>
          ) : qrCode ? (
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-inner inline-block">
                <img src={qrCode} alt="WhatsApp QR Code" className="w-56 h-56 object-contain mx-auto" />
              </div>
              <p className="text-[11px] text-slate-500">
                Abra o WhatsApp no seu celular &gt; Aparelhos Conectados &gt; Conectar Aparelho e escaneie este código.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 py-12 text-slate-400">
              <Smartphone size={48} className="stroke-1" />
              <p className="text-xs">Clique em "Conectar WhatsApp" para gerar o QR Code de acesso.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
