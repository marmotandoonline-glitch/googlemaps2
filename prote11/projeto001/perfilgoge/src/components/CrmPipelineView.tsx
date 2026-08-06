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
  { key: 'novo', label: 'Novo Lead', color: 'bg-slate-400' },
  { key: 'analisado', label: 'Analisado', color: 'bg-slate-500' },
  { key: 'contato_enviado', label: 'Contato Enviado', color: 'bg-amber-500' },
  { key: 'respondeu', label: 'Respondeu', color: 'bg-orange-500' },
  { key: 'negociacao', label: 'Em Negociação', color: 'bg-[#5B4FE9]' },
  { key: 'fechado', label: 'Fechado / Ganho', color: 'bg-[#1F9254]' },
  { key: 'onboarding', label: 'Onboarding', color: 'bg-[#1F9254]' },
  { key: 'producao', label: 'Em Produção', color: 'bg-[#5B4FE9]' },
  { key: 'entregue', label: 'Entregue', color: 'bg-[#1F9254]' },
  { key: 'mensalista', label: 'Mensalista', color: 'bg-[#1F9254]' },
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
      <div className="bg-white rounded-[20px] border border-[#E7E7F1] p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#16162B] flex items-center gap-2">
              <Building2 size={20} className="text-[#5B4FE9]" />
              CRM Pipeline
            </h2>
            <p className="text-xs text-[#8A8AA3] mt-0.5">{filteredLeads.length} leads no pipeline</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8AA3]" />
              <input
                type="text"
                placeholder="Buscar por nome, categoria, cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-[#ECEDF7]/50 border border-[#E2E2EE] rounded-full text-xs w-64 focus:ring-2 focus:ring-[#5B4FE9] focus:outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B]"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === stage.key);

          return (
            <div key={stage.key} className="bg-white border border-[#E7E7F1] rounded-[20px] p-4 shadow-2xs flex flex-col space-y-3 min-h-[500px]">
              <div className="flex items-center justify-between border-b border-[#E7E7F1] pb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                  <span className="font-semibold text-xs text-[#16162B]">{stage.label}</span>
                </div>
                <span className="text-[10px] bg-[#ECEDF7] text-[#16162B] font-mono px-2 py-0.5 rounded-full font-bold">
                  {stageLeads.length}
                </span>
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-12 text-[#8A8AA3] text-xs italic">Nenhum lead</div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLeadModal(lead)}
                      className="bg-[#ECEDF7]/30 hover:bg-[#ECEDF7]/70 border border-[#E2E2EE] p-3 rounded-xl cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-xs text-[#16162B] group-hover:text-[#5B4FE9] transition-colors line-clamp-1">
                          {lead.name}
                        </h4>
                        <span className="text-[10px] font-mono bg-white border border-[#E2E2EE] text-[#16162B] px-1.5 py-0.2 rounded-full">
                          {lead.score} pts
                        </span>
                      </div>

                      <div className="text-[11px] text-[#8A8AA3] space-y-0.5">
                        <div className="truncate">{lead.category}</div>
                        <div className="truncate">{lead.city} • {lead.rating}★</div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#E2E2EE] text-[10px] text-[#8A8AA3]">
                        <span>{lead.reviewsCount} reviews</span>
                        <span className="text-[#5B4FE9] font-medium flex items-center gap-0.5">
                          Detalhes <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalhes do Lead */}
      {selectedLeadModal && (
        <div className="fixed inset-0 bg-[#16162B]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E7E7F1] rounded-[24px] max-w-2xl w-full p-6 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#E7E7F1] pb-4">
              <div>
                <span className="text-[10px] font-mono bg-[#ECEDF7] text-[#5B4FE9] px-2 py-0.5 rounded-full font-bold">
                  Score {selectedLeadModal.score} / 100
                </span>
                <h3 className="text-xl font-bold text-[#16162B] mt-1">{selectedLeadModal.name}</h3>
                <p className="text-xs text-[#8A8AA3]">{selectedLeadModal.category} • {selectedLeadModal.address}, {selectedLeadModal.city}</p>
              </div>
              <button
                onClick={() => setSelectedLeadModal(null)}
                className="text-[#8A8AA3] hover:text-[#16162B] text-sm p-1 rounded-full hover:bg-[#ECEDF7]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 bg-[#ECEDF7]/30 p-4 rounded-xl border border-[#E2E2EE]">
                <div className="font-semibold text-[#16162B]">Contato & Mídia</div>
                <div>Telefone: <span className="font-mono text-[#8A8AA3]">{selectedLeadModal.phone || 'Não informado'}</span></div>
                <div>WhatsApp: <span className="font-mono text-[#8A8AA3]">{selectedLeadModal.whatsapp || selectedLeadModal.phone || 'N/A'}</span></div>
                <div>Website: <span className="font-mono text-[#8A8AA3]">{selectedLeadModal.website || 'Sem site (Oportunidade)'}</span></div>
                <div>Avaliações: <span className="font-mono text-[#8A8AA3]">{selectedLeadModal.reviewsCount} ({selectedLeadModal.rating}★)</span></div>
              </div>

              <div className="space-y-2 bg-[#ECEDF7]/30 p-4 rounded-xl border border-[#E2E2EE]">
                <div className="font-semibold text-[#16162B]">Ações Comerciais</div>
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => { setSelectedLeadModal(null); onSelectLeadForProposal(selectedLeadModal); }}
                    className="w-full py-2 bg-[#5B4FE9] hover:bg-[#4C3FDB] text-white rounded-full font-medium flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <MessageSquare size={14} /> Gerar Proposta WhatsApp
                  </button>
                  <button
                    onClick={() => { setSelectedLeadModal(null); onSelectLeadForAi(selectedLeadModal); }}
                    className="w-full py-2 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] rounded-full font-medium flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles size={14} className="text-[#5B4FE9]" /> Motor de IA & Posts
                  </button>
                  <button
                    onClick={() => { setSelectedLeadModal(null); onSelectLeadForReport(selectedLeadModal); }}
                    className="w-full py-2 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] rounded-full font-medium flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <FileText size={14} className="text-[#1F9254]" /> Relatório Diagnóstico PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Mudar Estágio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#16162B]">Mudar Estágio no Pipeline</label>
              <select
                value={selectedLeadModal.stage}
                onChange={(e) => {
                  const newStage = e.target.value as PipelineStage;
                  onUpdateLeadStage(selectedLeadModal.id, newStage);
                  setSelectedLeadModal({ ...selectedLeadModal, stage: newStage });
                }}
                className="w-full px-3 py-2 bg-white border border-[#E2E2EE] rounded-xl text-xs font-medium text-[#16162B]"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Portal do Cliente Link */}
            <div className="space-y-2 bg-[#F1F0FC] p-4 rounded-xl border border-[#5B4FE9]/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#5B4FE9]">Link do Portal do Cliente (White-label)</span>
                <button
                  onClick={() => handleCopyPortalLink(selectedLeadModal.portalToken, selectedLeadModal.id)}
                  className="px-3 py-1 bg-[#5B4FE9] text-white rounded-full text-xs font-medium flex items-center gap-1 shadow-2xs"
                >
                  {copiedTokenId === selectedLeadModal.id ? <Check size={12} /> : <Copy size={12} />}
                  {copiedTokenId === selectedLeadModal.id ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>
              <p className="text-[11px] text-[#8A8AA3] font-mono break-all">
                {window.location.origin}/portal/{selectedLeadModal.portalToken}
              </p>
            </div>

            {/* Notas e Histórico */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-[#16162B]">Notas & Atividades</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedLeadModal.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-[#ECEDF7]/30 rounded-xl border border-[#E2E2EE] text-xs space-y-1">
                    <div className="flex justify-between text-[10px] text-[#8A8AA3]">
                      <span className="font-semibold text-[#5B4FE9]">{note.author}</span>
                      <span>{note.createdAt}</span>
                    </div>
                    <p className="text-[#16162B]">{note.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Adicionar nota interna..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-[#E2E2EE] rounded-full text-xs focus:ring-2 focus:ring-[#5B4FE9] focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (!newNote.trim()) return;
                    onAddNote(selectedLeadModal.id, newNote);
                    setSelectedLeadModal({
                      ...selectedLeadModal,
                      notes: [
                        { id: `n-${Date.now()}`, author: 'Operador', text: newNote, createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') },
                        ...selectedLeadModal.notes,
                      ],
                    });
                    setNewNote('');
                  }}
                  className="px-4 py-2 bg-[#5B4FE9] text-white rounded-full text-xs font-medium shadow-2xs"
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#E7E7F1]">
              <button
                onClick={() => handleDelete(selectedLeadModal.id)}
                className="px-3 py-1.5 bg-[#FDEAF0] text-[#D6336C] rounded-full text-xs font-medium flex items-center gap-1"
              >
                <Trash2 size={13} /> Excluir Lead
              </button>
              <button
                onClick={() => setSelectedLeadModal(null)}
                className="px-4 py-2 bg-white border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
