-- Top oficial compartido. El administrador fija el tamaño del top y marca las candidatas en orden; todos lo ven en vivo.

-- Tamaño del top oficial por año (lo fija el administrador).
create table if not exists top_oficial_config (
  anio int primary key,
  corte int not null check (corte >= 1)
);

-- Candidatas oficiales del top, en orden.
create table if not exists top_oficial (
  anio int not null,
  corte int not null check (corte >= 1),
  orden int not null check (orden >= 1),
  candidata_id uuid not null references candidatas(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (anio, corte, candidata_id),
  unique (anio, corte, orden)
);

alter table top_oficial_config enable row level security;
alter table top_oficial enable row level security;

drop policy if exists "top_oficial_config_lectura_publica" on top_oficial_config;
create policy "top_oficial_config_lectura_publica" on top_oficial_config for select using (true);

drop policy if exists "top_oficial_lectura_publica" on top_oficial;
create policy "top_oficial_lectura_publica" on top_oficial for select using (true);

-- Realtime: avisa a los navegadores cuando cambian el tamaño o el top. Si ya estaban agregadas, no pasa nada.
do $$
begin
  alter publication supabase_realtime add table top_oficial;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table top_oficial_config;
exception
  when duplicate_object then null;
end $$;
