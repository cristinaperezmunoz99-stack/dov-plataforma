-- Fase 3: memoria del caso y sesiones

-- ============ Categorías de memoria (configuración) ============
create table public.memory_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  name text not null check (char_length(name) between 1 and 60),
  description text not null default '' check (char_length(description) <= 300),
  sort_order int not null default 0,
  active boolean not null default true
);

alter table public.memory_categories enable row level security;

create policy "memory_categories_read_active" on public.memory_categories
  for select to authenticated
  using (active);

revoke all on public.memory_categories from anon, authenticated;
grant select on public.memory_categories to authenticated;

insert into public.memory_categories (slug, name, description, sort_order) values
  ('contexto-clinico', 'Contexto clínico', 'Motivo de consulta, historia relevante y situación actual.', 10),
  ('objetivos', 'Objetivos', 'Objetivos terapéuticos acordados.', 20),
  ('formulacion', 'Formulación', 'Hipótesis de trabajo sobre el caso.', 30),
  ('evolucion', 'Evolución', 'Cambios y progreso a lo largo del proceso.', 40),
  ('observaciones', 'Observaciones', 'Otras notas que conviene tener presentes.', 50);

-- ============ Utilidad: marcar el caso como actualizado ============
-- security definer: el usuario no tiene permiso para escribir updated_at directamente.
create function public.touch_case()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.case_id, old.case_id);
begin
  -- En borrados en cascada (al eliminar el caso o la cuenta) no se toca el caso.
  if tg_op = 'DELETE' and pg_trigger_depth() > 1 then
    return null;
  end if;
  update public.cases set updated_at = now() where id = target;
  return null;
end;
$$;

revoke execute on function public.touch_case() from public, anon, authenticated;

-- ============ Memoria del caso ============
create table public.case_memory (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  user_id uuid not null default auth.uid(),
  category_id uuid not null references public.memory_categories (id),
  content text not null check (char_length(content) between 1 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- La entrada solo puede pertenecer a un caso del mismo usuario.
  constraint case_memory_case_fk foreign key (case_id, user_id)
    references public.cases (id, user_id) on delete cascade
);

create index case_memory_case_idx on public.case_memory (case_id, category_id, created_at);
create index case_memory_user_idx on public.case_memory (user_id);

alter table public.case_memory enable row level security;

create policy "case_memory_select_own" on public.case_memory
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "case_memory_insert_own" on public.case_memory
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "case_memory_update_own" on public.case_memory
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "case_memory_delete_own" on public.case_memory
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.case_memory from anon, authenticated;
grant select, delete on public.case_memory to authenticated;
grant insert (case_id, category_id, content) on public.case_memory to authenticated;
grant update (category_id, content) on public.case_memory to authenticated;

create trigger case_memory_set_updated_at
  before update on public.case_memory
  for each row execute function public.set_updated_at();

create trigger case_memory_touch_case
  after insert or update or delete on public.case_memory
  for each row execute function public.touch_case();

-- ============ Sesiones ============
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  user_id uuid not null default auth.uid(),
  session_number int not null default 0,
  session_type text not null default 'individual' check (session_type ~ '^[a-z0-9-]{2,40}$'),
  date date not null default current_date,
  notes text not null default '' check (char_length(notes) <= 20000),
  summary text not null default '' check (char_length(summary) <= 5000),
  relevant_info text not null default '' check (char_length(relevant_info) <= 5000),
  changes text not null default '' check (char_length(changes) <= 5000),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sessions_case_fk foreign key (case_id, user_id)
    references public.cases (id, user_id) on delete cascade,
  constraint sessions_number_unique unique (case_id, session_number)
);

create index sessions_case_idx on public.sessions (case_id, session_number desc);
create index sessions_user_idx on public.sessions (user_id);

alter table public.sessions enable row level security;

create policy "sessions_select_own" on public.sessions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "sessions_insert_own" on public.sessions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "sessions_update_own" on public.sessions
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "sessions_delete_own" on public.sessions
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.sessions from anon, authenticated;
grant select, delete on public.sessions to authenticated;
grant insert (case_id, date, notes, summary, relevant_info, changes) on public.sessions to authenticated;
grant update (date, notes, summary, relevant_info, changes) on public.sessions to authenticated;

-- Número de sesión correlativo por caso.
create function public.assign_session_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Evita números duplicados si se crean dos sesiones a la vez.
  perform pg_advisory_xact_lock(hashtextextended(new.case_id::text, 0));
  select coalesce(max(s.session_number), 0) + 1 into new.session_number
  from public.sessions s where s.case_id = new.case_id;
  return new;
end;
$$;

create trigger sessions_assign_number
  before insert on public.sessions
  for each row execute function public.assign_session_number();

create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

create trigger sessions_touch_case
  after insert or update or delete on public.sessions
  for each row execute function public.touch_case();
