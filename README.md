# Saathi — AI Career Counselling & Family Decision Support

Hackathon MVP for **AI-enabled career counselling and family decision-support
for vocational education** in India, built for a **3–5 minute walkthrough**.
The platform supports **English and Tamil**, gives evidence-based counselling
answers, and helps a learner *and* their family decide together — without
ranking trades into a single "best career".

```
/family-skills-counselling
├─ client/   React 18 + Vite + Bootstrap 5 + Recharts
├─ server/   Node + Express + TypeScript (Supabase/MongoDB backed, in-memory fallback)
│            incl. Swagger UI at /api-docs (OpenAPI spec in server/src/docs/)
└─ scripts/  smoke.mjs (end-to-end API test)
```

---

## Run it

Prerequisite: Node.js ≥ 22.5.

```bash
npm install        # one-time, installs both workspaces
npm run dev        # starts API (:8787) + Vite client (:5173)
```

Open http://localhost:5173

### Other scripts

| Command              | What it does                                    |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | API + client together (concurrently)            |
| `npm run dev:server` | API only, watch mode                            |
| `npm run dev:client` | Vite client only                                |
| `npm run typecheck`  | `tsc` for server and client                     |
| `npm run seed`       | Seed Supabase or MongoDB demo sessions (needs creds)
| `npm run smoke`      | End-to-end API smoke test (starts its own port) |
| `npm run build`      | Production build for both workspaces            |
| `npm start`          | Run the built server (`server/dist/index.js`)   |

### Demo credentials

- **Admin dashboard** → open http://localhost:5173/admin
  - username: `admin`
  - password: `saathi2024`

### Database

No database is required for the demo. The API defaults to an in-memory store
pre-seeded with synthetic counselling sessions so the admin dashboard has data.

**Supabase (Postgres) — recommended:** create a project, run
`server/supabase/schema.sql` in its SQL editor, then set:

```bash
$env:SUPABASE_URL="https://your-project-ref.supabase.co"
$env:SUPABASE_SERVICE_KEY="<service-role key, server-side only>"
npm run seed     # optional: seed demo sessions
npm run dev
```

**MongoDB (fallback):** set `MONGODB_URI` (see `server/.env.example`):

```bash
$env:MONGODB_URI="mongodb://127.0.0.1:27017/saathi"   # PowerShell
export MONGODB_URI="mongodb://127.0.0.1:27017/saathi" # bash
npm run dev
```

Backend selection order: Supabase → MongoDB → in-memory. If the configured
backend is unreachable, the server logs a warning and falls back to memory.

---

## Production & deployment

The Express server also serves the built client, so production is a **single
service on one port**:

```bash
npm run build   # compiles server + bundle client into client/dist
npm start       # node server/dist/index.js → serves API + app on ${PORT:-8787}
```

Verified behaviour of the production build:

| Request             | Result                                  |
| ------------------- | --------------------------------------- |
| `GET /`             | app HTML (SPA)                          |
| `GET /profile` etc. | SPA fallback → app HTML                 |
| `GET /api/health`   | JSON `{"ok":true,…}`                    |
| `GET /api/nope`     | JSON `{"error":"Not found."}`           |

### Deploy to Vercel (free) — primary production target

Vercel hosts the **entire app** (React UI + Express API) as one deployment, so
there is a single URL (e.g. `https://saathi.vercel.app`), same-origin `/api`,
and no CORS issue. HTTPS is automatic.

1. Push this repository to GitHub (already done for `Harshinisasikumar/saathi`).
2. Import it at https://vercel.com/new → **Continue with GitHub** → pick the
   `saathi` repo. Vercel uses the root `package.json` (`npm ci`, then
   `npm run build` which compiles the server and bundles the client).
3. `vercel.json` routes every request to the `api/index.ts` serverless
   function, which is the same Express app (`server/src/app.ts`) — static
   assets, SPA fallback and `/api/*` all in one.
