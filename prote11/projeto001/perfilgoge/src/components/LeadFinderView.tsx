import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Building2,
  Star,
  Plus,
  Check,
  Zap,
  RefreshCw,
  Info,
} from 'lucide-react';
import { LeadSearchResult } from '../types';
import { useAuth } from '../auth/AuthProvider';

interface SearchResponse {
  results?: LeadSearchResult[];
  error?: string;
}

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
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<LeadSearchResult | null>(null);
  const { apiFetch } = useAuth();
  const [searchResults, setSearchResults] = useState<LeadSearchResult[]>([
    {
      placeId: 'lead-1',
      name: 'Sorriso Perfeito Moema',
      category: 'Clínica Odontológica',
      address: 'Av. Ibirapuera, 2000',
      neighborhood: 'Moema',
      city: 'São Paulo',
      state: 'SP',
      rating: 4.1,
      reviewsCount: 38,
      photosCount: 8,
      phone: '(11) 98888-1234',
      website: '',
      hasWhatsApp: true,
      hasServices: true,
      description: 'Clínica geral e implantes.',
      calculatedScore: 42,
      diagnostic: {
        totalScore: 42,
        scoreGrade: 'Regular',
        summary: 'Perfil com poucas avaliações e sem site oficial.',
        details: [],
        quickWins: ['Cadastrar site profissional', 'Campanha para 50 novas avaliações 5 estrelas'],
      },
    },
    {
      placeId: 'lead-2',
      name: 'Odonto VIP Sp',
      category: 'Clínica Odontológica',
      address: 'Rua dos Omaguás, 100',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      rating: 4.5,
      reviewsCount: 110,
      photosCount: 24,
      phone: '(11) 97777-5678',
      website: 'https://exemplo.com',
      hasWhatsApp: true,
      hasServices: true,
      description: 'Ortodontia avançada.',
      calculatedScore: 68,
      diagnostic: {
        totalScore: 68,
        scoreGrade: 'Bom',
        summary: 'Bom posicionamento, mas falta automação de GMN.',
        details: [],
        quickWins: ['Adicionar posts semanais no GMN'],
      },
    },
  ]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, city, neighborhood, state }),
      });
      const data = (await response.json().catch(() => ({}))) as SearchResponse;
      if (!response.ok) throw new Error(data.error || 'Não foi possível realizar a busca.');
      setSearchResults(data.results || []);
    } catch (err: any) {
      setError(err?.message || 'Erro ao realizar a busca.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Card */}
      <div className="bg-white p-6 rounded-[20px] border border-[#E7E7F1] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-semibold text-[#16162B] flex items-center gap-2">
              <Search className="text-[#5B4FE9]" size={20} /> Lead Finder & Inteligência Geográfica
            </h2>
            <p className="text-xs text-[#8A8AA3]">
              Encontre empresas no Google Maps, analise a qualidade do perfil e calcule o Score de Oportunidade.
            </p>
          </div>
          <span className="text-xs font-semibold bg-[#ECEDF7] text-[#5B4FE9] px-3 py-1 rounded-full w-fit">
            Pesquisa em Tempo Real
          </span>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#16162B] mb-1">Nicho / Categoria</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-2.5 text-[#8A8AA3]" />
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#ECEDF7]/50 border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B] focus:ring-2 focus:ring-[#5B4FE9] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#16162B] mb-1">Cidade</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-2.5 text-[#8A8AA3]" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#ECEDF7]/50 border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B] focus:ring-2 focus:ring-[#5B4FE9] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#16162B] mb-1">Bairro</label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#ECEDF7]/50 border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B] focus:ring-2 focus:ring-[#5B4FE9] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#16162B] mb-1">UF / Estado</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#ECEDF7]/50 border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B] focus:ring-2 focus:ring-[#5B4FE9] focus:outline-none"
            >
              {['SP', 'RJ', 'MG', 'PR', 'RS', 'SC', 'BA', 'PE', 'DF', 'CE', 'GO'].map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#5B4FE9] hover:bg-[#4C3FDB] text-white font-medium rounded-full text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />} Pesquisar
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs" role="alert">
          {error}
        </div>
      )}

      {diagnostic && (
        <div className="fixed inset-0 z-50 bg-[#16162B]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#16162B]">Diagnóstico — {diagnostic.name}</h3>
              <button onClick={() => setDiagnostic(null)} className="text-[#8A8AA3]">✕</button>
            </div>
            <p className="text-sm text-[#16162B]">{diagnostic.diagnostic.summary}</p>
            <div className="text-xs text-[#8A8AA3]">Score: {diagnostic.diagnostic.totalScore}/100</div>
            <div className="flex flex-wrap gap-2">{diagnostic.diagnostic.quickWins.map((win) => <span key={win} className="px-3 py-1 bg-[#ECEDF7] rounded-full text-xs text-[#16162B]">{win}</span>)}</div>
            <button onClick={() => setDiagnostic(null)} className="w-full py-2 bg-[#5B4FE9] text-white rounded-full text-xs font-medium">Fechar</button>
          </div>
        </div>
      )}

      {/* Search Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.length === 0 && !loading ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white border border-[#E7E7F1] rounded-[20px] p-8 text-center text-sm text-[#8A8AA3]">
            Nenhum resultado encontrado para os filtros informados.
          </div>
        ) : searchResults.map((item) => {
          const isAdded = addedLeadPlaceIds.includes(item.placeId);

          return (
            <div
              key={item.placeId}
              className="bg-white border border-[#E7E7F1] rounded-[20px] p-5 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-[#16162B] text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-[#8A8AA3]">
                      {item.category} • {item.neighborhood}
                    </p>
                  </div>
                  <div className="flex flex-col items-end px-2.5 py-1 rounded-full border border-[#E2E2EE] bg-[#ECEDF7]/50 text-center">
                    <span className="text-[10px] font-bold text-[#8A8AA3] uppercase">Score</span>
                    <span className="text-base font-bold text-[#16162B] leading-none">{item.calculatedScore}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#8A8AA3]">
                  <div className="flex items-center text-[#16162B] font-semibold">
                    <Star size={13} className="fill-[#16162B] text-[#16162B] mr-1" />
                    {item.rating}
                  </div>
                  <span>({item.reviewsCount} avaliações)</span>
                </div>

                <p className="text-xs text-[#8A8AA3] pt-1 border-t border-[#E7E7F1]">
                  📍 {item.address}, {item.city} - {item.state}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E7E7F1]">
                <button
                  onClick={() => setDiagnostic(item)}
                  className="py-2 px-3 bg-[#ECEDF7]/50 hover:bg-[#ECEDF7] text-[#16162B] text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-1"
                >
                  <Info size={13} /> Diagnóstico
                </button>

                <button
                  onClick={() => onAddLeadToCrm(item)}
                  disabled={isAdded}
                  className={`py-2 px-3 font-medium text-xs rounded-full transition-all flex items-center justify-center gap-1 ${
                    isAdded
                      ? 'bg-[#E7F6ED] text-[#1F9254]'
                      : 'bg-[#5B4FE9] hover:bg-[#4C3FDB] text-white shadow-xs'
                  }`}
                >
                  {isAdded ? <Check size={13} /> : <Plus size={13} />}
                  {isAdded ? 'No CRM' : 'Adicionar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
