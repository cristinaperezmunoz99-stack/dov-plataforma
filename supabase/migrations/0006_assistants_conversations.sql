-- Fase 4: asistentes, conversaciones, mensajes y registro de uso

-- ============ Asistentes (datos públicos) ============
create table public.assistants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 500),
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.assistants enable row level security;

create policy "assistants_read" on public.assistants
  for select to authenticated using (true);

revoke all on public.assistants from anon, authenticated;
grant select on public.assistants to authenticated;

-- ============ Versiones de asistente (solo servidor) ============
-- Contiene los system_prompt: sin políticas ni permisos para usuarios.
create table public.assistant_versions (
  id uuid primary key default gen_random_uuid(),
  assistant_id uuid not null references public.assistants (id) on delete cascade,
  version int not null check (version > 0),
  system_prompt text not null,
  model text not null,
  max_tokens int not null check (max_tokens between 1 and 32000),
  config jsonb not null default '{}'::jsonb,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  constraint assistant_versions_unique unique (assistant_id, version)
);

create unique index assistant_versions_one_current
  on public.assistant_versions (assistant_id) where is_current;

alter table public.assistant_versions enable row level security;
revoke all on public.assistant_versions from anon, authenticated;

-- ============ Conversaciones ============
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  user_id uuid not null default auth.uid(),
  assistant_id uuid not null references public.assistants (id),
  title text not null default '' check (char_length(title) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_case_fk foreign key (case_id, user_id)
    references public.cases (id, user_id) on delete cascade,
  constraint conversations_id_user_unique unique (id, user_id)
);

create index conversations_case_idx on public.conversations (case_id, updated_at desc);
create index conversations_user_idx on public.conversations (user_id);
create index conversations_assistant_idx on public.conversations (assistant_id);

alter table public.conversations enable row level security;

create policy "conversations_select_own" on public.conversations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "conversations_insert_own" on public.conversations
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.assistants a where a.id = assistant_id and a.active)
  );
create policy "conversations_update_own" on public.conversations
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "conversations_delete_own" on public.conversations
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.conversations from anon, authenticated;
grant select, delete on public.conversations to authenticated;
grant insert (case_id, assistant_id, title) on public.conversations to authenticated;
grant update (title) on public.conversations to authenticated;

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

create trigger conversations_touch_case
  after insert or delete on public.conversations
  for each row execute function public.touch_case();

-- ============ Mensajes ============
-- El usuario solo lee. Los escribe el servidor (clave secreta) tras validar al usuario.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id uuid not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 100000),
  assistant_version_id uuid references public.assistant_versions (id),
  created_at timestamptz not null default now(),
  constraint messages_conversation_fk foreign key (conversation_id, user_id)
    references public.conversations (id, user_id) on delete cascade
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);
create index messages_user_idx on public.messages (user_id);
create index messages_version_idx on public.messages (assistant_version_id);

alter table public.messages enable row level security;

create policy "messages_select_own" on public.messages
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.messages from anon, authenticated;
grant select on public.messages to authenticated;

-- ============ Registro de uso ============
create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid references public.cases (id) on delete set null,
  conversation_id uuid references public.conversations (id) on delete set null,
  assistant_id uuid references public.assistants (id) on delete set null,
  assistant_version_id uuid references public.assistant_versions (id) on delete set null,
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cache_creation_input_tokens int not null default 0,
  cache_read_input_tokens int not null default 0,
  estimated_cost_usd numeric(12, 6) not null default 0,
  created_at timestamptz not null default now()
);

create index usage_events_user_created_idx on public.usage_events (user_id, created_at desc);
create index usage_events_case_idx on public.usage_events (case_id);
create index usage_events_conversation_idx on public.usage_events (conversation_id);
create index usage_events_assistant_idx on public.usage_events (assistant_id);
create index usage_events_version_idx on public.usage_events (assistant_version_id);

alter table public.usage_events enable row level security;

create policy "usage_events_select_own" on public.usage_events
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.usage_events from anon, authenticated;
grant select on public.usage_events to authenticated;

-- ============ Asistente de prueba técnica ============
-- No es un asistente clínico. Sirve solo para comprobar que la integración funciona.
with a as (
  insert into public.assistants (slug, name, description, sort_order)
  values (
    'prueba-tecnica',
    'Asistente de prueba',
    'Asistente técnico para comprobar que la plataforma funciona. No es un asistente clínico.',
    999
  )
  returning id
)
insert into public.assistant_versions (assistant_id, version, system_prompt, model, max_tokens, is_current)
select
  a.id,
  1,
  'Eres un asistente de prueba técnica dentro de una plataforma de trabajo para psicólogos. '
  || 'Tu única función es comprobar que la integración funciona. Responde en español, con brevedad. '
  || 'Si te preguntan qué información del caso has recibido, resúmela en pocas líneas. '
  || 'Si te piden orientación clínica, indica que eres un asistente de prueba y que los asistentes definitivos se añadirán más adelante.',
  'claude-sonnet-5-5',
  1024,
  true
from a;
