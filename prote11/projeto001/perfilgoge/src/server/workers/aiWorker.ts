import { Worker } from 'bullmq';
import Redis from '../lib/redis';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const connection = Redis;

// Worker to process AI jobs
export const aiWorker = new Worker(
  'ai-jobs',
  async (job) => {
    console.log('AI Worker processing job', job.id, job.data);
    const { jobId } = job.data as { jobId: string };

    // fetch DB record
    const dbJob = await prisma.aIJob.findUnique({ where: { id: jobId } });
    if (!dbJob) throw new Error('Job not found in DB: ' + jobId);

    // mark processing
    await prisma.aIJob.update({ where: { id: jobId }, data: { status: 'processing' } });

    try {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        // No key configured — fail job with error message
        await prisma.aIJob.update({ where: { id: jobId }, data: { status: 'failed', result: { error: 'GEMINI_API_KEY not configured' } } });
        return;
      }

      // Call Gemini via @google/genai
      const { TextServiceClient } = await import('@google/genai');
      const client = new TextServiceClient({ key: geminiKey } as any);

      const prompt = generatePromptFromPayload(dbJob.payload as any);

      const response = await client.generate({
        model: 'gemini-3.6',
        input: prompt,
      } as any);

      const text = response?.candidates?.[0]?.content || null;

      if (!text) {
        await prisma.aIJob.update({ where: { id: jobId }, data: { status: 'failed', result: { error: 'Empty response from AI provider' } } });
        return;
      }

      const aiContent = { generatedText: text, generatedAt: new Date().toISOString() };

      // persist AIContent and update lead if present
      if (dbJob.leadId) {
        await prisma.aIContent.create({ data: { leadId: dbJob.leadId, content: aiContent as any, source: 'gemini', generatedAt: new Date() } });
        await prisma.leadHistory.create({ data: { leadId: dbJob.leadId, type: 'ai_generated', description: 'Conteúdo gerado via Motor de IA Gemini' } });
      }

      await prisma.aIJob.update({ where: { id: jobId }, data: { status: 'done', result: aiContent } });
    } catch (err: any) {
      console.error('AI job processing error', err);
      await prisma.aIJob.update({ where: { id: jobId }, data: { status: 'failed', result: { error: String(err?.message || err) } } });
    }
  },
  { connection }
);

function generatePromptFromPayload(payload: any) {
  const { companyName, category, city, neighborhood, existingServices, clientNotes } = payload || {};
  return `Gere um pacote de conteúdo SEO para a empresa ${companyName} (${category}) localizada em ${neighborhood || city}. Serviços existentes: ${existingServices || 'não informado'}. Observações do cliente: ${clientNotes || ''}. Forneça: shortDescription, longDescription (até 750 chars), seoDescription (160 chars), servicesList (name, description, priceSuggestion), productsList, faqs, categories, keywords, postSuggestions (title, caption, callToAction, hashtags), imageAltTexts.`;
}
