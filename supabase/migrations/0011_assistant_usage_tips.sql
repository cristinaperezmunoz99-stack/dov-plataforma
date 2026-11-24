-- Ayuda en el momento: consejos de uso y frases de inicio por asistente (datos públicos, no son el prompt).
alter table public.assistants
  add column usage_tips text not null default '' check (char_length(usage_tips) <= 2000),
  add column starters text[] not null default '{}';

update public.assistants set
  usage_tips = E'- Si el caso ya tiene información, no la repitas: dile directamente qué necesitas.\n- Indica desde qué enfoque quieres trabajar (TCC, ACT, sistémico…) o pídele que lo elija.\n- Pide primero la formulación y el plan; después, el paso a paso de las técnicas que vayas a usar.',
  starters = array[
    'Formula el caso y propón un plan de intervención por fases. Trabajo desde TCC.',
    'Formula el caso y recomiéndame el enfoque más adecuado.',
    'Prepárame la próxima sesión a partir del plan actual.'
  ]
where slug = 'la-brujula';

update public.assistants set
  usage_tips = E'- Asistente técnico para comprobar que todo funciona.',
  starters = array['¿Qué información del caso has recibido?']
where slug = 'prueba-tecnica';
