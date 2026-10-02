export const env = {
  port: Number(process.env.PORT ?? 8787),
  mongoUri: process.env.MONGODB_URI ?? null,
  supabaseUrl: process.env.SUPABASE_URL ?? null,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY ?? null,
  adminUser: process.env.ADMIN_USER || 'admin',
  adminPass: process.env.ADMIN_PASS || 'saathi2024',
  demoMode: process.env.DEMO_MODE !== 'false',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};

export function requireAdmin(auth?: string): boolean {
  if (!auth) return false;
  const [scheme, token] = auth.split(' ');
  if (scheme?.toLowerCase() !== 'basic' || !token) return false;
  const decoded = Buffer.from(token, 'base64').toString('utf-8');
  const idx = decoded.indexOf(':');
  if (idx < 0) return false;
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);
  return user === env.adminUser && pass === env.adminPass;
}