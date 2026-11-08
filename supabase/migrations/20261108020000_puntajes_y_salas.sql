-- Puntajes por sala. Cada persona guarda sus picks; el ranking de la sala se calcula en la base de datos.

-- La ronda final también se guarda como oficial (orden 1 a 5) en top_etapa_oficial.
alter table top_etapa_oficial drop constraint if exists top_etapa_oficial_etapa_check;
alter table top_etapa_oficial add constraint top_etapa_oficial_etapa_check
  check (etapa in ('inicial', 'top10', 'top5', 'final'));

-- Lo que elige cada persona en cada etapa. Solo la propia persona puede leerlo y cambiarlo.
create table if not exists participacion (
  user_id uuid not null references auth.users(id) on delete cascade,
  anio int not null,
  etapa text not null check (etapa in ('inicial', 'top10', 'top5', 'final')),
  candidata_id uuid not null references candidatas(id) on delete cascade,
  orden int check (orden between 1 and 5),
  primary key (user_id, anio, etapa, candidata_id)
);

alter table participacion enable row level security;

drop policy if exists "participacion_lee_propia" on participacion;
create policy "participacion_lee_propia" on participacion for select using (auth.uid() = user_id);

drop policy if exists "participacion_inserta_propia" on participacion;
create policy "participacion_inserta_propia" on participacion for insert with check (auth.uid() = user_id);

drop policy if exists "participacion_borra_propia" on participacion;
create policy "participacion_borra_propia" on participacion for delete using (auth.uid() = user_id);

-- Salas: un grupo de amigos que compara puntajes.
create table if not exists sala (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  codigo text not null unique,
  creada_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists sala_miembro (
  sala_id uuid not null references sala(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (sala_id, user_id)
);

alter table sala enable row level security;
alter table sala_miembro enable row level security;

drop policy if exists "sala_lectura_autenticados" on sala;
create policy "sala_lectura_autenticados" on sala for select using (auth.role() = 'authenticated');

drop policy if exists "sala_miembro_lee_propia" on sala_miembro;
create policy "sala_miembro_lee_propia" on sala_miembro for select using (auth.uid() = user_id);

drop policy if exists "sala_miembro_inserta_propia" on sala_miembro;
create policy "sala_miembro_inserta_propia" on sala_miembro for insert with check (auth.uid() = user_id);

drop policy if exists "sala_miembro_borra_propia" on sala_miembro;
create policy "sala_miembro_borra_propia" on sala_miembro for delete using (auth.uid() = user_id);

-- Ranking de una sala. Solo lo puede pedir alguien que esté en la sala.
-- Puntos: inicial 10, top 10 15, top 5 20 por acierto. Ronda final: 1.º (Miss Universo) 50, 2.º 35, 3.º 30, 4.º 28, 5.º 25.
create or replace function puntajes_sala(p_sala uuid)
returns table (
  user_id uuid,
  nombre text,
  aciertos_inicial int,
  puntos_inicial int,
  aciertos_top10 int,
  puntos_top10 int,
  aciertos_top5 int,
  puntos_top5 int,
  aciertos_final int,
  puntos_final int,
  total int
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select * from (
    with miembros as (
      select m.user_id
      from sala_miembro m
      where m.sala_id = p_sala
        and exists (
          select 1 from sala_miembro x
          where x.sala_id = p_sala and x.user_id = auth.uid()
        )
    ),
    aciertos as (
      select p.user_id, p.etapa, count(*)::int as n
      from participacion p
      join top_etapa_oficial o
        on o.anio = p.anio and o.etapa = p.etapa and o.candidata_id = p.candidata_id
      where p.etapa in ('inicial', 'top10', 'top5')
        and p.user_id in (select mi.user_id from miembros mi)
      group by p.user_id, p.etapa
    ),
    aciertos_final as (
      select p.user_id,
        count(*)::int as n,
        sum(case p.orden when 1 then 50 when 2 then 35 when 3 then 30 when 4 then 28 when 5 then 25 else 0 end)::int as pts
      from participacion p
      join top_etapa_oficial o
        on o.anio = p.anio and o.etapa = 'final' and o.orden = p.orden and o.candidata_id = p.candidata_id
      where p.etapa = 'final'
        and p.user_id in (select mi.user_id from miembros mi)
      group by p.user_id
    )
    select
      m.user_id,
      coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Participante') as nombre,
      coalesce(ai.n, 0) as aciertos_inicial,
      coalesce(ai.n, 0) * 10 as puntos_inicial,
      coalesce(a10.n, 0) as aciertos_top10,
      coalesce(a10.n, 0) * 15 as puntos_top10,
      coalesce(a5.n, 0) as aciertos_top5,
      coalesce(a5.n, 0) * 20 as puntos_top5,
      coalesce(af.n, 0) as aciertos_final,
      coalesce(af.pts, 0) as puntos_final,
      coalesce(ai.n, 0) * 10 + coalesce(a10.n, 0) * 15 + coalesce(a5.n, 0) * 20 + coalesce(af.pts, 0) as total
    from miembros m
    join auth.users u on u.id = m.user_id
    left join aciertos ai on ai.user_id = m.user_id and ai.etapa = 'inicial'
    left join aciertos a10 on a10.user_id = m.user_id and a10.etapa = 'top10'
    left join aciertos a5 on a5.user_id = m.user_id and a5.etapa = 'top5'
    left join aciertos_final af on af.user_id = m.user_id
  ) s
  order by s.total desc, s.nombre
$$;

revoke execute on function puntajes_sala(uuid) from public, anon;
grant execute on function puntajes_sala(uuid) to authenticated;
