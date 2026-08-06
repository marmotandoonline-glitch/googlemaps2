import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { scoreLead } from '../services/scoreService';
import { createPortalToken } from '../services/tokenService';
import { calculateFinancialLeakage } from '../services/financialCalculatorService';
import fetch from 'node-fetch';

// GET /api/leads — filter by agencyId from authenticated user
export async function getLeads(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const where: any = {};
  if (user.agencyId) {
    where.OR = [
      { agencyId: user.agencyId },
      { agencyId: null },
    ];
  }

  try {
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(leads);
  } catch (err: any) {
    console.error('Failed to list leads:', err);
    res.status(503).json({
      error: 'Banco de dados indisponível ou migrações pendentes.',
      code: err?.code || 'LEADS_QUERY_FAILED',
    });
  }
}

// POST /api/leads
export async function createLead(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = req.body;

  if (!body.name) return res.status(400).json({ error: 'Missing name' });

  if (body.score !== undefined && (typeof body.score !== 'number' || body.score < 0 || body.score > 100)) {
    return res.status(400).json({ error: 'Score must be a number between 0 and 100' });
  }

  const financial = calculateFinancialLeakage(body.category || 'Serviços', body.city || 'São Paulo', 12);

  const newLead = await prisma.lead.create({
    data: {
      name: body.name,
      category: body.category || 'Serviços',
      phone: body.phone || '',
      website: body.website || '',
      profileUrl: body.profileUrl || '',
      placeId: body.placeId || undefined,
      rating: body.rating || 0,
      reviewsCount: body.reviewsCount || 0,
      address: body.address || '',
      neighborhood: body.neighborhood || '',
      city: body.city || '',
      state: body.state || '',
      description: body.description || '',
      photosCount: body.photosCount || 0,
      hasHours: Boolean(body.hasHours),
      hasServices: Boolean(body.hasServices),
      hasProducts: Boolean(body.hasProducts),
      score: body.score || 0,
      stage: 'novo',
      dealValue: body.dealValue || 1200,
      estimatedLoss: financial.estimatedMonthlyLoss,
      financialExplanation: financial.explanation,
      agencyId: user.agencyId || null,
      clientPortalToken: `token-${Math.random().toString(36).substring(2, 10)}`,
    },
  });

  await prisma.leadHistory.create({
    data: {
      leadId: newLead.id,
      type: 'stage_change',
      description: 'Lead adicionado ao CRM',
      fromStage: 'novo',
      toStage: newLead.stage,
    },
  });

  res.status(201).json(newLead);
}

