-- 1) Aceptación de documentos legales (términos, privacidad, contrato de encargo).
-- 2) Conservación limitada de registros (12 meses).

create table public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  document text not null check (document in ('terms', 'privacy', 'dpa')),
  version text not null check (version ~ '^\d{4}-\d{2}-\d{2}$'),
  accepted_at timestamptz not null default now(),
  unique (user_id, document, version)
);

alter table public.legal_acceptances enable row level security;

create policy "legal_acceptances_select_own" on public.legal_acceptances
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "legal_acceptances_insert_own" on public.legal_acceptances
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "legal_acceptances_mfa" on public.legal_acceptances
  as restrictive for all to authenticated
  using ((select private.mfa_satisfied())) with check ((select private.mfa_satisfied()));

-- El usuario registra aceptaciones; no puede editarlas ni borrarlas.
revoke all on public.legal_acceptances from anon, authenticated;
grant select on public.legal_acceptances to authenticated;
grant insert (document, version) on public.legal_acceptances to authenticated;

-- Al registrarse, la aceptación viaja en los metadatos del alta.
-- Se valida el formato; la aplicación comprueba después que la versión sea la vigente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_doc text;
  v_version text;
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(left(trim(new.raw_user_meta_data ->> 'name'), 120), '')
  );

  if jsonb_typeof(new.raw_user_meta_data -> 'legal') = 'object' then
    for v_doc, v_version in
      select key, value from jsonb_each_text(new.raw_user_meta_data -> 'legal')
    loop
      if v_doc in ('terms', 'privacy', 'dpa') and v_version ~ '^\d{4}-\d{2}-\d{2}$' then
        insert into public.legal_acceptances (user_id, document, version)
        values (new.id, v_doc, v_version)
        on conflict do nothing;
      end if;
    end loop;
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Conservación: registros de seguridad y de uso, 12 meses.
create extension if not exists pg_cron;

create or replace function private.purge_old_records()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.security_events where created_at < now() - interval '12 months';
  delete from public.usage_events where created_at < now() - interval '12 months';
  delete from public.auth_rate_events where created_at < now() - interval '1 day';
$$;

revoke all on function private.purge_old_records() from public, anon, authenticated;

select cron.schedule('purge-old-records', '17 3 * * *', $$select private.purge_old_records()$$);
