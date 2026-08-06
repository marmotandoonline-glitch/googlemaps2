import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_LEADS } from './src/data/mockLeads';
import { Lead, LeadDiagnostic, AIContentResult, PipelineStage } from './src/types';

// Global memory state for leads (persists across API calls in runtime container)
let leadsDb: Lead[] = [...INITIAL_LEADS];

// Initialize Gemini AI Client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Calculate 0-100 Opportunity Score for Google Business Profile
export function calculateOpportunityScore(params: {
  rating: number;
  reviewsCount: number;
  photosCount: number;
  hasWebsite: boolean;
  hasDescription: boolean;
  hasHours: boolean;
  hasServices: boolean;
  hasProducts: boolean;
}): LeadDiagnostic {
  let score = 100;
  const details: LeadDiagnostic['details'] = [];
  const quickWins: string[] = [];

  // 1. Avaliações (max 25 pts lost)
  if (params.reviewsCount < 20) {
    const penalty = 20;
    score -= penalty;
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
    const penalty = 10;
    score -= penalty;
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

  // 2. Fotos e Mídia (max 20 pts lost)
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

  // 3. Lista de Serviços & Produtos (max 25 pts lost)
  if (!params.hasServices && !params.hasProducts) {
    score -= 25;
    details.push({
      category: 'Menu de Serviços e Produtos',
      points: 0,
      maxPoints: 25,
      status: 'critical',
      issue: 'Nenhum serviço ou produto cadastrado no menu do Perfil do Google.',
      recommendation: 'Cadastrar catálogo completo de serviços com preços e descrições otimizadas para busca.',
    });
    quickWins.push('Cadastrar catálogo de serviços completos com palavras-chave de intenção de compra');
  } else if (!params.hasServices || !params.hasProducts) {
    score -= 12;
    details.push({
      category: 'Menu de Serviços e Produtos',
      points: 13,
      maxPoints: 25,
      status: 'warning',
      issue: 'Menu parcialmente preenchido (falta catálogo completo).',
      recommendation: 'Completar descrições e preços dos serviços oferecidos.',
    });
  } else {
    details.push({
      category: 'Menu de Serviços e Produtos',
      points: 25,
      maxPoints: 25,
      status: 'good',
      issue: 'Serviços e produtos devidamente cadastrados.',
      recommendation: 'Revisar preços periodicamente.',
    });
  }

  // 4. Descrição SEO (max 15 pts lost)
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
      issue: 'Descrição presente.',
      recommendation: 'Aprimorar palavras-chave focadas na região.',
    });
  }

  // 5. Website & Horários (max 15 pts lost)
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

  let scoreGrade: LeadDiagnostic['scoreGrade'] = 'C';
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

