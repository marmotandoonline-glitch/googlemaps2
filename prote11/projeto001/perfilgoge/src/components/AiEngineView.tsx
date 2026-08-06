import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Tag,
  FileText,
  ShoppingBag,
  HelpCircle,
  Hash,
  Image,
  Layers,
  Save,
  Zap,
} from 'lucide-react';
import { Lead, AIContentResult } from '../types';

interface AiEngineViewProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
  onSaveAiContentToLead: (leadId: string, aiData: AIContentResult) => void;
}

export const AiEngineView: React.FC<AiEngineViewProps> = ({
  leads,
  selectedLead,
  onSelectLead,
  onSaveAiContentToLead,
}) => {
  const currentLead = selectedLead || leads[0];

  const [companyName, setCompanyName] = useState(currentLead?.name || '');
  const [category, setCategory] = useState(currentLead?.category || 'Clínica Odontológica');
  const [city, setCity] = useState(currentLead?.city || 'São Paulo');
  const [neighborhood, setNeighborhood] = useState(currentLead?.neighborhood || 'Moema');
  const [existingServices, setExistingServices] = useState('Avaliações, Consultas, Tratamentos');
  const [clientNotes, setClientNotes] = useState('Destaque para atendimento humanizado e ambiente aconchegante.');

  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState<AIContentResult | null>(currentLead?.aiContent || {
    optimizedDescription: 'Empresa especializada em tratamentos de excelência em São Paulo. Foco em resultados e satisfação.',
    servicesList: [{ name: 'Consulta Inicial', description: 'Avaliação completa' }],
    faqs: [{ question: 'Como agendar?', answer: 'Diretamente pelo WhatsApp.' }],
    suggestedCategories: ['Clínica', 'Consultório'],
    socialPosts: [{ platform: 'Instagram', caption: 'Venha conhecer nosso espaço!', callToAction: 'Agende pelo link da bio' }],
    altKeywords: ['dentista moema', 'implante são paulo'],
  });
  const [activeTab, setActiveTab] = useState<'desc' | 'services' | 'faqs' | 'categories' | 'posts' | 'alt'>('desc');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (currentLead) {
      setCompanyName(currentLead.name);
      setCategory(currentLead.category);
      setCity(currentLead.city);
      setNeighborhood(currentLead.neighborhood);
      if (currentLead.aiContent) {
        setAiData(currentLead.aiContent);
      }
    }
  }, [currentLead?.id]);

  const handleGenerateAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSave = () => {
    if (!currentLead || !aiData) return;
    onSaveAiContentToLead(currentLead.id, aiData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-[20px] border border-[#E7E7F1] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-semibold text-[#16162B] flex items-center gap-2">
              <Sparkles className="text-[#5B4FE9]" size={20} /> Motor de IA & Copywriting para GMN
            </h2>
            <p className="text-xs text-[#8A8AA3]">
              Gere descrições otimizadas, listas de serviços, FAQs e posts para engajamento local.
            </p>
          </div>
          <span className="text-xs font-semibold bg-[#ECEDF7] text-[#5B4FE9] px-3 py-1 rounded-full w-fit">
            GPT-4o Inteligência de Ranking
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Inputs */}
        <div className="bg-white p-6 rounded-[20px] border border-[#E7E7F1] shadow-2xs space-y-4">
          <h3 className="font-semibold text-xs text-[#16162B] uppercase tracking-wider text-[#8A8AA3]">Parâmetros do Negócio</h3>

          <div>
            <label className="block text-xs font-semibold text-[#16162B] mb-1">Empresa</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#ECEDF7]/50 border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#16162B] mb-1">Categoria</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#ECEDF7]/50 border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[#16162B] mb-1">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#ECEDF7]/50 border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#16162B] mb-1">Bairro</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#ECEDF7]/50 border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B]"
              />
            </div>
          </div>

          <button
            onClick={() => handleGenerateAI()}
            disabled={loading}
            className="w-full py-2.5 bg-[#5B4FE9] hover:bg-[#4C3FDB] text-white font-medium rounded-full text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />} Gerar com IA
          </button>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[20px] border border-[#E7E7F1] shadow-2xs space-y-4">
          <div className="flex flex-wrap gap-1 border-b border-[#E7E7F1] pb-3">
            {[
              { id: 'desc', label: 'Descrição GMN', icon: FileText },
              { id: 'services', label: 'Serviços', icon: ShoppingBag },
              { id: 'faqs', label: 'FAQs', icon: HelpCircle },
              { id: 'categories', label: 'Categorias', icon: Tag },
              { id: 'posts', label: 'Posts Sociais', icon: Layers },
              { id: 'alt', label: 'Palavras-chave', icon: Hash },
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#F1F0FC] text-[#5B4FE9] font-semibold'
                      : 'text-[#8A8AA3] hover:text-[#16162B] hover:bg-[#ECEDF7]/50'
                  }`}
                >
                  <IconComp size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {activeTab === 'desc' && aiData && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-[#16162B]">Descrição Otimizada para SEO Local</span>
                  <button
                    onClick={() => handleCopy(aiData.optimizedDescription, 'desc')}
                    className="px-3 py-1 bg-white border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B] flex items-center gap-1 shadow-2xs"
                  >
                    {copiedSection === 'desc' ? <Check size={12} className="text-[#1F9254]" /> : <Copy size={12} />}
                    {copiedSection === 'desc' ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <div className="p-4 bg-[#ECEDF7]/40 rounded-2xl border border-[#E2E2EE] text-xs text-[#16162B] font-mono leading-relaxed">
                  {aiData.optimizedDescription}
                </div>
              </div>
            )}

            {activeTab === 'services' && aiData && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-[#16162B]">Lista Sugerida de Serviços</span>
                <div className="space-y-2">
                  {aiData.servicesList.map((srv, idx) => (
                    <div key={idx} className="p-3 bg-[#ECEDF7]/30 rounded-xl border border-[#E2E2EE] text-xs">
                      <div className="font-semibold text-[#16162B]">{srv.name}</div>
                      <div className="text-[#8A8AA3]">{srv.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'faqs' && aiData && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-[#16162B]">Perguntas Frequentes (FAQs)</span>
                <div className="space-y-2">
                  {aiData.faqs.map((faq, idx) => (
                    <div key={idx} className="p-3 bg-[#ECEDF7]/30 rounded-xl border border-[#E2E2EE] text-xs space-y-1">
                      <div className="font-semibold text-[#16162B]">Q: {faq.question}</div>
                      <div className="text-[#8A8AA3]">R: {faq.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'categories' && aiData && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-[#16162B]">Categorias Adicionais Sugeridas</span>
                <div className="flex flex-wrap gap-2">
                  {aiData.suggestedCategories.map((cat, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-[#ECEDF7] text-[#16162B] text-xs font-semibold rounded-full border border-[#E2E2EE]">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'posts' && aiData && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-[#16162B]">Sugestão de Posts para GMN & Redes</span>
                <div className="space-y-3">
                  {aiData.socialPosts.map((post, idx) => (
                    <div key={idx} className="p-4 bg-[#ECEDF7]/30 rounded-2xl border border-[#E2E2EE] text-xs space-y-2">
                      <div className="font-bold text-[#5B4FE9]">{post.platform}</div>
                      <p className="text-[#16162B] font-mono">{post.caption}</p>
                      <div className="text-[11px] font-semibold text-[#1F9254]">Call to Action: {post.callToAction}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'alt' && aiData && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-[#16162B]">Palavras-chave de Oportunidade</span>
                <div className="flex flex-wrap gap-2">
                  {aiData.altKeywords.map((kw, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-white text-[#16162B] text-xs font-mono font-semibold rounded-full border border-[#E2E2EE]">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E7E7F1] flex justify-between items-center">
            {saveSuccess ? (
              <span className="text-xs font-semibold text-[#1F9254] flex items-center gap-1">
                <Check size={14} /> Salvo com sucesso no Lead!
              </span>
            ) : (
              <span className="text-xs text-[#8A8AA3]">Pronto para exportar</span>
            )}
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#5B4FE9] hover:bg-[#4C3FDB] text-white text-xs font-medium rounded-full shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Save size={14} /> Salvar Conteúdo no Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
