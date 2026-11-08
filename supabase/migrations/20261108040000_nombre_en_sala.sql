-- Cada persona escribe su nombre al entrar a la sala. Ese es el nombre que ven los demás en el ranking.

alter table sala_miembro add column if not exists nombre text not null default 'Participante';

-- Las firmas cambian (ahora reciben el nombre), así que se borran y se vuelven a crear.
drop function if exists crear_sala(text);
drop function if exists unirse_sala(text);
drop function if exists mi_sala();

-- Crea la sala y te agrega como miembro con tu nombre.
create or replace function crear_sala(p_nombre text, p_tu_nombre text)
returns table (id uuid, codigo text, nombre text, mi_nombre text)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  nuevo_id uuid;
  nuevo_codigo text;
  intentos int := 0;
begin
  if uid is null then
    raise exception 'Inicia sesión para crear una sala.';
  end if;
  if exists (select 1 from sala_miembro m where m.user_id = uid) then
    raise exception 'Ya estás en una sala. Sal primero para crear otra.';
  end if;
  if p_nombre is null or length(trim(p_nombre)) = 0 then
    raise exception 'Escribe un nombre para la sala.';
  end if;
  if p_tu_nombre is null or length(trim(p_tu_nombre)) = 0 then
    raise exception 'Escribe tu nombre.';
  end if;

  loop
    intentos := intentos + 1;
    nuevo_codigo := (
      select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', floor(random() * 32)::int + 1, 1), '')
      from generate_series(1, 6)
    );
    begin
      insert into sala (nombre, codigo, creada_por)
      values (trim(p_nombre), nuevo_codigo, uid)
      returning sala.id into nuevo_id;
      exit;
    exception when unique_violation then
      if intentos > 10 then
        raise exception 'No se pudo crear la sala. Intenta de nuevo.';
      end if;
    end;
  end loop;

  insert into sala_miembro (sala_id, user_id, nombre) values (nuevo_id, uid, trim(p_tu_nombre));
  return query
    select s.id, s.codigo, s.nombre, m.nombre
    from sala s
    join sala_miembro m on m.sala_id = s.id and m.user_id = uid
    where s.id = nuevo_id;
end
$$;

-- Entra a una sala con su código y su nombre.
create or replace function unirse_sala(p_codigo text, p_tu_nombre text)
returns table (id uuid, codigo text, nombre text, mi_nombre text)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  sid uuid;
begin
  if uid is null then
    raise exception 'Inicia sesión para unirte a una sala.';
  end if;
  if exists (select 1 from sala_miembro m where m.user_id = uid) then
    raise exception 'Ya estás en una sala. Sal primero para unirte a otra.';
  end if;
  if p_tu_nombre is null or length(trim(p_tu_nombre)) = 0 then
    raise exception 'Escribe tu nombre.';
  end if;

  select s.id into sid from sala s where s.codigo = upper(trim(p_codigo));
  if sid is null then
    raise exception 'Ese código no existe.';
  end if;

  insert into sala_miembro (sala_id, user_id, nombre) values (sid, uid, trim(p_tu_nombre));
  return query
    select s.id, s.codigo, s.nombre, m.nombre
    from sala s
    join sala_miembro m on m.sala_id = s.id and m.user_id = uid
    where s.id = sid;
end
$$;

-- La sala en la que estás (si estás en alguna), con tu nombre.
create or replace function mi_sala()
returns table (id uuid, codigo text, nombre text, mi_nombre text)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.codigo, s.nombre, m.nombre
  from sala s
  join sala_miembro m on m.sala_id = s.id
  where m.user_id = auth.uid();
$$;

-- Nombres de quienes están en tu sala (para la lista de integrantes).
create or replace function integrantes_sala()
returns table (nombre text)
language sql
stable
security definer
set search_path = public
as $$
  select m.nombre
  from sala_miembro m
  where m.sala_id = (select mi.sala_id from sala_miembro mi where mi.user_id = auth.uid())
  order by m.nombre;
$$;

-- Ranking de una sala: usa el nombre que escribió cada persona al entrar.
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
set search_path = public
as $$
  select * from (
    with miembros as (
      select m.user_id, m.nombre
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
      m.nombre,
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
    left join aciertos ai on ai.user_id = m.user_id and ai.etapa = 'inicial'
    left join aciertos a10 on a10.user_id = m.user_id and a10.etapa = 'top10'
    left join aciertos a5 on a5.user_id = m.user_id and a5.etapa = 'top5'
    left join aciertos_final af on af.user_id = m.user_id
  ) s
  order by s.total desc, s.nombre
$$;

revoke execute on function crear_sala(text, text) from public, anon;
revoke execute on function unirse_sala(text, text) from public, anon;
revoke execute on function mi_sala() from public, anon;
revoke execute on function integrantes_sala() from public, anon;
grant execute on function crear_sala(text, text) to authenticated;
grant execute on function unirse_sala(text, text) to authenticated;
grant execute on function mi_sala() to authenticated;
grant execute on function integrantes_sala() to authenticated;