4. Optional env vars (dashboard → Settings → Environment Variables, or
   `vercel env add`): `ADMIN_PASS` (admin password), `DEMO_MODE`, and for a
   persistent database `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (run
   `server/supabase/schema.sql` in your Supabase SQL editor first). Leave them
   unset to run on the seed data.
5. Without a database the in-memory demo store is used. On serverless that
   memory lives inside one warm instance and can reset between requests —
   for a persistent experience, connect Supabase (also free).

How the routing splits (see `vercel.json`): `outputDirectory: client/dist`
publishes the React app on Vercel's static CDN with an SPA fallback to
`index.html`, while `/api/*` and `/api-docs` are rewritten to the
`api/index.ts` serverless function (the same Express app from
`server/src/app.ts`). HTTPS is automatic.

### Deploy the frontend as a static mirror (GitHub Pages, optional)

The client can also be published as a **static site** that talks to the API
cross-origin (the server sends permissive CORS for the demo). This is only a
mirror; the Vercel deployment above is the real app.

1. `.github/workflows/deploy-pages.yml` auto-builds `client/dist` and deploys
   it to GitHub Pages on every push touching the client.
2. The workflow bakes the API base from the repo variable `API_URL` (default
   `https://saathi.onrender.com`) and the base path from `BASE_URL` (default
   `/<repo>/`). Point `API_URL` at your Vercel URL (Settings → Variables →
   Actions) if you keep the mirror.

The API client resolves its base URL from (highest priority first)
`window.SAATHI_API_URL` (inject via `index.html`), then the build-time
`VITE_API_URL`, then same-origin `/api`. See `client/.env.example`.

---

## The walkthrough (3–5 minutes)

1. **Landing** — switch language (`English ⇄ தமிழ்`) via the navbar pill.
2. **Start counselling** — choose *Learner*, *Parent*, or *Family together*.
3. **Profile** — minimal, no PII requirements.
4. **Learner snapshot** — interest questions. This is a **career-interest
   snapshot heuristic**, explicitly **not** a validated test.
5. **Parent concern** — type or **speak** a concern in English or Tamil
   (browser speech input). It is classified (e.g. job security, income…).
6. **AI counsellor** — bilingual, neutral, evidence-grounded chat with source
   citations for every figure.
7. **Compare trades** — factors side by side; never a single score.
8. **Family Decision Scorecard** — each factor rated separately.
9. **Career pathway** — labelled *"Possible pathway — verify with
   counsellor/provider"*; NSQF levels explicitly *not* verified.
10. **Human counsellor** — escalation form (records instead of calling).
11. **Admin** (`/admin`, `admin`/`saathi2024`) — aggregated live analytics.

---

## Accuracy rules (enforced structurally)

- Every statistic carries `source_name`, `source_url`, `data_period` and a
  verification status; the UI renders them as a citation strip.
- All outcome metrics in the seed are `synthetic_baseline` provenance and cite
  the single **Hackathon Demo Dataset (synthetic — not official statistics)**.
- The counsellor/RAG layer reads **only** from the seeded knowledge base; it
  never invents placement %, salaries, NSQF levels or government claims.
- The comparison must not rank trades into a single "best career".
- NSQF levels/durations are prototype data; the UI says so and directs users
  to verify with the training provider.
- The admin dashboard shows **aggregates only** — no personal conversations or
  identifying details.

---

## User flow & routes

`/` → `/start` → `/profile` → `/assessment` → `/concern` → `/counsellor` →
`/compare` → `/scorecard` → `/pathway` → `/escalate` → `/trades` · `/admin`

Full endpoint reference: [docs/api.md](docs/api.md)

---

## Project structure (highlights)

**Server**
- `server/src/domain/types.ts` — domain model; every number is a `Metric`
  carrying provenance.
- `server/src/data/seedData.ts` — 5 trades, providers, outcomes, `DEMO_SOURCE`.
- `server/src/db/` — storage contract (`store.ts`) with Supabase
  (`supabaseStore.ts` + `supabase/schema.sql`), MongoDB (`mongoStore.ts`) and
  in-memory backends, chosen by env in `index.ts`.
- `server/src/db/seed.ts` — seeds demo sessions into Supabase/Mongo (optional).
- `server/src/ai/` — Tamil detection, deterministic concern classifier,
  retrieval (`rag.ts`), bilingual counsellor.
- `server/src/services/counsellingService.ts` — snapshot scoring, scorecard,
  comparison, pathway.
- `server/src/routes/*.ts` — REST endpoints.

**Client**
- `client/src/context/{Language,Flow}Context.tsx` — bootstrap state + language.
- `client/src/pages/*.tsx` — each step of the flow.
- `client/src/components/` — `Layout`, `Stepper`, `RichReply`, `SourceStrip`,
  `Shell`, `Bits`.