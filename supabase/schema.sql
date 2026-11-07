-- Miss Universo 2026: esquema inicial (PostgreSQL / Supabase)
-- Borrador alineado con docs/especificacion.md (sección 14). Las cantidades de cortes son editables.
-- Pendiente: políticas de Row Level Security (RLS) antes de publicar.

create extension if not exists pgcrypto;

-- Candidatas oficiales
create table candidatas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  pais text not null,
  foto_url text,
  descripcion text
);

-- Rondas del certamen
create table rondas (
  id int primary key,
  orden int not null unique,
  nombre text not null,
  -- puntuacion: se califica a cada candidata
  -- ranking_con_corte: se califica y además define quién avanza
  -- final: pick de la ganadora
  tipo text not null check (tipo in ('puntuacion', 'ranking_con_corte', 'final')),
  -- Cantidad de candidatas del corte (semifinalistas, Top 5). Editable por el administrador.
  cantidad int check (cantidad is null or cantidad >= 1)
);

-- Subsecciones de cada ronda (ej. Traje de baño, Traje de gala)
create table subsecciones (
  id int primary key,
  ronda_id int not null references rondas(id) on delete cascade,
  nombre text not null
);

-- Criterios de calificación por subsección (ej. Pasarela, Vestido)
create table criterios (
  id int primary key,
  subseccion_id int not null references subsecciones(id) on delete cascade,
  nombre text not null,
  activo boolean not null default true
);

-- Jugadores: identidad anónima sin login
create table jugadores (
  id uuid primary key default gen_random_uuid(),
  apodo text not null,
  codigo_recuperacion text not null unique,
  created_at timestamptz not null default now()
);

-- Salas (partidas)
create table salas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  anfitrion_id uuid references jugadores(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Rondas activas en cada sala
create table sala_rondas (
  sala_id uuid not null references salas(id) on delete cascade,
  ronda_id int not null references rondas(id),
  primary key (sala_id, ronda_id)
);

-- Miembros de cada sala
create table sala_miembros (
  sala_id uuid not null references salas(id) on delete cascade,
  jugador_id uuid not null references jugadores(id) on delete cascade,
  primary key (sala_id, jugador_id)
);

-- Calificaciones. sala_id es nulo en modo individual.
create table calificaciones (
  id uuid primary key default gen_random_uuid(),
  jugador_id uuid not null references jugadores(id) on delete cascade,
  sala_id uuid references salas(id) on delete cascade,
  candidata_id uuid not null references candidatas(id),
  ronda_id int not null references rondas(id),
  criterio_id int not null references criterios(id),
  valor numeric(3,1) not null check (valor >= 1.0 and valor <= 10.0),
  updated_at timestamptz not null default now()
);

-- Una calificación por jugador, candidata y criterio dentro de cada contexto (individual o sala)
create unique index calificaciones_unica
  on calificaciones (jugador_id, coalesce(sala_id, '00000000-0000-0000-0000-000000000000'::uuid), candidata_id, criterio_id);

-- Picks (top propio) de cada jugador. sala_id es nulo en modo individual.
create table picks (
  id uuid primary key default gen_random_uuid(),
  jugador_id uuid not null references jugadores(id) on delete cascade,
  sala_id uuid references salas(id) on delete cascade,
  ronda_id int not null references rondas(id),
  candidata_id uuid not null references candidatas(id),
  posicion int not null check (posicion >= 1),
  bloqueado boolean not null default false
);

-- Grupos oficiales por ronda (semifinalistas, Top 5, ganadora). Los carga el administrador.
create table grupos_oficiales (
  ronda_id int not null references rondas(id),
  candidata_id uuid not null references candidatas(id),
  posicion int not null check (posicion >= 1),
  primary key (ronda_id, candidata_id),
  unique (ronda_id, posicion)
);

-- Datos iniciales de rondas. La cantidad de semifinalistas y del Top 5 queda nula hasta que el administrador la defina.
insert into rondas (id, orden, nombre, tipo, cantidad) values
  (1, 1, 'Desfile de traje típico', 'puntuacion', null),
  (2, 2, 'Competencia preliminar', 'ranking_con_corte', null),
  (3, 3, 'Noche final: semifinalistas', 'puntuacion', null),
  (4, 4, 'Noche final: Top 5', 'ranking_con_corte', 5),
  (5, 5, 'Ganadora', 'final', 1);

-- La entrevista con el jurado no se califica en la app.
insert into subsecciones (id, ronda_id, nombre) values
  (1, 1, 'Desfile de traje típico'),
  (2, 2, 'Traje de baño'),
  (3, 2, 'Traje de gala'),
  (4, 3, 'Traje de baño'),
  (5, 3, 'Vestido de noche'),
  (6, 4, 'Preguntas'),
  (7, 4, 'Oratoria');

-- Promedio simple de criterios por subsección (sin pesos).
insert into criterios (id, subseccion_id, nombre) values
  (1, 1, 'Puntaje general'),
  (2, 2, 'Pasarela'),
  (3, 2, 'Puntaje general'),
  (4, 3, 'Pasarela'),
  (5, 3, 'Vestido'),
  (6, 4, 'Puntaje general'),
  (7, 5, 'Puntaje general'),
  (8, 6, 'Respuesta'),
  (9, 7, 'Oratoria');
