import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Video,
  Sparkles,
} from 'lucide-react';
import { Lead } from '../types';

interface ProposalsViewProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
  onUpdateProposalMsg: (leadId: string, customMsg: string, videoUrl: string) => void;
}

interface ProposalVideos {
  positioning: string;
  website: string;
}

const EMPTY_VIDEOS: ProposalVideos = { positioning: '', website: '' };

function parseProposalVideos(value?: string): ProposalVideos {
  if (!value) return EMPTY_VIDEOS;
  try {
    const parsed = JSON.parse(value) as Partial<ProposalVideos>;
    if (parsed && typeof parsed === 'object') {
      return {
        positioning: typeof parsed.positioning === 'string' ? parsed.positioning : '',
        website: typeof parsed.website === 'string' ? parsed.website : '',
      };
    }
  } catch {
    // Compatibilidade com leads antigos que tinham apenas um link em videoUrl.
    return { positioning: value, website: '' };
  }
  return EMPTY_VIDEOS;
}

function serializeProposalVideos(videos: ProposalVideos): string {
  return JSON.stringify(videos);
}

function getBusinessLabel(lead: Lead): string {
  const category = (lead.category || '').toLowerCase();
  if (category.includes('odont')) return 'clínica odontológica';
  if (category.includes('restaurante') || category.includes('aliment')) return 'negócio de alimentação';
  if (category.includes('salão') || category.includes('beleza') || category.includes('barbear')) return 'negócio de beleza';
  if (category.includes('advoc')) return 'escritório de advocacia';
  return lead.category?.toLowerCase() || 'negócio local';
}

