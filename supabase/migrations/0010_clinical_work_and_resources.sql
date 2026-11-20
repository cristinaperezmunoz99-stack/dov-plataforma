-- Trabajo clínico (antes "memoria") alimentado desde los asistentes, y biblioteca de recursos por caso.

-- ============ Secciones de trabajo clínico ============
-- mode 'single': hay una versión vigente (guardar de nuevo la sustituye).
-- mode 'multiple': las entradas se acumulan.
alter table public.memory_categories
  add column mode text not null default 'multiple' check (mode in ('single', 'multiple'));

delete from public.memory_categories where slug = 'contexto-clinico';

insert into public.memory_categories (slug, name, description, sort_order, mode) values
  ('evaluacion', 'Evaluación', 'Evaluación del caso y áreas a explorar.', 10, 'single'),
  ('plan-intervencion', 'Plan de intervención', 'Fases, técnicas y ramificaciones del plan.', 30, 'single');

update public.memory_categories set sort_order = 20, mode = 'single',
  description = 'Hipótesis explicativa vigente del caso.' where slug = 'formulacion';
update public.memory_categories set sort_order = 40, mode = 'single',
  description = 'Objetivos terapéuticos vigentes y sus indicadores.' where slug = 'objetivos';
update public.memory_categories set sort_order = 50, mode = 'multiple',
  description = 'Cambios y progreso a lo largo del proceso.' where slug = 'evolucion';
update public.memory_categories set sort_order = 60, mode = 'multiple',
  description = 'Puntos ciegos, hipótesis alternativas y otras notas a tener presentes.' where slug = 'observaciones';

alter table public.case_memory drop constraint case_memory_content_check;
alter table public.case_memory
  add constraint case_memory_content_check check (char_length(content) between 1 and 60000);

-- ============ Destinos de guardado por asistente ============
-- Slugs de secciones (o 'recursos') donde cada asistente guarda su trabajo. El primero es el predeterminado.
alter table public.assistants add column save_targets text[] not null default '{}';

update public.assistants set save_targets = array['formulacion', 'plan-intervencion', 'evaluacion', 'objetivos']
  where slug = 'la-brujula';
update public.assistants set save_targets = array['formulacion', 'plan-intervencion', 'evaluacion', 'objetivos', 'evolucion', 'observaciones', 'recursos']
  where slug = 'prueba-tecnica';

-- ============ Recursos del caso ============
create table public.case_resources (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  user_id uuid not null default auth.uid(),
  title text not null check (char_length(title) between 1 and 200),
  resource_type text not null default 'material' check (resource_type ~ '^[a-z0-9-]{2,40}$'),
  content text not null check (char_length(content) between 1 and 60000),
  source_assistant_id uuid references public.assistants (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_resources_case_fk foreign key (case_id, user_id)
    references public.cases (id, user_id) on delete cascade
);

create index case_resources_case_idx on public.case_resources (case_id, created_at desc);
create index case_resources_user_idx on public.case_resources (user_id);
create index case_resources_assistant_idx on public.case_resources (source_assistant_id);

alter table public.case_resources enable row level security;

create policy "case_resources_select_own" on public.case_resources
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "case_resources_insert_own" on public.case_resources
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "case_resources_update_own" on public.case_resources
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "case_resources_delete_own" on public.case_resources
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.case_resources from anon, authenticated;
grant select, delete on public.case_resources to authenticated;
grant insert (case_id, title, resource_type, content, source_assistant_id) on public.case_resources to authenticated;
grant update (title, resource_type, content) on public.case_resources to authenticated;

create trigger case_resources_set_updated_at
  before update on public.case_resources
  for each row execute function public.set_updated_at();

create trigger case_resources_touch_case
  after insert or update or delete on public.case_resources
  for each row execute function public.touch_case();
