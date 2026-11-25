-- Fase 5: suscripciones (solo las escribe el servidor/webhook) y consumo del periodo.

create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan_id text not null check (char_length(plan_id) between 1 and 40),
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "subscriptions_mfa" on public.subscriptions
  as restrictive for all to authenticated
  using ((select private.mfa_satisfied())) with check ((select private.mfa_satisfied()));

-- El usuario solo lee. Escribe únicamente el servidor (webhook de Stripe).
revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;
grant select, insert, update on public.subscriptions to service_role;

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Consumo propio desde una fecha: mensajes enviados a la IA y coste estimado.
-- security invoker: RLS de usage_events limita a los datos del propio usuario.
create or replace function public.my_usage_since(p_since timestamptz)
returns table (messages bigint, cost_usd numeric)
language sql
stable
security invoker
set search_path = ''
as $$
  select count(*)::bigint, coalesce(sum(estimated_cost_usd), 0)::numeric
  from public.usage_events
  where user_id = (select auth.uid())
    and created_at >= p_since;
$$;

revoke all on function public.my_usage_since(timestamptz) from public, anon;
grant execute on function public.my_usage_since(timestamptz) to authenticated;

create index if not exists usage_events_user_created on public.usage_events (user_id, created_at desc);
