import React from 'react';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  DollarSign,
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

  return (
    <div className="space-y-6">
      {/* Welcome Title & Action Pills (Mercury Style) */}
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-[#16162B] tracking-tight">Welcome, Jane</h1>

        {/* Action Pills Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#E7E7F1]">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateTab('proposals')}
              className="px-4 py-1.5 bg-[#5B4FE9] hover:bg-[#4C3FDB] text-white rounded-full text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Send size={13} /> Send
            </button>
            <button
              onClick={() => onNavigateTab('leads')}
              className="px-4 py-1.5 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] rounded-full text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <Download size={13} className="text-[#8A8AA3]" /> Request
            </button>
            <button
              onClick={() => onNavigateTab('prospect')}
              className="px-4 py-1.5 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] rounded-full text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCw size={13} className="text-[#8A8AA3]" /> Transfer
            </button>
            <button
              onClick={() => onNavigateTab('whatsapp')}
              className="px-4 py-1.5 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] rounded-full text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <Plus size={13} className="text-[#8A8AA3]" /> Deposit
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-4 py-1.5 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] rounded-full text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <FileText size={13} className="text-[#8A8AA3]" /> Upload Bill
            </button>
            <button
              onClick={() => onNavigateTab('proposals')}
              className="px-4 py-1.5 bg-white border border-[#E2E2EE] hover:bg-[#ECEDF7]/50 text-[#16162B] rounded-full text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 size={13} className="text-[#8A8AA3]" /> Create Invoice
            </button>
          </div>

          <div className="text-xs text-[#8A8AA3] font-medium flex items-center gap-1 cursor-pointer hover:text-[#16162B]">
            <Settings size={13} /> Customize
          </div>
        </div>
      </div>

      {/* Main Grid: Balance & Accounts (Mercury Layout Exato) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Balance & Growth Chart (Exato igual referência Mercury) */}
        <div className="lg:col-span-2 bg-white border border-[#E7E7F1] rounded-[20px] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#16162B]">Mercury Balance</span>
              <ShieldCheck size={14} className="text-[#5B4FE9]" />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 bg-white border border-[#E2E2EE] rounded-lg text-[#8A8AA3] hover:text-[#16162B] shadow-2xs">
                <FileText size={13} />
              </button>
              <button className="p-1.5 bg-white border border-[#E2E2EE] rounded-lg text-[#8A8AA3] hover:text-[#16162B] shadow-2xs">
                <Building2 size={13} />
              </button>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold text-[#16162B] tabular-nums tracking-tight">
              R$ {totalRevenue.toLocaleString('pt-BR')}<span className="text-lg font-normal text-[#8A8AA3]">.24</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#8A8AA3]">
            <span className="text-[#1F9254] font-medium flex items-center gap-1">
              <ArrowUpRight size={14} /> R$ {(totalRevenue * 0.85).toFixed(2)}
            </span>
            <span className="text-[#16162B] font-medium flex items-center gap-1">
              <ArrowUpRight size={14} className="rotate-90 text-[#8A8AA3]" /> R$ 180.3K
            </span>
            <span className="ml-auto text-[11px] font-mono text-[#8A8AA3]">Last 30 Days</span>
          </div>

          {/* Mercury Exact Balance Chart (Line chart with lavender container & smooth purple gradient) */}
          <div className="pt-2">
            <div className="h-40 w-full bg-[#ECEDF7]/40 rounded-2xl border border-[#E2E2EE] p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 flex items-end px-4 pb-2">
                <svg className="w-full h-28 text-[#5B4FE9] overflow-visible" fill="none" viewBox="0 0 400 100">
                  <path
                    d="M 0 85 Q 100 65 200 45 T 400 20"
                    stroke="#5B4FE9"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 85 Q 100 65 200 45 T 400 20 L 400 100 L 0 100 Z"
                    fill="url(#mercuryGrad)"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="mercuryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#5B4FE9" />
                      <stop offset="100%" stopColor="#5B4FE9" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex justify-between text-[11px] text-[#8A8AA3] font-mono z-10 pt-1 border-t border-[#E2E2EE]/60">
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
              <span className="text-[#8A8AA3]">Payroll</span>
              <span className="font-semibold text-[#16162B] font-mono">R$ {mrr.toLocaleString('pt-BR')}.13</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8A8AA3]">Profit</span>
              <span className="font-semibold text-[#16162B] font-mono">R$ 150,180.24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8A8AA3]">Operating Expenses</span>
              <span className="font-semibold text-[#16162B] font-mono">R$ 49,001.38</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8A8AA3]">Treasury</span>
              <span className="font-semibold text-[#16162B] font-mono">R$ 84,056.82</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8A8AA3]">Taxes</span>
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
              <div className="font-semibold text-[#16162B]">{stageCounts.novo} • R$ {(stageCounts.novo * 1500).toLocaleString('pt-BR')}</div>
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

        {/* Credit Card Card */}
        <div className="bg-white border border-[#E7E7F1] rounded-[20px] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#16162B] text-xs uppercase tracking-wider text-[#8A8AA3]">Credit Card</span>
            <CreditCard size={15} className="text-[#8A8AA3]" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#16162B]">R$ 10,423.00</div>
            <div className="w-full bg-[#ECEDF7] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#5B4FE9] h-full rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#E7E7F1] flex justify-between items-center text-xs">
            <span className="text-[#8A8AA3]">Balance • Pending</span>
            <span className="text-[#5B4FE9] font-mono font-semibold">R$ 40,000 available</span>
          </div>
        </div>

        {/* Bill Pay Card */}
        <div className="bg-white border border-[#E7E7F1] rounded-[20px] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#16162B] text-xs uppercase tracking-wider text-[#8A8AA3]">Bill Pay</span>
            <FileText size={15} className="text-[#8A8AA3]" />
          </div>
          <div className="flex justify-between text-xs pt-1">
            <div>
              <div className="text-[#8A8AA3] text-[11px]">Outstanding</div>
              <div className="font-semibold text-[#16162B]">11</div>
            </div>
            <div>
              <div className="text-[#8A8AA3] text-[11px]">Overdue</div>
              <div className="font-semibold text-[#16162B]">4</div>
            </div>
            <div>
              <div className="text-[#8A8AA3] text-[11px]">Due soon</div>
              <div className="font-semibold text-[#16162B]">1</div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#E7E7F1] flex justify-between items-center text-xs">
            <span className="text-[#8A8AA3]">Inbox 4 bills</span>
            <button onClick={() => onNavigateTab('leads')} className="text-[#5B4FE9] font-medium hover:underline">View &rarr;</button>
          </div>
        </div>
      </div>
    </div>
  );
};
