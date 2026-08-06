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

  const avgScore =
    leads.length > 0
      ? Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length)
      : 0;

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
      {/* Mercury Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E7E7F1]">
        <div>
          <h1 className="text-2xl font-semibold text-[#16162B] tracking-tight">Painel Operacional</h1>
          <p className="text-xs text-[#8A8AA3] mt-0.5">Visão geral de receita, MRR e performance de prospecção local.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="px-3 py-1.5 bg-white border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B] hover:bg-[#ECEDF7]/50 shadow-2xs flex items-center gap-1.5">
            <span>All time</span>
            <ChevronRight size={12} className="rotate-90 text-[#8A8AA3]" />
          </button>
          <button className="px-3 py-1.5 bg-white border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B] hover:bg-[#ECEDF7]/50 shadow-2xs flex items-center gap-1.5">
            <Calendar size={13} className="text-[#8A8AA3]" />
            <span>Jan 1–Sep 10</span>
          </button>
          <button className="px-3 py-1.5 bg-white border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B] hover:bg-[#ECEDF7]/50 shadow-2xs flex items-center gap-1.5">
            <span>Monthly</span>
            <ChevronRight size={12} className="rotate-90 text-[#8A8AA3]" />
          </button>
          <button
            onClick={() => onNavigateTab('prospect')}
            className="px-3.5 py-1.5 bg-[#5B4FE9] hover:bg-[#4C3FDB] text-white rounded-full text-xs font-medium shadow-xs flex items-center gap-1.5"
          >
            <Zap size={13} /> Prospectar Leads
          </button>
        </div>
      </div>

      {/* Mercury Growth Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Card */}
        <div className="bg-white border border-[#E7E7F1] rounded-[20px] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#8A8AA3] uppercase tracking-wider">Receita em Carteira (MRR)</span>
              <span className="text-[10px] bg-[#ECEDF7] text-[#16162B] px-1.5 py-0.5 rounded font-mono">i</span>
            </div>
            <span className="text-[11px] text-[#8A8AA3] font-mono">Data as of Sep 9</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-[#16162B] tabular-nums">
              R$ {totalRevenue.toLocaleString('pt-BR')}<span className="text-lg font-normal text-[#8A8AA3]">.00</span>
            </span>
            <span className="text-xs font-semibold bg-[#E7F6ED] text-[#1F9254] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp size={12} /> +55.9%
            </span>
          </div>

          <p className="text-xs text-[#8A8AA3]">
            Mensalistas Ativos: <span className="font-semibold text-[#16162B]">R$ {mrr.toLocaleString('pt-BR')}/mês</span>
          </p>

          {/* Mercury Line Chart */}
          <div className="pt-4 border-t border-[#E7E7F1]">
            <div className="h-28 w-full bg-[#ECEDF7]/30 rounded-xl border border-[#E2E2EE] p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 flex items-end px-3">
                <svg className="w-full h-20 text-[#5B4FE9] overflow-visible" fill="none" viewBox="0 0 300 80">
                  <path
                    d="M 0 70 Q 75 55 150 35 T 300 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 70 Q 75 55 150 35 T 300 15 L 300 80 L 0 80 Z"
                    fill="url(#grad)"
                    opacity="0.12"
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
                <span>Jan 1</span>
                <span>Sep 9</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Subscribers Card */}
        <div className="bg-white border border-[#E7E7F1] rounded-[20px] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#8A8AA3] uppercase tracking-wider">Total de Leads & Clientes</span>
              <span className="text-[10px] bg-[#ECEDF7] text-[#16162B] px-1.5 py-0.5 rounded font-mono">i</span>
            </div>
            <span className="text-[11px] text-[#8A8AA3] font-mono">Data as of Sep 9</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-[#16162B] tabular-nums">{totalLeads}</span>
            <span className="text-xs font-semibold bg-[#E7F6ED] text-[#1F9254] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp size={12} /> +55.6%
            </span>
          </div>

          <p className="text-xs text-[#8A8AA3]">
            Em Negociação & Produção: <span className="font-semibold text-[#16162B]">{leadsInNegotiation + leadsInProduction} ativos</span>
          </p>

          {/* Mercury Line Chart 2 */}
          <div className="pt-4 border-t border-[#E7E7F1]">
            <div className="h-28 w-full bg-[#ECEDF7]/30 rounded-xl border border-[#E2E2EE] p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 flex items-end px-3">
                <svg className="w-full h-20 text-[#5B4FE9] overflow-visible" fill="none" viewBox="0 0 300 80">
                  <path
                    d="M 0 65 Q 100 45 200 25 T 300 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 65 Q 100 45 200 25 T 300 10 L 300 80 L 0 80 Z"
                    fill="url(#grad2)"
                    opacity="0.12"
                  />
                  <defs>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#5B4FE9" />
                      <stop offset="100%" stopColor="#5B4FE9" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-[#8A8AA3] font-mono z-10">
                <span>Jan 1</span>
                <span>Sep 9</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Funnel and Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Funnel distribution */}
        <div className="lg:col-span-2 bg-white border border-[#E7E7F1] rounded-[20px] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#16162B] text-sm">Distribuição do Funil de Vendas</h3>
              <p className="text-xs text-[#8A8AA3]">Status atual das empresas registradas no CRM</p>
            </div>
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-xs text-[#5B4FE9] hover:underline font-semibold flex items-center gap-1"
            >
              Ver Kanban <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {(Object.keys(stageCounts) as PipelineStage[]).map((stage) => {
              const count = stageCounts[stage];
              const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;

              return (
                <div key={stage} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-[#16162B]">{stageLabels[stage]}</span>
                    <span className="text-[#8A8AA3] font-mono">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#ECEDF7] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ['novo', 'analisado'].includes(stage)
                          ? 'bg-[#B4B4C6]'
                          : ['contato_enviado', 'respondeu', 'negociacao'].includes(stage)
                          ? 'bg-[#B7791F]'
                          : ['fechado', 'onboarding', 'producao'].includes(stage)
                          ? 'bg-[#1F9254]'
                          : 'bg-[#5B4FE9]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Urgent Opportunities */}
        <div className="bg-white border border-[#E7E7F1] rounded-[20px] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#FDEAF0] text-[#D6336C] rounded-full border border-[#D6336C]/20">
                <AlertTriangle size={15} />
              </div>
              <div>
                <h3 className="font-semibold text-[#16162B] text-sm">Maiores Oportunidades</h3>
                <p className="text-xs text-[#8A8AA3]">Score de alerta (&lt; 50)</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {highOpportunityLeads.length === 0 ? (
              <p className="text-xs text-[#8A8AA3] italic py-4 text-center">Nenhum lead com falha crítica no momento.</p>
            ) : (
              highOpportunityLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="p-3 bg-[#ECEDF7]/30 hover:bg-[#ECEDF7]/70 border border-[#E2E2EE] rounded-xl cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-[#16162B] text-xs group-hover:text-[#5B4FE9] transition-colors">
                        {lead.name}
                      </h4>
                      <p className="text-[11px] text-[#8A8AA3]">
                        {lead.category} • {lead.city}
                      </p>
                    </div>
                    <span className="bg-[#FDEAF0] text-[#D6336C] font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Score {lead.score}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8A8AA3] pt-1 border-t border-[#E2E2EE]">
                    <span>{lead.reviewsCount} avaliações ({lead.rating}★)</span>
                    <span className="text-[#5B4FE9] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Analisar <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigateTab('prospect')}
            className="w-full py-2.5 bg-[#5B4FE9] hover:bg-[#4C3FDB] text-white text-xs font-medium rounded-full transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <Zap size={14} /> Buscar Mais Empresas na Região
          </button>
          
          <button
            onClick={() => onNavigateTab('rank-tracker')}
            className="w-full py-2.5 bg-white hover:bg-[#ECEDF7]/50 text-[#16162B] border border-[#E2E2EE] text-xs font-medium rounded-full transition-colors shadow-2xs flex items-center justify-center gap-1.5"
          >
            <MapPin size={14} className="text-[#5B4FE9]" /> Abrir Rank Tracker Local
          </button>
        </div>
      </div>
    </div>
  );
};
