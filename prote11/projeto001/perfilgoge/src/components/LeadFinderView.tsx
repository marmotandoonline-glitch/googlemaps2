import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Building2,
  Filter,
  Star,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  Zap,
  ShieldAlert,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { LeadSearchResult, LeadDiagnostic } from '../types';

interface LeadFinderViewProps {
  onAddLeadToCrm: (leadData: LeadSearchResult) => void;
  addedLeadPlaceIds: string[];
}

export const LeadFinderView: React.FC<LeadFinderViewProps> = ({ onAddLeadToCrm, addedLeadPlaceIds }) => {
  const [niche, setNiche] = useState('Clínica Odontológica');
  const [city, setCity] = useState('São Paulo');
  const [neighborhood, setNeighborhood] = useState('Moema');
  const [state, setState] = useState('SP');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<LeadSearchResult[]>([]);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<{
    companyName: string;
    diagnostic: LeadDiagnostic;
  } | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, city, neighborhood, state }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Erro ao buscar empresas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial search on load if empty
  React.useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Filter Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="text-indigo-600" size={22} /> Lead Finder & Analisador de Perfis
            </h2>
            <p className="text-xs text-slate-500">
              Encontre empresas no Google Maps, analise a qualidade do perfil e calcule o Score de Oportunidade (0–100).
            </p>
          </div>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-3 py-1 rounded-full w-fit">
            Pesquisa em Tempo Real
          </span>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nicho / Categoria
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Ex: Dentista, Oficina, Barbearia"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bairro (Opcional)
            </label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Ex: Moema, Savassi, Batel"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">UF / Estado</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {['SP', 'RJ', 'MG', 'PR', 'RS', 'SC', 'BA', 'PE', 'DF', 'CE', 'GO'].map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Buscando...
                </>
              ) : (
                <>
                  <Search size={14} /> Pesquisar Empresas
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Filter Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Exibindo <strong>{searchResults.length}</strong> perfis encontrados em {city} - {state}
        </span>
        <span className="flex items-center gap-1 text-amber-600 font-medium">
          <Zap size={14} /> Score baixo (0-45) = Maior facilidade de fechar venda
        </span>
      </div>

      {/* Search Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((item) => {
          const isAdded = addedLeadPlaceIds.includes(item.placeId);
          const scoreColor =
            item.calculatedScore < 45
              ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
              : item.calculatedScore < 70
              ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300';

          return (
            <div
              key={item.placeId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-slate-500">
                      {item.category} • {item.neighborhood}
                    </p>
                  </div>
                  <div
                    className={`flex flex-col items-end px-2.5 py-1 rounded-lg border text-center ${scoreColor}`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">Score</span>
                    <span className="text-lg font-extrabold leading-none">{item.calculatedScore}</span>
                  </div>
                </div>

                {/* Stars and Reviews */}
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center text-amber-500 font-semibold">
                    <Star size={14} className="fill-amber-400 text-amber-400 mr-1" />
                    {item.rating}
                  </div>
                  <span>({item.reviewsCount} avaliações)</span>
                  <span className="text-slate-300">•</span>
                  <span>{item.photosCount} fotos</span>
                </div>

                {/* Missing Elements Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {!item.website && (
                    <span className="text-[10px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                      Sem Website
                    </span>
                  )}
                  {item.photosCount < 5 && (
                    <span className="text-[10px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                      Poucas Fotos
                    </span>
                  )}
                  {!item.hasServices && (
                    <span className="text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      Sem Serviços
                    </span>
                  )}
                  {!item.description && (
                    <span className="text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      Sem Descrição
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                  📍 {item.address}, {item.city} - {item.state}
                </p>
              </div>

              {/* Card Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() =>
                    setSelectedDiagnostic({
                      companyName: item.name,
                      diagnostic: item.diagnostic,
                    })
                  }
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Info size={14} /> Diagnóstico
                </button>

                <button
                  onClick={() => onAddLeadToCrm(item)}
                  disabled={isAdded}
                  className={`py-1.5 px-3 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1 ${
                    isAdded
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <CheckCircle2 size={14} /> No CRM
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Adicionar CRM
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostic Modal */}
      {selectedDiagnostic && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Relatório Diagnóstico Completo
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedDiagnostic.companyName}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-indigo-600">
                  {selectedDiagnostic.diagnostic.totalScore}/100
                </span>
                <p className="text-xs font-bold text-slate-500">
                  Nota: {selectedDiagnostic.diagnostic.scoreGrade}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Resumo Executivo
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedDiagnostic.diagnostic.summary}
              </p>
            </div>

            {/* Diagnostic Categories */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detalhamento dos Critérios
              </h4>
              {selectedDiagnostic.diagnostic.details.map((detail, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {detail.status === 'critical' ? (
                        <ShieldAlert size={14} className="text-rose-500" />
                      ) : detail.status === 'warning' ? (
                        <AlertTriangle size={14} className="text-amber-500" />
                      ) : (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      )}
                      {detail.category}
                    </span>
                    <span className="font-semibold text-slate-500">
                      {detail.points} / {detail.maxPoints} pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>Problema:</strong> {detail.issue}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    💡 <strong>Recomendação:</strong> {detail.recommendation}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Wins */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles size={14} /> Quick Wins (Ganhos Rápidos de Otimização)
              </h4>
              <ul className="space-y-1">
                {selectedDiagnostic.diagnostic.quickWins.map((win, idx) => (
                  <li key={idx} className="text-xs text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> {win}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedDiagnostic(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
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
