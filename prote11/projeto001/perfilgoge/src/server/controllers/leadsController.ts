import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { scoreLead } from '../services/scoreService';
import { createPortalToken } from '../services/tokenService';
import fetch from 'node-fetch';

// GET /api/leads — filter by agencyId from authenticated user
export async function getLeads(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const where: any = {};
  if (user.agencyId) {
    // filter leads that belong to the same agency
    where.OR = [
      { agencyId: user.agencyId },
      { agencyId: null }, // leads without agency (legacy/seed data)
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  res.json(leads);
}

// POST /api/leads
export async function createLead(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = req.body;

  // Basic validation
  if (!body.name) return res.status(400).json({ error: 'Missing name' });

  // Validate score value
  if (body.score !== undefined && (typeof body.score !== 'number' || body.score < 0 || body.score > 100)) {
    return res.status(400).json({ error: 'Score must be a number between 0 and 100' });
  }

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
      agencyId: user.agencyId || null,
      clientPortalToken: `token-${Math.random().toString(36).substring(2, 10)}`,
    },
  });

  // Create initial history entry
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

// POST /api/leads/search — with robust error handling and parallel fetch
export async function searchLeads(req: Request, res: Response) {
  const { niche, city, neighborhood, state } = req.body || {};

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY not configured' });

  // Use Text Search API (server-side)
  const query = `${niche} in ${neighborhood || city || ''} ${state || ''}`;
  const encoded = encodeURIComponent(query);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encoded}&key=${apiKey}&language=pt-BR`;

  let r;
  try {
    r = await fetch(url);
  } catch (err: any) {
    return res.status(503).json({ error: 'Network error contacting Google Maps API', details: err?.message });
  }

  const json = await r.json();

  // Validate Google API response status
  if (json.status !== 'OK') {
    const statusMessages: Record<string, string> = {
      REQUEST_DENIED: 'Acesso negado — verifique se a API Key está habilitada e configurada corretamente.',
      OVER_QUERY_LIMIT: 'Limite de requisições excedido para a Google Maps API.',
      INVALID_REQUEST: 'Requisição inválida para a Google Maps API.',
      UNKNOWN_ERROR: 'Erro desconhecido no serviço do Google Maps.',
    };
    const errorMsg = statusMessages[json.status] || `Google Maps API returned status: ${json.status}`;
    return res.status(json.status === 'OVER_QUERY_LIMIT' ? 429 : 502).json({
      error: errorMsg,
      googleStatus: json.status,
      results: [],
    });
  }

  if (!Array.isArray(json.results) || json.results.length === 0) {
    return res.json({ query: { niche, city, neighborhood, state }, totalFound: 0, results: [] });
  }

  // Fetch Place Details in parallel with timeout and error handling
  const results = await Promise.all(
    (json.results || []).map(async (item: any) => {
      const placeId = item.place_id;
      const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&key=${apiKey}&language=pt-BR&fields=name,formatted_phone_number,website,rating,user_ratings_total,formatted_address,opening_hours,types,photos`;

      let details: any = {};
      try {
        const dr = await fetch(detailUrl);
        const djson = await dr.json() as any;
        if (djson?.status === 'OK' && djson?.result) {
          details = djson.result;
        }
      } catch (err) {
        // If details fetch fails, continue with text search data only
        console.warn(`Failed to fetch details for place ${placeId}:`, err);
      }

      const leadCandidate = {
        name: item.name,
        category: (item.types && item.types[0]) || niche,
        phone: details.formatted_phone_number || '',
        website: details.website || '',
        profileUrl: `https://maps.google.com/?cid=${item.place_id}`,
        placeId: item.place_id,
        rating: details.rating || item.rating || 0,
        reviewsCount: details.user_ratings_total || 0,
        address: details.formatted_address || item.formatted_address || '',
        neighborhood: neighborhood || '',
        city: city || '',
        state: state || '',
        description: item.formatted_address || '',
        photosCount: (details.photos && details.photos.length) || 0,
        hasHours: !!details.opening_hours,
        hasServices: false,
        hasProducts: false,
      };

      // calculate score using local service
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
    })
  );

  // Filter out failed fetches (those that returned null-ish data)
  const validResults = results.filter((r) => r && r.name);

  res.json({ query: { niche, city, neighborhood, state }, totalFound: validResults.length, results: validResults });
}

// GET /api/leads/:id
export async function getLeadById(req: Request, res: Response) {
  const { id } = req.params;
  const lead = await prisma.lead.findUnique({ where: { id }, include: { notes: true, history: true } });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
}

// PATCH /api/leads/:id — properly handle transient fields
export async function updateLead(req: Request, res: Response) {
  const { id } = req.params;
  const updates = req.body;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  // Handle stage change history
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

  // Generate a secure portal token if stage changes to 'fechado' (closed/won)
  let newPortalToken: string | null = null;
  if (updates.stage === 'fechado' && lead.stage !== 'fechado') {
    try {
      const { token, expiresAt } = await createPortalToken(id, 168); // 7 days TTL
      newPortalToken = token;
    } catch (err) {
      console.error('Failed to generate portal token:', err);
    }
  }

  // Add note if provided
  if (updates.newNoteText) {
    await prisma.leadNote.create({
      data: {
        leadId: id,
        author: updates.noteAuthor || 'Operador',
        text: updates.newNoteText,
      },
    });
  }

  // Extract transient fields that should NOT be sent to Prisma
  const {
    newNoteText,
    noteAuthor,
    // ... rest are valid fields
    ...prismaData
  } = updates;

  // Remove fields that don't exist on the Lead model
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

  // Update portal token if generated
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
