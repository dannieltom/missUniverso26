-- Nombres oficiales de las candidatas de Europa, con su título nacional.
-- Fuente: sitio oficial de Miss Universo 2026 (sección Europa, 38 perfiles).
-- Armenia se muestra en Europa en el sitio, así que pasa a esta región.
-- Es seguro ejecutarlo varias veces.

update candidatas set nombre = 'Jogersa Beqiri', descripcion = 'Miss Universe Albania 2026' where pais = 'Albania';
update candidatas set nombre = 'Celina Weil', descripcion = 'Miss Universe Germany 2026' where pais = 'Alemania';
update candidatas set nombre = 'Victoria Amerson', descripcion = 'Miss Universe Austria 2026' where pais = 'Austria';
update candidatas set nombre = 'Aliya Korotkaya', descripcion = 'Miss Universe Belarus 2026' where pais = 'Bielorrusia';
update candidatas set nombre = 'Olga Mariana Lombardo', descripcion = 'Miss Belgium 2026' where pais = 'Bélgica';
update candidatas set nombre = 'Antea Mršić', descripcion = 'Miss Universe Croatia 2026' where pais = 'Croacia';
update candidatas set nombre = 'Dominika Viktorie Kotoučková', descripcion = 'Miss Universe Czech Republic 2026' where pais = 'República Checa';
update candidatas set nombre = 'Fie Rose Lindegaard', descripcion = 'Miss Universe Denmark 2026' where pais = 'Dinamarca';
update candidatas set nombre = 'Susana Lucía Medina', descripcion = 'Miss Universe Spain 2026' where pais = 'España';
update candidatas set nombre = 'Emili Denneng', descripcion = 'Miss Universe Estonia 2025' where pais = 'Estonia';
update candidatas set nombre = 'Garance Authié', descripcion = 'Miss Universe France 2026' where pais = 'Francia';
update candidatas set nombre = 'Kiss Kamilla', descripcion = 'Miss Universe Hungary 2026' where pais = 'Hungría';
update candidatas set nombre = 'Aideen Howard', descripcion = 'Miss Universe Ireland 2026' where pais = 'Irlanda';
update candidatas set nombre = 'Sigga Özk', descripcion = 'Miss Universe Iceland 2026' where pais = 'Islandia';
update candidatas set nombre = 'Giada Folcia', descripcion = 'Miss Universe Italy 2026' where pais = 'Italia';
update candidatas set nombre = 'Evisa Pacolli', descripcion = 'Miss Universe Kosovo 2026' where pais = 'Kosovo';
update candidatas set nombre = 'Olga Bykadorova', descripcion = 'Miss Universe Lithuania 2026' where pais = 'Lituania';
update candidatas set nombre = 'Francesca Mercieca', descripcion = 'Miss Universe Malta 2026' where pais = 'Malta';
update candidatas set nombre = 'Maria Aleksandra Ivezaj', descripcion = 'Miss Universe Montenegro 2026' where pais = 'Montenegro';
update candidatas set nombre = 'Melissa Tjemma Janneke Bottema', descripcion = 'Miss Nederland 2026' where pais = 'Países Bajos';
update candidatas set nombre = 'Katia Doneva', descripcion = 'Miss Universe North Macedonia 2026' where pais = 'Macedonia del Norte';
update candidatas set nombre = 'Anna Ličková', descripcion = 'Miss Universe Slovakia 2026' where pais = 'Eslovaquia';
update candidatas set nombre = 'Angela Magienda Pitao Aumonier', descripcion = 'Miss Universe Great Britain 2026' where pais = 'Reino Unido';
update candidatas set nombre = 'Anna Nikonova', descripcion = 'Miss Universe Ukraine 2026' where pais = 'Ucrania';

-- Armenia: el sitio la muestra en Europa.
update candidatas set nombre = 'Arena Zeynalian', descripcion = 'Miss Universe Armenia 2026', region = 'Europa' where pais = 'Armenia';

-- Países de Europa que aparecen en el sitio y no estaban en la lista.
insert into candidatas (nombre, pais, region, descripcion)
select v.nombre, v.pais, 'Europa', v.descripcion
from (values
  ('Anna Maria Babau', 'Bulgaria', 'Miss Universe Bulgaria 2026'),
  ('Veera Grönlund', 'Finlandia', 'Miss Universe Finland 2026'),
  ('Olivia Vasilopoulos', 'Grecia', 'Miss Universe Greece 2026'),
  ('Lāsma Kuhtarska', 'Letonia', 'Miss Universe Latvia 2026'),
  ('Dorina Darii', 'Moldavia', 'Miss Universe Moldova 2026'),
  ('Abelone Smedsrud', 'Noruega', 'Miss Norway 2026'),
  ('Vivica Lewandowski', 'Polonia', 'Miss Universe Poland 2026'),
  ('Isabela Santos', 'Portugal', 'Miss Universe Portugal 2026'),
  ('Sabina Gabriela Parmac', 'Rumania', 'Miss Universe Romania 2026'),
  ('Aleksandra Stashkevich', 'Rusia', 'Miss Universe Russia 2026'),
  ('Nikolina Vujčić', 'Serbia', 'Miss Universe Serbia 2026'),
  ('Josefin Strand', 'Suecia', 'Miss Universe Sweden 2026'),
  ('Itiya Dube', 'Suiza', 'Miss Universe Switzerland 2026')
) as v(nombre, pais, descripcion)
where not exists (select 1 from candidatas c where c.pais = v.pais);