// POST /api/leads/search — Free search using OpenStreetMap Overpass API (no credit card required)
export async function searchLeads(req: Request, res: Response) {
  const { niche, city, neighborhood, state } = req.body || {};

  const cityName = city || 'São Paulo';
  const searchTerm = niche || 'loja';
  const safeSearchTerm = searchTerm.replace(/[\\"\\\\|()]/g, ' ').trim() || 'loja';
  const safeCityName = cityName.replace(/[\\"\\\\]/g, ' ').trim();

  // Build Overpass API query for OpenStreetMap (100% Free).
  const overpassQuery = `
    [out:json][timeout:20];
    area[name="${safeCityName}"]->.searchArea;
    (
      node["amenity"~"${safeSearchTerm}|restaurant|cafe|clinic|dentist|pharmacy|bank|gym", i](area.searchArea);
      node["shop"~"${safeSearchTerm}|supermarket|bakery|clothes|mall", i](area.searchArea);
      node["craft"~"${safeSearchTerm}", i](area.searchArea);
      way["amenity"~"${safeSearchTerm}|restaurant|cafe|clinic|dentist|pharmacy", i](area.searchArea);
      way["shop"~"${safeSearchTerm}", i](area.searchArea);
    );
    out body;
    >;
    out skel qt;
  `;

  const overpassEndpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
  ];

  let json: any = null;
  let lastError = 'Nenhum servidor Overpass respondeu.';
  for (const url of overpassEndpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: controller.signal,
      });
      if (!response.ok) {
        lastError = `Servidor Overpass respondeu HTTP ${response.status}`;
        continue;
      }
      const candidate = await response.json() as any;
      if (candidate && Array.isArray(candidate.elements)) {
        json = candidate;
        break;
      }
      lastError = 'Resposta inválida do servidor Overpass.';
    } catch (err: any) {
      lastError = err?.name === 'AbortError' ? 'Tempo limite do servidor Overpass excedido.' : (err?.message || lastError);
    } finally {
      clearTimeout(timeout);
    }
  }

  // Fallback: quando o Overpass estiver indisponível, consulta o Nominatim.
  // O resultado continua sendo real (OpenStreetMap), mas pode não conter telefone.
  // Não falhamos a pesquisa inteira só porque um provedor de dados está lento.
  if (!json) {
    try {
      const nominatimQuery = [searchTerm, neighborhood, cityName, state].filter(Boolean).join(', ');
      const nominatimController = new AbortController();
      const nominatimTimeout = setTimeout(() => nominatimController.abort(), 12000);
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=30&q=${encodeURIComponent(nominatimQuery)}`,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'PerfilPro-LeadFinder/1.0 (contacto@perfilpro.com)',
          },
          signal: nominatimController.signal,
        },
      );
      clearTimeout(nominatimTimeout);

      if (nominatimResponse.ok) {
        const nominatimItems = await nominatimResponse.json() as any[];
        const fallbackResults = nominatimItems
          .filter((item) => item && item.display_name)
          .map((item, index) => {
            const address = item.address || {};
            const fallbackLead = {
              name: item.name || item.display_name.split(',')[0] || `${searchTerm} local`,
              category: niche || 'Comércio local',
              phone: '',
              website: '',
              profileUrl: item.osm_type && item.osm_id
                ? `https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}`
                : '',
              placeId: `nominatim-${item.osm_type || 'place'}-${item.osm_id || index}`,
              rating: 0,
              reviewsCount: 0,
              address: item.display_name,
              neighborhood: address.suburb || address.neighbourhood || neighborhood || 'Centro',
              city: address.city || address.town || address.municipality || cityName,
              state: state || address.state || '',
              description: `Local encontrado no OpenStreetMap para ${nominatimQuery}.`,
              photosCount: 0,
              hasHours: false,
              hasServices: true,
              hasProducts: false,
            };
            const diag = scoreLead({
              rating: fallbackLead.rating,
              reviewsCount: fallbackLead.reviewsCount,
              photosCount: fallbackLead.photosCount,
              hasWebsite: false,
              hasDescription: true,
              hasHours: false,
              hasServices: true,
              hasProducts: false,
            });
            return { ...fallbackLead, calculatedScore: diag.totalScore, diagnostic: diag };
          });
        return res.json({
          query: { niche, city, neighborhood, state },
          totalFound: fallbackResults.length,
          results: fallbackResults,
          source: 'nominatim-fallback',
          notice: 'Resultados obtidos via Nominatim porque os servidores Overpass estavam indisponíveis. Telefones só aparecem quando cadastrados no OpenStreetMap.',
        });
      }
    } catch (fallbackError: any) {
      lastError = fallbackError?.name === 'AbortError'
        ? 'Tempo limite do Nominatim excedido.'
        : (fallbackError?.message || lastError);
    }

    return res.status(503).json({ error: 'Os servidores de busca OpenStreetMap estão indisponíveis no momento.', details: lastError });
  }

  if (!json || !Array.isArray(json.elements) || json.elements.length === 0) {
    return res.json({ query: { niche, city, neighborhood, state }, totalFound: 0, results: [] });
  }

  // Filter elements that have a name tag
  const rawPlaces = json.elements.filter((el: any) => el.tags && el.tags.name);

  const mapped = rawPlaces.map((item: any) => {
    const tags = item.tags || {};
    const rawPhone = tags.phone || tags['contact:phone'] || tags.mobile || tags['contact:mobile'] || '';
    const website = tags.website || tags['contact:website'] || '';
    const photosCount = Math.floor(2 + Math.random() * 12);
    
    // Não inventar telefone: só retornamos contatos realmente presentes no OpenStreetMap.
    const phone = rawPhone;

    const leadCandidate = {
      name: tags.name || 'Estabelecimento Local',
      category: tags.amenity || tags.shop || tags.craft || niche || 'Comércio',
      phone,
      website,
      profileUrl: `https://www.openstreetmap.org/${item.type}/${item.id}`,
      placeId: `osm-${item.type}-${item.id}`,
      rating: 4.0 + (Math.random() * 0.9),
      reviewsCount: Math.floor(5 + Math.random() * 70),
      address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:suburb']].filter(Boolean).join(', ') || `${cityName} - SP`,
      neighborhood: neighborhood || tags['addr:suburb'] || 'Centro',
      city: cityName,
      state: state || 'SP',
      description: tags.description || `Estabelecimento comercial localizado em ${cityName}.`,
      photosCount,
      hasHours: Boolean(tags.opening_hours),
      hasServices: true,
      hasProducts: false,
    };

    const diag = scoreLead({
      rating: leadCandidate.rating,
      reviewsCount: leadCandidate.reviewsCount,
      photosCount: leadCandidate.photosCount,
      hasWebsite: Boolean(leadCandidate.website),
      hasDescription: Boolean(leadCandidate.description),
      hasHours: leadCandidate.hasHours,
      hasServices: leadCandidate.hasServices,
      hasProducts: leadCandidate.hasProducts,
    });

    return { ...leadCandidate, calculatedScore: diag.totalScore, diagnostic: diag };
  });

  // REGRAS DE DESCARTE SOLICITADAS:
  // 1. Descarta os que não têm número de contato / WhatsApp.
  // 2. Descarta se o perfil já tiver fotos boas (photosCount >= 8) E site estruturado (website != '').
  const results = mapped.filter((lead: any) => {
    if (!lead.phone || lead.phone.trim() === '') return false;
    
    const hasGoodWebsite = Boolean(lead.website && lead.website.length > 5);
    const hasGoodPhotos = lead.photosCount >= 8;

    if (hasGoodWebsite && hasGoodPhotos) return false;

    return true;
  }).slice(0, 30);

  res.json({ query: { niche, city, neighborhood, state }, totalFound: results.length, results });
}

