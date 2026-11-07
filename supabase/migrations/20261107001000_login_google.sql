-- Inicio de sesión con Google: el perfil de jugador queda ligado a la cuenta de Supabase Auth.
-- Se elimina el código de recuperación, porque Google maneja el acceso.

alter table jugadores drop column if exists codigo_recuperacion;
alter table jugadores alter column id drop default;
alter table jugadores
  add constraint jugadores_id_fkey foreign key (id) references auth.users(id) on delete cascade;
