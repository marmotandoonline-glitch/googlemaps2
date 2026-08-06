import React, { useState, useEffect } from 'react';
import { MapPin, Search, RefreshCw, Trophy, ShieldAlert, Award, TrendingUp, BarChart3, ChevronRight } from 'lucide-react';
import { Lead } from '../types';
import { useAuth } from '../auth/AuthProvider';

interface RankTrackerViewProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
}

export const RankTrackerView: React.FC<RankTrackerViewProps> = ({ leads, selectedLead, onSelectLead }) => {
  const { apiFetch } = useAuth();
  const currentLead = selectedLead || leads[0];

  const [keyword, setKeyword] = useState(currentLead?.category || 'Serviços');
  const [loading, setLoading] = useState(false);
  const [gridData, setGridData] = useState<any>(null);

  const fetchRankGrid = async (leadId: string, searchKeyword: string) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/rank-tracker/${leadId}?keyword=${encodeURIComponent(searchKeyword)}`);
      const data = await res.json();
      setGridData(data);
    } catch (err) {
      console.error('Erro ao buscar grade de rank tracker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentLead) {
      setKeyword(currentLead.category || 'Serviços');
      fetchRankGrid(currentLead.id, currentLead.category || 'Serviços');
    }
  }, [currentLead?.id]);

  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = leads.find((l) => l.id === e.target.value);
    if (found) {
      onSelectLead(found);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentLead) {
      fetchRankGrid(currentLead.id, keyword);
    }
  };

  if (!currentLead) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        Nenhum lead disponível para monitoramento de ranking. Adicione leads via Lead Finder primeiro.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="text-rose-500" size={22} /> Rank Tracker Local (Monitor de Posição)
            </h2>
            <p className="text-xs text-slate-500">
              Audite em tempo real a posição do seu cliente no Google Pack Local (Top 3) em diferentes raios geográficos (1km, 3km, 5km).
            </p>
          </div>

          <div className="w-full sm:w-72">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Selecionar Cliente / Lead:
            </label>
            <select
              value={currentLead.id}
              onChange={handleLeadChange}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Palavra-Chave Alvo (Ex: Dentista em Moema, Oficina mecânica)
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ex: Clínicas de Estética"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Rodando Varredura...
                </>
              ) : (
                <>
                  <BarChart3 size={14} /> Executar Grid Audit
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Grid Results & Heatmap */}
      {gridData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Heatmap Grid 3x3 */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Mapa de Calor Geográfico (Rank por Ponto)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Endereço base: {gridData.centerAddress} • Palavra-chave: "{gridData.keyword}"
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Rank Médio</span>
                <p className="text-lg font-extrabold text-rose-600">#{gridData.averageRank}</p>
              </div>
            </div>

            {/* Grid 3x3 Visualization */}
            <div className="grid grid-cols-3 gap-3 py-2">
              {gridData.points.map((point: any) => {
                const isTop3 = point.clientRank <= 3;
                const isTop10 = point.clientRank <= 10;
                const bgRankColor = isTop3
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                  : isTop10
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300';

                return (
                  <div
                    key={point.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 transition-all shadow-xs ${bgRankColor}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                        {point.direction}
                      </span>
                      <span className="text-[10px] font-mono">{point.distanceKm} km</span>
                    </div>

                    <div className="text-center py-2">
                      <span className="text-2xl font-black">#{point.clientRank}</span>
                      <p className="text-[10px] font-medium opacity-80">Posição no Google</p>
                    </div>

                    <div className="text-[10px] border-t border-current/20 pt-1">
                      <span className="font-semibold block truncate">Top 1: {point.topCompetitors[0]?.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Top 3 (Ideal)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Posição 4-10 (Atenção)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> 11+ (Invisível)
              </span>
            </div>
          </div>

          {/* Right Col: Competitor Summary & Sales Pitch */}
          <div className="space-y-6">
            {/* Competitor Summary */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" /> Principais Concorrentes na Região
              </h3>

              <div className="space-y-3">
                {gridData.competitorSummary.map((comp: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{comp.name}</span>
                      <p className="text-[10px] text-slate-500">Média de pos.: #{comp.avgPosition}</p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-1 rounded font-extrabold text-xs">
                      {comp.appearancesInTop3}x Top 3
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Weapon Box */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl border border-indigo-700/50 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-emerald-400" size={20} />
                <h4 className="font-bold text-sm">Argumento de Vendas (Pitch)</h4>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed">
                "Notamos que a <strong>{currentLead.name}</strong> está perdendo clientes valiosos nas bordas de {currentLead.city} (Posição #{gridData.averageRank} na média), enquanto concorrentes menores dominam o Top 3. Podemos reverter isso em 30 dias."
              </p>
              <button
                onClick={() => alert('Relatório Rank Tracker copiado para envio via WhatsApp ou PDF!')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                Gerar Relatório Comercial para WhatsApp <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
