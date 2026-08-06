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

// Security headers
app.use(helmet());

// CORS - restrict to known origins in production
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [process.env.FRONTEND_URL || ''],
    credentials: true,
  }));
} else {
  app.use(cors());
}

app.use(json({ limit: '2mb' }));

// Strict rate limiter for authentication endpoints (prevent brute force)
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api/auth/register', rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour
  message: { error: 'Limite de registros atingido. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Strict rate limiter for Google Maps search (prevent quota abuse)
app.use('/api/leads/search', rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 searches per hour per IP
  message: { error: 'Limite de buscas atingido. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Lenient rate limiter for general API endpoints
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Public routes (no auth required)
app.use('/api/auth', authRouter);
app.use('/api/client-portal', portalRouter);

// Protected routes (require JWT)
app.use('/api/leads', authMiddleware, leadRouter);
app.use('/api/ai', authMiddleware, aiRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Serve frontend static assets and SPA fallback in production
const staticPath = path.resolve(process.cwd(), 'dist');
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
  console.log(`⚡ PerfilPro server listening on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
