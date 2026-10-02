import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { MongoStore } from './mongoStore.js';
import { SupabaseStore } from './supabaseStore.js';

/**
 * Seed the persistent backend (Supabase first, else MongoDB) with the demo
 * counselling sessions so the admin dashboard has content. Reference data
 * (trades / providers / outcomes / sources) is always loaded from the code
 * seed by the store itself, so this script only needs a reachable database.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npm run seed -w server
 *   MONGODB_URI=... npm run seed -w server
 */
export async function seed(): Promise<void> {
  if (env.supabaseUrl && env.supabaseKey) {
    const client = createClient(env.supabaseUrl, env.supabaseKey);
    const { error } = await client.from('sessions').delete().neq('session_id', '');
    if (error) throw error;
    for (const table of ['learner_profiles', 'parent_profiles', 'assessments', 'concerns', 'chat_messages', 'escalations']) {
      const { error: e } = await client.from(table as never).delete().neq('session_id', '');
      if (e) throw e;
    }
    await new SupabaseStore(client).init();
    console.log('[seed] Seeded demo counselling sessions into Supabase.');
    return;
  }
  if (!env.mongoUri) {
    console.log('[seed] No SUPABASE_URL/SUPABASE_SERVICE_KEY or MONGODB_URI configured — demo runs in memory, nothing to seed.');
    return;
  }
  await mongoose.connect(env.mongoUri);
  await mongoose.connection.dropDatabase();
  await new MongoStore().init();
  console.log('[seed] Seeded demo counselling sessions into MongoDB.');
  await mongoose.disconnect();
}

seed().catch((e: unknown) => {
  console.error('[seed] Failed:', e instanceof Error ? e.message : String(e));
  process.exit(1);
});