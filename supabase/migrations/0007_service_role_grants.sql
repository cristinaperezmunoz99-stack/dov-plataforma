-- En este proyecto service_role no recibe permisos por defecto sobre tablas nuevas.
-- Se conceden solo los mínimos que necesita el servidor (/api/chat):
--   leer la configuración de los asistentes, guardar respuestas de la IA y registrar uso.
grant select on public.assistants to service_role;
grant select on public.assistant_versions to service_role;
grant insert on public.messages to service_role;
grant insert on public.usage_events to service_role;
