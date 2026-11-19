-- Prueba de aislamiento de asistentes, conversaciones, mensajes y uso.
-- Resultado esperado: una fila con "OK". Si algo falla, aparece un error que empieza por "FALLO".

do $$
declare
  a uuid := '00000000-0000-0000-0000-0000000000a1';
  b uuid := '00000000-0000-0000-0000-0000000000b2';
  asst uuid;
  inactive_asst uuid;
  case_a uuid;
  case_b uuid;
  conv_a uuid;
  conv_b uuid;
  n int;
begin
  insert into auth.users (id, email, aud, role) values
    (a, 'prueba-a@example.com', 'authenticated', 'authenticated'),
    (b, 'prueba-b@example.com', 'authenticated', 'authenticated');

  select id into asst from public.assistants where slug = 'prueba-tecnica';
  insert into public.assistants (slug, name, active) values ('inactivo-test', 'Inactivo', false)
    returning id into inactive_asst;

  -- B: caso, conversación, mensajes y uso (los mensajes y el uso los escribe el servidor)
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public.cases (title) values ('Caso de B') returning id into case_b;
  insert into public.conversations (case_id, assistant_id) values (case_b, asst) returning id into conv_b;
  reset role;
  insert into public.messages (conversation_id, user_id, role, content) values (conv_b, b, 'user', 'Hola');
  insert into public.usage_events (user_id, case_id, conversation_id, assistant_id, model) values (b, case_b, conv_b, asst, 'test');

  -- A
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public.cases (title) values ('Caso de A') returning id into case_a;

  select count(*) into n from public.assistants where id = asst;
  if n <> 1 then raise exception 'FALLO: A no ve los asistentes'; end if;

  begin
    perform 1 from public.assistant_versions;
    raise exception 'FALLO: A puede leer los prompts de los asistentes';
  exception when insufficient_privilege then null;
  end;

  insert into public.conversations (case_id, assistant_id) values (case_a, asst) returning id into conv_a;

  begin
    insert into public.conversations (case_id, assistant_id) values (case_a, inactive_asst);
    raise exception 'FALLO: A abre conversación con un asistente inactivo';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.conversations (case_id, assistant_id) values (case_b, asst);
    raise exception 'FALLO: A abre conversación en el caso de B';
  exception when foreign_key_violation then null;
  end;

  select count(*) into n from public.conversations;
  if n <> 1 then raise exception 'FALLO: A ve % conversaciones (debería ver 1)', n; end if;
  select count(*) into n from public.messages;
  if n <> 0 then raise exception 'FALLO: A ve mensajes de B'; end if;
  select count(*) into n from public.usage_events;
  if n <> 0 then raise exception 'FALLO: A ve el uso de B'; end if;

  begin
    insert into public.messages (conversation_id, user_id, role, content) values (conv_a, a, 'assistant', 'Falso');
    raise exception 'FALLO: A puede escribir mensajes directamente';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.usage_events (user_id, model) values (a, 'test');
    raise exception 'FALLO: A puede escribir en el registro de uso';
  exception when insufficient_privilege then null;
  end;

  begin
    delete from public.usage_events where user_id = a;
    raise exception 'FALLO: A puede borrar su registro de uso';
  exception when insufficient_privilege then null;
  end;

  delete from public.conversations where id = conv_b;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALLO: A borra conversaciones de B'; end if;

  begin
    update public.conversations set assistant_id = inactive_asst where id = conv_a;
    raise exception 'FALLO: A cambia el asistente de una conversación';
  exception when insufficient_privilege then null;
  end;

  -- Anónimo
  reset role;
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  begin
    perform 1 from public.messages;
    raise exception 'FALLO: un anónimo lee mensajes';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.assistants;
    raise exception 'FALLO: un anónimo lee asistentes';
  exception when insufficient_privilege then null;
  end;

  -- Borrar la conversación de B elimina sus mensajes y conserva el uso sin vínculo
  reset role;
  delete from public.conversations where id = conv_b;
  select count(*) into n from public.messages where conversation_id = conv_b;
  if n <> 0 then raise exception 'FALLO: quedan mensajes tras borrar la conversación'; end if;
  select count(*) into n from public.usage_events where user_id = b and conversation_id is null;
  if n <> 1 then raise exception 'FALLO: el registro de uso no se conserva al borrar la conversación'; end if;

  -- Limpieza
  delete from auth.users where id in (a, b);
  delete from public.assistants where id = inactive_asst;
  select count(*) into n from public.usage_events where user_id in (a, b);
  if n <> 0 then raise exception 'FALLO: queda uso tras borrar a los usuarios'; end if;
end;
$$;

select 'OK: aislamiento de conversaciones, mensajes y uso correcto' as resultado;
