import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateRankGrid } from '../services/rankTrackerService';

export async function getRankTrackerGrid(req: Request, res: Response) {
  try {
    const { leadId } = req.params;
    const { keyword } = req.query;

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    const gridData = await generateRankGrid(
      { id: lead.id, name: lead.name, city: lead.city, address: lead.address },
      (keyword as string) || lead.category || 'Serviços'
    );

    res.json(gridData);
  } catch (err: any) {
    console.error('Erro no Rank Tracker:', err);
    res.status(500).json({ error: err?.message || 'Erro ao gerar auditoria de rank' });
  }
}
