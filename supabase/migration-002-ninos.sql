-- Migración 002 · Versión niños del Quiz de Perfil Cerebral Neurobalance
-- Ejecutar UNA vez en Supabase → SQL Editor, ANTES de desplegar la versión con el quiz de niños.

alter table public.quiz_responses add column if not exists quiz_type text not null default 'adults'
  check (quiz_type in ('adults','kids'));
alter table public.quiz_responses add column if not exists details jsonb;

-- La versión niños usa el rango de edad 2_5
alter table public.quiz_responses drop constraint if exists quiz_responses_age_band_check;
alter table public.quiz_responses add constraint quiz_responses_age_band_check
  check (age_band in ('0_2','3_5','2_5','6_12','13_17','18_plus'));

create index if not exists quiz_responses_type_idx on public.quiz_responses (quiz_type);
