/**
 * PerfilPro - Types & Interfaces
 */

export type PipelineStage =
  | 'novo'
  | 'analisado'
  | 'contato_enviado'
  | 'respondeu'
  | 'negociacao'
  | 'fechado'
  | 'onboarding'
  | 'producao'
  | 'entregue'
  | 'mensalista';

export interface ScoreDetail {
  category: string;
  points: number;
  maxPoints: number;
  status: 'critical' | 'warning' | 'good';
  issue: string;
  recommendation: string;
}

export interface LeadDiagnostic {
  totalScore: number;
  scoreGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  details: ScoreDetail[];
  quickWins: string[];
}

export interface AIContentResult {
  shortDescription: string;
  longDescription: string;
  seoDescription: string;
  servicesList: { name: string; description: string; priceSuggestion?: string }[];
  productsList: { name: string; description: string; category: string }[];
  faqs: { question: string; answer: string }[];
  categories: { primary: string; secondary: string[] };
  keywords: string[];
  postSuggestions: { title: string; caption: string; callToAction: string; hashtags: string[] }[];
  imageAltTexts: { type: string; altText: string }[];
  generatedAt: string;
}

export interface ClientPortalData {
  companyName: string;
  logoUrl?: string;
  photos: string[];
  businessHours: { [day: string]: string };
  services: string[];
  products: string[];
  paymentMethods: string[];
  differentials: string[];
  socialLinks: { instagram?: string; facebook?: string; website?: string };
  contactEmail: string;
  contactPhone: string;
  notes?: string;
  submittedAt?: string;
}

export interface LeadNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface LeadHistoryEvent {
  id: string;
  type: 'stage_change' | 'note' | 'proposal_sent' | 'client_upload' | 'ai_generated' | 'delivered';
  description: string;
  timestamp: string;
  fromStage?: PipelineStage;
  toStage?: PipelineStage;
}

export interface Lead {
  id: string;
  name: string;
  category: string;
  phone: string;
  website?: string;
  profileUrl?: string;
  placeId: string;
  rating: number;
  reviewsCount: number;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  description?: string;
  photosCount: number;
  hasHours: boolean;
  hasServices: boolean;
  hasProducts: boolean;
  score: number;
  stage: PipelineStage;
  dealValue: number;
  estimatedLoss?: number;
  financialExplanation?: string;
  diagnostic?: LeadDiagnostic;
  aiContent?: AIContentResult;
  clientPortalData?: ClientPortalData;
  clientPortalToken: string;
  notes: LeadNote[];
  history: LeadHistoryEvent[];
  videoUrl?: string;
  customProposalMsg?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadSearchResult {
  name: string;
  category: string;
  phone: string;
  website?: string;
  profileUrl?: string;
  placeId: string;
  rating: number;
  reviewsCount: number;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  description?: string;
  photosCount: number;
  hasHours: boolean;
  hasServices: boolean;
  hasProducts: boolean;
  calculatedScore: number;
  diagnostic: LeadDiagnostic;
}
