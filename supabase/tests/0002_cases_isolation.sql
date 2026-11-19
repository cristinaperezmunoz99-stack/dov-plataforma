-- Prueba de aislamiento de casos entre dos usuarios.
-- Resultado esperado: una fila con "OK". Si algo falla, aparece un error que empieza por "FALLO".

do $$
declare
  a uuid := '00000000-0000-0000-0000-0000000000a1';
  b uuid := '00000000-0000-0000-0000-0000000000b2';
  case_a uuid;
  case_b uuid;
  code_a text;
  n int;
begin
  insert into auth.users (id, email, aud, role) values
    (a, 'prueba-a@example.com', 'authenticated', 'authenticated'),
    (b, 'prueba-b@example.com', 'authenticated', 'authenticated');

  -- B crea un caso
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public.cases (title) values ('Caso de B') returning id into case_b;
  reset role;

  -- A crea un caso
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public.cases (title, general_context) values ('Caso de A', 'Contexto') returning id, case_code into case_a, code_a;

  if code_a !~ '^CASO-[A-Z2-9]{4}$' then raise exception 'FALLO: código de caso con formato incorrecto (%)', code_a; end if;

  select count(*) into n from public.cases;
  if n <> 1 then raise exception 'FALLO: A ve % casos (debería ver 1)', n; end if;

  update public.cases set title = 'Modificado por A' where id = case_b;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALLO: A ha modificado un caso de B'; end if;

  delete from public.cases where id = case_b;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALLO: A ha borrado un caso de B'; end if;

  update public.cases set title = 'Nuevo título' where id = case_a;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FALLO: A no puede editar su propio caso'; end if;

  begin
    insert into public.cases (user_id, title) values (b, 'Caso falso a nombre de B');
    raise exception 'FALLO: A puede crear casos a nombre de otro usuario';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.cases set user_id = b where id = case_a;
    raise exception 'FALLO: A puede transferir su caso a otro usuario';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.cases set case_code = 'CASO-XXXX' where id = case_a;
    raise exception 'FALLO: A puede cambiar el código de su caso';
  exception when insufficient_privilege then null;
  end;

  delete from public.cases where id = case_a;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FALLO: A no puede borrar su propio caso'; end if;

  -- Anónimo
  reset role;
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  begin
    perform 1 from public.cases;
    raise exception 'FALLO: un anónimo puede leer casos';
  exception when insufficient_privilege then null;
  end;

  -- Limpieza (el borrado del usuario arrastra sus casos)
  reset role;
  delete from auth.users where id in (a, b);
  select count(*) into n from public.cases where id in (case_a, case_b);
  if n <> 0 then raise exception 'FALLO: quedan casos tras borrar a sus usuarios'; end if;
end;
$$;

select 'OK: aislamiento de casos correcto' as resultado;
