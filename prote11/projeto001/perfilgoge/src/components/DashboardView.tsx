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
      {/* Top Welcome Banner - Vercel / Linear Style */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 opacity-5 translate-x-10 -translate-y-10 text-emerald-400 pointer-events-none">
          <Building2 size={320} />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-mono tracking-wide">
            <ShieldCheck size={14} /> PAINEL OPERACIONAL DA AGÊNCIA
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Gestão de Otimização e Prospecção GBP
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed font-sans">
            Monitore o pipeline de vendas, audite perfis locais com IA e automatize propostas comerciais de alto impacto.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('prospect')}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10"
            >
              <Search size={14} /> Prospectar Novos Leads
            </button>
            <button
              onClick={() => onNavigateTab('leads')}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition-all"
            >
              <Users size={14} /> Ver Pipeline CRM ({totalLeads})
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total de Leads</span>
            <div className="p-2 bg-slate-800 text-slate-300 rounded-lg">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{totalLeads}</span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-0.5">
              <TrendingUp size={12} /> Ativos
            </span>
          </div>
          <p className="text-xs text-slate-400">{leadsInNegotiation} em negociação ativa</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Receita em Carteira</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-emerald-400 font-mono">Contratos</span>
          </div>
          <p className="text-xs text-slate-400">MRR Mensalistas: R$ {mrr.toLocaleString('pt-BR')}/mês</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Score Médio Oportunidades</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Star size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{avgScore} / 100</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                avgScore < 50
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : avgScore < 75
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {avgScore < 50 ? 'Alto Potencial' : 'Moderado'}
            </span>
          </div>
          <p className="text-xs text-slate-400">Menor score = maior dor do cliente</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Operação & Mensalistas</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{monthlyClients} Clientes</span>
            <span className="text-xs text-blue-400 font-mono">{leadsInProduction} em produção</span>
          </div>
          <p className="text-xs text-slate-400">Recorrência garantida com relatórios</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Funnel Distribution */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Distribuição do Funil de Vendas</h3>
              <p className="text-xs text-slate-400">Status atual das empresas registradas no CRM</p>
            </div>
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
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
                    <span className="text-slate-300">{stageLabels[stage]}</span>
                    <span className="text-slate-400 font-mono">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ['novo', 'analisado'].includes(stage)
                          ? 'bg-slate-600'
                          : ['contato_enviado', 'respondeu', 'negociacao'].includes(stage)
                          ? 'bg-amber-500'
                          : ['fechado', 'onboarding', 'producao'].includes(stage)
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Urgent Leads / Opportunities */}
        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
                <AlertTriangle size={15} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Maiores Oportunidades</h3>
                <p className="text-xs text-slate-400">Score de alerta (&lt; 50)</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {highOpportunityLeads.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">Nenhum lead com falha crítica no momento.</p>
            ) : (
              highOpportunityLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="p-3 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 rounded-xl cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">
                        {lead.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {lead.category} • {lead.city}
                      </p>
                    </div>
                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Score {lead.score}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>{lead.reviewsCount} avaliações ({lead.rating}★)</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Analisar <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigateTab('prospect')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Zap size={14} className="text-amber-400" /> Buscar Mais Empresas na Região
          </button>
          
          <button
            onClick={() => onNavigateTab('rank-tracker')}
            className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <MapPin size={14} /> Abrir Rank Tracker Local
          </button>
        </div>
      </div>
    </div>
  );
};
