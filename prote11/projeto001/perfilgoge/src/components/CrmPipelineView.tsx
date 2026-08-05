import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  Phone,
  Globe,
  Plus,
  ChevronRight,
  MessageSquare,
  Sparkles,
  FileText,
  Copy,
  Check,
  Building2,
  Trash2,
  ExternalLink,
  DollarSign,
  User,
  Send,
  Calendar,
} from 'lucide-react';
import { Lead, PipelineStage } from '../types';

interface CrmPipelineViewProps {
  leads: Lead[];
  onUpdateLeadStage: (leadId: string, newStage: PipelineStage) => void;
  onAddNote: (leadId: string, noteText: string) => void;
  onSelectLeadForProposal: (lead: Lead) => void;
  onSelectLeadForAi: (lead: Lead) => void;
  onSelectLeadForReport: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'novo', label: 'Novo Lead', color: 'bg-slate-500' },
  { key: 'analisado', label: 'Analisado', color: 'bg-blue-500' },
  { key: 'contato_enviado', label: 'Contato Enviado', color: 'bg-amber-500' },
  { key: 'respondeu', label: 'Respondeu', color: 'bg-orange-500' },
  { key: 'negociacao', label: 'Em Negociação', color: 'bg-purple-500' },
  { key: 'fechado', label: 'Fechado / Ganho', color: 'bg-emerald-500' },
  { key: 'onboarding', label: 'Onboarding', color: 'bg-cyan-500' },
  { key: 'producao', label: 'Em Produção', color: 'bg-indigo-500' },
  { key: 'entregue', label: 'Entregue', color: 'bg-[#4285F4]' },
  { key: 'mensalista', label: 'Mensalista', color: 'bg-[#34A853]' },
];

