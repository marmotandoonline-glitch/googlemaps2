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

// ... rest of server.ts omitted for brevity
