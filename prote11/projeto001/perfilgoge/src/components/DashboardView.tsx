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
} from 'lucide-react';
import { Lead, PipelineStage } from '../types';

interface DashboardViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ leads, onSelectLead, onNavigateTab }) => {
  // Metrics Calculations
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

  // Stage distribution
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
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-6">
          <Building2 size={300} />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck size={14} /> Painel Operacional da Agência
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gestão de Otimizações do Perfil da Empresa no Google
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Acompanhe a prospecção de leads, cálculo de score de oportunidade, pipeline de vendas e produção automatizada com IA.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('finder')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all shadow-md hover:shadow-indigo-500/20"
            >
              <Search size={16} /> Prospectar Novos Leads
            </button>
            <button
              onClick={() => onNavigateTab('crm')}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition-all"
            >
              <Users size={16} /> Ver Pipeline CRM ({totalLeads})
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Leads</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalLeads}</span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
              <TrendingUp size={12} /> Ativos
            </span>
          </div>
          <p className="text-xs text-slate-500">{leadsInNegotiation} em negociação ativa</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Receita em Carteira</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Contratos</span>
          </div>
          <p className="text-xs text-slate-500">MRR Mensalistas: R$ {mrr.toLocaleString('pt-BR')}/mês</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Score Médio Oportunidades</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg">
              <Star size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{avgScore} / 100</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                avgScore < 50
                  ? 'bg-rose-100 text-rose-700'
                  : avgScore < 75
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {avgScore < 50 ? 'Alto Potencial' : 'Otimização Moderada'}
            </span>
          </div>
          <p className="text-xs text-slate-500">Quanto menor o score, maior a dor do cliente</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Operação & Mensalistas</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{monthlyClients} Clientes</span>
            <span className="text-xs text-blue-600 font-medium">{leadsInProduction} em produção</span>
          </div>
          <p className="text-xs text-slate-500">Recorrência garantida com relatórios e posts</p>
        </div>
      </div>

      {/* Main Grid: Pipeline Breakdown & Urgent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Funnel Distribution */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Distribuição do Funil de Vendas</h3>
              <p className="text-xs text-slate-500">Status atual das empresas registradas no CRM</p>
            </div>
            <button
              onClick={() => onNavigateTab('crm')}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1"
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
                    <span className="text-slate-700 dark:text-slate-300">{stageLabels[stage]}</span>
                    <span className="text-slate-500 font-semibold">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ['novo', 'analisado'].includes(stage)
                          ? 'bg-slate-400'
                          : ['contato_enviado', 'respondeu', 'negociacao'].includes(stage)
                          ? 'bg-amber-500'
                          : ['fechado', 'onboarding', 'producao'].includes(stage)
                          ? 'bg-indigo-600'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: High Opportunity Targets (Urgent Leads) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-100 text-rose-600 rounded">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Maiores Oportunidades</h3>
                <p className="text-xs text-slate-500">Perfis com falhas críticas (Score &lt; 50)</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {highOpportunityLeads.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Nenhum lead com falha crítica no momento.</p>
            ) : (
              highOpportunityLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="p-3 bg-slate-50 hover:bg-indigo-50/60 dark:bg-slate-800/60 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 transition-colors">
                        {lead.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {lead.category} • {lead.city} - {lead.state}
                      </p>
                    </div>
                    <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 font-extrabold text-[11px] px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                      Score {lead.score}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span>{lead.reviewsCount} avaliações ({lead.rating}★)</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Abrir <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigateTab('finder')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Zap size={14} className="text-amber-500" /> Buscar Mais Empresas na Região
          </button>
        </div>
      </div>
    </div>
  );
};