// Generates simulated Google Business Search results based on inputs
function generateSimulatedSearchResults(niche: string, city: string, neighborhood: string, state: string) {
  const baseCity = city || 'São Paulo';
  const baseState = state || 'SP';
  const baseNiche = niche || 'Clínica Odontológica';
  const baseNeighborhood = neighborhood || 'Centro';

  const suffixList = [
    { name: 'Prime', scoreBoost: -10, rating: 3.9, reviews: 18, photos: 4, hasSite: true, hasDesc: true, hasServ: false },
    { name: 'Excelência', scoreBoost: -25, rating: 3.6, reviews: 9, photos: 2, hasSite: false, hasDesc: false, hasServ: false },
    { name: 'VIP', scoreBoost: 5, rating: 4.4, reviews: 62, photos: 12, hasSite: true, hasDesc: true, hasServ: true },
    { name: 'Express', scoreBoost: -35, rating: 3.4, reviews: 7, photos: 1, hasSite: false, hasDesc: false, hasServ: false },
    { name: 'Central', scoreBoost: -15, rating: 4.0, reviews: 31, photos: 6, hasSite: true, hasDesc: false, hasServ: false },
  ];

  return suffixList.map((item, idx) => {
    const compName = `${baseNiche} ${item.name} ${baseNeighborhood}`;
    const placeId = `ChIJ_${baseNiche.replace(/\s+/g, '_')}_${idx}_${Date.now()}`;
    const diag = calculateOpportunityScore({
      rating: item.rating,
      reviewsCount: item.reviews,
      photosCount: item.photos,
      hasWebsite: item.hasSite,
      hasDescription: item.hasDesc,
      hasHours: true,
      hasServices: item.hasServ,
      hasProducts: false,
    });

    return {
      name: compName,
      category: baseNiche,
      phone: `(${baseState === 'SP' ? '11' : baseState === 'RJ' ? '21' : '41'}) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      website: item.hasSite ? `https://www.${compName.toLowerCase().replace(/[^a-z0-0]/g, '')}.com.br` : '',
      profileUrl: `https://maps.google.com/?cid=${10000 + idx}`,
      placeId,
      rating: item.rating,
      reviewsCount: item.reviews,
      address: `Rua Principal, ${100 + idx * 45}`,
      neighborhood: baseNeighborhood,
      city: baseCity,
      state: baseState,
      description: item.hasDesc ? `Atendimento especializado em ${baseNiche} na região de ${baseNeighborhood}.` : '',
      photosCount: item.photos,
      hasHours: true,
      hasServices: item.hasServ,
      hasProducts: false,
      calculatedScore: diag.totalScore,
      diagnostic: diag,
    };
  });
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all CRM leads
  app.get('/api/leads', (req, res) => {
    res.json(leadsDb);
  });

  // Search businesses in Google Maps / Lead Finder
  app.post('/api/leads/search', (req, res) => {
    const { niche, city, neighborhood, state } = req.body || {};
    const results = generateSimulatedSearchResults(niche, city, neighborhood, state);
    res.json({
      query: { niche, city, neighborhood, state },
      totalFound: results.length,
      results,
    });
  });

  // Analyze specific lead
  app.post('/api/leads/analyze', (req, res) => {
    const leadData = req.body;
    const diag = calculateOpportunityScore({
      rating: leadData.rating || 4.0,
      reviewsCount: leadData.reviewsCount || 10,
      photosCount: leadData.photosCount || 3,
      hasWebsite: Boolean(leadData.website),
      hasDescription: Boolean(leadData.description),
      hasHours: Boolean(leadData.hasHours),
      hasServices: Boolean(leadData.hasServices),
      hasProducts: Boolean(leadData.hasProducts),
    });

    res.json({
      placeId: leadData.placeId,
      diagnostic: diag,
    });
  });

  // Create new lead in CRM
  app.post('/api/leads', (req, res) => {
    const body = req.body;
    const diag = calculateOpportunityScore({
      rating: body.rating || 4.0,
      reviewsCount: body.reviewsCount || 10,
      photosCount: body.photosCount || 3,
      hasWebsite: Boolean(body.website),
      hasDescription: Boolean(body.description),
      hasHours: true,
      hasServices: Boolean(body.hasServices),
      hasProducts: Boolean(body.hasProducts),
    });

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: body.name || 'Empresa Sem Nome',
      category: body.category || 'Serviços',
      phone: body.phone || '',
      website: body.website || '',
      profileUrl: body.profileUrl || '',
      placeId: body.placeId || `place-${Date.now()}`,
      rating: body.rating || 4.0,
      reviewsCount: body.reviewsCount || 10,
      address: body.address || '',
      neighborhood: body.neighborhood || '',
      city: body.city || '',
      state: body.state || '',
      description: body.description || '',
      photosCount: body.photosCount || 3,
      hasHours: true,
      hasServices: Boolean(body.hasServices),
      hasProducts: Boolean(body.hasProducts),
      score: diag.totalScore,
      stage: 'novo',
      dealValue: body.dealValue || 1200,
      diagnostic: diag,
      clientPortalToken: `token-${Math.random().toString(36).substring(2, 10)}`,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Sistema',
          text: 'Lead adicionado ao CRM através do Lead Finder.',
          createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        },
      ],
      history: [
        {
          id: `hist-${Date.now()}`,
          type: 'stage_change',
          description: 'Lead adicionado ao CRM no estágio Novo.',
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          fromStage: 'novo',
          toStage: 'novo',
        },
      ],
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    leadsDb.unshift(newLead);
    res.status(201).json(newLead);
  });

  // Update lead (Stage, Notes, Proposal Msg, Video, etc.)
  app.patch('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    const index = leadsDb.findIndex((l) => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    const currentLead = leadsDb[index];
    const updates = req.body;

    // Track stage changes in history
    if (updates.stage && updates.stage !== currentLead.stage) {
      currentLead.history.unshift({
        id: `hist-${Date.now()}`,
        type: 'stage_change',
        description: `Estágio alterado de "${currentLead.stage}" para "${updates.stage}".`,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        fromStage: currentLead.stage,
        toStage: updates.stage,
      });
    }

    // Add new note if provided
    if (updates.newNoteText) {
      currentLead.notes.unshift({
        id: `note-${Date.now()}`,
        author: updates.noteAuthor || 'Operador',
        text: updates.newNoteText,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
    }

    const updatedLead: Lead = {
      ...currentLead,
      ...updates,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    leadsDb[index] = updatedLead;
    res.json(updatedLead);
  });

  // Delete lead
  app.delete('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    leadsDb = leadsDb.filter((l) => l.id !== id);
    res.json({ success: true, id });
  });

  // AI Content Generator Endpoint (Gemini 3.6 Flash server-side)
  app.post('/api/ai/generate', async (req, res) => {
    const { leadId, companyName, category, city, neighborhood, existingServices, clientNotes } = req.body || {};

    const targetLead = leadsDb.find((l) => l.id === leadId);
    const compName = companyName || targetLead?.name || 'Empresa Exemplo';
    const compCategory = category || targetLead?.category || 'Serviços';
    const compCity = city || targetLead?.city || 'São Paulo';
    const compNeighborhood = neighborhood || targetLead?.neighborhood || 'Centro';

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `Você é um especialista em SEO local e otimização de Perfil da Empresa no Google (Google Meu Negócio).
Gere um pacote completo de conteúdo de alta conversão em Português do Brasil para a seguinte empresa:
- Nome da Empresa: ${compName}
- Categoria Principal: ${compCategory}
- Cidade/Bairro: ${compNeighborhood}, ${compCity}
- Serviços Informados: ${existingServices || 'Atendimento especializado'}
- Observações Adicionais: ${clientNotes || 'Nenhuma'}

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "shortDescription": "string (máximo 150 caracteres para resumo rápido)",
  "longDescription": "string (texto comercial completo de 700-750 caracteres com forte chamada para ação, palavras-chave de SEO local e bairros atendidos)",
  "seoDescription": "string (Meta Descrição SEO otimizada de 160 caracteres)",
  "servicesList": [
    { "name": "string", "description": "string", "priceSuggestion": "string" }
  ] (gere exatamente 4 serviços relevantes),
  "productsList": [
    { "name": "string", "description": "string", "category": "string" }
  ] (gere exatamente 2 produtos ou combos),
  "faqs": [
    { "question": "string", "answer": "string" }
  ] (gere exatamente 3 perguntas frequentes),
  "categories": {
    "primary": "string (categoria oficial do Google)",
    "secondary": ["string", "string", "string"] (3 categorias secundárias recomendadas)
  },
  "keywords": ["string"] (5 termos de busca com alto volume local),
  "postSuggestions": [
    { "title": "string", "caption": "string", "callToAction": "string", "hashtags": ["string"] }
  ] (gere 2 postagens para a aba de novidades do Google),
  "imageAltTexts": [
    { "type": "string", "altText": "string" }
  ] (gere 2 textos alt para fotos)
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                shortDescription: { type: Type.STRING },
                longDescription: { type: Type.STRING },
                seoDescription: { type: Type.STRING },
                servicesList: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      priceSuggestion: { type: Type.STRING },
                    },
                  },
                },
                productsList: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      category: { type: Type.STRING },
                    },
                  },
                },
                faqs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      answer: { type: Type.STRING },
                    },
                  },
                },
                categories: {
                  type: Type.OBJECT,
                  properties: {
                    primary: { type: Type.STRING },
                    secondary: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                postSuggestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      caption: { type: Type.STRING },
                      callToAction: { type: Type.STRING },
                      hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                },
                imageAltTexts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      altText: { type: Type.STRING },
                    },
                  },
                },
              },
            },
          },
        });

        const jsonContent = JSON.parse(response.text || '{}') as AIContentResult;
        jsonContent.generatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');

        // If targetLead exists, save to DB
        if (targetLead) {
          targetLead.aiContent = jsonContent;
          targetLead.history.unshift({
            id: `hist-${Date.now()}`,
            type: 'ai_generated',
            description: 'Conteúdo completo de SEO e Perfil gerado com sucesso via Gemini 3.6 Flash.',
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          });
        }

        return res.json({ success: true, data: jsonContent, source: 'gemini-3.6-flash' });
      } catch (err: any) {
        console.error('Gemini API error, falling back to expert template generator:', err);
      }
    }

    // Fallback template generator if Gemini key is missing or errored
    const fallbackContent: AIContentResult = {
      shortDescription: `${compName} em ${compNeighborhood}, ${compCity} - Atendimento especializado em ${compCategory}.`,
      longDescription: `A ${compName} é referência em ${compCategory} no bairro ${compNeighborhood} em ${compCity}. Oferecemos estrutura moderna, profissionais capacitados e atendimento personalizado. Agende seu horário ou solicite um orçamento direto pelo WhatsApp! Atendemos de segunda a sábado.`,
      seoDescription: `${compCategory} em ${compNeighborhood} ${compCity} | ${compName}. Atendimento rápido, ambiente exclusivo e agendamento pelo WhatsApp.`,
      servicesList: [
        { name: `Consulta & Avaliação ${compCategory}`, description: 'Diagnóstico completo e plano de atendimento personalizado.', priceSuggestion: 'Sob Consulta' },
        { name: 'Atendimento Especializado Premium', description: 'Execução de serviços com equipamentos de primeira linha.', priceSuggestion: 'A partir de R$ 150' },
        { name: 'Manutenção & Acompanhamento', description: 'Suporte contínuo e acompanhamento pós-atendimento.', priceSuggestion: 'Incluso' },
        { name: 'Pacote Fidelidade Local', description: 'Condições exclusivas para clientes da região de ' + compNeighborhood, priceSuggestion: 'Desconto Especial' },
      ],
      productsList: [
        { name: 'Kit Manutenção Recomendado', description: 'Produtos selecionados para continuidade em casa.', category: 'Uso Diário' },
        { name: 'Vale-Presente Especial', description: 'Cartão presente personalizável para amigo ou familiar.', category: 'Presente' },
      ],
      faqs: [
        { question: 'Quais os horários de atendimento?', answer: 'Atendemos de Segunda a Sexta das 08:00 às 18:00 e aos Sábados das 08:00 às 13:00.' },
        { question: 'Preciso agendar com antecedência?', answer: 'Recomendamos agendamento prévio via WhatsApp para garantir seu horário sem filas.' },
        { question: 'Quais formas de pagamento são aceitas?', answer: 'Aceitamos PIX, cartões de crédito/débito em até 10x e dinheiro.' },
      ],
      categories: {
        primary: compCategory,
        secondary: ['Serviço de atendimento local', 'Centro de serviços especializados', 'Consultoria profissional'],
      },
      keywords: [
        `${compCategory.toLowerCase()} em ${compCity.toLowerCase()}`,
        `${compCategory.toLowerCase()} ${compNeighborhood.toLowerCase()}`,
        `melhor ${compCategory.toLowerCase()} ${compCity.toLowerCase()}`,
        `orçamento ${compCategory.toLowerCase()}`,
        `atendimento ${compNeighborhood.toLowerCase()}`,
      ],
      postSuggestions: [
        {
          title: `Qualidade e Tradição na ${compNeighborhood}`,
          caption: `Está procurando por ${compCategory} em ${compNeighborhood}? Na ${compName} você encontra atendimento rápido e condições exclusivas! Venha nos visitar ou chame no WhatsApp.`,
          callToAction: 'Fazer Orçamento no WhatsApp',
          hashtags: [`#${compCity.replace(/\s+/g, '')}`, `#${compNeighborhood.replace(/\s+/g, '')}`, '#AtendimentoTop'],
        },
        {
          title: 'Agende seu Atendimento pelo Google!',
          caption: 'Sabia que você pode garantir seu horário em poucos cliques? Clique no botão abaixo e fale direto com nossa equipe no WhatsApp. 📲',
          callToAction: 'Enviar Mensagem',
          hashtags: ['#AgendamentoFacil', '#AtendimentoWhatsApp'],
        },
      ],
      imageAltTexts: [
        { type: 'Fachada Externa', altText: `Fachada da ${compName} localizada no bairro ${compNeighborhood} em ${compCity}` },
        { type: 'Ambiente Interno', altText: `Recepção e espaço de atendimento da empresa ${compName}` },
      ],
      generatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    if (targetLead) {
      targetLead.aiContent = fallbackContent;
      targetLead.history.unshift({
        id: `hist-${Date.now()}`,
        type: 'ai_generated',
        description: 'Conteúdo SEO e descrições estruturadas geradas via Engine Interna.',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
    }

    res.json({ success: true, data: fallbackContent, source: 'template-engine' });
  });

  // Client Portal Data Submit
  app.post('/api/client-portal/submit', (req, res) => {
    const { token, portalData } = req.body;
    const targetLead = leadsDb.find((l) => l.clientPortalToken === token || l.id === token);

    if (!targetLead) {
      return res.status(404).json({ error: 'Token ou lead do portal inválido' });
    }

    targetLead.clientPortalData = {
      ...portalData,
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    targetLead.stage = 'onboarding';
    targetLead.history.unshift({
      id: `hist-${Date.now()}`,
      type: 'client_upload',
      description: 'Cliente enviou fotos, horários e informações através do Portal do Cliente.',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      fromStage: 'fechado',
      toStage: 'onboarding',
    });

    res.json({ success: true, lead: targetLead });
  });

  // Vite middleware setup (development vs production static)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ Servidor PerfilPro rodando na porta ${PORT}`);
  });
}

startServer();
