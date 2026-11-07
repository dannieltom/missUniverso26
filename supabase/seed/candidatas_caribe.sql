-- Nombres oficiales de las candidatas del Caribe, con su título nacional.
-- Fuente: sitio oficial de Miss Universo 2026 (sección Caribe, 16 perfiles).
-- Es seguro ejecutarlo varias veces.

update candidatas set nombre = 'Elizabeth Johnson', descripcion = 'Miss Universe Aruba 2026' where pais = 'Aruba';
update candidatas set nombre = 'Shawndra Henfield', descripcion = 'Miss Universe Bahamas 2026' where pais = 'Bahamas';
update candidatas set nombre = 'Mia Angelina Donadio Cancio', descripcion = 'Miss Universe Cuba 2026' where pais = 'Cuba';
update candidatas set nombre = 'Juliana May Myers', descripcion = 'Miss Universe Cayman Islands 2026' where pais = 'Islas Caimán';
update candidatas set nombre = 'Melissa Núñez', descripcion = 'Miss República Dominicana Universo 2026' where pais = 'República Dominicana';
update candidatas set nombre = 'Chloé Mathilde Marie Deher', descripcion = 'Miss Universe Guadeloupe 2026' where pais = 'Guadalupe';
update candidatas set nombre = 'Celene Hall', descripcion = 'Miss Universe Jamaica 2026' where pais = 'Jamaica';
update candidatas set nombre = 'Jennifer Barreto', descripcion = 'Miss Universe Puerto Rico 2026' where pais = 'Puerto Rico';
update candidatas set nombre = 'Jenna-Monét Queeley', descripcion = 'Miss Universe U.S. Virgin Islands 2026' where pais = 'Islas Vírgenes de los EE. UU.';

-- Islas Vírgenes Británicas: el sitio la muestra en la sección de América.
update candidatas set region = 'America', descripcion = 'Miss Universe British Virgin Islands 2026' where pais = 'Islas Vírgenes Británicas';

-- Países del Caribe que aparecen en el sitio y no estaban en la lista.
insert into candidatas (nombre, pais, region, descripcion)
select v.nombre, v.pais, 'Caribe', v.descripcion
from (values
  ('Caroline Porras', 'Bonaire', 'Miss Universe Bonaire 2026'),
  ('Blanty Rojer Comperts', 'Curazao', 'Miss Universe Curaçao 2026'),
  ('Tatenda Josephina Rameau', 'Haití', 'Miss Universe Haiti 2026'),
  ('Larissa Ségarel', 'Martinica', 'Miss Universe Martinique 2026'),
  ('Bernella Velinor', 'Santa Lucía', 'Miss Universe Saint Lucia 2026'),
  ('Vinita Manoo', 'Trinidad y Tobago', 'Miss Universe Trinidad and Tobago 2026'),
  ('Selena Grant', 'Islas Turcas y Caicos', 'Miss Universe Turks and Caicos 2026')
) as v(nombre, pais, descripcion)
where not exists (select 1 from candidatas c where c.pais = v.pais);