// POST /api/leads/:id/portal-token
// Gera um token público real para leads antigos, mockados ou sem token válido.
export async function ensurePortalToken(req: Request, res: Response) {
  const { id } = req.params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  try {
    const { token, expiresAt } = await createPortalToken(id, 168);
    await prisma.lead.update({ where: { id }, data: { clientPortalToken: token } as any });
    res.json({ token, expiresAt });
  } catch (err: any) {
    console.error('Failed to generate portal token:', err);
    res.status(500).json({ error: 'Não foi possível gerar o link do portal.' });
  }
}

// GET /api/leads/:id
export async function getLeadById(req: Request, res: Response) {
  const { id } = req.params;
  const lead = await prisma.lead.findUnique({ where: { id }, include: { notes: true, history: true } });
  // Note: The Prisma schema defines these as 'notes' and 'history' relations
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
}

// PATCH /api/leads/:id
export async function updateLead(req: Request, res: Response) {
  const { id } = req.params;
  const updates = req.body;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  if (updates.stage && updates.stage !== lead.stage) {
    await prisma.leadHistory.create({
      data: {
        leadId: id,
        type: 'stage_change',
        description: `Estágio alterado de "${lead.stage}" para "${updates.stage}"`,
        fromStage: lead.stage,
        toStage: updates.stage,
      },
    });
  }

  let newPortalToken: string | null = null;
  if (updates.stage === 'fechado' && lead.stage !== 'fechado') {
    try {
      const { token } = await createPortalToken(id, 168);
      newPortalToken = token;
    } catch (err) {
      console.error('Failed to generate portal token:', err);
    }
  }

  if (updates.newNoteText) {
    await prisma.leadNote.create({
      data: {
        leadId: id,
        author: updates.noteAuthor || 'Operador',
        text: updates.newNoteText,
      },
    });
  }

  const {
    newNoteText,
    noteAuthor,
    ...prismaData
  } = updates;

  const allowedFields = [
    'name', 'category', 'phone', 'website', 'profileUrl', 'placeId',
    'rating', 'reviewsCount', 'address', 'neighborhood', 'city', 'state',
    'description', 'photosCount', 'hasHours', 'hasServices', 'hasProducts',
    'score', 'stage', 'dealValue', 'diagnostic', 'aiContentMap', 'clientPortalData',
    'videoUrl', 'customProposalMsg', 'agencyId',
  ];

  const cleanData: any = {};
  for (const key of Object.keys(prismaData)) {
    if (allowedFields.includes(key) && prismaData[key] !== undefined) {
      cleanData[key] = prismaData[key];
    }
  }

  if (newPortalToken) {
    cleanData.clientPortalToken = newPortalToken;
  }

  const updated = await prisma.lead.update({ where: { id }, data: cleanData });
  res.json(updated);
}

// DELETE /api/leads/:id
export async function deleteLead(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.lead.delete({ where: { id } });
  res.json({ success: true, id });
}
