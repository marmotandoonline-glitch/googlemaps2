import express from 'express';
import { createLead, getLeads, searchLeads, getLeadById, updateLead, deleteLead } from '../controllers/leadsController';

export const leadRouter = express.Router();

leadRouter.get('/', getLeads);
leadRouter.post('/', createLead);
leadRouter.post('/search', searchLeads);
leadRouter.get('/:id', getLeadById);
leadRouter.patch('/:id', updateLead);
leadRouter.delete('/:id', deleteLead);
