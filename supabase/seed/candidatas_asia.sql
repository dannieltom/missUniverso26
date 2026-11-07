-- Nombres oficiales de las candidatas de Asia, con su título nacional.
-- Fuente: sitio oficial de Miss Universo 2026 (sección Asia, 20 perfiles).
-- Maldivas no aparece en el sitio: queda con nombre provisional hasta confirmar.
-- Es seguro ejecutarlo varias veces.

update candidatas set nombre = 'Shiqi Wang', descripcion = 'Miss Universe China 2026' where pais = 'China';
update candidatas set nombre = 'Bea Millan-Windorski', descripcion = 'Miss Universe Philippines 2026' where pais = 'Filipinas';
update candidatas set nombre = 'Kaziah Liz Mejo', descripcion = 'Miss Universe India 2026' where pais = 'India';
update candidatas set nombre = 'Sayuki Ito', descripcion = 'Miss Universe Japan 2026' where pais = 'Japón';
update candidatas set nombre = 'Destiny Anbar', descripcion = 'Miss Universe Jordan 2026' where pais = 'Jordania';
update candidatas set nombre = 'Alina Ekaterinecheva', descripcion = 'Miss Universe Kazakhstan 2026' where pais = 'Kazajistán';
update candidatas set nombre = 'Medina Ermekova', descripcion = 'Miss Universe Kyrgyzstan 2026' where pais = 'Kirguistán';
update candidatas set nombre = 'Enkhdelgerekh Enkhbold', descripcion = 'Miss Universe Mongolia 2026' where pais = 'Mongolia';
update candidatas set nombre = 'May Grace Parry', descripcion = 'Miss Universe Myanmar 2026' where pais = 'Myanmar (Birmania)';
update candidatas set nombre = 'Nimhara Sasindi', descripcion = 'Miss Universe Sri Lanka 2026' where pais = 'Sri Lanka';

-- Países de Asia que aparecen en el sitio y no estaban en la lista.
insert into candidatas (nombre, pais, region, descripcion)
select v.nombre, v.pais, 'Asia', v.descripcion
from (values
  ('Than Rthna', 'Camboya', 'Miss Universe Cambodia 2026'),
  ('Jennifer Kraft Zhou', 'Hong Kong', 'Miss Universe Hong Kong 2026'),
  ('Samantha Slewa', 'Irak', 'Miss Universe Iraq 2026'),
  ('Danielle Sophie Yablonka', 'Israel', 'Miss Universe Israel 2026'),
  ('Yurim Kim', 'Corea del Sur', null),
  ('Perla Harb', 'Líbano', 'Miss Universe Lebanon 2026'),
  ('Hou Xuhe', 'Macao', 'Miss Universe Macau 2026'),
  ('Prayashna Gurung', 'Nepal', 'Miss Universe Nepal 2026'),
  ('Misbah Arshad', 'Pakistán', 'Miss Universe Pakistan 2026'),
  ('Alara Eric', 'Turquía', 'Miss Universe Türkiye 2026')
) as v(nombre, pais, descripcion)
where not exists (select 1 from candidatas c where c.pais = v.pais);
