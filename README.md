# Asistentes (nombre provisional)

Espacio de trabajo para psicólogos, caso a caso. Plataforma SaaS de Darle Otra Vuelta.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (PostgreSQL + Auth, región UE: eu-west-1, Irlanda) · Anthropic API · Stripe · Vercel (región dub1, junto a Supabase en Irlanda).

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run dev
```

## Estructura

```
src/
  app/            rutas y páginas
  modules/        un módulo por dominio (cases, memory, sessions, conversations, assistants, billing, usage)
  lib/            adaptadores de servicios externos (supabase, ai, stripe), i18n, privacidad, planes
  components/ui/  componentes base
supabase/
  migrations/     cambios de esquema versionados
```

Las carpetas se crean a medida que cada fase las necesita.

## Fases

0. Setup ✔
1. Autenticación y perfiles
2. Casos con RLS, dashboard y búsqueda
3. Memoria y sesiones
4. Asistentes, conversaciones, chat con Claude y registro de uso
5. Límites por plan y rate limiting
6. Stripe
7. Endurecimiento: exportar, borrar, logs, errores, avisos de privacidad
