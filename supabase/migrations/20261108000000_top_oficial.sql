-- Top oficial compartido. El administrador marca las candidatas en orden y todos los que usan la app lo ven en vivo.
-- corte = tamaño del top (12, 20, 5...). Así no hace falta saber de antemano cuántas candidatas son.

create table if not exists top_oficial (
  anio int not null,
  corte int not null check (corte >= 1),
  orden int not null check (orden >= 1),
  candidata_id uuid not null references candidatas(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (anio, corte, candidata_id),
  unique (anio, corte, orden)
);

alter table top_oficial enable row level security;

drop policy if exists "top_oficial_lectura_publica" on top_oficial;
create policy "top_oficial_lectura_publica" on top_oficial for select using (true);

-- Realtime: avisa a los navegadores cuando cambia el top. Si ya estaba agregada, no pasa nada.
do $$
begin
  alter publication supabase_realtime add table top_oficial;
exception
  when duplicate_object then null;
end $$;
