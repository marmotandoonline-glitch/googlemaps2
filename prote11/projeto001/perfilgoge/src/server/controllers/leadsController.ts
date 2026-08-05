import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { scoreLead } from '../services/scoreService';
import fetch from 'node-fetch';

// GET /api/leads
export async function getLeads(req: Request, res: Response) {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  res.json(leads);
}

// POST /api/leads
export async function createLead(req: Request, res: Response) {
  const body = req.body;

  // Basic validation
  if (!body.name) return res.status(400).json({ error: 'Missing name' });

  // If placeId provided, try to preserve
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
      hasHours: true,
      hasServices: Boolean(body.hasServices),
      hasProducts: Boolean(body.hasProducts),
      score: body.score || 0,
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

// POST /api/leads/search
export async function searchLeads(req: Request, res: Response) {
  const { niche, city, neighborhood, state } = req.body || {};

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY not configured' });

  // Use Text Search API (server-side)
  const query = `${niche} in ${neighborhood || city || ''} ${state || ''}`;
  const encoded = encodeURIComponent(query);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encoded}&key=${apiKey}&language=pt-BR`;

  const r = await fetch(url);
  const json = await r.json();

  const results = [] as any[];

  for (const item of json.results || []) {
    // For each result fetch Place Details
    const placeId = item.place_id;
    const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&language=pt-BR&fields=name,formatted_phone_number,website,rating,user_ratings_total,formatted_address,opening_hours,types`;
    const dr = await fetch(detailUrl);
    const djson = await dr.json();
    const details = djson.result || {};

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
      photosCount: 0,
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

    results.push({ ...leadCandidate, calculatedScore: diag.totalScore, diagnostic: diag });
  }

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

  // handle stage change history
  if (updates.stage && updates.stage !== lead.stage) {
    await prisma.leadHistory.create({
      data: {
        leadId: id,
        type: 'stage_change',
        description: `Estágio alterado de ${lead.stage} para ${updates.stage}`,
        fromStage: lead.stage,
        toStage: updates.stage,
      },
    });
  }

  // add note
  if (updates.newNoteText) {
    await prisma.leadNote.create({
      data: {
        leadId: id,
        author: updates.noteAuthor || 'Operador',
        text: updates.newNoteText,
      },
    });
  }

  const updated = await prisma.lead.update({ where: { id }, data: { ...updates } });
  res.json(updated);
}

// DELETE /api/leads/:id
export async function deleteLead(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.lead.delete({ where: { id } });
  res.json({ success: true, id });
}
