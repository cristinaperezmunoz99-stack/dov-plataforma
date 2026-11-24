-- Prueba: con un factor verificado, la sesión aal1 no ve datos; la aal2 sí.
do $$
declare
  a uuid := '00000000-0000-0000-0000-0000000000a1';
  n int;
begin
  insert into auth.users (id, email, aud, role) values (a, 'prueba-a@example.com', 'authenticated', 'authenticated');

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  set local role authenticated;
  insert into public.cases (title) values ('Caso de A');
  select count(*) into n from public.cases;
  if n <> 1 then raise exception 'FALLO: sin 2FA, A no ve su caso'; end if;
  reset role;

  insert into auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret)
  values (gen_random_uuid(), a, 'prueba', 'totp', 'verified', now(), now(), 'secreto');

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  set local role authenticated;
  select count(*) into n from public.cases;
  if n <> 0 then raise exception 'FALLO: con 2FA activada, una sesión aal1 ve datos'; end if;
  select count(*) into n from public.profiles;
  if n <> 0 then raise exception 'FALLO: con 2FA activada, una sesión aal1 ve el perfil'; end if;
  begin
    insert into public.cases (title) values ('Intento aal1');
    raise exception 'FALLO: con 2FA activada, una sesión aal1 puede crear casos';
  exception when insufficient_privilege then null;
  end;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  set local role authenticated;
  select count(*) into n from public.cases;
  if n <> 1 then raise exception 'FALLO: con 2FA y sesión aal2, A no ve su caso'; end if;
  reset role;

  delete from auth.users where id = a;
end;
$$;

select 'OK: la verificación en dos pasos se aplica en la base de datos' as resultado;
