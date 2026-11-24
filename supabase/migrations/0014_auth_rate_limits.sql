-- Límites anti-abuso para login, registro, recuperación y reautenticación.
-- Solo guarda hashes (HMAC) de IP/email, nunca el valor en claro. Retención: 24 h.

create table public.auth_rate_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('login_ip','login_email','signup_ip','recover_ip','recover_email','reauth_user')),
  key_hash text not null check (char_length(key_hash) = 64),
  created_at timestamptz not null default now()
);

create index auth_rate_events_lookup on public.auth_rate_events (kind, key_hash, created_at desc);
create index auth_rate_events_created on public.auth_rate_events (created_at);

alter table public.auth_rate_events enable row level security;
-- Sin políticas: ni anon ni authenticated pueden leer o escribir.
revoke all on public.auth_rate_events from anon, authenticated;

-- Comprueba y registra un intento de forma atómica.
-- Devuelve true si el intento se permite, false si supera el límite.
create or replace function public.auth_rate_hit(
  p_kind text,
  p_key_hash text,
  p_window_seconds integer,
  p_max integer
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_window_seconds not between 1 and 86400 or p_max not between 1 and 1000 then
    raise exception 'invalid rate limit parameters';
  end if;

  -- Serializa intentos con la misma clave para evitar carreras.
  perform pg_advisory_xact_lock(hashtextextended(p_kind || ':' || p_key_hash, 0));

  delete from public.auth_rate_events where created_at < now() - interval '1 day';

  select count(*) into v_count
  from public.auth_rate_events
  where kind = p_kind
    and key_hash = p_key_hash
    and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max then
    return false;
  end if;

  insert into public.auth_rate_events (kind, key_hash) values (p_kind, p_key_hash);
  return true;
end;
$$;

revoke all on function public.auth_rate_hit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.auth_rate_hit(text, text, integer, integer) to service_role;
