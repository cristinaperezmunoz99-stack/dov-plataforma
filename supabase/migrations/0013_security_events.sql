-- Registro de eventos de seguridad. Sin contenido clínico.
-- Lo escribe solo el servidor; cada usuario puede consultar su propia actividad.

create table public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null check (event_type in (
    'login', 'logout', 'password_changed', 'password_reset_requested',
    'mfa_enabled', 'mfa_disabled', 'mfa_verified',
    'case_deleted', 'account_exported', 'account_deletion_requested'
  )),
  ip inet,
  user_agent text check (char_length(user_agent) <= 300),
  created_at timestamptz not null default now()
);

create index security_events_user_idx on public.security_events (user_id, created_at desc);

alter table public.security_events enable row level security;

create policy "security_events_select_own" on public.security_events
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "security_events_mfa" on public.security_events as restrictive for all to authenticated
  using ((select public.mfa_satisfied())) with check ((select public.mfa_satisfied()));

revoke all on public.security_events from anon, authenticated;
grant select on public.security_events to authenticated;
grant insert on public.security_events to service_role;
