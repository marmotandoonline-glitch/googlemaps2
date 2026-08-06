import React from 'react';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Star,
  Search,
  ChevronRight,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  Settings,
  Send,
  Download,
  RefreshCw,
  Plus,
  FileText,
  Upload,
  CreditCard,
} from 'lucide-react';
import { Lead, PipelineStage } from '../types';

interface DashboardViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ leads, onSelectLead, onNavigateTab }) => {
  const totalLeads = leads.length;

  const leadsInNegotiation = leads.filter((l) =>
    ['contato_enviado', 'respondeu', 'negociacao'].includes(l.stage)
  ).length;

  const leadsInProduction = leads.filter((l) =>
    ['fechado', 'onboarding', 'producao'].includes(l.stage)
  ).length;

  const monthlyClients = leads.filter((l) => l.stage === 'mensalista').length;

  const totalRevenue = leads
    .filter((l) => ['fechado', 'onboarding', 'producao', 'entregue', 'mensalista'].includes(l.stage))
    .reduce((acc, l) => acc + (l.dealValue || 0), 0);

  const mrr = leads
    .filter((l) => l.stage === 'mensalista')
    .reduce((acc, l) => acc + (l.dealValue || 0), 0);

  const highOpportunityLeads = leads
    .filter((l) => l.score < 50)
    .sort((a, b) => a.score - b.score)
    .slice(0, 4);

  const stageCounts: Record<PipelineStage, number> = {
    novo: 0,
    analisado: 0,
    contato_enviado: 0,
    respondeu: 0,
    negociacao: 0,
    fechado: 0,
    onboarding: 0,
    producao: 0,
    entregue: 0,
    mensalista: 0,
  };

  leads.forEach((l) => {
    if (stageCounts[l.stage] !== undefined) {
      stageCounts[l.stage]++;
    }
  });

