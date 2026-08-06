// Rank Tracker Local Service
// Simula uma varredura em grade (grid de pontos 3x3 ou 5x5) ao redor do endereço do cliente
// para calcular a posição (rank) no Google Pack Local e concorrentes na região.

export interface GridPoint {
  id: string;
  latOffset: number;
  lngOffset: number;
  distanceKm: number;
  direction: string;
  clientRank: number; // Ex: 1 a 20 (0 = não aparece no top 20)
  topCompetitors: {
    name: string;
    rank: number;
    rating: number;
    reviews: number;
  }[];
}

export interface RankTrackerResult {
  leadId: string;
  companyName: string;
  keyword: string;
  centerAddress: string;
  generatedAt: string;
  averageRank: number;
  gridSize: string;
  points: GridPoint[];
  competitorSummary: {
    name: string;
    appearancesInTop3: number;
    avgPosition: number;
  }[];
}

export async function generateRankGrid(lead: { id: string; name: string; city: string; address?: string }, keyword: string = 'Dentista / Serviços'): Promise<RankTrackerResult> {
  const directions = ['Norte (1km)', 'Nordeste (1.5km)', 'Leste (1km)', 'Sudeste (1.5km)', 'Sul (1km)', 'Sudoeste (1.5km)', 'Oeste (1km)', 'Noroeste (1.5km)', 'Centro (Local)'];
  
  const competitorsPool = [
    { name: `Clínica Concorrente A (${lead.city})`, rating: 4.8, reviews: 142 },
    { name: `Dr. Especialista Local`, rating: 4.7, reviews: 98 },
    { name: `Centro Médico ${lead.city}`, rating: 4.9, reviews: 215 },
    { name: `Espaço Saúde & Estética`, rating: 4.6, reviews: 84 },
    { name: `Rede Odonto & Cia`, rating: 4.5, reviews: 110 },
  ];

  let totalRankSum = 0;
  const points: GridPoint[] = directions.map((dir, idx) => {
    // Simula uma variação realista baseada na distância e direção
    // No centro e norte, o cliente pode estar um pouco melhor; nas bordas, pior.
    const baseRank = idx === 8 ? 2 : (idx % 3 === 0 ? 4 : (idx % 2 === 0 ? 8 : 14));
    const clientRank = Math.min(20, Math.max(1, baseRank + Math.floor(Math.random() * 3) - 1));
    totalRankSum += clientRank;

    // Seleciona 3 concorrentes embaralhados para este ponto
    const shuffled = [...competitorsPool].sort(() => 0.5 - Math.random());
    const topCompetitors = shuffled.slice(0, 3).map((comp, cIdx) => ({
      name: comp.name,
      rank: cIdx + 1,
      rating: comp.rating,
      reviews: comp.reviews,
    }));

    return {
      id: `point-${idx + 1}`,
      latOffset: (Math.random() - 0.5) * 0.02,
      lngOffset: (Math.random() - 0.5) * 0.02,
      distanceKm: idx === 8 ? 0.0 : Number((0.8 + (idx * 0.3)).toFixed(1)),
      direction: dir,
      clientRank,
      topCompetitors,
    };
  });

  const averageRank = Number((totalRankSum / points.length).toFixed(1));

  const competitorSummary = [
    { name: competitorsPool[0].name, appearancesInTop3: 7, avgPosition: 1.4 },
    { name: competitorsPool[1].name, appearancesInTop3: 5, avgPosition: 2.1 },
    { name: competitorsPool[2].name, appearancesInTop3: 4, avgPosition: 2.8 },
  ];

  return {
    leadId: lead.id,
    companyName: lead.name,
    keyword,
    centerAddress: lead.address || `${lead.city} - SP`,
    generatedAt: new Date().toISOString(),
    averageRank,
    gridSize: 'Grade 3x3 (Raio de 2km)',
    points,
    competitorSummary,
  };
}
