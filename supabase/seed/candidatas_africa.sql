-- Nombres oficiales de las candidatas de África, con su título nacional.
-- Fuente: sitio oficial de Miss Universo 2026 (sección África, 24 perfiles).
-- Es seguro ejecutarlo varias veces.

update candidatas set nombre = 'Wanderléia Bango Nicolau Rodrigues', descripcion = 'Miss Angola Universo 2025/2026' where pais = 'Angola';
update candidatas set nombre = 'Dabilo Moses', descripcion = 'Miss Universe Botswana 2026' where pais = 'Botswana';
update candidatas set nombre = 'Audrey Moutongo Black', descripcion = 'Miss Cameroon 2025' where pais = 'Camerún';
update candidatas set nombre = 'Armandina Cunha', descripcion = 'Miss Universe Cabo Verde 2026' where pais = 'Cabo Verde';
update candidatas set nombre = 'Sonia Gergis', descripcion = 'Miss Universe Egypt 2026' where pais = 'Egipto';
update candidatas set nombre = 'Bruktawit Belete Woldeyes', descripcion = 'Miss Universe Ethiopia 2026' where pais = 'Etiopía';
update candidatas set nombre = 'Justine Kamara', descripcion = 'Miss Universe Guinea 2026' where pais = 'Guinea';
update candidatas set nombre = 'Teresa Isabel Mbomio Ada', descripcion = 'Miss Universe Guinea Ecuatorial 2026' where pais = 'Guinea Ecuatorial';
update candidatas set nombre = 'Jean Ojiro', descripcion = 'Miss Universe Kenya 2026' where pais = 'Kenia';
update candidatas set nombre = 'Maëva Toumbou Dani', descripcion = 'Miss Universe Mayotte 2026' where pais = 'Mayotte';
update candidatas set nombre = 'Zoulahatou Amadou', descripcion = 'Miss Universe Niger 2026' where pais = 'Níger';
update candidatas set nombre = 'Abigaëlle Tailamée', descripcion = 'Miss Universe Reunion 2026' where pais = 'Reunión';
update candidatas set nombre = 'Katti Fofanah', descripcion = 'Miss Universe Sierra Leone 2026' where pais = 'Sierra Leona';
update candidatas set nombre = 'Sarrah Brahmi', descripcion = 'Miss Universe Tunisia 2026' where pais = 'Túnez';
update candidatas set nombre = 'Mubanga Pamela Hatyoka', descripcion = 'Miss Universe Zambia 2026' where pais = 'Zambia';
update candidatas set nombre = 'Roseanna Hall', descripcion = 'Miss Universe Zimbabwe 2026' where pais = 'Zimbabue';

-- Países de África que aparecen en el sitio y no estaban en la lista.
insert into candidatas (nombre, pais, region, descripcion)
select v.nombre, v.pais, 'Africa', v.descripcion
from (values
  ('Belvy Naa Teide Ofori', 'Ghana', 'Miss Universe Ghana 2026'),
  ('Jessi Longwe Kalambayi', 'República Democrática del Congo', 'Miss Universe RD Congo 2026'),
  ('Georgina Kambongo', 'República del Congo', 'Miss Universe République du Congo 2026'),
  ('Charene Elizabeth Labuschagne', 'Namibia', 'Miss Namibia 2026'),
  ('Bajabulise Thela', 'Sudáfrica', 'Miss Universe South Africa 2026'),
  ('Adut Deng', 'Sudán del Sur', 'Miss Universe South Sudan 2026'),
  ('Queen Elizabeth William Makune', 'Tanzania', 'Miss Universe Tanzania 2026'),
  ('Mitchelle Daka', 'Uganda', 'Miss Universe Uganda 2026')
) as v(nombre, pais, descripcion)
where not exists (select 1 from candidatas c where c.pais = v.pais);
