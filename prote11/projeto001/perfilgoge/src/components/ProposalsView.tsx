import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Video,
  Copy,
  Check,
  Phone,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Star,
  Zap,
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

  // Generate conditional WhatsApp proposal text based on website & Google business deficiencies + Financial Leakage
  const generateDefaultMsg = (lead: Lead | null) => {
    if (!lead) return '';
    const name = lead.name;
    const city = lead.city;
    const score = lead.score;
    const hasWebsite = Boolean(lead.website && lead.website.length > 5);
    const mainPain = lead.diagnostic?.details.find((d) => d.status === 'critical')?.issue || 'Perfil incompleto';
    const lossFormatted = lead.estimatedLoss
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.estimatedLoss)
      : 'R$ 4.500';

    if (!hasWebsite) {
      return `Olá! Tudo bem? Me chamo Déric, da agência PerfilPro.

Fiz um raio-x digital da *${name}* em ${city} e identificamos que vocês estão deixando de faturar aproximadamente **${lossFormatted}/mês** para concorrentes mais bem posicionados no Google.

Motivos principais:
1️⃣ **Google Meu Negócio:** Score ${score}/100 (${mainPain}).
2️⃣ **Ausência de Site Profissional:** Sem landing page para capturar os clientes que buscam no celular.

Preparamos uma estratégia matadora combinando o **Posicionamento no Top 3 do Google Empresas + Criação de Landing Page Profissional**.

Gravei um vídeo rápido explicando os números:
🔗 ${videoUrl}

Podemos bater um papo de 5 minutos sobre isso?`;
    } else {
      return `Olá! Tudo bem? Me chamo Déric, da agência PerfilPro.

Fiz um raio-x digital da *${name}* em ${city}. Vi que vocês já possuem site (ótimo!), mas por estarem fora do Top 3 do Google Maps, estimamos que estão perdendo cerca de **${lossFormatted}/mês** em pacientes/clientes para a concorrência.
⚠️ **Ponto crítico no perfil:** ${mainPain} (Score ${score}/100).

Preparamos um plano focado exclusivamente em **Otimização Avançada e Gestão do Google Meu Negócio** para recuperar esse faturamento.

Gravei um vídeo mostrando a análise:
🔗 ${videoUrl}

Podemos bater um papo rápido de 5 minutos sobre isso?`;
    }
  };

  const [message, setMessage] = useState(generateDefaultMsg(currentLead));

  // Sync message when selected lead changes
  React.useEffect(() => {
    if (currentLead) {
      setVideoUrl(currentLead.videoUrl || 'https://youtube.com/watch?v=demo123');
      setMessage(currentLead.customProposalMsg || generateDefaultMsg(currentLead));
    }
  }, [currentLead?.id]);

  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = leads.find((l) => l.id === e.target.value);
    if (found) {
      onSelectLead(found);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    if (!currentLead) return;
    // Clean phone number (remove non-digits)
    const phoneDigits = currentLead.phone.replace(/\D/g, '');
    const cleanPhone = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;
    const encodedText = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    // Save proposal to lead state
    onUpdateProposalMsg(currentLead.id, message, videoUrl);

    window.open(waUrl, '_blank');
  };

  if (!currentLead) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        Nenhum lead disponível para gerar proposta. Adicione leads via Lead Finder primeiro.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Lead Switcher */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="text-amber-500" size={22} /> Gerador de Propostas WhatsApp
            </h2>
            <p className="text-xs text-slate-500">
              Prepare mensagens altamente conversivas com diagnóstico personalizado e link pré-preenchido do WhatsApp.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Selecionar Lead:
            </label>
            <select
              value={currentLead.id}
              onChange={handleLeadChange}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.city} - Score {l.score})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Composer vs Live Phone Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Customizer & Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Editar Conteúdo da Mensagem</h3>
            <button
              onClick={() => setMessage(generateDefaultMsg(currentLead))}
              className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Sparkles size={12} /> Restaurar Template Padrão
            </button>
          </div>

          {/* Lead Snapshot */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">{currentLead.name}</span>
              <p className="text-slate-500">
                {currentLead.phone || 'Sem telefone'} • {currentLead.category}
              </p>
            </div>
            <span
              className={`font-extrabold px-2.5 py-1 rounded-md text-xs ${
                currentLead.score < 50 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              Score {currentLead.score}/100
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link do Vídeo Diagnóstico (YouTube / Loom)
            </label>
            <div className="relative">
              <Video size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  const newMsg = message.replace(/🔗 .*/, `🔗 ${e.target.value}\n\nPodemos bater um papo rápido de 5 minutos sobre isso?`);
                  setMessage(newMsg);
                }}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Corpo da Mensagem (Suporta Formatação WhatsApp *negrito* e _itálico_)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 flex-1"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-500" /> Mensagem Copiada!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copiar Texto
                </>
              )}
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center justify-center gap-2 flex-1"
            >
              <Send size={16} /> Abrir WhatsApp Web
            </button>
          </div>
        </div>

        {/* Right Column: Live Phone WhatsApp Mockup */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Visualização em Tempo Real (WhatsApp)
          </span>

          {/* Smartphone Frame */}
          <div className="w-full max-w-sm bg-slate-900 rounded-[35px] border-4 border-slate-700 p-3 shadow-2xl relative overflow-hidden">
            {/* Phone Notch */}
            <div className="w-32 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2" />

            {/* Chat Header */}
            <div className="bg-emerald-800 text-white p-2.5 rounded-t-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-xs">
                  {currentLead.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-none">{currentLead.name}</h4>
                  <span className="text-[10px] text-emerald-200">Online no WhatsApp</span>
                </div>
              </div>
              <Phone size={14} />
            </div>

            {/* Chat Message Bubble */}
            <div className="bg-[#e5ddd5] dark:bg-slate-800 p-4 rounded-b-xl min-h-[360px] flex flex-col justify-between space-y-4">
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 rounded-lg shadow-sm text-xs space-y-2 relative self-start max-w-[90%] font-sans">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.split('*').map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </p>
                <div className="text-[10px] text-slate-400 text-right">09:30 ✓✓</div>
              </div>

              <div className="text-center">
                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                  Pronto para envio sem automação direta (Respeita Diretrizes)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
