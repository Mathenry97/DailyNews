-- Schéma initial du brief app.
-- À exécuter dans l'éditeur SQL du projet Supabase (Dashboard → SQL Editor).

-- Un bloc généré = le contenu d'UN sujet pour UN jour donné.
-- Généré une seule fois par sujet par jour, recomposé ensuite par utilisateur
-- selon ses sujets cochés (jamais régénéré par utilisateur).
create table if not exists topic_blocks (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  date date not null,
  generated_at timestamptz not null,
  is_empty boolean not null default false,
  empty_reason text,
  bullets jsonb not null default '[]',
  unique (topic, date)
);

alter table topic_blocks enable row level security;

-- Contenu public par nature (actualité) : lecture ouverte pour l'app.
-- Seule la clé service_role (utilisée par le générateur, jamais par l'app)
-- peut écrire, RLS ne s'applique pas à elle.
create policy "topic_blocks are publicly readable"
  on topic_blocks for select
  using (true);

-- Un compte utilisateur : ses sujets cochés + son token de notification.
-- Pas de Supabase Auth pour l'instant (MVP) : device_id est un UUID généré et
-- stocké localement par l'app à la première ouverture, c'est notre seul moyen
-- d'identifier un "compte". Rien de sensible n'est stocké ici, donc l'app peut
-- écrire directement avec la clé publique (anon/publishable) — à revoir si on
-- introduit un vrai login plus tard.
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  device_id text unique not null,
  expo_push_token text,
  topics text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table app_users enable row level security;

create policy "anyone can register or update their own device"
  on app_users for insert
  with check (true);

create policy "anyone can update app_users rows"
  on app_users for update
  using (true)
  with check (true);

-- Nécessaire même si l'app ne lit jamais app_users directement : l'upsert
-- (INSERT ... ON CONFLICT DO UPDATE) a besoin en interne d'une policy SELECT
-- pour résoudre la ligne en conflit, sinon Postgres rejette l'upsert avec
-- une violation RLS même quand INSERT et UPDATE sont permissifs.
create policy "app_users readable for upsert resolution"
  on app_users for select
  using (true);
