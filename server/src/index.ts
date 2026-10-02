import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { env } from './config/env.js';
import { getStore } from './db/index.js';
import { rateLimit } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/error.js';
import { usersRouter } from './routes/users.js';
import { assessmentRouter } from './routes/assessment.js';
import { parentConcernsRouter } from './routes/parentConcerns.js';
import { chatRouter } from './routes/chat.js';
import { tradesRouter } from './routes/trades.js';
import { computationRouter } from './routes/computation.js';
import { providersRouter } from './routes/providers.js';
import { escalationRouter } from './routes/escalation.js';
import { adminRouter } from './routes/admin.js';
import { metaRouter } from './routes/meta.js';

const app = express();

app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }));
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'saathi', demoMode: env.demoMode, ts: new Date().toISOString() });
});

app.use('/api/meta', rateLimit(120, 60000), metaRouter);
app.use('/api/users', rateLimit(60, 60000), usersRouter);
app.use('/api/assessment', rateLimit(60, 60000), assessmentRouter);
app.use('/api/parent-concerns', rateLimit(60, 60000), parentConcernsRouter);
app.use('/api/chat', rateLimit(60, 60000), chatRouter);
app.use('/api/trades', rateLimit(120, 60000), tradesRouter);
app.use('/api', computationRouter);
app.use('/api/providers', rateLimit(120, 60000), providersRouter);
app.use('/api/escalation', rateLimit(30, 60000), escalationRouter);
app.use('/api/admin', adminRouter);

const clientDist = fileURLToPath(new URL('../../client/dist', import.meta.url));
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  console.warn('[saathi] client/dist not found — serving API only. Run `npm run build` to include the client.');
}

app.use(notFound);
app.use(errorHandler);

export async function start() {
  await getStore();
  app.listen(env.port, () => {
    console.log(`[saathi] API listening on http://localhost:${env.port}`);
    if (env.demoMode) {
      console.log('[saathi] Hackathon Demo Mode is ON — outcome figures are synthetic demo data.');
    }
  });
}

if (process.env.NODE_ENV !== 'test' && process.env.CALLING_MODULE !== 'true') {
  start();
}

export { app };