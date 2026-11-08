-- Salas con código: cualquiera con sesión crea una sala y comparte su código. Cada persona está en una sola sala.

-- Una sola sala por persona.
create unique index if not exists sala_miembro_una_sala on sala_miembro (user_id);

-- Crea una sala con código aleatorio (letras y números, sin caracteres confusos) y te agrega como miembro.
create or replace function crear_sala(p_nombre text)
returns table (id uuid, codigo text, nombre text)
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

  insert into sala_miembro (sala_id, user_id) values (nuevo_id, uid);
  return query select s.id, s.codigo, s.nombre from sala s where s.id = nuevo_id;
end
$$;

-- Entra a una sala con su código.
create or replace function unirse_sala(p_codigo text)
returns table (id uuid, codigo text, nombre text)
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

  select s.id into sid from sala s where s.codigo = upper(trim(p_codigo));
  if sid is null then
    raise exception 'Ese código no existe.';
  end if;

  insert into sala_miembro (sala_id, user_id) values (sid, uid);
  return query select s.id, s.codigo, s.nombre from sala s where s.id = sid;
end
$$;

-- Sale de la sala actual.
create or replace function salir_sala()
returns void
language sql
security definer
set search_path = public
as $$
  delete from sala_miembro where user_id = auth.uid();
$$;

-- La sala en la que estás (si estás en alguna).
create or replace function mi_sala()
returns table (id uuid, codigo text, nombre text)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.codigo, s.nombre
  from sala s
  join sala_miembro m on m.sala_id = s.id
  where m.user_id = auth.uid();
$$;

revoke execute on function crear_sala(text) from public, anon;
revoke execute on function unirse_sala(text) from public, anon;
revoke execute on function salir_sala() from public, anon;
revoke execute on function mi_sala() from public, anon;
grant execute on function crear_sala(text) to authenticated;
grant execute on function unirse_sala(text) to authenticated;
grant execute on function salir_sala() to authenticated;
grant execute on function mi_sala() to authenticated;
