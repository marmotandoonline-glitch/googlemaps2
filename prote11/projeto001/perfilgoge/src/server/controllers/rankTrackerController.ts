import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateRankGrid } from '../services/rankTrackerService';

export async function getRankTrackerGrid(req: Request, res: Response) {
  try {
    const { leadId } = req.params;
    const { keyword } = req.query;

    // Tenta buscar no banco Prisma
    let leadData: any = await prisma.lead.findUnique({ where: { id: leadId } });

    // Se não achar no Prisma (ex: lead de exemplo mock-1, lead-1, etc), busca em memória/mock estático
    if (!leadData) {
      const mockLeads = [
        { id: 'lead-1', name: 'OdontoPrime Moema', city: 'São Paulo', address: 'Alameda dos Maracatins, 1200', category: 'Clínica Odontológica' },
        { id: 'lead-2', name: 'Auto Mecânica São Jorge', city: 'São Paulo', address: 'Av. Paulista, 1000', category: 'Oficina Mecânica' },
        { id: 'lead-3', name: 'Pet Shop Cão & Gato Feliz', city: 'São Paulo', address: 'Rua Augusta, 500', category: 'Pet Shop' },
        { id: 'mock-1', name: 'Clínica Sorriso Perfeito', city: 'São Paulo', address: 'Av. Brigadeiro Luis Antonio, 2000', category: 'Odontologia' },
        { id: 'mock-2', name: 'Restaurante Sabor Mineiro', city: 'São Paulo', address: 'Rua da Consolação, 1500', category: 'Restaurante' },
      ];
      leadData = mockLeads.find((l) => l.id === leadId) || {
        id: leadId,
        name: 'Empresa Selecionada',
        city: 'São Paulo',
        address: 'Centro, São Paulo',
        category: 'Serviços'
      };
    }

    const gridData = await generateRankGrid(
      { id: leadData.id, name: leadData.name, city: leadData.city, address: leadData.address },
      (keyword as string) || leadData.category || 'Serviços'
    );

    res.json(gridData);
  } catch (err: any) {
    console.error('Erro no Rank Tracker:', err);
    res.status(500).json({ error: err?.message || 'Erro ao gerar auditoria de rank' });
  }
}
