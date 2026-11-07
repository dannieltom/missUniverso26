-- Nombres oficiales de las candidatas de América y Caribe, con su título nacional.
-- Fuente: sitio oficial de Miss Universo 2026 (sección Américas, 23 perfiles).
-- Actualiza las filas por país. Los países que no estaban en la lista se agregan al final.
-- Es seguro ejecutarlo varias veces.

update candidatas set nombre = 'Daiana Stefani Pereyra', descripcion = 'Miss Universo Argentina 2026' where pais = 'Argentina';
update candidatas set nombre = 'Valeria Mena Ferreira', descripcion = 'Miss Universo Bolivia 2026' where pais = 'Bolivia';
update candidatas set nombre = 'Marcella Kozinski de Barros', descripcion = 'Miss Universo Brasil 2026' where pais = 'Brasil';
update candidatas set nombre = 'Dominga López', descripcion = 'Miss Universo Chile 2026' where pais = 'Chile';
update candidatas set nombre = 'María Alejandra López Pérez', descripcion = 'Miss Universe Colombia 2026' where pais = 'Colombia';
update candidatas set nombre = 'María Alejandra Acosta García', descripcion = 'Miss Universo Costa Rica 2026' where pais = 'Costa Rica';
update candidatas set nombre = 'Dalia Bucaram', descripcion = 'Miss Universo Ecuador 2026' where pais = 'Ecuador';
update candidatas set nombre = 'Sofía Córdova Moreno', descripcion = 'Miss Universo El Salvador 2026' where pais = 'El Salvador';
update candidatas set nombre = 'María Adelina Castillo Birba', descripcion = 'Miss Universe Guatemala 2026' where pais = 'Guatemala';
update candidatas set nombre = 'Luisa Paola Pineda Barahona', descripcion = 'Miss Honduras Universo 2026' where pais = 'Honduras';
update candidatas set nombre = 'María Vargas', descripcion = 'Miss Universe México 2026' where pais = 'México';
update candidatas set nombre = 'Jasmine Chola', descripcion = 'Miss Universe Nicaragua 2026' where pais = 'Nicaragua';
update candidatas set nombre = 'Gabriela Lineth González Del Valle', descripcion = 'Miss Universo Panamá 2026' where pais = 'Panamá';
update candidatas set nombre = 'Gretha Milagros Estigarribia Matiauda', descripcion = 'Miss Universo Paraguay 2026' where pais = 'Paraguay';
update candidatas set nombre = 'Luren Leticia Márquez Canales', descripcion = 'Miss Perú Universo 2026' where pais = 'Perú';
update candidatas set nombre = 'Maruschka Sahiboe', descripcion = 'Miss Universe Suriname 2026' where pais = 'Surinam';
update candidatas set nombre = 'Justus Anye Coleman Kelley', descripcion = 'Miss USA 2026' where pais = 'Estados Unidos';
update candidatas set nombre = 'Lucía Piñeyro Lima', descripcion = 'Miss Universo Uruguay 2026' where pais = 'Uruguay';
update candidatas set nombre = 'Clara Vegas Goetz', descripcion = 'Miss Universo Venezuela 2025' where pais = 'Venezuela';

-- Países que aparecen en el sitio y no estaban en la lista.
insert into candidatas (nombre, pais, region, descripcion)
select v.nombre, v.pais, v.region, v.descripcion
from (values
  ('Caleigh-Rose West', 'Belice', 'America', 'Miss Universe Belize 2026'),
  ('Aslhan Moralı', 'Canadá', 'America', 'Miss Universe Canada 2026'),
  ('Angel Bhathal', 'Guyana', 'America', 'Miss Universe Guyana 2026'),
  ('Orealia Thomas', 'Islas Vírgenes Británicas', 'Caribe', 'Miss Universe British Virgin Islands 2026')
) as v(nombre, pais, region, descripcion)
where not exists (select 1 from candidatas c where c.pais = v.pais);
