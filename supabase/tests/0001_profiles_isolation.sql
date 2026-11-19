-- Prueba de aislamiento de perfiles entre dos usuarios.
-- Crea dos usuarios de prueba, comprueba los permisos y los borra.
-- Resultado esperado: una fila con "OK". Si algo falla, aparece un error que empieza por "FALLO".

do $$
declare
  a uuid := '00000000-0000-0000-0000-0000000000a1';
  b uuid := '00000000-0000-0000-0000-0000000000b2';
  n int;
begin
  insert into auth.users (id, email, raw_user_meta_data, aud, role)
  values
    (a, 'prueba-a@example.com', '{"name":"Usuario A"}', 'authenticated', 'authenticated'),
    (b, 'prueba-b@example.com', '{"name":"Usuario B"}', 'authenticated', 'authenticated');

  select count(*) into n from public.profiles where id in (a, b);
  if n <> 2 then raise exception 'FALLO: el trigger no creó los perfiles'; end if;

  -- Actuar como el usuario A
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.profiles;
  if n <> 1 then raise exception 'FALLO: A ve % perfiles (debería ver 1)', n; end if;

  update public.profiles set name = 'Cambiado por A' where id = b;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALLO: A ha modificado el perfil de B'; end if;

  update public.profiles set name = 'Nuevo nombre A' where id = a;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FALLO: A no puede cambiar su propio nombre'; end if;

  begin
    update public.profiles set email = 'otro@example.com' where id = a;
    raise exception 'FALLO: A puede cambiar su email en profiles';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.profiles (id, email) values (gen_random_uuid(), 'x@example.com');
    raise exception 'FALLO: A puede crear perfiles';
  exception when insufficient_privilege then null;
  end;

  begin
    delete from public.profiles where id = a;
    raise exception 'FALLO: A puede borrar perfiles';
  exception when insufficient_privilege then null;
  end;

  -- Actuar como anónimo
  reset role;
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  begin
    perform 1 from public.profiles;
    raise exception 'FALLO: un anónimo puede leer perfiles';
  exception when insufficient_privilege then null;
  end;

  -- Limpieza
  reset role;
  delete from auth.users where id in (a, b);
end;
$$;

select 'OK: aislamiento de perfiles correcto' as resultado;
