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

  // FIXED: Generate portal URL using path parameter format to match PortalPage route
  const handleCopyPortalLink = (token: string, leadId: string) => {
    const portalUrl = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedTokenId(leadId);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleDelete = (leadId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      onDeleteLead(leadId);
      if (selectedLeadModal?.id === leadId) setSelectedLeadModal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 size={22} className="text-indigo-600" />
              CRM Pipeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{filteredLeads.length} leads no pipeline</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, categoria, cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
            >
              <option value="todos">Todas categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === stage.key);
          return (
            <div key={stage.key} className="flex-shrink-0 w-72">
              <div className="bg-slate-200/60 dark:bg-slate-800/60 rounded-xl p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">{stage.label}</h3>
                  <span className="text-[10px] bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full font-bold">{stageLeads.length}</span>
                </div>

                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadModal(lead)}
                    className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-400 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{lead.name}</h4>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.5 rounded flex-shrink-0">
                        {lead.score || 0}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{lead.category}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      {lead.city && <span>{lead.city}</span>}
                      {lead.rating > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star size={10} className="fill-amber-400 text-amber-400" /> {lead.rating}
                        </span>
                      )}
                      {lead.reviewsCount > 0 && <span>{lead.reviewsCount} reviews</span>}
                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center">
                    <p className="text-[11px] text-slate-400">Nenhum lead</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead Detail Modal */}
      {selectedLeadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLeadModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{selectedLeadModal.name}</h3>
                <p className="text-xs text-slate-500">{selectedLeadModal.category} • Score: {selectedLeadModal.score}</p>
              </div>
              <button onClick={() => setSelectedLeadModal(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl">&times;</button>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selectedLeadModal.phone && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <Phone size={14} className="text-slate-400 mb-1" />
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{selectedLeadModal.phone}</p>
                </div>
              )}
              {selectedLeadModal.website && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <Globe size={14} className="text-slate-400 mb-1" />
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{selectedLeadModal.website}</p>
                </div>
              )}
              {selectedLeadModal.rating > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <Star size={14} className="text-slate-400 mb-1" />
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{selectedLeadModal.rating} ({selectedLeadModal.reviewsCount} reviews)</p>
                </div>
              )}
              {selectedLeadModal.dealValue && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <DollarSign size={14} className="text-slate-400 mb-1" />
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">R$ {selectedLeadModal.dealValue}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {/* Portal Link Button - FIXED to use path parameter format */}
              <button
                onClick={() => handleCopyPortalLink(selectedLeadModal.clientPortalToken, selectedLeadModal.id)}
                className="py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                {copiedTokenId === selectedLeadModal.id ? <><Check size={14} /> Link Copiado!</> : <><ExternalLink size={14} /> Link Portal Cliente</>}
              </button>

              <button
                onClick={() => { onSelectLeadForProposal(selectedLeadModal); setSelectedLeadModal(null); }}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <MessageSquare size={14} /> Proposta WhatsApp
              </button>
              <button
                onClick={() => { onSelectLeadForAi(selectedLeadModal); setSelectedLeadModal(null); }}
                className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Sparkles size={14} /> Gerar IA
              </button>
              <button
                onClick={() => { onSelectLeadForReport(selectedLeadModal); setSelectedLeadModal(null); }}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <FileText size={14} /> Relatório
              </button>
              <button
                onClick={() => handleDelete(selectedLeadModal.id)}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 ml-auto"
              >
                <Trash2 size={14} /> Excluir
              </button>
            </div>

            {/* Stage Selector */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Alterar Estágio</h4>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => { onUpdateLeadStage(selectedLeadModal.id, s.key); setSelectedLeadModal({ ...selectedLeadModal, stage: s.key }); }}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                      selectedLeadModal.stage === s.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Note */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Adicionar Nota</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Digite uma nota sobre este lead..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
                <button
                  onClick={() => {
                    if (newNote.trim()) {
                      onAddNote(selectedLeadModal.id, newNote.trim());
                      setNewNote('');
                      setSelectedLeadModal({
                        ...selectedLeadModal,
                        notes: [{ id: `note-${Date.now()}`, author: 'Operador', text: newNote.trim(), createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') }, ...selectedLeadModal.notes],
                      });
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg"
                >
                  Enviar
                </button>
              </div>
            </div>

            {/* Notes */}
            {selectedLeadModal.notes && selectedLeadModal.notes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Notas ({selectedLeadModal.notes.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedLeadModal.notes.map((note) => (
                    <div key={note.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-indigo-600">{note.author}</span>
                        <span className="text-[10px] text-slate-400">{note.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            {selectedLeadModal.history && selectedLeadModal.history.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Histórico de Atividades</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedLeadModal.history.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-700 dark:text-slate-300">{event.description}</p>
                        <p className="text-slate-400 text-[10px]">{event.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
