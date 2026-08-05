import express from 'express';
import { requestUpload, completeUpload } from '../controllers/portalController';

export const portalRouter = express.Router();

portalRouter.post('/request-upload', requestUpload);
portalRouter.post('/complete', completeUpload);
