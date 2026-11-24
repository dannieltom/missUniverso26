-- Nueva etapa "top3" entre el top 5 y la final. La final ordena solo a 3 (ganadora, 1.ª y 2.ª finalista).

alter table top_etapa drop constraint if exists top_etapa_etapa_check;
alter table top_etapa add constraint top_etapa_etapa_check
  check (etapa in ('inicial', 'top10', 'top5', 'top3'));

alter table top_etapa_oficial drop constraint if exists top_etapa_oficial_etapa_check;
alter table top_etapa_oficial add constraint top_etapa_oficial_etapa_check
  check (etapa in ('inicial', 'top10', 'top5', 'top3', 'final'));

alter table participacion drop constraint if exists participacion_etapa_check;
alter table participacion add constraint participacion_etapa_check
  check (etapa in ('inicial', 'top10', 'top5', 'top3', 'final'));

-- Las finales anteriores (de 5 lugares) ya no aplican: se borran para volver a ordenar.
delete from top_etapa_oficial where etapa = 'final';
delete from participacion where etapa = 'final';

drop function if exists puntajes_sala(uuid);

create function puntajes_sala(p_sala uuid)
returns table (
  user_id uuid,
  nombre text,
  aciertos_inicial int,
  puntos_inicial int,
  aciertos_top10 int,
  puntos_top10 int,
  aciertos_top5 int,
  puntos_top5 int,
  aciertos_top3 int,
  puntos_top3 int,
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
      where p.etapa in ('inicial', 'top10', 'top5', 'top3')
        and p.user_id in (select mi.user_id from miembros mi)
      group by p.user_id, p.etapa
    ),
    aciertos_final as (
      select p.user_id,
        count(*)::int as n,
        sum(case p.orden when 1 then 70 when 2 then 50 when 3 then 40 else 0 end)::int as pts
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
      coalesce(a10.n, 0) * 20 as puntos_top10,
      coalesce(a5.n, 0) as aciertos_top5,
      coalesce(a5.n, 0) * 25 as puntos_top5,
      coalesce(a3.n, 0) as aciertos_top3,
      coalesce(a3.n, 0) * 30 as puntos_top3,
      coalesce(af.n, 0) as aciertos_final,
      coalesce(af.pts, 0) as puntos_final,
      coalesce(ai.n, 0) * 10 + coalesce(a10.n, 0) * 20 + coalesce(a5.n, 0) * 25
        + coalesce(a3.n, 0) * 30 + coalesce(af.pts, 0) as total
    from miembros m
    left join aciertos ai on ai.user_id = m.user_id and ai.etapa = 'inicial'
    left join aciertos a10 on a10.user_id = m.user_id and a10.etapa = 'top10'
    left join aciertos a5 on a5.user_id = m.user_id and a5.etapa = 'top5'
    left join aciertos a3 on a3.user_id = m.user_id and a3.etapa = 'top3'
    left join aciertos_final af on af.user_id = m.user_id
  ) s
  order by s.total desc, s.nombre
$$;

revoke all on function puntajes_sala(uuid) from public, anon;
grant execute on function puntajes_sala(uuid) to authenticated;
