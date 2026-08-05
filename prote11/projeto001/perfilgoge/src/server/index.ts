import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { json } from 'body-parser';
import { leadRouter } from './routes/leads';
import { aiRouter } from './routes/ai';
import { portalRouter } from './routes/portal';
import { authRouter } from './routes/auth';
import { authMiddleware } from './middleware/authMiddleware';
import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(json({ limit: '2mb' }));

// Global (lenient) rate limiter for general API
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

// Public routes
app.use('/api/auth', authRouter);
app.use('/api/client-portal', portalRouter);

// Protected routes (require JWT)
app.use('/api/leads', authMiddleware, leadRouter);
app.use('/api/ai', authMiddleware, aiRouter);
// reports router would be protected similarly when added

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Serve frontend static assets and SPA fallback in production
const staticPath = path.resolve(process.cwd(), 'perfilpro---gestão-de-perfis-no-google', 'dist');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));

  // Any non-API GET request should return index.html (SPA fallback)
  app.get('*', (req, res) => {
    if (req.method !== 'GET') return res.status(404).end();
    if (req.path.startsWith('/api')) return res.status(404).end();
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // In dev, we rely on Vite dev server; provide a helpful message for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.status(404).send('Frontend not built. Run `npm run build` to generate static files or use the dev server.');
  });
}

app.listen(PORT, () => {
  console.log(`⚡ PerfilPro server listening on ${PORT}`);
});
