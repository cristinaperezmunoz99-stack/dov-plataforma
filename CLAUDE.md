@AGENTS.md

# Reglas del proyecto

Plataforma SaaS para psicólogos: casos clínicos + asistentes de IA. Datos de salud: la seguridad es prioritaria.

- Antes de usar una API de Next.js, Supabase, Anthropic o Stripe, consulta la documentación de la versión instalada. No asumas APIs de memoria.
- Todo acceso a datos pasa por RLS. El servidor usa el cliente con la identidad del usuario. La clave secreta de Supabase solo en el webhook de Stripe y en operaciones administrativas.
- Las claves secretas nunca llegan al navegador ni se escriben en el código.
- Validación de entradas en servidor con zod.
- Los system_prompt de los asistentes nunca son legibles desde el cliente.
- Logs sin contenido clínico. Errores sin información sensible.
- Estilos solo con los tokens de `src/app/globals.css` (bg-surface, text-ink, rounded-md...). Nada de colores o medidas sueltos.
- Textos de interfaz en `src/lib/i18n/es.ts`. Español neutro, tratamiento de "tú". Nunca lenguaje de diagnóstico ni de decisión de tratamiento.
- No inventes asistentes ni escribas prompts clínicos.
- Cambios de esquema siempre como migración en `supabase/migrations/`.
- Una fase cada vez; cada fase se verifica antes de continuar.
