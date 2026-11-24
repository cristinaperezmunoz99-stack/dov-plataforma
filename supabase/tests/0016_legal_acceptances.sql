-- Prueba: el alta registra aceptaciones válidas; cada usuario solo ve y crea las suyas;
-- no se pueden editar ni borrar; la limpieza diaria está programada.
begin;
do $$
declare
  a uuid := '00000000-0000-0000-0000-0000000000a1';
  b uuid := '00000000-0000-0000-0000-0000000000b2';
  n int;
begin
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (a, 'prueba-a@example.com', 'authenticated', 'authenticated',
     '{"name":"A","legal":{"terms":"2026-11-24","privacy":"2026-11-24","dpa":"2026-11-24","otro":"2026-11-24"}}'),
    (b, 'prueba-b@example.com', 'authenticated', 'authenticated', '{"name":"B","legal":{"terms":"malformado"}}');

  select count(*) into n from public.legal_acceptances where user_id = a;
  if n <> 3 then raise exception 'FALLO: el alta no registra las 3 aceptaciones (%).', n; end if;
  select count(*) into n from public.legal_acceptances where user_id = b;
  if n <> 0 then raise exception 'FALLO: se aceptan versiones malformadas'; end if;

  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  set local role authenticated;
  select count(*) into n from public.legal_acceptances;
  if n <> 0 then raise exception 'FALLO: B ve aceptaciones de A'; end if;
  insert into public.legal_acceptances (document, version) values ('terms', '2026-11-24');
  begin
    insert into public.legal_acceptances (user_id, document, version) values (a, 'dpa', '2027-01-01');
    raise exception 'FALLO: B puede aceptar en nombre de A';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.legal_acceptances set version = '2020-01-01';
    raise exception 'FALLO: B puede editar aceptaciones';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.legal_acceptances;
    raise exception 'FALLO: B puede borrar aceptaciones';
  exception when insufficient_privilege then null;
  end;
  reset role;

  select count(*) into n from cron.job where jobname = 'purge-old-records';
  if n <> 1 then raise exception 'FALLO: no está programada la limpieza'; end if;
end;
$$;
select 'OK: aceptaciones legales aisladas e inmutables; limpieza programada' as resultado;
rollback;
