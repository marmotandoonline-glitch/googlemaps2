// Financial Leakage Calculator Service (Calculadora de Vazamento Financeiro)
// Estima quanto em R$ um negócio perde por mês por não estar no Top 3 do Google Local Pack

export interface FinancialLeakageResult {
  estimatedMonthlyLoss: number;
  formattedMonthlyLoss: string;
  confidence: 'baixa' | 'média' | 'alta';
  estimatedMonthlySearches: number;
  ticketAverage: number;
  currentRank: number;
  explanation: string;
}

// Benchmarks de CTR por posição no Google Local Pack (Top 3)
const CTR_BENCHMARKS: Record<number, number> = {
  1: 0.32, // 32% dos cliques
  2: 0.20, // 20% dos cliques
  3: 0.13, // 13% dos cliques
  4: 0.08,
  5: 0.06,
  6: 0.05,
  7: 0.04,
  8: 0.03,
  9: 0.025,
  10: 0.02,
};

// Tabelas de Ticket Médio por Nicho (R$)
const NICHE_TICKETS: Record<string, number> = {
  'clínica odontológica': 600,
  'odontologia': 600,
  'dentista': 600,
  'clínica de estética': 500,
  'estética': 500,
  'oficina mecânica': 400,
  'mecânica': 400,
  'pet shop': 150,
  'veterinário': 250,
  'restaurante': 90,
  'advogado': 1500,
  'imobiliária': 3000,
  'academia': 120,
  'psicólogo': 250,
  'ar condicionado': 350,
  'solar': 5000,
};

// Volume de buscas estimado por categoria e porte da cidade
const NICHE_BASE_SEARCHES: Record<string, number> = {
  'clínica odontológica': 1200,
  'odontologia': 1200,
  'dentista': 1200,
  'clínica de estética': 900,
  'estética': 900,
  'oficina mecânica': 800,
  'mecânica': 800,
  'pet shop': 1500,
  'veterinário': 600,
  'restaurante': 3500,
  'advogado': 500,
  'imobiliária': 2000,
  'academia': 2500,
  'psicólogo': 450,
};

export function calculateFinancialLeakage(
  category: string,
  city: string,
  currentRank: number = 12,
  customTicket?: number,
  customSearches?: number
): FinancialLeakageResult {
  const normalizedCategory = (category || 'serviços').toLowerCase();
  
  // Encontrar ticket médio
  let ticketAverage = customTicket || 300; // default
  for (const [key, val] of Object.entries(NICHE_TICKETS)) {
    if (normalizedCategory.includes(key)) {
      ticketAverage = val;
      break;
    }
  }

  // Encontrar volume de buscas base
  let baseSearches = customSearches || 800; // default
  for (const [key, val] of Object.entries(NICHE_BASE_SEARCHES)) {
    if (normalizedCategory.includes(key)) {
      baseSearches = val;
      break;
    }
  }

  // Ajuste por cidade (ex: São Paulo tem mais volume que cidades menores)
  const isLargeCity = ['são paulo', 'rio de janeiro', 'belo horizonte', 'curitiba', 'porto alegre', 'salvador', 'brasília'].some(c => city.toLowerCase().includes(c));
  const cityMultiplier = isLargeCity ? 2.5 : 1.0;
  const estimatedMonthlySearches = Math.round(baseSearches * cityMultiplier);

  // CTR do Top 1 (benchmark de referência) vs CTR da posição atual
  const top3Ctr = CTR_BENCHMARKS[1] || 0.32; // 32%
  const currentRankBounded = Math.min(Math.max(currentRank, 1), 10);
  const currentCtr = CTR_BENCHMARKS[currentRankBounded] || 0.01; // 1% se > 10

  const ctrDiff = Math.max(0, top3Ctr - currentCtr);

  // Taxa de conversão conservadora (clique vira cliente): 6%
  const conversionRate = 0.06;

  // Fórmula: Perda mensal = Buscas x Delta CTR x Conversão x Ticket Médio
  const rawMonthlyLoss = estimatedMonthlySearches * ctrDiff * conversionRate * ticketAverage;
  const estimatedMonthlyLoss = Math.round(rawMonthlyLoss / 50) * 50; // arredondado para múltiplo de 50

  const formattedMonthlyLoss = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(estimatedMonthlyLoss);

  const confidence = isLargeCity ? 'alta' : 'média';

  const explanation = `Estimativa calculada com base em ~${estimatedMonthlySearches} buscas mensais para "${category}" em ${city}, considerando um ticket médio de R$ ${ticketAverage} e a diferença de cliques entre a 1ª posição e a sua posição atual (#${currentRank}).`;

  return {
    estimatedMonthlyLoss,
    formattedMonthlyLoss,
    confidence,
    estimatedMonthlySearches,
    ticketAverage,
    currentRank,
    explanation,
  };
}
