-- Prueba de aislamiento de recursos entre dos usuarios.
do $$
declare
  a uuid := '00000000-0000-0000-0000-0000000000a1';
  b uuid := '00000000-0000-0000-0000-0000000000b2';
  case_a uuid; case_b uuid; res_b uuid; n int;
begin
  insert into auth.users (id, email, aud, role) values
    (a, 'prueba-a@example.com', 'authenticated', 'authenticated'),
    (b, 'prueba-b@example.com', 'authenticated', 'authenticated');

  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public.cases (title) values ('Caso de B') returning id into case_b;
  insert into public.case_resources (case_id, title, content) values (case_b, 'Autorregistro', 'Contenido') returning id into res_b;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public.cases (title) values ('Caso de A') returning id into case_a;

  select count(*) into n from public.case_resources;
  if n <> 0 then raise exception 'FALLO: A ve recursos de B'; end if;
  update public.case_resources set title = 'X' where id = res_b;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALLO: A modifica recursos de B'; end if;
  delete from public.case_resources where id = res_b;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALLO: A borra recursos de B'; end if;
  begin
    insert into public.case_resources (case_id, title, content) values (case_b, 'Intruso', 'X');
    raise exception 'FALLO: A añade recursos al caso de B';
  exception when foreign_key_violation then null;
  end;
  begin
    insert into public.case_resources (case_id, user_id, title, content) values (case_a, b, 'Suplantación', 'X');
    raise exception 'FALLO: A crea recursos a nombre de B';
  exception when insufficient_privilege then null;
  end;
  insert into public.case_resources (case_id, title, content) values (case_a, 'Mío', 'X');
  delete from public.cases where id = case_a;
  select count(*) into n from public.case_resources where case_id = case_a;
  if n <> 0 then raise exception 'FALLO: quedan recursos tras borrar el caso'; end if;

  reset role;
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  begin
    perform 1 from public.case_resources;
    raise exception 'FALLO: un anónimo lee recursos';
  exception when insufficient_privilege then null;
  end;

  reset role;
  delete from auth.users where id in (a, b);
end;
$$;

select 'OK: aislamiento de recursos correcto' as resultado;
