import 'dotenv/config'; // must be first: other modules read env at import time
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

import { authMiddleware, requireAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.routes.js';
import organizationRoutes from './routes/organizations.routes.js';
import candidateRoutes from './routes/candidates.routes.js';
import jobRoutes from './routes/jobs.routes.js';
import applicationRoutes from './routes/applications.routes.js';
import interviewRoutes from './routes/interviews.routes.js';
import offerRoutes from './routes/offers.routes.js';
import batchRoutes from './routes/batches.routes.js';
import aiRoutes from './routes/ai.routes.js';
import userRoutes from './routes/users.routes.js';
import auditRoutes from './routes/audit.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import reportRoutes from './routes/reports.routes.js';
import settingRoutes from './routes/settings.routes.js';
import { db } from './db/store.js';
import { connectMongoDB, getMongoStatus } from './db/mongodb.js';
import { verifyMailer, mailConfigured } from './services/mailer.js';
import { geminiConfigured } from './services/ai.js';
import { s3Configured } from './services/s3.js';
import { AuthenticatedRequest } from './middleware/auth.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Behind a load balancer / reverse proxy, set TRUST_PROXY=1 so rate limits key on the real client IP.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
app.disable('x-powered-by');

// Never serialize credentials, whichever route returns a user object.
const SECRET_FIELDS = new Set(['password', 'passwordHash', 'resetTokenHash', 'resetTokenExpires', 'tokenVersion', 's3Key']);
app.set('json replacer', (key: string, value: unknown) => (SECRET_FIELDS.has(key) ? undefined : value));

app.use(helmet());

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || ALLOWED_ORIGINS.includes(origin)),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ---- Rate limits (per IP; per user once authenticated) ----
const limiter = (windowMin: number, limit: number, message: string) => rateLimit({
  windowMs: windowMin * 60_000,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too Many Requests', message }
});
// ponytail: in-memory counters, per process. Add a Redis store (rate-limit-redis) when running >1 instance.
app.use('/api/auth/login', limiter(15, 10, 'Too many sign-in attempts. Try again in 15 minutes.'));
app.use(['/api/auth/forgot-password', '/api/auth/reset-password'], limiter(15, 5, 'Too many password requests. Try again later.'));
app.use('/api/auth/register', limiter(60, 5, 'Too many registrations from this network. Try again later.'));
app.use('/api', limiter(15, 600, 'Request rate exceeded. Slow down and retry shortly.'));

app.use(authMiddleware);

const userKeyed = (windowMin: number, limit: number, message: string) => rateLimit({
  windowMs: windowMin * 60_000,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: req => (req as AuthenticatedRequest).user?.id || ipKeyGenerator(req.ip || ''),
  message: { error: 'Too Many Requests', message }
});
app.use('/api/ai', userKeyed(15, 60, 'AI request limit reached. Try again shortly.'));
app.use('/api/batches/upload', userKeyed(60, 20, 'Upload limit reached. Try again later.'));

// ---- Public routes ----
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes); // login/register/forgot/reset are public; /me and /logout-all check req.user themselves

// ---- Everything below requires a valid JWT ----
app.use('/api', requireAuth);

app.get('/api/system/status', (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'platform_admin') return res.status(403).json({ error: 'Forbidden' });
  const mongo = getMongoStatus();
  res.json({
    database: mongo.isConnected ? 'mongodb' : 'json-file (dev only)',
    mongo: { state: mongo.state, databaseName: mongo.databaseName },
    integrations: {
      gemini: geminiConfigured() ? 'configured' : 'missing GEMINI_API_KEY',
      s3: s3Configured() ? 'configured' : 'missing S3_BUCKET',
      smtp: mailConfigured() ? (process.env.BREVO_API_KEY ? 'brevo' : 'smtp') : 'not configured (emails logged to console)'
    },
    counts: {
      organizations: db.getOrganizations().length,
      candidates: db.getCandidates().length,
      jobs: db.getJobs().length
    }
  });
});

app.use('/api/organizations', organizationRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler — no internals leak to clients in production
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status < 500 ? err.message : 'InternalServerError',
    message: status < 500 || process.env.NODE_ENV !== 'production' ? err.message : 'An unexpected error occurred.'
  });
});

async function start() {
  await connectMongoDB();
  await db.init();
  await verifyMailer();
  if (!geminiConfigured()) console.warn('[AI] GEMINI_API_KEY not set — resume parsing will return 503.');
  if (!s3Configured()) console.warn('[S3] S3_BUCKET not set — resume uploads will return 503.');
  app.listen(PORT, () => console.log(`[API] listening on http://127.0.0.1:${PORT}/api`));
}

start().catch(err => {
  console.error('[Startup] Fatal:', err.message);
  process.exit(1);
});

export default app;
