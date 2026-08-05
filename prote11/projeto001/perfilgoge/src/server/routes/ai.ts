import express from 'express';
import { enqueueAiGeneration, getAiJob } from '../controllers/aiController';

export const aiRouter = express.Router();

aiRouter.post('/generate', enqueueAiGeneration);
aiRouter.get('/jobs/:id', getAiJob);
