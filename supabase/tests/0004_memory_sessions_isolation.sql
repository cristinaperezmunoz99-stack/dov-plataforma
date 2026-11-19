-- Prueba de aislamiento de memoria y sesiones entre dos usuarios.
-- Resultado esperado: una fila con "OK". Si algo falla, aparece un error que empieza por "FALLO".

do $$
declare
  a uuid := '00000000-0000-0000-0000-0000000000a1';
  b uuid := '00000000-0000-0000-0000-0000000000b2';
  case_a uuid;
  case_b uuid;
  cat uuid;
  mem_b uuid;
  ses_b uuid;
  n int;
  t1 timestamptz;
  t2 timestamptz;
begin
  insert into auth.users (id, email, aud, role) values
    (a, 'prueba-a@example.com', 'authenticated', 'authenticated'),
    (b, 'prueba-b@example.com', 'authenticated', 'authenticated');

  select id into cat from public.memory_categories where slug = 'objetivos';

  -- B: caso con memoria y sesión
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public.cases (title) values ('Caso de B') returning id into case_b;
  insert into public.case_memory (case_id, category_id, content) values (case_b, cat, 'Memoria de B') returning id into mem_b;
  insert into public.sessions (case_id, notes) values (case_b, 'Sesión de B') returning id into ses_b;
  reset role;

  -- A
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.memory_categories;
  if n < 5 then raise exception 'FALLO: A no ve las categorías de memoria'; end if;

  insert into public.cases (title) values ('Caso de A') returning id into case_a;
  -- Fecha antigua para comprobar que añadir memoria/sesiones actualiza el caso
  reset role;
  update public.cases set updated_at = '2000-01-01' where id = case_a;
  t1 := '2000-01-01';
  set local role authenticated;

  -- Memoria y sesiones de B invisibles para A
  select count(*) into n from public.case_memory;
  if n <> 0 then raise exception 'FALLO: A ve memoria de B'; end if;
  select count(*) into n from public.sessions;
  if n <> 0 then raise exception 'FALLO: A ve sesiones de B'; end if;

  update public.case_memory set content = 'X' where id = mem_b;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALLO: A modifica memoria de B'; end if;
  delete from public.sessions where id = ses_b;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALLO: A borra sesiones de B'; end if;

  -- A no puede escribir en el caso de B
  begin
    insert into public.case_memory (case_id, category_id, content) values (case_b, cat, 'Intruso');
    raise exception 'FALLO: A añade memoria al caso de B';
  exception when foreign_key_violation then null;
  end;
  begin
    insert into public.sessions (case_id, notes) values (case_b, 'Intruso');
    raise exception 'FALLO: A añade sesiones al caso de B';
  exception when foreign_key_violation then null;
  end;

  -- Columnas protegidas
  begin
    insert into public.sessions (case_id, session_number) values (case_a, 99);
    raise exception 'FALLO: A elige el número de sesión';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.case_memory (case_id, user_id, category_id, content) values (case_a, b, cat, 'Suplantación');
    raise exception 'FALLO: A crea memoria a nombre de B';
  exception when insufficient_privilege then null;
  end;

  -- Funcionamiento propio
  insert into public.case_memory (case_id, category_id, content) values (case_a, cat, 'Objetivo 1');
  insert into public.sessions (case_id, notes) values (case_a, 'Primera');
  insert into public.sessions (case_id, notes) values (case_a, 'Segunda');
  select max(session_number) into n from public.sessions where case_id = case_a;
  if n <> 2 then raise exception 'FALLO: numeración de sesiones incorrecta (%)', n; end if;
  select updated_at into t2 from public.cases where id = case_a;
  if t2 <= t1 then raise exception 'FALLO: el caso no se marca como actualizado'; end if;

  -- Borrar el caso arrastra su memoria y sesiones
  delete from public.cases where id = case_a;
  select count(*) into n from public.case_memory where case_id = case_a;
  if n <> 0 then raise exception 'FALLO: queda memoria tras borrar el caso'; end if;
  select count(*) into n from public.sessions where case_id = case_a;
  if n <> 0 then raise exception 'FALLO: quedan sesiones tras borrar el caso'; end if;

  -- Anónimo
  reset role;
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  begin
    perform 1 from public.case_memory;
    raise exception 'FALLO: un anónimo lee memoria';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.sessions;
    raise exception 'FALLO: un anónimo lee sesiones';
  exception when insufficient_privilege then null;
  end;

  -- Limpieza
  reset role;
  delete from auth.users where id in (a, b);
  select count(*) into n from public.case_memory where id = mem_b;
  if n <> 0 then raise exception 'FALLO: queda memoria tras borrar al usuario'; end if;
end;
$$;

select 'OK: aislamiento de memoria y sesiones correcto' as resultado;
