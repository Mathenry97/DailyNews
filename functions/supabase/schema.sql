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
-- Pas encore relié à Supabase Auth — à revoir à l'étape "écran d'inscription".
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  expo_push_token text unique,
  topics text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table app_users enable row level security;
-- Pas de policy publique pour l'instant : seule la clé service_role écrit/lit.
-- À ouvrir quand l'app appellera Supabase directement (étape inscription).
