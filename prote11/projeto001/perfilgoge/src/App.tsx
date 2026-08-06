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
  Moon,
  Sun,
  Globe,
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
import { Smartphone, MapPin } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';

export default function App() {
  const { user, logout, apiFetch } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads] = React.useState<Lead[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(INITIAL_LEADS[0] || null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    // Use authenticated fetch to load leads
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
      } else {
        console.error('Failed to add lead:', res.status);
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

  const handleUpdateProposalMsg = (leadId: string, customProposalMsg: string, videoUrl: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, customProposalMsg, videoUrl } : l)));
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

  const handleClientPortalSubmit = (portalData: ClientPortalData) => {
    if (!selectedLead) return;
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, clientPortalData: portalData, stage: 'onboarding' } : l))
    );
  };

  // Layout / Navigation - Stripe Light Mode Style
  return (
    <div className="min-h-screen bg-[#f6f9fc] text-[#0a2540] flex flex-col font-sans">
      <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#635bff] rounded-lg flex items-center justify-center text-white font-black text-base shadow-sm">P</div>
              <span className="font-bold text-sm tracking-tight text-[#0a2540]">PerfilPro</span>
            </div>
            
            <div className="hidden md:flex items-center relative w-64">
              <Search size={14} className="absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#0a2540] focus:outline-none focus:border-[#635bff] focus:bg-white transition-all shadow-2xs"
                readOnly
                value="Google Business Intelligence"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/portal')}
              className="py-1.5 px-3 bg-[#635bff] hover:bg-[#5851db] text-white font-medium text-xs rounded-md transition-all shadow-xs flex items-center gap-1.5"
            >
              Portal do Cliente
            </button>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <span className="text-xs text-slate-600 font-medium hidden sm:inline">{user?.name || user?.email}</span>
            <button onClick={logout} className="text-xs px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-md transition-colors border border-[#e2e8f0] shadow-2xs font-medium">
              Sair
            </button>
          </div>
        </div>

        {/* Subnav Pills Stripe Style */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto h-12 border-t border-[#f0f4f8]">
          {[
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/prospect', label: 'Lead Finder', icon: Search },
            { to: '/leads', label: 'CRM Pipeline', icon: Kanban, badge: leads.length },
            { to: '/proposals', label: 'Propostas WhatsApp', icon: MessageSquare },
            { to: '/whatsapp', label: 'WhatsApp (QR)', icon: Smartphone },
            { to: '/rank-tracker', label: 'Rank Tracker', icon: MapPin },
            { to: '/ai-engine', label: 'Motor de IA', icon: Sparkles },
            { to: '/reports', label: 'Relatórios', icon: FileText },
          ].map((tab) => {
            const IconComp = tab.icon as any;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#635bff]/10 text-[#635bff] font-semibold'
                      : 'text-slate-600 hover:text-[#0a2540] hover:bg-slate-100/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <IconComp size={14} className={isActive ? 'text-[#635bff]' : 'text-slate-400'} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                        {tab.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <Routes>
          <Route path="/login" element={<LoginView onSwitchToRegister={() => navigate('/register')} />} />
          <Route path="/register" element={<RegisterView onSwitchToLogin={() => navigate('/login')} />} />

          <Route path="/portal/:token" element={<PortalPage />} />
          <Route path="/portal" element={<PortalPage />} />

          <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardView
                  leads={leads}
                  onSelectLead={(lead) => { setSelectedLead(lead); navigate('/leads'); }}
                  onNavigateTab={(tab) => navigate(tab as any)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prospect"
            element={
              <ProtectedRoute>
                <LeadFinderView
                  onAddLeadToCrm={handleAddLeadToCrm}
                  addedLeadPlaceIds={leads.map((l) => l.placeId)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute>
                <CrmPipelineView
                  leads={leads}
                  onUpdateLeadStage={handleUpdateLeadStage}
                  onAddNote={handleAddNote}
                  onSelectLeadForProposal={(lead) => { setSelectedLead(lead); navigate('/proposals'); }}
                  onSelectLeadForAi={(lead) => { setSelectedLead(lead); navigate('/ai-engine'); }}
                  onSelectLeadForReport={(lead) => { setSelectedLead(lead); navigate('/reports'); }}
                  onDeleteLead={handleDeleteLead}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proposals"
            element={
              <ProtectedRoute>
                <ProposalsView
                  leads={leads}
                  selectedLead={selectedLead}
                  onSelectLead={setSelectedLead}
                  onUpdateProposalMsg={handleUpdateProposalMsg}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/whatsapp"
            element={
              <ProtectedRoute>
                <WhatsAppView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rank-tracker"
            element={
              <ProtectedRoute>
                <RankTrackerView
                  leads={leads}
                  selectedLead={selectedLead}
                  onSelectLead={setSelectedLead}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-engine"
            element={
              <ProtectedRoute>
                <AiEngineView
                  leads={leads}
                  selectedLead={selectedLead}
                  onSelectLead={setSelectedLead}
                  onSaveAiContentToLead={handleSaveAiContentToLead}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsView
                  leads={leads}
                  selectedLead={selectedLead}
                  onSelectLead={setSelectedLead}
                />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
