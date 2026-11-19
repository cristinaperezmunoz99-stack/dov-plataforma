-- Corrige assign_session_number: comprobar que el caso pertenece al usuario ANTES de
-- calcular el número. Antes, al intentar insertar en un caso ajeno, el cálculo (limitado
-- por RLS) chocaba con la restricción única y el error revelaba que el caso tenía sesiones.

create or replace function public.assign_session_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.cases c where c.id = new.case_id and c.user_id = new.user_id
  ) then
    raise exception 'El caso no existe' using errcode = 'foreign_key_violation';
  end if;

  -- Evita números duplicados si se crean dos sesiones a la vez.
  perform pg_advisory_xact_lock(hashtextextended(new.case_id::text, 0));
  select coalesce(max(s.session_number), 0) + 1 into new.session_number
  from public.sessions s where s.case_id = new.case_id;
  return new;
end;
$$;
