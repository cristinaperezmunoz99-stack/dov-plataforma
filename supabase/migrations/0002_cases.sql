-- Fase 2: casos
-- Cada caso pertenece a un único usuario. Se identifica por un código (CASO-XXXX), nunca por datos del paciente.

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  case_code text not null,
  title text not null default '' check (char_length(title) <= 120),
  general_context text not null default '' check (char_length(general_context) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cases_user_code_unique unique (user_id, case_code),
  -- Permite claves foráneas compuestas (case_id, user_id) en las tablas hijas.
  constraint cases_id_user_unique unique (id, user_id)
);

create index cases_user_updated_idx on public.cases (user_id, updated_at desc);

alter table public.cases enable row level security;

create policy "cases_select_own" on public.cases
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "cases_insert_own" on public.cases
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "cases_update_own" on public.cases
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "cases_delete_own" on public.cases
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Permisos mínimos: el usuario solo escribe título y contexto.
-- user_id lo pone la base de datos (auth.uid()) y case_code lo genera el trigger.
revoke all on public.cases from anon, authenticated;
grant select, delete on public.cases to authenticated;
grant insert (title, general_context) on public.cases to authenticated;
grant update (title, general_context) on public.cases to authenticated;

-- Código de caso: CASO- + 4 caracteres sin ambiguos (sin 0/O, 1/I/L).
create function public.generate_case_code()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  candidate text;
  attempt int := 0;
begin
  loop
    attempt := attempt + 1;
    candidate := 'CASO-';
    for i in 1..4 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (
      select 1 from public.cases c where c.user_id = new.user_id and c.case_code = candidate
    );
    if attempt >= 20 then
      raise exception 'No se pudo generar un código de caso único';
    end if;
  end loop;
  new.case_code := candidate;
  return new;
end;
$$;

create trigger cases_generate_code
  before insert on public.cases
  for each row execute function public.generate_case_code();

create trigger cases_set_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();
