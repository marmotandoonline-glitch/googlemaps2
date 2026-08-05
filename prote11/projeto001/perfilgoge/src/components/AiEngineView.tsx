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
  const [aiData, setAiData] = useState<AIContentResult | null>(currentLead?.aiContent || null);
  const [activeTab, setActiveTab] = useState<'desc' | 'services' | 'faqs' | 'categories' | 'posts' | 'alt'>('desc');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when selected lead changes
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
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: currentLead?.id,
          companyName,
          category,
          city,
          neighborhood,
          existingServices,
          clientNotes,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAiData(data.data);
      }
    } catch (err) {
      console.error('Erro ao gerar conteúdo com IA:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSaveToProfile = () => {
    if (!currentLead || !aiData) return;
    onSaveAiContentToLead(currentLead.id, aiData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-lg border border-indigo-800 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} /> Motor de IA Gemini 3.6 Flash
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight mt-1">
              Geração Automatizada de Conteúdo SEO para o Perfil
            </h2>
            <p className="text-xs text-indigo-200">
              Crie descrições de 750 caracteres, menu de serviços, categorias recomendadas, posts e FAQs otimizados em segundos.
            </p>
          </div>

          {currentLead && (
            <div className="bg-slate-900/80 p-3 rounded-xl border border-indigo-500/30 text-xs space-y-1 min-w-[200px]">
              <span className="text-indigo-300 font-semibold block">Lead Selecionado:</span>
              <span className="font-bold text-white block">{currentLead.name}</span>
              <span className="text-slate-400">{currentLead.city} • Score {currentLead.score}</span>
            </div>
          )}
        </div>
      </div>

      {/* Inputs Form Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Parâmetros de Geração de IA</h3>
          {leads.length > 0 && (
            <select
              value={currentLead?.id}
              onChange={(e) => {
                const found = leads.find((l) => l.id === e.target.value);
                if (found) onSelectLead(found);
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  Carregar do CRM: {l.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <form onSubmit={handleGenerateAI} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Categoria Principal
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bairro</label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Serviços / Principais Tratamentos
            </label>
            <input
              type="text"
              value={existingServices}
              onChange={(e) => setExistingServices(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Diferenciais / Orientações do Cliente
            </label>
            <input
              type="text"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Processando com IA Gemini...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Gerar Todo Conteúdo Otimizado para o Perfil
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Content Tabs & Output View */}
      {aiData && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-6">
          {/* Output Header */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Conteúdo Gerado com Sucesso ({aiData.generatedAt})
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Pacote Otimizado de Otimização no Google
              </h3>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveToProfile}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
              >
                {saveSuccess ? (
                  <>
                    <Check size={14} /> Salvo no CRM!
                  </>
                ) : (
                  <>
                    <Save size={14} /> Vincular ao Lead no CRM
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
            {[
              { id: 'desc', label: 'Descrições SEO', icon: FileText },
              { id: 'services', label: 'Serviços & Produtos', icon: ShoppingBag },
              { id: 'faqs', label: 'FAQs & Respostas', icon: HelpCircle },
              { id: 'categories', label: 'Categorias & Keywords', icon: Hash },
              { id: 'posts', label: 'Sugestões de Posts', icon: Layers },
              { id: 'alt', label: 'Alt Text Fotos', icon: Image },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <IconComp size={16} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="p-6">
            {/* Tab 1: Descrições */}
            {activeTab === 'desc' && (
              <div className="space-y-6">
                {/* Long Description (750 chars) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Descrição Otimizada para o Perfil do Google (750 Caracteres)
                    </h4>
                    <button
                      onClick={() => handleCopyText(aiData.longDescription, 'longDesc')}
                      className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      {copiedSection === 'longDesc' ? (
                        <>
                          <Check size={12} className="text-emerald-500" /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copiar Texto
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                    {aiData.longDescription}
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Tamanho: {aiData.longDescription.length} caracteres
                  </span>
                </div>

                {/* Short Description */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Descrição Curta / Slogan
                    </h4>
                    <button
                      onClick={() => handleCopyText(aiData.shortDescription, 'shortDesc')}
                      className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      {copiedSection === 'shortDesc' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} Copiar
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {aiData.shortDescription}
                  </p>
                </div>

                {/* SEO Meta Description */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Meta Descrição SEO (160 Caracteres)
                    </h4>
                    <button
                      onClick={() => handleCopyText(aiData.seoDescription, 'seoDesc')}
                      className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      {copiedSection === 'seoDesc' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} Copiar
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {aiData.seoDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Serviços & Produtos */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                    Catálogo de Serviços Otimizados ({aiData.servicesList.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiData.servicesList.map((srv, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white">{srv.name}</h5>
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded">
                            {srv.priceSuggestion || 'Sob Consulta'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{srv.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                    Catálogo de Produtos ({aiData.productsList.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiData.productsList.map((prod, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1"
                      >
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white">{prod.name}</h5>
                          <span className="text-[10px] font-bold text-slate-500">{prod.category}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{prod.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: FAQs */}
            {activeTab === 'faqs' && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                  Perguntas e Respostas Frequentes (FAQs)
                </h4>
                {aiData.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5"
                  >
                    <h5 className="font-bold text-xs text-indigo-700 dark:text-indigo-300">
                      ❓ Q: {faq.question}
                    </h5>
                    <p className="text-xs text-slate-700 dark:text-slate-300">💡 A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Categorias & Keywords */}
            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Sugestões de Categorias do Google
                  </h4>
                  <div>
                    <span className="text-xs text-slate-500 block">Categoria Principal:</span>
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                      {aiData.categories.primary}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Categorias Secundárias Otimizadas:</span>
                    <ul className="space-y-1 pt-1">
                      {aiData.categories.secondary.map((cat, idx) => (
                        <li key={idx} className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> {cat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Palavras-Chave de Alta Conversão Local
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {aiData.keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Sugestões de Posts */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Postagens Prontas para a Aba Novidades
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiData.postSuggestions.map((post, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative"
                    >
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">{post.title}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{post.caption}</p>
                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-indigo-600">Botão: {post.callToAction}</span>
                        <div className="flex gap-1 text-slate-400">
                          {post.hashtags.map((h, i) => (
                            <span key={i}>{h}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 6: Alt Text Fotos */}
            {activeTab === 'alt' && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Textos Alternativos (ALT Text) para Indexação de Imagens
                </h4>
                {aiData.imageAltTexts.map((altItem, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{altItem.type}:</span>
                      <span className="text-slate-600 dark:text-slate-400 italic">"{altItem.altText}"</span>
                    </div>
                    <button
                      onClick={() => handleCopyText(altItem.altText, `alt-${idx}`)}
                      className="p-1.5 text-indigo-600 hover:text-indigo-700"
                    >
                      {copiedSection === `alt-${idx}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
