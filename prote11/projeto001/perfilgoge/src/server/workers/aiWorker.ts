import { Worker } from 'bullmq';
import Redis from '../lib/redis';
import { prisma } from '../lib/prisma';

const connection = Redis;

// Worker to process AI jobs using the correct GoogleGenAI API
export const aiWorker = new Worker(
  'ai-jobs',
  async (job) => {
    console.log('AI Worker processing job', job.id, job.data);
    const { jobId } = job.data as { jobId: string };

    // Fetch DB record
    const dbJob = await prisma.aIJob.findUnique({ where: { id: jobId } });
    if (!dbJob) throw new Error('Job not found in DB: ' + jobId);

    // Mark processing
    await prisma.aIJob.update({ where: { id: jobId }, data: { status: 'processing' } });

    try {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        // No key configured — fail job with error message
        await prisma.aIJob.update({
          where: { id: jobId },
          data: { status: 'failed', result: { error: 'GEMINI_API_KEY not configured' } as any },
        });
        return;
      }

      // Import GoogleGenAI correctly (same as server.ts pattern)
      const { GoogleGenAI, Type } = await import('@google/genai');

      const client = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'perfilpro-ai-worker',
          },
        },
      });

      const prompt = generatePromptFromPayload(dbJob.payload as any);

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
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

      const text = response?.text || null;
      if (!text) {
        await prisma.aIJob.update({
          where: { id: jobId },
          data: { status: 'failed', result: { error: 'Empty response from AI provider' } as any },
        });
        return;
      }

      const aiContent = JSON.parse(text);
      const resultData = {
        ...aiContent,
        generatedAt: new Date().toISOString(),
      };

      // Persist AIContent and update lead if present
      if (dbJob.leadId) {
        await prisma.aIContent.create({
          data: {
            leadId: dbJob.leadId,
            content: resultData as any,
            source: 'gemini-worker',
            generatedAt: new Date(),
          },
        });

        await prisma.leadHistory.create({
          data: {
            leadId: dbJob.leadId,
            type: 'ai_generated',
            description: 'Conteúdo gerado via Motor de IA Gemini (worker)',
          },
        });
      }

      await prisma.aIJob.update({
        where: { id: jobId },
        data: { status: 'done', result: resultData as any },
      });
    } catch (err: any) {
      console.error('AI job processing error', err);
      await prisma.aIJob.update({
        where: { id: jobId },
        data: { status: 'failed', result: { error: String(err?.message || err) } as any },
      });
    }
  },
  { connection }
);

function generatePromptFromPayload(payload: any) {
  const { companyName, category, city, neighborhood, existingServices, clientNotes } = payload || {};
  return `Você é um especialista em SEO local e otimização de Perfil da Empresa no Google (Google Meu Negócio).
Gere um pacote completo de conteúdo de alta conversão em Português do Brasil para a seguinte empresa:
- Nome da Empresa: ${companyName || 'Empresa Exemplo'}
- Categoria Principal: ${category || 'Serviços'}
- Cidade/Bairro: ${neighborhood || city || 'São Paulo'}
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
}
