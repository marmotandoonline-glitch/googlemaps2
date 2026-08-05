export function scoreLead(params: {
  rating: number;
  reviewsCount: number;
  photosCount: number;
  hasWebsite: boolean;
  hasDescription: boolean;
  hasHours: boolean;
  hasServices: boolean;
  hasProducts: boolean;
}) {
  let score = 100;
  const details: any[] = [];
  const quickWins: string[] = [];

  if (params.reviewsCount < 20) {
    score -= 20;
    details.push({ category: 'Avaliações & Prova Social', points: 5, maxPoints: 25, status: 'critical', issue: `Apenas ${params.reviewsCount} avaliações cadastradas. Concorrentes locais ativos possuem >50.`, recommendation: 'Implementar campanha QR Code/WhatsApp.' });
    quickWins.push('Implementar rotina de coleta de avaliações');
  } else if (params.reviewsCount < 50 || params.rating < 4.2) {
    score -= 10;
    details.push({ category: 'Avaliações & Prova Social', points: 15, maxPoints: 25, status: 'warning', issue: `Nota média de ${params.rating} com ${params.reviewsCount} avaliações.`, recommendation: 'Responder todas as avaliações.' });
  } else {
    details.push({ category: 'Avaliações & Prova Social', points: 25, maxPoints: 25, status: 'good', issue: 'Média de avaliações excelente.', recommendation: 'Manter padrão.' });
  }

  if (params.photosCount < 5) {
    score -= 20;
    details.push({ category: 'Fotos e Identidade Visual', points: 0, maxPoints: 20, status: 'critical', issue: `Apenas ${params.photosCount} fotos cadastradas.`, recommendation: 'Subir fotos profissionais.' });
    quickWins.push('Adicionar 20+ fotos profissionais');
  } else if (params.photosCount < 20) {
    score -= 10;
    details.push({ category: 'Fotos e Identidade Visual', points: 10, maxPoints: 20, status: 'warning', issue: `${params.photosCount} fotos encontradas.`, recommendation: 'Cadastrar fotos organizadas.' });
  } else {
    details.push({ category: 'Fotos e Identidade Visual', points: 20, maxPoints: 20, status: 'good', issue: 'Galeria bem abastecida.', recommendation: 'Manter fotos atualizadas.' });
  }

  if (!params.hasServices && !params.hasProducts) {
    score -= 25;
    details.push({ category: 'Menu de Serviços e Produtos', points: 0, maxPoints: 25, status: 'critical', issue: 'Nenhum serviço ou produto cadastrado.', recommendation: 'Cadastrar catálogo completo.' });
    quickWins.push('Cadastrar catálogo de serviços completos');
  } else if (!params.hasServices || !params.hasProducts) {
    score -= 12;
    details.push({ category: 'Menu de Serviços e Produtos', points: 13, maxPoints: 25, status: 'warning', issue: 'Menu parcialmente preenchido.', recommendation: 'Completar descrições.' });
  } else {
    details.push({ category: 'Menu de Serviços e Produtos', points: 25, maxPoints: 25, status: 'good', issue: 'Serviços e produtos cadastrados.', recommendation: 'Revisar preços.' });
  }

  if (!params.hasDescription) {
    score -= 15;
    details.push({ category: 'Descrição & SEO Local', points: 0, maxPoints: 15, status: 'critical', issue: 'Descrição do perfil está em branco.', recommendation: 'Elaborar texto persuasivo.' });
    quickWins.push('Elaborar texto descritivo de 750 caracteres');
  } else {
    details.push({ category: 'Descrição & SEO Local', points: 15, maxPoints: 15, status: 'good', issue: 'Descrição presente.', recommendation: 'Aprimorar palavras-chave.' });
  }

  if (!params.hasWebsite) {
    score -= 10;
    details.push({ category: 'Website & Agendamento', points: 0, maxPoints: 10, status: 'warning', issue: 'Perfil não possui link direto para site.', recommendation: 'Criar Landing Page.' });
    quickWins.push('Adicionar link direto de agendamento/WhatsApp');
  }
  if (!params.hasHours) {
    score -= 5;
    details.push({ category: 'Horários de Funcionamento', points: 0, maxPoints: 5, status: 'warning', issue: 'Horário de funcionamento não informado.', recommendation: 'Cadastrar horários.' });
  }

  const finalScore = Math.max(0, Math.min(100, score));
  let scoreGrade: any = 'C';
  if (finalScore >= 90) scoreGrade = 'A+';
  else if (finalScore >= 80) scoreGrade = 'A';
  else if (finalScore >= 65) scoreGrade = 'B';
  else if (finalScore >= 45) scoreGrade = 'C';
  else if (finalScore >= 30) scoreGrade = 'D';
  else scoreGrade = 'F';

  return {
    totalScore: finalScore,
    scoreGrade,
    summary: `Perfil avaliado com score ${finalScore}/100. ${finalScore < 60 ? 'Apresenta falhas graves.' : 'Possui boa base.'}`,
    details,
    quickWins: quickWins.length > 0 ? quickWins : ['Manter postagens semanais', 'Responder avaliações em até 24h'],
  };
}
