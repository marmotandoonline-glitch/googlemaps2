type ScoreGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

interface ScoreDetail {
  category: string;
  points: number;
  maxPoints: number;
  status: 'critical' | 'warning' | 'good';
  issue: string;
  recommendation: string;
}

export interface ScoreResult {
  totalScore: number;
  scoreGrade: ScoreGrade;
  summary: string;
  details: ScoreDetail[];
  quickWins: string[];
}

export function scoreLead(params: {
  rating: number;
  reviewsCount: number;
  photosCount: number;
  hasWebsite: boolean;
  hasDescription: boolean;
  hasHours: boolean;
  hasServices: boolean;
  hasProducts: boolean;
}): ScoreResult {
  let score = 100;
  const details: ScoreDetail[] = [];
  const quickWins: string[] = [];

  // 1. Avaliações & Prova Social (max 25 pts)
  if (params.reviewsCount < 20) {
    score -= 20;
    details.push({
      category: 'Avaliações & Prova Social',
      points: 5,
      maxPoints: 25,
      status: 'critical',
      issue: `Apenas ${params.reviewsCount} avaliações cadastradas. Concorrentes locais ativos possuem >50.`,
      recommendation: 'Implementar campanha QR Code/WhatsApp de solicitações de avaliação pós-atendimento.',
    });
    quickWins.push('Implementar rotina de coleta de avaliações com clientes satisfeitos');
  } else if (params.reviewsCount < 50 || params.rating < 4.2) {
    score -= 10;
    details.push({
      category: 'Avaliações & Prova Social',
      points: 15,
      maxPoints: 25,
      status: 'warning',
      issue: `Nota média de ${params.rating} com ${params.reviewsCount} avaliações. Há margem de melhoria na nota.`,
      recommendation: 'Responder todas as avaliações atuais e direcionar clientes estratégicos para nota 5.',
    });
  } else {
    details.push({
      category: 'Avaliações & Prova Social',
      points: 25,
      maxPoints: 25,
      status: 'good',
      issue: 'Média de avaliações excelente.',
      recommendation: 'Manter padrão de respostas rápidas.',
    });
  }

  // 2. Fotos e Identidade Visual (max 20 pts)
  if (params.photosCount < 5) {
    score -= 20;
    details.push({
      category: 'Fotos e Identidade Visual',
      points: 0,
      maxPoints: 20,
      status: 'critical',
      issue: `Apenas ${params.photosCount} fotos cadastradas. Perfis otimizados têm no mínimo 25 fotos profissionais.`,
      recommendation: 'Subir lote de fotos da fachada, interiores, equipe e trabalhos realizados.',
    });
    quickWins.push('Adicionar 20+ fotos profissionais em alta resolução com geotagging local');
  } else if (params.photosCount < 20) {
    score -= 10;
    details.push({
      category: 'Fotos e Identidade Visual',
      points: 10,
      maxPoints: 20,
      status: 'warning',
      issue: `${params.photosCount} fotos encontradas. Faltam fotos atualizadas da equipe e ambiente.`,
      recommendation: 'Cadastrar fotos organizadas por categorias (Equipe, Produtos, Interior).',
    });
  } else {
    details.push({
      category: 'Fotos e Identidade Visual',
      points: 20,
      maxPoints: 20,
      status: 'good',
      issue: 'Galeria de fotos bem abastecida.',
      recommendation: 'Manter fotos atualizadas mensalmente.',
    });
  }

  // 3. Menu de Serviços e Produtos (max 25 pts)
  if (!params.hasServices && !params.hasProducts) {
    score -= 25;
    details.push({
      category: 'Menu de Serviços e Produtos',
      points: 0,
      maxPoints: 25,
      status: 'critical',
      issue: 'Nenhum serviço ou produto cadastrado no perfil.',
      recommendation: 'Cadastrar catálogo completo de serviços e produtos com descrições e preços.',
    });
    quickWins.push('Cadastrar catálogo de serviços completos com preços e descrições');
  } else if (!params.hasServices || !params.hasProducts) {
    score -= 12;
    details.push({
      category: 'Menu de Serviços e Produtos',
      points: 13,
      maxPoints: 25,
      status: 'warning',
      issue: 'Menu parcialmente preenchido. Faltam serviços ou produtos cadastrados.',
      recommendation: 'Completar descrições de todos os serviços e adicionar categorias de produtos.',
    });
  } else {
    details.push({
      category: 'Menu de Serviços e Produtos',
      points: 25,
      maxPoints: 25,
      status: 'good',
      issue: 'Serviços e produtos devidamente cadastrados.',
      recommendation: 'Revisar preços e descrições periodicamente.',
    });
  }

  // 4. Descrição & SEO Local (max 15 pts)
  if (!params.hasDescription) {
    score -= 15;
    details.push({
      category: 'Descrição & SEO Local',
      points: 0,
      maxPoints: 15,
      status: 'critical',
      issue: 'Descrição do perfil está em branco.',
      recommendation: 'Elaborar texto persuasivo de 750 caracteres com termos de busca locais.',
    });
    quickWins.push('Elaborar texto descritivo comercial de 750 caracteres para indexação no Google');
  } else {
    details.push({
      category: 'Descrição & SEO Local',
      points: 15,
      maxPoints: 15,
      status: 'good',
      issue: 'Descrição presente no perfil.',
      recommendation: 'Aprimorar palavras-chave focadas na região.',
    });
  }

  // 5. Website & Agendamento (max 10 pts)
  if (!params.hasWebsite) {
    score -= 10;
    details.push({
      category: 'Website & Agendamento',
      points: 0,
      maxPoints: 10,
      status: 'warning',
      issue: 'Perfil não possui link direto para site ou botão de WhatsApp.',
      recommendation: 'Criar Landing Page de conversão rápida ou link direto de atendimento.',
    });
    quickWins.push('Adicionar link direto de agendamento/WhatsApp no botão oficial do perfil');
  }

  // 6. Horários de Funcionamento (max 5 pts)
  if (!params.hasHours) {
    score -= 5;
    details.push({
      category: 'Horários de Funcionamento',
      points: 0,
      maxPoints: 5,
      status: 'warning',
      issue: 'Horário de funcionamento não informado ou desatualizado.',
      recommendation: 'Cadastrar horários exatos e de feriados.',
    });
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let scoreGrade: ScoreGrade = 'C';
  if (finalScore >= 90) scoreGrade = 'A+';
  else if (finalScore >= 80) scoreGrade = 'A';
  else if (finalScore >= 65) scoreGrade = 'B';
  else if (finalScore >= 45) scoreGrade = 'C';
  else if (finalScore >= 30) scoreGrade = 'D';
  else scoreGrade = 'F';

  return {
    totalScore: finalScore,
    scoreGrade,
    summary: `Perfil avaliado com score ${finalScore}/100. ${
      finalScore < 60
        ? 'Apresenta falhas graves que impedem o aparecimento no Top 3 do Google Maps (Pack Local).'
        : 'Possui boa base, mas necessita de otimização profissional para dominar as buscas locais.'
    }`,
    details,
    quickWins: quickWins.length > 0 ? quickWins : ['Manter postagens semanais no Google', 'Responder avaliações em até 24h'],
  };
}
