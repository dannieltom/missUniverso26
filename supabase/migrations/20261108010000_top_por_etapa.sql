-- Tops por etapa: top inicial (20, 25...), top 10 y top 5. Cada etapa tiene su tamaño y sus candidatas oficiales.
-- Las tablas anteriores (top_oficial, top_oficial_config) no se borran; la app ya no las usa.

create table if not exists top_etapa (
  anio int not null,
  etapa text not null check (etapa in ('inicial', 'top10', 'top5')),
  tamano int not null check (tamano >= 1),
  primary key (anio, etapa)
);

create table if not exists top_etapa_oficial (
  anio int not null,
  etapa text not null check (etapa in ('inicial', 'top10', 'top5')),
  orden int not null check (orden >= 1),
  candidata_id uuid not null references candidatas(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (anio, etapa, candidata_id),
  unique (anio, etapa, orden)
);

alter table top_etapa enable row level security;
alter table top_etapa_oficial enable row level security;

drop policy if exists "top_etapa_lectura_publica" on top_etapa;
create policy "top_etapa_lectura_publica" on top_etapa for select using (true);

drop policy if exists "top_etapa_oficial_lectura_publica" on top_etapa_oficial;
create policy "top_etapa_oficial_lectura_publica" on top_etapa_oficial for select using (true);

-- Realtime: avisa a los navegadores cuando cambian los tamaños o los oficiales.
do $$
begin
  alter publication supabase_realtime add table top_etapa;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table top_etapa_oficial;
exception
  when duplicate_object then null;
end $$;