export const CrmPipelineView: React.FC<CrmPipelineViewProps> = ({
  leads,
  onUpdateLeadStage,
  onAddNote,
  onSelectLeadForProposal,
  onSelectLeadForAi,
  onSelectLeadForReport,
  onDeleteLead,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [selectedLeadModal, setSelectedLeadModal] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Filtered leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'todos' || l.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(leads.map((l) => l.category)));

  const handleCopyPortalLink = (token: string, leadId: string) => {
    const portalUrl = `${window.location.origin}/portal?token=${token}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedTokenId(leadId);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedLeadModal) return;
    onAddNote(selectedLeadModal.id, newNote.trim());
    setNewNote('');
    // Update local modal lead reference notes
    setSelectedLeadModal((prev) =>
      prev
        ? {
            ...prev,
            notes: [
              {
                id: `note-${Date.now()}`,
                author: 'Déric (Agência)',
                text: newNote.trim(),
                createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              },
              ...prev.notes,
            ],
          }
        : null
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls & Filters */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="text-indigo-600" size={22} /> Pipeline CRM & Histórico de Vendas
            </h2>
            <p className="text-xs text-slate-500">
              Gerencie a jornada de prospecção, negociação e entrega de relatórios para Perfis do Google.
            </p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-full w-fit">
            {filteredLeads.length} Lead(s) Cadastrados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por empresa, nicho ou cidade..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="todos">Todas as Categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-[1800px]">
          {STAGES.map((stg) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stg.key);
            const totalStageValue = stageLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

            return (
              <div
                key={stg.key}
                className="w-72 bg-slate-100/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between shrink-0 min-h-[500px]"
              >
                <div className="space-y-3">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stg.color}`} />
                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">{stg.label}</h3>
                    </div>
                    <span className="text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full shadow-2xs">
                      {stageLeads.length}
                    </span>
                  </div>

                  {totalStageValue > 0 && (
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      R$ {totalStageValue.toLocaleString('pt-BR')}
                    </p>
                  )}

                  {/* Cards List */}
                  <div className="space-y-2.5">
                    {stageLeads.length === 0 ? (
                      <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center text-[11px] text-slate-400">
                        Sem leads neste estágio
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-xs hover:shadow-md transition-all space-y-2.5 cursor-pointer group"
                          onClick={() => setSelectedLeadModal(lead)}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                {lead.name}
                              </h4>
                              <p className="text-[11px] text-slate-500">{lead.category}</p>
                            </div>
                            <span
                              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                lead.score < 50
                                  ? 'bg-rose-100 text-rose-700'
                                  : lead.score < 75
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              Score {lead.score}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>📍 {lead.neighborhood || lead.city}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              R$ {lead.dealValue}
                            </span>
                          </div>

                          {/* Fast Actions inside card */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                            <select
                              value={lead.stage}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => onUpdateLeadStage(lead.id, e.target.value as PipelineStage)}
                              className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-slate-700 dark:text-slate-300 font-medium"
                            >
                              {STAGES.map((s) => (
                                <option key={s.key} value={s.key}>
                                  Mover: {s.label}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteLead(lead.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Remover Lead"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Lead Modal */}
      {selectedLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Ficha do Lead / Cliente
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedLeadModal.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedLeadModal.category} • {selectedLeadModal.address}, {selectedLeadModal.city} - {selectedLeadModal.state}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-extrabold px-3 py-1 rounded-lg border ${
                    selectedLeadModal.score < 50
                      ? 'bg-rose-100 text-rose-700 border-rose-300'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                  }`}
                >
                  Score Oportunidade: {selectedLeadModal.score}/100
                </span>
                <button
                  onClick={() => setSelectedLeadModal(null)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Action Bar inside Modal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  onSelectLeadForProposal(selectedLeadModal);
                  setSelectedLeadModal(null);
                }}
                className="p-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare size={18} /> Proposta WhatsApp
              </button>

              <button
                onClick={() => {
                  onSelectLeadForAi(selectedLeadModal);
                  setSelectedLeadModal(null);
                }}
                className="p-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles size={18} /> Motor de Conteúdo IA
              </button>

              <button
                onClick={() => {
                  onSelectLeadForReport(selectedLeadModal);
                  setSelectedLeadModal(null);
                }}
                className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <FileText size={18} /> Relatório Otimização
              </button>

              <button
                onClick={() => handleCopyPortalLink(selectedLeadModal.clientPortalToken, selectedLeadModal.id)}
                className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                {copiedTokenId === selectedLeadModal.id ? (
                  <>
                    <Check size={18} className="text-emerald-500" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={18} /> Link Portal Cliente
                  </>
                )}
              </button>
            </div>

            {/* Stage Shifter & Value */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Estágio no Funil
                </label>
                <select
                  value={selectedLeadModal.stage}
                  onChange={(e) => {
                    const newStg = e.target.value as PipelineStage;
                    onUpdateLeadStage(selectedLeadModal.id, newStg);
                    setSelectedLeadModal((prev) => (prev ? { ...prev, stage: newStg } : null));
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telefone / WhatsApp
                </label>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg">
                  <Phone size={14} className="text-emerald-600" />
                  {selectedLeadModal.phone || 'Não informado'}
                </div>
              </div>
            </div>

            {/* Notes & History Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notes */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MessageSquare size={14} /> Observações & Anotações do Operador
                </h4>

                <form onSubmit={handleAddNoteSubmit} className="space-y-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Adicionar nota de atendimento..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    rows={2}
                  />
                  <button
                    type="submit"
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Send size={12} /> Salvar Observação
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedLeadModal.notes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhuma observação cadastrada.</p>
                  ) : (
                    selectedLeadModal.notes.map((n) => (
                      <div key={n.id} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-slate-600 dark:text-slate-300">{n.author}</span>
                          <span>{n.createdAt}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-xs">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* History Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar size={14} /> Histórico de Eventos
                </h4>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 border-l-2 border-indigo-200 dark:border-indigo-900 pl-3">
                  {selectedLeadModal.history.map((h) => (
                    <div key={h.id} className="text-xs space-y-0.5 relative">
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>{h.timestamp}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{h.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
