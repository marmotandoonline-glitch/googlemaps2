import { prisma } from '../lib/prisma';

const POLL_MS = Math.max(30_000, Number(process.env.FOLLOWUP_POLL_MS || 60_000));

type FollowupRule = { stage: string; afterDays: number; label: string };

const RULES: FollowupRule[] = [
  { stage: 'novo', afterDays: 3, label: 'primeiro follow-up após a prospecção' },
  { stage: 'proposta', afterDays: 3, label: 'follow-up da proposta enviada' },
  { stage: 'negociacao', afterDays: 5, label: 'follow-up da negociação' },
];

function buildFollowupText(lead: { name: string; category: string; city: string | null; clientPortalToken: string | null }, rule: FollowupRule) {
  const portal = lead.clientPortalToken ? `${process.env.PUBLIC_APP_URL || ''}/portal/${lead.clientPortalToken}` : '';
  return `Olá, equipe da ${lead.name}! Passando para retomar nosso contato sobre a análise de ${lead.category} em ${lead.city || 'sua região'}. ${rule.label}. Se fizer sentido, posso mostrar em poucos minutos os próximos passos e responder às dúvidas. ${portal}`.trim();
}

export async function processDueFollowups() {
  const now = Date.now();
  let created = 0;
  for (const rule of RULES) {
    const cutoff = new Date(now - rule.afterDays * 24 * 60 * 60 * 1000);
    const leads = await prisma.lead.findMany({
      where: {
        stage: rule.stage,
        updatedAt: { lte: cutoff },
        phone: { not: null },
      },
      select: { id: true, name: true, category: true, city: true, clientPortalToken: true },
      take: 100,
    });

    for (const lead of leads) {
      const existing = await prisma.leadTask.findFirst({
        where: { leadId: lead.id, type: 'whatsapp_followup', status: { in: ['pending', 'approved', 'completed'] } },
        orderBy: { createdAt: 'desc' },
      });
      if (existing) continue;

      const text = buildFollowupText(lead, rule);
      await prisma.leadTask.create({
        data: {
          leadId: lead.id,
          type: 'whatsapp_followup',
          status: 'pending',
          title: `Follow-up pronto para aprovação: ${rule.label}`,
          description: text,
          dueAt: new Date(),
          metadata: { channel: 'whatsapp', requiresApproval: true, stage: rule.stage },
        },
      });
      await prisma.domainEvent.create({
        data: { leadId: lead.id, type: 'followup_due', payload: { stage: rule.stage, text }, status: 'pending' },
      });
      created += 1;
    }
  }
  return created;
}

export function startFollowupWorker() {
  const interval = setInterval(() => {
    processDueFollowups().catch((error) => console.error('follow-up worker error:', error));
  }, POLL_MS);
  interval.unref?.();
  console.log(`⏰ follow-up worker enabled (${POLL_MS}ms polling; approval required)`);
  return interval;
}