function buildPersonalizedMessage(lead: Lead, videos: ProposalVideos): string {
  const portalUrl = `${window.location.origin}/portal/${lead.clientPortalToken || ''}`;
  const businessLabel = getBusinessLabel(lead);
  const location = [lead.neighborhood, lead.city, lead.state].filter(Boolean).join(', ');
  const ratingLine = lead.reviewsCount > 0
    ? `Hoje, o perfil aparece com ${lead.rating?.toFixed(1) || '0,0'} estrelas e ${lead.reviewsCount} avaliações.`
    : 'O perfil ainda tem uma oportunidade importante de ganhar mais autoridade e avaliações na região.';
  const opportunity = lead.score >= 70
    ? 'Mesmo com uma boa presença, há espaço para transformar essa visibilidade em mais contatos e agendamentos.'
    : 'Isso indica uma oportunidade concreta de melhorar a visibilidade, a confiança e a geração de novos contatos.';

  const lines = [
    `Olá, equipe da ${lead.name}! Tudo bem?`,
    '',
    `Eu estava analisando ${businessLabel} em ${location || lead.city || 'sua região'} e encontrei uma oportunidade interessante para vocês.`,
    ratingLine,
    opportunity,
    '',
    'Nós preparamos uma demonstração objetiva do que pode ser melhorado no Google e de como uma presença digital mais forte pode ajudar o negócio a receber mais oportunidades:',
  ];

  if (videos.positioning.trim()) {
    lines.push(`• Antes e depois do posicionamento no Google: ${videos.positioning.trim()}`);
  }
  if (videos.website.trim()) {
    lines.push(`• Vídeo do site pronto criado para a empresa: ${videos.website.trim()}`);
  }

  lines.push(
    '',
    `Também deixei um diagnóstico personalizado aqui: ${portalUrl}`,
    '',
    'Se fizer sentido para vocês, posso explicar em poucos minutos como aplicar essa estratégia ao negócio. Posso falar com a pessoa responsável por marketing ou atendimento?'
  );

  return lines.join('\n');
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({
  leads,
  selectedLead,
  onSelectLead,
  onUpdateProposalMsg,
}) => {
  const currentLead = leads.find((lead) => lead.id === selectedLead?.id) || leads[0];
  const [videos, setVideos] = useState<ProposalVideos>(() => parseProposalVideos(currentLead?.videoUrl));
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(currentLead?.customProposalMsg || (currentLead ? buildPersonalizedMessage(currentLead, videos) : ''));

  React.useEffect(() => {
    if (currentLead) {
      const nextVideos = parseProposalVideos(currentLead.videoUrl);
      setVideos(nextVideos);
      setMessage(currentLead.customProposalMsg || buildPersonalizedMessage(currentLead, nextVideos));
    }
  }, [currentLead?.id]);

  const updateVideo = (field: keyof ProposalVideos, value: string) => {
    setVideos((previous) => ({ ...previous, [field]: value }));
  };

  const handleGenerateMessage = () => {
    if (!currentLead) return;
    setMessage(buildPersonalizedMessage(currentLead, videos));
  };

  const persistProposal = () => {
    if (!currentLead) return;
    onUpdateProposalMsg(currentLead.id, message, serializeProposalVideos(videos));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    if (!currentLead) return;
    const phoneDigits = (currentLead.phone || '').replace(/\D/g, '');
    if (!phoneDigits) return;
    const cleanPhone = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;
    persistProposal();
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
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
      <div className="bg-white p-6 rounded-[20px] border border-[#E7E7F1] shadow-2xs space-y-2">
        <h2 className="text-xl font-semibold text-[#16162B] flex items-center gap-2">
          <MessageSquare size={20} className="text-[#5B4FE9]" /> Gerador de Propostas WhatsApp
        </h2>
        <p className="text-xs text-[#8A8AA3]">
          Crie uma abordagem consultiva, específica para cada comércio, com diagnóstico, prova visual e próximo passo claro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[20px] border border-[#E7E7F1] shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#E7E7F1]">
            <div>
              <h3 className="font-semibold text-sm text-[#16162B]">Personalizar proposta</h3>
              <p className="text-[11px] text-[#8A8AA3]">A mensagem será adaptada ao comércio selecionado.</p>
            </div>
            <select
              value={currentLead.id}
              onChange={(e) => {
                const found = leads.find((l) => l.id === e.target.value);
                if (found) onSelectLead(found);
              }}
              className="max-w-[210px] px-3 py-1.5 bg-[#ECEDF7]/50 border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B]"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{l.name} ({l.city})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#16162B] mb-1">Vídeo antes e depois do posicionamento no Google</label>
            <div className="relative">
              <Video size={14} className="absolute left-3.5 top-3 text-[#8A8AA3]" />
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videos.positioning}
                onChange={(e) => updateVideo('positioning', e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#ECEDF7]/40 border border-[#E2E2EE] rounded-full text-xs text-[#16162B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#16162B] mb-1">Vídeo do site pronto criado</label>
            <div className="relative">
              <Video size={14} className="absolute left-3.5 top-3 text-[#8A8AA3]" />
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videos.website}
                onChange={(e) => updateVideo('website', e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#ECEDF7]/40 border border-[#E2E2EE] rounded-full text-xs text-[#16162B]"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateMessage}
            className="w-full py-2.5 px-4 bg-[#ECEDF7] hover:bg-[#E1E2F2] text-[#3F3A9E] font-semibold text-xs rounded-full transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles size={14} /> Gerar mensagem personalizada
          </button>

          <div>
            <label className="block text-xs font-semibold text-[#16162B] mb-1">Texto da mensagem</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={13}
              className="w-full p-4 bg-[#ECEDF7]/40 border border-[#E2E2EE] rounded-2xl text-xs text-[#16162B] font-mono"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="py-2.5 px-4 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] font-medium text-xs rounded-full transition-colors flex items-center justify-center gap-1.5 flex-1 shadow-2xs"
            >
              {copied ? <Check size={14} className="text-[#1F9254]" /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar texto'}
            </button>
            <button
              onClick={handleOpenWhatsApp}
              disabled={!currentLead.phone}
              className="py-2.5 px-4 bg-[#5B4FE9] hover:bg-[#4C3FDB] disabled:bg-[#B7B7C8] text-white font-medium text-xs rounded-full transition-all shadow-xs flex items-center justify-center gap-1.5 flex-1"
            >
              <Send size={14} /> {currentLead.phone ? 'Abrir WhatsApp Web' : 'Cadastre o telefone'}
            </button>
          </div>
        </div>

        <div className="bg-[#16162B] p-6 rounded-[20px] border border-[#2B2B48] flex flex-col items-center justify-center space-y-4">
          <span className="text-xs font-medium text-[#8A8AA3] uppercase tracking-wider">Visualização WhatsApp</span>
          <div className="w-full max-w-sm bg-white p-4 rounded-2xl shadow-lg text-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E7E7F1] pb-2 font-semibold text-[#16162B]">
              <div className="w-6 h-6 rounded-full bg-[#5B4FE9] text-white flex items-center justify-center text-[10px]">{currentLead.name[0]}</div>
              {currentLead.name}
            </div>
            <p className="whitespace-pre-wrap text-[#16162B] leading-relaxed font-sans">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalsView;

// Mantém o utilitário disponível para testes unitários e futuras integrações de IA.
export { buildPersonalizedMessage, parseProposalVideos, serializeProposalVideos };
