# Miss Universo 2026: calificación en vivo

Aplicación web de calificación en vivo con gamificación para seguir el Miss Universo 2026 (Puerto Rico). Cada persona califica a las candidatas mientras ve la transmisión, arma sus tops y ordena a las finalistas. El administrador publica los resultados oficiales en vivo y el sistema compara cada pronóstico, suma puntos y muestra un ranking por salas.

## Funciones

- **Ronda preliminar:** calificación de baño y gala de 1.0 a 10.0.
- **Top inicial, top 10 y top 5:** cada persona arma su top y se compara con el top oficial, con ✓ o ✗ en vivo.
- **Ronda final:** ordena a las cinco finalistas y recibe puntos según el lugar acertado, con ✓ o ✗ por lugar cuando se publica el orden oficial.
- **Salas con código:** se crea una sala o se entra con un código de letras y números, y el ranking muestra puntos por etapa.
- **Jugar solo:** la misma dinámica sin ranking.
- **Administración:** solo la cuenta del administrador publica los tops oficiales y el orden final, y todos los usuarios lo ven en vivo.

## Estado

- Especificación: `docs/especificacion.md`.
- Esquema y migraciones de Supabase: `supabase/migrations/`.

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
- Supabase (PostgreSQL, autenticación con Google y Realtime).
- Netlify para el alojamiento en la nube y la publicación automática desde `main`.

## Temas

nextjs · react · typescript · tailwindcss · supabase · postgresql · netlify · cloud-computing · gamificacion · tiempo-real · autenticacion · oauth · responsive-design · miss-universo

## Pendientes

Ver la sección 15 de `docs/especificacion.md`.
