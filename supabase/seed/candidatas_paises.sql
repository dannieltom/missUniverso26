-- Carga inicial de candidatas usando la lista de países que indicó el administrador.
-- Provisional: el nombre de la candidata es igual al país hasta tener los nombres oficiales.
-- Ejecutar en el Editor SQL de Supabase. Solo inserta si la tabla está vacía.

insert into candidatas (nombre, pais)
select v.pais, v.pais
from (values
  ('Albania'), ('Alemania'), ('Angola'), ('Argentina'), ('Armenia'), ('Aruba'), ('Australia'), ('Austria'),
  ('Bahamas'), ('Bielorrusia'), ('Bélgica'), ('Bolivia'), ('Botswana'), ('Brasil'),
  ('Camerún'), ('Cabo Verde'), ('Islas Caimán'), ('Chile'), ('China'), ('Colombia'), ('Costa Rica'), ('Croacia'), ('Cuba'), ('República Checa'),
  ('Dinamarca'), ('República Dominicana'),
  ('Ecuador'), ('Egipto'), ('El Salvador'), ('Guinea Ecuatorial'), ('España'), ('Estonia'), ('Etiopía'),
  ('Filipinas'), ('Francia'),
  ('Guadalupe'), ('Guatemala'), ('Guinea'),
  ('Honduras'), ('Hungría'),
  ('Islandia'), ('India'), ('Irlanda'), ('Italia'),
  ('Jamaica'), ('Japón'), ('Jordania'),
  ('Kazajistán'), ('Kenia'), ('Kosovo'), ('Kirguistán'),
  ('Lituania'),
  ('Maldivas'), ('Malta'), ('Mayotte'), ('México'), ('Mongolia'), ('Montenegro'), ('Myanmar (Birmania)'),
  ('Países Bajos'), ('Nicaragua'), ('Níger'), ('Macedonia del Norte'),
  ('Panamá'), ('Paraguay'), ('Perú'), ('Puerto Rico'),
  ('Reunión'),
  ('Sierra Leona'), ('Eslovaquia'), ('Sri Lanka'), ('Surinam'),
  ('Túnez'),
  ('Ucrania'), ('Reino Unido'), ('Estados Unidos'), ('Uruguay'), ('Islas Vírgenes de los EE. UU.'),
  ('Venezuela'),
  ('Zambia'), ('Zimbabue')
) as v(pais)
where not exists (select 1 from candidatas);
