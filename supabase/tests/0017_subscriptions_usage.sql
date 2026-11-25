-- Prueba: suscripciones aisladas y de solo lectura para el usuario; my_usage_since solo suma lo propio.
begin;
do $$
declare
  a uuid := '00000000-0000-0000-0000-0000000000a1';
  b uuid := '00000000-0000-0000-0000-0000000000b2';
  n int; m bigint; c numeric;
begin
  insert into auth.users (id, email, aud, role) values
    (a, 'prueba-a@example.com', 'authenticated', 'authenticated'),
    (b, 'prueba-b@example.com', 'authenticated', 'authenticated');
  insert into public.subscriptions (user_id, plan_id, status) values (a, 'profesional', 'active');
  insert into public.usage_events (user_id, model, input_tokens, output_tokens, estimated_cost_usd)
  values (a, 'm', 1, 1, 0.5), (a, 'm', 1, 1, 0.25), (b, 'm', 1, 1, 9);

  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  set local role authenticated;
  select count(*) into n from public.subscriptions;
  if n <> 0 then raise exception 'FALLO: B ve la suscripción de A'; end if;
  select messages, cost_usd into m, c from public.my_usage_since(now() - interval '1 day');
  if m <> 1 or c <> 9 then raise exception 'FALLO: consumo de B incorrecto (% / %)', m, c; end if;
  begin
    insert into public.subscriptions (user_id, plan_id, status) values (b, 'profesional', 'active');
    raise exception 'FALLO: B puede crearse una suscripción';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.subscriptions set plan_id = 'profesional';
    raise exception 'FALLO: B puede editar suscripciones';
  exception when insufficient_privilege then null;
  end;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  set local role authenticated;
  select count(*) into n from public.subscriptions;
  if n <> 1 then raise exception 'FALLO: A no ve su suscripción'; end if;
  select messages, cost_usd into m, c from public.my_usage_since(now() - interval '1 day');
  if m <> 2 or c <> 0.75 then raise exception 'FALLO: consumo de A incorrecto (% / %)', m, c; end if;
  reset role;
end;
$$;
select 'OK: suscripciones aisladas y de solo lectura; consumo propio correcto' as resultado;
rollback;
