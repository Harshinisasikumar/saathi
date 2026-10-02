-- Saathi - Supabase (Postgres) schema
-- Run in: Supabase dashboard -> SQL Editor -> New query
--
-- The server connects with the SERVICE_ROLE key (server-side only; never
-- expose it to the browser). Storage backend is selected automatically when
-- SUPABASE_URL + SUPABASE_SERVICE_KEY are set.

create table if not exists public.sessions (
  session_id text primary key,
  user_type  text not null check (user_type in ('learner', 'parent', 'joint')),
  lang       text not null check (lang in ('en', 'ta')),
  created_at timestamptz not null default now()
);

create table if not exists public.learner_profiles (
  session_id           text primary key references public.sessions(session_id) on delete cascade,
  age                  int,
  gender               text,
  education            text,
  academic_background  text,
  interests            jsonb not null default '[]'::jsonb,
  preferred_work_type  jsonb not null default '[]'::jsonb,
  learning_preference  text,
  preferred_location   text,
  state                text not null default 'Tamil Nadu',
  district             text not null default 'salem',
  urbanity             text not null default 'unspecified',
  career_goals         text
);

create table if not exists public.parent_profiles (
  session_id      text primary key references public.sessions(session_id) on delete cascade,
  state           text not null default 'Tamil Nadu',
  district        text not null default 'salem',
  income_bracket  text,
  primary_concern text,
  max_distance_km int,
  preference      text
);

create table if not exists public.assessments (
  session_id text primary key references public.sessions(session_id) on delete cascade,
  answers    jsonb not null default '[]'::jsonb,
  snapshot   jsonb
);

create table if not exists public.concerns (
  id            text primary key,
  session_id    text not null references public.sessions(session_id) on delete cascade,
  raw_text      text not null,
  detected_lang text not null check (detected_lang in ('en', 'ta')),
  category      text not null,
  confidence    double precision not null default 0.5,
  severity      text not null default 'medium',
  created_at    timestamptz not null default now()
);

create index if not exists concerns_session_id_idx on public.concerns (session_id);

create table if not exists public.chat_messages (
  id         text primary key,
  session_id text not null references public.sessions(session_id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  text       text not null,
  lang       text not null default 'en',
  structured jsonb
);

create index if not exists chat_messages_session_id_idx on public.chat_messages (session_id);

create table if not exists public.escalations (
  id                text primary key,
  session_id        text not null references public.sessions(session_id) on delete cascade,
  language          text not null check (language in ('en', 'ta')),
  concern_category  text not null,
  contact_method    text,
  preferred_time    text,
  description       text,
  created_at        timestamptz not null default now()
);