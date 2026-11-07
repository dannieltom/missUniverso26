-- Nombres oficiales de las candidatas de Oceanía, con su título nacional.
-- Fuente: sitio oficial de Miss Universo 2026 (sección Oceanía, 2 perfiles).
-- Es seguro ejecutarlo varias veces.

update candidatas set nombre = 'Caitlin Worthington', descripcion = 'Miss Universe Australia 2026' where pais = 'Australia';

-- Nueva Zelanda: aparece en el sitio y no estaba en la lista.
insert into candidatas (nombre, pais, region, descripcion)
select 'Georgia Waddington', 'Nueva Zelanda', 'Oceania', 'Miss Universe New Zealand 2026'
where not exists (select 1 from candidatas c where c.pais = 'Nueva Zelanda');
