-- mfa_satisfied() la usan las políticas RLS, pero no debe ser invocable vía /rest/v1/rpc.
-- Se mueve a un esquema no expuesto por la API. Las políticas siguen funcionando
-- porque referencian la función por su identificador interno.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
alter function public.mfa_satisfied() set schema private;
revoke all on function private.mfa_satisfied() from public, anon;
grant execute on function private.mfa_satisfied() to authenticated;
