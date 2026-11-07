-- Región de cada candidata: América, Caribe, Europa, África, Asia u Oceanía.
alter table candidatas add column if not exists region text;

alter table candidatas drop constraint if exists candidatas_region_check;
alter table candidatas
  add constraint candidatas_region_check
  check (region is null or region in ('America', 'Caribe', 'Europa', 'Africa', 'Asia', 'Oceania'));
