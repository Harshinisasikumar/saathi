import { env } from '../config/env.js';
import type { StoreBackend } from './store.js';
import { MemoryStore } from './store.js';

let store: StoreBackend | null = null;

export async function getStore(): Promise<StoreBackend> {
  if (store) return store;
  if (env.supabaseUrl && env.supabaseKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const { SupabaseStore } = await import('./supabaseStore.js');
      const client = createClient(env.supabaseUrl, env.supabaseKey);
      store = new SupabaseStore(client);
      await store.init();
      console.log(`[saathi] persistence backend: ${store.backendName()}`);
      return store;
    } catch (err) {
      console.warn('[saathi] Supabase unavailable, falling back to in-memory store:', (err as Error).message);
    }
  }
  if (env.mongoUri) {
    try {
      const mongoose = (await import('mongoose')).default;
      await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 4000 });
      const { MongoStore } = await import('./mongoStore.js');
      store = new MongoStore();
      await store.init();
      console.log(`[saathi] persistence backend: ${store.backendName()}`);
      return store;
    } catch (err) {
      console.warn('[saathi] MongoDB unavailable, falling back to in-memory store:', (err as Error).message);
    }
  }
  store = new MemoryStore();
  await store.init();
  console.log(`[saathi] persistence backend: ${store.backendName()} (demo data seeded)`);
  return store;
}