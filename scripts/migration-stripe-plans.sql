-- Migration : ajout des champs d'abonnement Stripe
-- À exécuter une seule fois dans Supabase (SQL Editor)

alter table users
  add column if not exists plan text not null default 'free',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan_renews_at timestamptz;

-- Contrainte : plan dans une liste connue
alter table users
  drop constraint if exists users_plan_check;
alter table users
  add constraint users_plan_check check (plan in ('free', 'monthly', 'annual'));

-- Index pour retrouver un user par son customer Stripe (webhook lookups)
create index if not exists users_stripe_customer_id_idx
  on users (stripe_customer_id);
