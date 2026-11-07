# Miss Universo 2026: calificación en vivo

Aplicación web para seguir el Miss Universo 2026 (Puerto Rico) en vivo. Cada persona califica a las candidatas en cada ronda mientras ve la transmisión, el sistema calcula los rankings y los compara con los resultados oficiales.

## Estado

- Especificación: `docs/especificacion.md`.
- Esquema y datos iniciales de rondas: `supabase/migrations/`.
- App: ronda R1 (desfile de traje típico) con calificación de 1.0 a 10.0 y ranking. Los puntajes se guardan en el navegador por ahora; el guardado en Supabase llega después.

## Cómo correrla en tu computador

1. Instala Node.js 20 o superior.
2. Copia `.env.example` a `.env.local` y completa la URL del proyecto y la clave pública de Supabase.
3. Instala dependencias y arranca:

```
npm install
npm run dev
```

Luego abre http://localhost:3000.

## Stack

- Next.js (App Router), React, TypeScript, Tailwind CSS.
- Supabase (PostgreSQL + Realtime).

## Pendientes

Ver la sección 15 de `docs/especificacion.md`.
