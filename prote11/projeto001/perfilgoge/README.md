# PerfilPro — README (Updated)

This repository contains the PerfilPro application: an internal platform for optimizing Google Business Profiles.

Important: major refactor completed — mocks removed in favor of production-ready integrations. Read carefully before running.

Prerequisites
- Docker & docker-compose (for local dev: Postgres, Redis, MinIO)
- Node.js 18+
- npm or yarn

Setup (local dev)
1. Copy .env.example to .env and fill keys (GEMINI_API_KEY, GOOGLE_MAPS_API_KEY).
2. Start infra for local dev (postgres, redis, minio):
   docker compose -f docker-compose.dev.yml up -d
3. Install dependencies:
   npm install
4. Generate Prisma client and run migrations:
   npm run prisma:generate
   npm run prisma:migrate
5. Seed development data (optional):
   npm run prisma:seed
6. Start dev server:
   npm run dev

APIs (high level)
- GET /api/health
- GET /api/leads
- POST /api/leads
- POST /api/leads/search
- PATCH /api/leads/:id
- DELETE /api/leads/:id
- POST /api/ai/generate (enqueue job)
- GET /api/ai/jobs/:id
- POST /api/client-portal/submit

Notes
- Google Places integration requires GOOGLE_MAPS_API_KEY set in env.
- AI generation enqueues a job (AIJob record); worker integration (BullMQ) can be wired later to process jobs.
- Client portal uses tokens stored on lead.clientPortalToken — for production, tokens should be securely generated and stored.
