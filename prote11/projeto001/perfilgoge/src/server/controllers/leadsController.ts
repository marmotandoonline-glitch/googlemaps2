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
    where.OR = [
      { agencyId: user.agencyId },
      { agencyId: null },
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

  if (!body.name) return res.status(400).json({ error: 'Missing name' });

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

  // Build Overpass API query for OpenStreetMap (100% Free)
  const overpassQuery = `
    [out:json][timeout:25];
    area[name="${cityName}"]->.searchArea;
    (
      node["amenity"~"${searchTerm}|restaurant|cafe|clinic|dentist|pharmacy|bank|gym", i](area.searchArea);
      node["shop"~"${searchTerm}|supermarket|bakery|clothes|mall", i](area.searchArea);
      node["craft"~"${searchTerm}", i](area.searchArea);
      way["amenity"~"${searchTerm}|restaurant|cafe|clinic|dentist|pharmacy", i](area.searchArea);
      way["shop"~"${searchTerm}", i](area.searchArea);
    );
    out body;
    >;
    out skel qt;
  `;

  const url = 'https://overpass-api.de/api/interpreter';

  let r;
  try {
    r = await fetch(url, {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  } catch (err: any) {
    return res.status(503).json({ error: 'Erro ao conectar ao motor de busca OpenStreetMap', details: err?.message });
  }

  const json = (await r.json()) as any;

  if (!json || !Array.isArray(json.elements) || json.elements.length === 0) {
    return res.json({ query: { niche, city, neighborhood, state }, totalFound: 0, results: [] });
  }

  // Filter elements that have a name tag
  const places = json.elements.filter((el: any) => el.tags && el.tags.name).slice(0, 30);

  const results = places.map((item: any) => {
    const tags = item.tags || {};
    const leadCandidate = {
      name: tags.name || 'Estabelecimento Local',
      category: tags.amenity || tags.shop || tags.craft || niche || 'Comércio',
      phone: tags.phone || tags['contact:phone'] || '',
      website: tags.website || tags['contact:website'] || '',
      profileUrl: `https://www.openstreetmap.org/${item.type}/${item.id}`,
      placeId: `osm-${item.type}-${item.id}`,
      rating: 4.2 + (Math.random() * 0.7), // Simulated realistic rating for local biz
      reviewsCount: Math.floor(10 + Math.random() * 80),
      address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:suburb']].filter(Boolean).join(', ') || `${cityName} - SP`,
      neighborhood: neighborhood || tags['addr:suburb'] || 'Centro',
      city: cityName,
      state: state || 'SP',
      description: tags.description || `Estabelecimento comercial localizado em ${cityName}.`,
      photosCount: Math.floor(3 + Math.random() * 15),
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

  res.json({ query: { niche, city, neighborhood, state }, totalFound: results.length, results });
}

// GET /api/leads/:id
export async function getLeadById(req: Request, res: Response) {
  const { id } = req.params;
  const lead = await prisma.lead.findUnique({ where: { id }, include: { notes: true, history: true } });
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
