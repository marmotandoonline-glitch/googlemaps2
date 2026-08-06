import React from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Search,
  Kanban,
  MessageSquare,
  Sparkles,
  FileText,
  Globe,
  Smartphone,
  MapPin,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  Shield,
  Bell,
  ChevronDown,
  HelpCircle,
  Settings,
  Plus,
} from 'lucide-react';
import { INITIAL_LEADS } from './data/mockLeads';
import { Lead, LeadSearchResult, PipelineStage, AIContentResult, ClientPortalData } from './types';
import { DashboardView } from './components/DashboardView';
import { LeadFinderView } from './components/LeadFinderView';
import { CrmPipelineView } from './components/CrmPipelineView';
import { ProposalsView } from './components/ProposalsView';
import { AiEngineView } from './components/AiEngineView';
import { ReportsView } from './components/ReportsView';
import { ClientPortalView } from './components/ClientPortalView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { ProtectedRoute } from './router/ProtectedRoute';
import { PortalPage } from './pages/PortalPage';
import { WhatsAppView } from './components/WhatsAppView';
import { RankTrackerView } from './components/RankTrackerView';
import { useAuth } from './auth/AuthProvider';

export default function App() {
  const { user, logout, apiFetch } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads] = React.useState<Lead[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(INITIAL_LEADS[0] || null);

  React.useEffect(() => {
    if (!user) return;
    apiFetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLeads(data);
          if (!selectedLead) setSelectedLead(data[0]);
        }
      })
      .catch((err) => console.log('Usando dados em memória local:', err));
  }, [user, apiFetch]);

  // Handlers
  const handleAddLeadToCrm = async (leadData: LeadSearchResult) => {
    try {
      const res = await apiFetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });

      if (res.ok) {
        const createdLead = await res.json();
        setLeads((prev) => [createdLead, ...prev]);
        setSelectedLead(createdLead);
        navigate('/leads');
      }
    } catch (err) {
      console.error('Erro ao adicionar lead:', err);
    }
  };

  const handleUpdateLeadStage = async (leadId: string, newStage: PipelineStage) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)));
    if (selectedLead?.id === leadId) setSelectedLead((prev) => (prev ? { ...prev, stage: newStage } : null));
    try {
      await apiFetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
    } catch (err) {
      console.error('Erro ao atualizar estágio:', err);
    }
  };

  const handleAddNote = async (leadId: string, noteText: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              notes: [
                { id: `note-${Date.now()}`, author: user?.name || 'Operador', text: noteText, createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') },
                ...l.notes,
              ],
            }
          : l
      )
    );
    try {
      await apiFetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newNoteText: noteText, noteAuthor: user?.name || 'Operador' }),
      });
    } catch (err) {
      console.error('Erro ao adicionar nota:', err);
    }
  };

  const handleUpdateProposalMsg = async (leadId: string, customProposalMsg: string, videoUrl: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, customProposalMsg, videoUrl } : l)));
    try {
      const response = await apiFetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customProposalMsg, videoUrl }),
      });
      if (!response.ok) throw new Error('Falha ao salvar proposta');
    } catch (err) {
      console.error('Erro ao salvar proposta:', err);
    }
  };

  const handleSaveAiContentToLead = (leadId: string, aiData: AIContentResult) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, aiContent: aiData } : l)));
  };

  const handleDeleteLead = async (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (selectedLead?.id === leadId) setSelectedLead(leads.find((l) => l.id !== leadId) || null);
    try {
      await apiFetch(`/api/leads/${leadId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Erro ao deletar lead:', err);
    }
  };

  const handleClientPortalSubmit = async (portalData: ClientPortalData) => {
    if (!selectedLead) return false;
    try {
      const response = await apiFetch(`/api/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientPortalData: portalData, stage: 'onboarding' }),
      });
      if (!response.ok) throw new Error('Falha ao salvar os dados do portal.');
      setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? { ...l, clientPortalData: portalData, stage: 'onboarding' } : l)));
      return true;
    } catch (err) {
      console.error('Erro ao salvar dados do portal:', err);
      return false;
    }
  };

  // Se estiver na tela de login/registro ou portal público, renderiza sem a sidebar do Mercury
  return (
    <Routes>
      <Route path="/login" element={<LoginView onSwitchToRegister={() => navigate('/register')} />} />
      <Route path="/register" element={<RegisterView onSwitchToLogin={() => navigate('/login')} />} />
      <Route path="/portal/:token" element={<PortalPage />} />
      <Route path="/portal" element={<PortalPage />} />

      <Route
        path="*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-[#ECEDF7] text-[#16162B] flex font-sans">
              {/* Sidebar Lateral Esquerda (Estilo Mercury Exato) */}
              <aside className="w-64 bg-white border-r border-[#E7E7F1] flex flex-col shrink-0 hidden lg:flex sticky top-0 h-screen select-none">
                {/* Top Company Selector */}
                <div className="p-4 border-b border-[#E7E7F1] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#16162B] text-white rounded-md flex items-center justify-center font-bold text-xs">
                      P
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#16162B] flex items-center gap-1">
                        PerfilPro Agency <ChevronDown size={12} className="text-[#8A8AA3]" />
                      </div>
                      <div className="text-[10px] text-[#8A8AA3]">Workspace Principal</div>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs font-medium">
                  {/* Main Group */}
                  <div className="space-y-1">
                    {[
                      { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
                      { to: '/prospect', label: 'Lead Finder', icon: Search },
                      { to: '/leads', label: 'CRM Pipeline', icon: Kanban, badge: leads.length },
                      { to: '/proposals', label: 'Propostas WhatsApp', icon: MessageSquare },
                      { to: '/whatsapp', label: 'WhatsApp (QR)', icon: Smartphone },
                    ].map((item) => {
                      const IconComp = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-[#F1F0FC] text-[#5B4FE9] font-semibold'
                                : 'text-[#16162B] hover:bg-[#ECEDF7]/50 text-[#8A8AA3] hover:text-[#16162B]'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className="flex items-center gap-2.5">
                                <IconComp size={16} className={isActive ? 'text-[#5B4FE9]' : 'text-[#8A8AA3]'} />
                                <span>{item.label}</span>
                              </div>
                              {item.badge !== undefined && (
                                <span className="text-[10px] bg-[#ECEDF7] text-[#16162B] px-1.5 py-0.2 rounded-full font-mono">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>

                  {/* Workflows Group */}
                  <div className="space-y-1.5 pt-2">
                    <div className="px-3 text-[10px] font-semibold tracking-wider text-[#B4B4C6] uppercase">
                      Workflows & IA
                    </div>
                    {[
                      { to: '/rank-tracker', label: 'Rank Tracker', icon: MapPin },
                      { to: '/ai-engine', label: 'Motor de IA', icon: Sparkles },
                      { to: '/reports', label: 'Relatórios', icon: FileText },
                    ].map((item) => {
                      const IconComp = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-[#F1F0FC] text-[#5B4FE9] font-semibold'
                                : 'text-[#8A8AA3] hover:text-[#16162B] hover:bg-[#ECEDF7]/50'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <IconComp size={16} className={isActive ? 'text-[#5B4FE9]' : 'text-[#8A8AA3]'} />
                              <span>{item.label}</span>
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>

                  {/* Secondary Operations */}
                  <div className="space-y-1.5 pt-2">
                    <div className="px-3 text-[10px] font-semibold tracking-wider text-[#B4B4C6] uppercase">
                      Gestão
                    </div>
                    <NavLink
                      to="/client-portal"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#8A8AA3] hover:text-[#16162B] hover:bg-[#ECEDF7]/50 transition-colors"
                    >
                      <Globe size={16} className="text-[#8A8AA3]" />
                      <span>Portal do Cliente</span>
                    </NavLink>
                  </div>
                </div>

                {/* Sidebar Footer User */}
                <div className="p-3 border-t border-[#E7E7F1] flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-[#5B4FE9]/10 text-[#5B4FE9] font-bold text-xs flex items-center justify-center shrink-0">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium text-[#16162B] truncate">{user?.name || 'Operador'}</div>
                      <div className="text-[10px] text-[#8A8AA3] truncate">{user?.email || 'admin@perfilpro.com'}</div>
                    </div>
                  </div>
                  <button onClick={logout} className="text-xs text-[#8A8AA3] hover:text-[#16162B] p-1.5 rounded hover:bg-[#ECEDF7]/50" title="Sair">
                    Sair
                  </button>
                </div>
              </aside>

              {/* Conteúdo Principal */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar Exata Mercury */}
                <header className="bg-white border-b border-[#E7E7F1] h-16 flex items-center justify-between px-6 sticky top-0 z-30 shadow-2xs">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Search or jump to */}
                    <div className="relative max-w-md w-full">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8AA3]" />
                      <input
                        type="text"
                        placeholder="Search or jump to"
                        className="w-full bg-[#ECEDF7]/40 border border-[#E2E2EE] rounded-full pl-9 pr-12 py-1.5 text-xs text-[#16162B] focus:outline-none focus:border-[#5B4FE9] focus:bg-white transition-all shadow-2xs"
                        readOnly
                        value="Search or jump to"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-[#E2E2EE]/60 text-[#8A8AA3] px-1.5 py-0.5 rounded">
                        ⌘K
                      </span>
                    </div>
                  </div>

                  {/* Topbar Right Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate('/prospect')}
                      className="px-4 py-1.5 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/40 text-[#16162B] rounded-full text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5"
                    >
                      <span>Move Money</span>
                      <ChevronDown size={12} className="text-[#8A8AA3]" />
                    </button>

                    <button className="p-2 text-[#8A8AA3] hover:text-[#16162B] rounded-full hover:bg-[#ECEDF7]/50 transition-colors relative">
                      <HelpCircle size={18} />
                    </button>

                    <button className="p-2 text-[#8A8AA3] hover:text-[#16162B] rounded-full hover:bg-[#ECEDF7]/50 transition-colors relative">
                      <Bell size={18} />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#5B4FE9] rounded-full"></span>
                    </button>

                    <div className="w-8 h-8 rounded-full bg-[#5B4FE9] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer">
                      {user?.name?.[0] || 'P'}
                    </div>
                  </div>
                </header>

                <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
                  <Routes>
                    <Route
                      path="/dashboard"
                      element={
                        <DashboardView
                          leads={leads}
                          onSelectLead={(lead) => { setSelectedLead(lead); navigate('/leads'); }}
                          onNavigateTab={(tab) => navigate(tab as any)}
                        />
                      }
                    />
                    <Route
                      path="/prospect"
                      element={
                        <LeadFinderView
                          onAddLeadToCrm={handleAddLeadToCrm}
                          addedLeadPlaceIds={leads.map((l) => l.placeId)}
                        />
                      }
                    />
                    <Route
                      path="/leads"
                      element={
                        <CrmPipelineView
                          leads={leads}
                          onUpdateLeadStage={handleUpdateLeadStage}
                          onAddNote={handleAddNote}
                          onSelectLeadForProposal={(lead) => { setSelectedLead(lead); navigate('/proposals'); }}
                          onSelectLeadForAi={(lead) => { setSelectedLead(lead); navigate('/ai-engine'); }}
                          onSelectLeadForReport={(lead) => { setSelectedLead(lead); navigate('/reports'); }}
                          onDeleteLead={handleDeleteLead}
                        />
                      }
                    />
                    <Route
                      path="/proposals"
                      element={
                        <ProposalsView
                          leads={leads}
                          selectedLead={selectedLead}
                          onSelectLead={setSelectedLead}
                          onUpdateProposalMsg={handleUpdateProposalMsg}
                        />
                      }
                    />
                    <Route
                      path="/whatsapp"
                      element={<WhatsAppView />}
                    />
                    <Route
                      path="/rank-tracker"
                      element={
                        <RankTrackerView
                          leads={leads}
                          selectedLead={selectedLead}
                          onSelectLead={setSelectedLead}
                        />
                      }
                    />
                    <Route
                      path="/ai-engine"
                      element={
                        <AiEngineView
                          leads={leads}
                          selectedLead={selectedLead}
                          onSelectLead={setSelectedLead}
                          onSaveAiContentToLead={handleSaveAiContentToLead}
                        />
                      }
                    />
                                        <Route
                      path="/client-portal"
                      element={<ClientPortalView lead={selectedLead} onSubmitPortalData={handleClientPortalSubmit} />}
                    />
                    <Route path="/reports"
                      element={
                        <ReportsView
                          leads={leads}
                          selectedLead={selectedLead}
                          onSelectLead={setSelectedLead}
                        />
                      }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
