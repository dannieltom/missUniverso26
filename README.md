# Miss Universo 2026: calificación en vivo

Aplicación web para seguir el Miss Universo 2026 (Puerto Rico) en vivo. Cada persona califica a las candidatas en cada ronda mientras ve la transmisión, el sistema calcula los rankings y los compara con los resultados oficiales.

## Estado

Fase inicial. Están definidos la especificación (`docs/especificacion.md`) y el esquema de datos (`supabase/schema.sql`). El frontend aún no está creado.

## Stack propuesto

- Frontend: Next.js, React, TypeScript, Tailwind CSS (PWA responsive).
- Datos y tiempo real: Supabase (PostgreSQL + Realtime).
- Hosting: Vercel (frontend) y Supabase (datos).

## Estructura

```
docs/            Especificación funcional
supabase/migrations/  Migración inicial (esquema y datos de rondas)
```

## Pendientes antes de programar la calificación

Ver la sección 15 de `docs/especificacion.md`. Las decisiones ya confirmadas están en la sección 14.