  const stageLabels: { [key in PipelineStage]: string } = {
    novo: 'Novos Leads',
    analisado: 'Analisados',
    contato_enviado: 'Contato Enviado',
    respondeu: 'Responderam',
    negociacao: 'Em Negociação',
    fechado: 'Fechados',
    onboarding: 'Onboarding',
    producao: 'Em Produção',
    entregue: 'Entregues',
    mensalista: 'Mensalistas',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Title & Action Pills (Mercury Style) */}
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-[#16162B] tracking-tight">Welcome, Operator</h1>

        {/* Action Pills Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#E7E7F1]">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateTab('proposals')}
              className="px-3.5 py-1.5 bg-[#5B4FE9] hover:bg-[#4C3FDB] text-white rounded-full text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Send size={13} /> Send Proposal
            </button>
            <button
              onClick={() => onNavigateTab('leads')}
              className="px-3.5 py-1.5 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] rounded-full text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <Download size={13} className="text-[#8A8AA3]" /> Request Lead
            </button>
            <button
              onClick={() => onNavigateTab('prospect')}
              className="px-3.5 py-1.5 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] rounded-full text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCw size={13} className="text-[#8A8AA3]" /> Sync Finder
            </button>
            <button
              onClick={() => onNavigateTab('whatsapp')}
              className="px-3.5 py-1.5 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] rounded-full text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <Plus size={13} className="text-[#8A8AA3]" /> WhatsApp QR
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-3.5 py-1.5 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] rounded-full text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <FileText size={13} className="text-[#8A8AA3]" /> Create Report
            </button>
          </div>

          <div className="text-xs text-[#8A8AA3] font-medium flex items-center gap-1 cursor-pointer hover:text-[#16162B]">
            <Settings size={13} /> Customize
          </div>
        </div>
      </div>

      {/* Main Grid: Balance & Accounts (Mercury Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Balance & Growth Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E7E7F1] rounded-[20px] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#16162B]">PerfilPro Balance</span>
              <span className="text-[10px] bg-[#E7F6ED] text-[#1F9254] px-1.5 py-0.5 rounded-full font-mono font-bold">Verified</span>
            </div>
            <div className="flex items-center gap-1 bg-[#ECEDF7]/60 p-1 rounded-lg text-xs font-medium text-[#8A8AA3]">
              <span className="px-2 py-0.5 bg-white text-[#16162B] rounded shadow-2xs">Last 30 Days</span>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold text-[#16162B] tabular-nums tracking-tight">
              R$ {totalRevenue.toLocaleString('pt-BR')}<span className="text-lg font-normal text-[#8A8AA3]">.24</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#8A8AA3]">
            <span className="text-[#1F9254] font-medium flex items-center gap-1">
              <ArrowUpRight size={14} /> R$ {(totalRevenue * 0.85).toFixed(2)} Inflow
            </span>
            <span className="text-[#D6336C] font-medium flex items-center gap-1">
              <ArrowUpRight size={14} className="rotate-90" /> R$ 0.00 Outflow
            </span>
          </div>

          {/* Mercury Line Chart */}
          <div className="pt-4 border-t border-[#E7E7F1]">
            <div className="h-32 w-full bg-[#ECEDF7]/20 rounded-xl border border-[#E2E2EE] p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 flex items-end px-3">
                <svg className="w-full h-24 text-[#5B4FE9] overflow-visible" fill="none" viewBox="0 0 300 80">
                  <path
                    d="M 0 70 Q 75 50 150 35 T 300 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 70 Q 75 50 150 35 T 300 15 L 300 80 L 0 80 Z"
                    fill="url(#grad)"
                    opacity="0.1"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#5B4FE9" />
                      <stop offset="100%" stopColor="#5B4FE9" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-[#8A8AA3] font-mono z-10">
                <span>Sept 26</span>
                <span>Oct 4</span>
                <span>Oct 13</span>
                <span>Oct 22</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Accounts breakdown */}
        <div className="bg-white border border-[#E7E7F1] rounded-[20px] p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7E7F1] pb-3">
            <span className="font-semibold text-[#16162B] text-sm">Accounts</span>
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigateTab('leads')} className="text-xs text-[#8A8AA3] hover:text-[#16162B]">+</button>
              <span className="text-xs text-[#8A8AA3]">:</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#8A8AA3]">Payroll / MRR</span>
              <span className="font-semibold text-[#16162B] font-mono">R$ {mrr.toLocaleString('pt-BR')}.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8A8AA3]">Closed Deals</span>
              <span className="font-semibold text-[#16162B] font-mono">R$ {totalRevenue.toLocaleString('pt-BR')}.24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8A8AA3]">Operating Expenses</span>
              <span className="font-semibold text-[#16162B] font-mono">R$ 0.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8A8AA3]">Treasury</span>
              <span className="font-semibold text-[#16162B] font-mono">R$ 84,056.82</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8A8AA3]">Taxes & Reserves</span>
              <span className="font-semibold text-[#16162B] font-mono">R$ 60,494.21</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7E7F1]">
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-xs text-[#5B4FE9] font-medium hover:underline flex items-center gap-1"
            >
              +2 View all accounts
            </button>
          </div>
        </div>
      </div>

      {/* Third Row: Invoicing, Credit Card, Bill Pay (Mercury Small Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Invoicing Card */}
        <div className="bg-white border border-[#E7E7F1] rounded-[20px] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#16162B] text-xs uppercase tracking-wider text-[#8A8AA3]">Invoicing</span>
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigateTab('proposals')} className="text-xs text-[#8A8AA3] hover:text-[#16162B]">+</button>
            </div>
          </div>
          <div className="flex justify-between text-xs pt-1">
            <div>
              <div className="text-[#8A8AA3] text-[11px]">Overdue</div>
              <div className="font-semibold text-[#D6336C]">{stageCounts.novo} • R$ {(stageCounts.novo * 1500).toLocaleString('pt-BR')}</div>
            </div>
            <div>
              <div className="text-[#8A8AA3] text-[11px]">Paid</div>
              <div className="font-semibold text-[#1F9254]">{monthlyClients} • R$ {mrr.toLocaleString('pt-BR')}</div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#E7E7F1] flex justify-between items-center text-xs">
            <span className="text-[#8A8AA3]">{totalLeads} total invoices</span>
            <button onClick={() => onNavigateTab('proposals')} className="text-[#5B4FE9] font-medium hover:underline">View &rarr;</button>
          </div>
        </div>

        {/* Credit Card / CRM Pipeline Card */}
        <div className="bg-white border border-[#E7E7F1] rounded-[20px] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#16162B] text-xs uppercase tracking-wider text-[#8A8AA3]">CRM Pipeline</span>
            <CreditCard size={15} className="text-[#8A8AA3]" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#16162B]">{totalLeads} Leads</div>
            <div className="w-full bg-[#ECEDF7] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#5B4FE9] h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#E7E7F1] flex justify-between items-center text-xs">
            <span className="text-[#8A8AA3]">{leadsInNegotiation} in negotiation</span>
            <button onClick={() => onNavigateTab('leads')} className="text-[#5B4FE9] font-medium hover:underline">Manage &rarr;</button>
          </div>
        </div>

        {/* Bill Pay / Rank Tracker Card */}
        <div className="bg-white border border-[#E7E7F1] rounded-[20px] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#16162B] text-xs uppercase tracking-wider text-[#8A8AA3]">Rank Tracker</span>
            <MapPin size={15} className="text-[#8A8AA3]" />
          </div>
          <div className="flex justify-between text-xs pt-1">
            <div>
              <div className="text-[#8A8AA3] text-[11px]">Grid Audits</div>
              <div className="font-semibold text-[#16162B]">Active Maps</div>
            </div>
            <div>
              <div className="text-[#8A8AA3] text-[11px]">Top 3 Pack</div>
              <div className="font-semibold text-[#1F9254]">Optimized</div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#E7E7F1] flex justify-between items-center text-xs">
            <span className="text-[#8A8AA3]">Local SEO grid</span>
            <button onClick={() => onNavigateTab('rank-tracker')} className="text-[#5B4FE9] font-medium hover:underline">Open &rarr;</button>
          </div>
        </div>
      </div>
    </div>
  );
};
