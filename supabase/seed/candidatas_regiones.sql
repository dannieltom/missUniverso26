-- Asigna la región a cada candidata según su país. Ejecutar después de la migración de región
-- y de la carga de candidatas. Es seguro ejecutarlo varias veces: solo actualiza las que no tienen región.
-- Criterios: Armenia y Kazajistán se consideran Asia; Surinam se considera América del Sur.

update candidatas
set region = case
  when pais in (
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Ecuador', 'El Salvador',
    'Estados Unidos', 'Guatemala', 'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú',
    'Surinam', 'Uruguay', 'Venezuela'
  ) then 'America'
  when pais in (
    'Aruba', 'Bahamas', 'Cuba', 'Guadalupe', 'Islas Caimán', 'Islas Vírgenes de los EE. UU.',
    'Jamaica', 'República Dominicana', 'Puerto Rico'
  ) then 'Caribe'
  when pais in (
    'Albania', 'Alemania', 'Austria', 'Bielorrusia', 'Bélgica', 'Croacia', 'República Checa',
    'Dinamarca', 'España', 'Estonia', 'Francia', 'Hungría', 'Irlanda', 'Islandia', 'Italia',
    'Kosovo', 'Lituania', 'Malta', 'Montenegro', 'Países Bajos', 'Macedonia del Norte',
    'Eslovaquia', 'Reino Unido', 'Ucrania'
  ) then 'Europa'
  when pais in (
    'Angola', 'Botswana', 'Cabo Verde', 'Camerún', 'Egipto', 'Etiopía', 'Guinea', 'Guinea Ecuatorial',
    'Kenia', 'Mayotte', 'Níger', 'Reunión', 'Sierra Leona', 'Túnez', 'Zambia', 'Zimbabue'
  ) then 'Africa'
  when pais in (
    'Armenia', 'China', 'Filipinas', 'India', 'Japón', 'Jordania', 'Kazajistán', 'Kirguistán',
    'Maldivas', 'Mongolia', 'Myanmar (Birmania)', 'Sri Lanka'
  ) then 'Asia'
  when pais = 'Australia' then 'Oceania'
  else null
end
where region is null;
