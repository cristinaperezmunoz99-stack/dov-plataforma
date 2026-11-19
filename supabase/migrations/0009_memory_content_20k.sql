-- Permite guardar en memoria formulaciones largas procedentes de los asistentes.
alter table public.case_memory drop constraint case_memory_content_check;
alter table public.case_memory
  add constraint case_memory_content_check check (char_length(content) between 1 and 20000);
