import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { MongoStore } from './mongoStore.js';

/**
 * Seed the MongoDB backend with the demo counselling sessions so the admin
 * dashboard has content. Reference data (trades / providers / outcomes /
 * sources) is always loaded from the code seed by MongoStore itself, so this
 * script only needs a reachable database.
 *
 * Usage:
 *   MONGODB_URI=... npm run seed -w server
 */
export async function seed(): Promise<void> {
  if (!env.mongoUri) {
    console.log('[seed] No MONGODB_URI configured — demo runs in memory, nothing to seed.');
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