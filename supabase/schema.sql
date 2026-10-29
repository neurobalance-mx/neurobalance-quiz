-- Quiz de Perfil Cerebral Neurobalance · esquema de base de datos
-- Ejecutar en Supabase → SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.quiz_responses (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  status            text not null default 'started' check (status in ('started','completed')),
  quiz_version      text not null default 'v1',
  -- Registro previo
  name              text not null,
  email             text not null,
  phone             text,
  consent_privacy   boolean not null default false,
  consent_marketing boolean not null default false,  -- separado de usos comerciales
  -- Configuración
  target_type       text check (target_type in ('self','other')),
  age_band          text check (age_band in ('0_2','3_5','6_12','13_17','18_plus')),
  subject_name      text,
  -- Respuestas individuales: {"1":0..4|null, ... "36": ...}; null = "No observado"
  answers           jsonb,
  -- Contexto P37–P42: {"q37":"a","q40":["b","c"],...}
  context           jsonb,
  -- Puntuaciones 0–100 o null
  fl numeric(5,1), fr numeric(5,1), rl numeric(5,1), rr numeric(5,1),
  result            text check (result in ('red','blue','combined','insufficient')),
  guide_urls        text[],
  utm               jsonb,
  integrations_log  jsonb,
  user_agent        text
);

create index if not exists quiz_responses_created_idx on public.quiz_responses (created_at desc);
create index if not exists quiz_responses_email_idx   on public.quiz_responses (lower(email));
create index if not exists quiz_responses_result_idx  on public.quiz_responses (result);

create table if not exists public.app_settings (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.app_settings (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;

-- Seguridad: RLS activado sin políticas públicas. Solo el servidor (service role) lee y escribe.
alter table public.quiz_responses enable row level security;
alter table public.app_settings   enable row level security;
