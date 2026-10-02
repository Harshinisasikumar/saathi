import { spawn } from 'node:child_process';
import process from 'node:process';

/*
 * End-to-end smoke test for the Saathi API.
 *
 * Starts the server (via tsx) on a dedicated port, then exercises the full
 * counselling flow and the admin dashboard. Exits non-zero if any check fails.
 *
 * Usage:
 *   npm run smoke
 *   SMOKE_PORT=8899 npm run smoke
 */

const PORT = process.env.SMOKE_PORT ? Number(process.env.SMOKE_PORT) : 8799;
const BASE = `http://127.0.0.1:${PORT}`;
const ADMIN = Buffer.from('admin:saathi2024').toString('base64');

let serverLog = '';
const child = spawn('npx', ['tsx', 'server/src/index.ts'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
});
child.stdout.on('data', (d) => {
  serverLog += d;
});
child.stderr.on('data', (d) => {
  serverLog += d;
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitReady(timeoutMs = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return true;
    } catch {
      /* not up yet */
    }
    await sleep(400);
  }
  return false;
}

let failed = 0;
function check(name, ok, extra = '') {
  if (ok) {
    console.log(`  ok   ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${name}${extra ? ` — ${extra}` : ''}`);
  }
}

const h = (r) => {
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r;
};

async function main() {
  console.log(`[smoke] starting server at ${BASE} ...`);
  if (!(await waitReady())) {
    console.log('[smoke] server did not become ready.');
    console.log(serverLog.slice(-2000));
    child.kill();
    process.exit(1);
  }
  console.log('[smoke] server ready. Running the flow ...\n');

  try {
    const session = await fetch(`${BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userType: 'joint', lang: 'ta' }),
    })
      .then(h)
      .then((r) => r.json());
    const sid = session.sessionId;
    check('create session', typeof sid === 'string' && sid.length > 0, JSON.stringify(session));

    const lp = await fetch(`${BASE}/api/users/${sid}/learner-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age: 18,
        gender: 'male',
        education: 'class_12',
        academicBackground: 'science',
        interests: ['electronics', 'electrical'],
        preferredWorkType: ['hands_on', 'field_work'],
        learningPreference: 'practical',
        state: 'Tamil Nadu',
        district: 'salem',
        urbanity: 'semiurban',
      }),
    })
      .then(h)
      .then((r) => r.json());
    check('learner profile saved', lp.ok === true);

    const pp = await fetch(`${BASE}/api/users/${sid}/parent-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: 'Tamil Nadu',
        district: 'salem',
        incomeBracket: '10000_25000',
        maxDistanceKm: 30,
      }),
    })
      .then(h)
      .then((r) => r.json());
    check('parent profile saved', pp.ok === true);

    const as = await fetch(`${BASE}/api/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sid,
        answers: [
          { questionId: 'interests', value: 'electronics,electrical' },
          { questionId: 'workpref', value: 'hands_on,field_work' },
          { questionId: 'learning', value: 'practical' },
          { questionId: 'toolsmanship', value: 'yes' },
          { questionId: 'outdoors', value: 'comfortable' },
          { questionId: 'priority', value: 'learning_skills' },
        ],
      }),
    })
      .then(h)
      .then((r) => r.json());
    check(
      'assessment snapshot has tradeScores',
      Array.isArray(as.snapshot?.tradeScores) && as.snapshot.tradeScores.length === 5,
    );
    const topTradeId = as.snapshot?.tradeScores?.[0]?.tradeId;

    const pc = await fetch(`${BASE}/api/parent-concerns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, text: 'இந்த course படித்த பிறகு வேலை கிடைக்குமா?' }),
    })
      .then(h)
      .then((r) => r.json());
    check('Tamil concern classified', pc.category === 'job_security', `got ${pc.category}`);

    const chat = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, message: 'What can someone earn after electrician training?' }),
    })
      .then(h)
      .then((r) => r.json());
    check('chat reply text', typeof chat.reply === 'string' && chat.reply.length > 0);
    check(
      'chat reply cites sources',
      Array.isArray(chat.structured?.sources) && chat.structured.sources.length > 0,
    );

    const history = await fetch(`${BASE}/api/chat/${sid}`).then(h).then((r) => r.json());
    check('chat history has 2 messages', Array.isArray(history.messages) && history.messages.length === 2);

    const trades = await fetch(`${BASE}/api/trades?district=salem`).then(h).then((r) => r.json());
    check('trades list (5 trades)', Array.isArray(trades.trades) && trades.trades.length === 5);

    const cmp = await fetch(`${BASE}/api/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot: as.snapshot, district: 'salem' }),
    })
      .then(h)
      .then((r) => r.json());
    check('comparison has rows', Array.isArray(cmp.rows) && cmp.rows.length >= 5);

    const sc = await fetch(`${BASE}/api/scorecard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot: as.snapshot, concernCategory: 'job_security', district: 'salem' }),
    })
      .then(h)
      .then((r) => r.json());
    check(
      'scorecard has cells',
      Boolean(sc.learnerInterest && sc.familyConcerns && sc.dataConfidence),
    );

    const pw = await fetch(`${BASE}/api/pathway?tradeId=${topTradeId ?? ''}`).then(h).then((r) => r.json());
    check('pathway has steps', Array.isArray(pw.steps) && pw.steps.length >= 4);

    const esc = await fetch(`${BASE}/api/escalation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sid,
        language: 'ta',
        concernCategory: 'job_security',
        contactMethod: 'phone',
        preferredTime: 'evening',
        description: 'Wanted to ask about placement support.',
      }),
    })
      .then(h)
      .then((r) => r.json());
    check('escalation created', esc.ok === true);

    const stats = await fetch(`${BASE}/api/admin/dashboard`, {
      headers: { Authorization: `Basic ${ADMIN}` },
    })
      .then(h)
      .then((r) => r.json());
    check('admin dashboard totalSessions > 0', stats.stats?.totalSessions > 0);
    check('admin dashboard has distribution', Boolean(stats.stats?.concernDistribution));

    const noAuth = await fetch(`${BASE}/api/admin/dashboard`).then((r) => r.status);
    check('admin dashboard rejects missing auth', noAuth === 401, `got ${noAuth}`);
  } catch (e) {
    failed += 1;
    console.log(`  FAIL unexpected error: ${e.message}`);
  }

  child.kill();
  console.log(failed === 0 ? '\n[smoke] PASS' : `\n[smoke] FAIL — ${failed} check(s) failed`);
  if (failed > 0) console.log(serverLog.slice(-1500));
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.log(e);
  child.kill();
  process.exit(1);
});