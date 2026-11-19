-- El trigger genera case_code; el valor por defecto solo permite insertar sin indicarlo.
alter table public.cases alter column case_code set default '';
