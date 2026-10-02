import { app } from './app.js';
import { env } from './config/env.js';
import { getStore } from './db/index.js';

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