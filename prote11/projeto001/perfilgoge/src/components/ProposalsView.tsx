import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Video,
} from 'lucide-react';
import { Lead } from '../types';

interface ProposalsViewProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
  onUpdateProposalMsg: (leadId: string, customMsg: string, videoUrl: string) => void;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({
  leads,
  selectedLead,
  onSelectLead,
  onUpdateProposalMsg,
}) => {
  const currentLead = selectedLead || leads[0];
  const [videoUrl, setVideoUrl] = useState(currentLead?.videoUrl || 'https://youtube.com/watch?v=demo123');
  const [copied, setCopied] = useState(false);

  const generateDefaultMsg = (lead: Lead | null) => {
    if (!lead) return '';
    return `Olá, ${lead.name}! Analisei o perfil de vocês no Google Maps e identificamos oportunidades de crescimento em ${lead.city}. Preparamos um diagnóstico exclusivo: ${window.location.origin}/portal/${(lead as any).portalToken || 'demo'}`;
  };

  const [message, setMessage] = useState(currentLead?.customProposalMsg || generateDefaultMsg(currentLead));

  React.useEffect(() => {
    if (currentLead) {
      setVideoUrl(currentLead.videoUrl || 'https://youtube.com/watch?v=demo123');
      setMessage(currentLead.customProposalMsg || generateDefaultMsg(currentLead));
    }
  }, [currentLead?.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    if (!currentLead) return;
    const phoneDigits = (currentLead.phone || '11999999999').replace(/\D/g, '');
    const cleanPhone = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;
    const encodedText = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    onUpdateProposalMsg(currentLead.id, message, videoUrl);
    window.open(waUrl, '_blank');
  };

  if (!currentLead) {
    return (
      <div className="p-12 text-center text-[#8A8AA3] bg-white rounded-[20px] border border-[#E7E7F1]">
        Nenhum lead disponível para gerar proposta.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[20px] border border-[#E7E7F1] shadow-2xs space-y-4">
        <h2 className="text-xl font-semibold text-[#16162B] flex items-center gap-2">
          <MessageSquare size={20} className="text-[#5B4FE9]" /> Gerador de Propostas WhatsApp
        </h2>
        <p className="text-xs text-[#8A8AA3]">
          Prepare mensagens comerciais com diagnóstico personalizado e link pré-preenchido do WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[20px] border border-[#E7E7F1] shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#E7E7F1]">
            <h3 className="font-semibold text-sm text-[#16162B]">Editar Mensagem</h3>
            <select
              value={currentLead.id}
              onChange={(e) => {
                const found = leads.find((l) => l.id === e.target.value);
                if (found) onSelectLead(found);
              }}
              className="px-3 py-1.5 bg-[#ECEDF7]/50 border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B]"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{l.name} ({l.city})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#16162B] mb-1">Link do Vídeo Diagnóstico</label>
            <div className="relative">
              <Video size={14} className="absolute left-3.5 top-3 text-[#8A8AA3]" />
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#ECEDF7]/40 border border-[#E2E2EE] rounded-full text-xs text-[#16162B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#16162B] mb-1">Texto da Mensagem</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full p-4 bg-[#ECEDF7]/40 border border-[#E2E2EE] rounded-2xl text-xs text-[#16162B] font-mono"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="py-2.5 px-4 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] font-medium text-xs rounded-full transition-colors flex items-center justify-center gap-1.5 flex-1 shadow-2xs"
            >
              {copied ? <Check size={14} className="text-[#1F9254]" /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="py-2.5 px-4 bg-[#5B4FE9] hover:bg-[#4C3FDB] text-white font-medium text-xs rounded-full transition-all shadow-xs flex items-center justify-center gap-1.5 flex-1"
            >
              <Send size={14} /> Abrir WhatsApp Web
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-[#16162B] p-6 rounded-[20px] border border-[#2B2B48] flex flex-col items-center justify-center space-y-4">
          <span className="text-xs font-medium text-[#8A8AA3] uppercase tracking-wider">
            Visualização WhatsApp
          </span>
          <div className="w-full max-w-sm bg-white p-4 rounded-2xl shadow-lg text-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E7E7F1] pb-2 font-semibold text-[#16162B]">
              <div className="w-6 h-6 rounded-full bg-[#5B4FE9] text-white flex items-center justify-center text-[10px]">
                {currentLead.name[0]}
              </div>
              {currentLead.name}
            </div>
            <p className="whitespace-pre-wrap text-[#16162B] leading-relaxed font-sans">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
