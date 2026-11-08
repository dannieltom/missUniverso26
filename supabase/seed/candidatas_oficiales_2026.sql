-- Candidatas oficiales de Miss Universo 2026 (125 países), con el nombre del país en inglés
-- tal como aparece en el sitio oficial.
-- Reemplaza a los seeds anteriores (candidatas_paises, _regiones, _africa, _america, _asia,
-- _caribe, _europa, _oceania). Es seguro ejecutarlo varias veces.
--
-- Hace tres cosas:
--  1) Renombra y actualiza región y foto de las candidatas que ya existen.
--  2) Agrega las que faltan, con su nombre oficial cuando se conoce.
--  3) Elimina las que no están en la lista oficial (por ejemplo Maldivas y Níger).

do $$
begin

create temp table oficial (
  pais_anterior text,
  pais text not null,
  region text not null,
  nombre text,
  descripcion text,
  foto_url text
);

insert into oficial (pais_anterior, pais, region, nombre, descripcion, foto_url) values
('Albania', 'Albania', 'Europa', 'Jogersa Beqiri', 'Miss Universe Albania 2026', '/fotos/albania.jpg'),
('Angola', 'Angola', 'Africa', 'Wanderléia Bango Nicolau Rodrigues', 'Miss Angola Universo 2025/2026', '/fotos/angola.jpg'),
('Argentina', 'Argentina', 'America', 'Daiana Stefani Pereyra', 'Miss Universo Argentina 2026', '/fotos/argentina.jpg'),
('Armenia', 'Armenia', 'Europa', 'Arena Zeynalian', 'Miss Universe Armenia 2026', '/fotos/armenia.jpg'),
('Aruba', 'Aruba', 'Caribe', 'Elizabeth Johnson', 'Miss Universe Aruba 2026', '/fotos/aruba.jpg'),
('Australia', 'Australia', 'Oceania', 'Caitlin Worthington', 'Miss Universe Australia 2026', '/fotos/australia.jpg'),
('Austria', 'Austria', 'Europa', 'Victoria Amerson', 'Miss Universe Austria 2026', '/fotos/austria.jpg'),
('Bahamas', 'Bahamas', 'Caribe', 'Shawndra Henfield', 'Miss Universe Bahamas 2026', '/fotos/bahamas.jpg'),
(null, 'Bangladesh', 'Asia', 'Bangladesh', null, null),
('Bielorrusia', 'Belarus', 'Europa', 'Aliya Korotkaya', 'Miss Universe Belarus 2026', '/fotos/belarus.jpg'),
('Bélgica', 'Belgium', 'Europa', 'Olga Mariana Lombardo', 'Miss Belgium 2026', '/fotos/belgica.jpg'),
('Belice', 'Belize', 'America', 'Caleigh-Rose West', 'Miss Universe Belize 2026', '/fotos/belice.jpg'),
('Bolivia', 'Bolivia', 'America', 'Valeria Mena Ferreira', 'Miss Universo Bolivia 2026', '/fotos/bolivia.jpg'),
('Bonaire', 'Bonaire', 'Caribe', 'Caroline Porras', 'Miss Universe Bonaire 2026', '/fotos/bonaire.jpg'),
('Botswana', 'Botswana', 'Africa', 'Dabilo Moses', 'Miss Universe Botswana 2026', '/fotos/botswana.jpg'),
('Brasil', 'Brazil', 'America', 'Marcella Kozinski de Barros', 'Miss Universo Brasil 2026', '/fotos/brasil.jpg'),
('Islas Vírgenes Británicas', 'British Virgin Islands', 'America', 'Orealia Thomas', 'Miss Universe British Virgin Islands 2026', null),
(null, 'Bulgaria', 'Europa', 'Anna Maria Babau', 'Miss Universe Bulgaria 2026', null),
('Cabo Verde', 'Cabo Verde', 'Africa', 'Armandina Cunha', 'Miss Universe Cabo Verde 2026', '/fotos/cabo-verde.jpg'),
('Camboya', 'Cambodia', 'Asia', 'Than Rthna', 'Miss Universe Cambodia 2026', '/fotos/camboya.jpg'),
('Camerún', 'Cameroon', 'Africa', 'Audrey Moutongo Black', 'Miss Cameroon 2025', '/fotos/camerun.jpg'),
('Canadá', 'Canada', 'America', 'Aslhan Moralı', 'Miss Universe Canada 2026', '/fotos/canada.jpg'),
('Islas Caimán', 'Cayman Islands', 'Caribe', 'Juliana May Myers', 'Miss Universe Cayman Islands 2026', null),
('Chile', 'Chile', 'America', 'Dominga López', 'Miss Universo Chile 2026', '/fotos/chile.jpg'),
('China', 'China', 'Asia', 'Shiqi Wang', 'Miss Universe China 2026', null),
('Colombia', 'Colombia', 'America', 'María Alejandra López Pérez', 'Miss Universe Colombia 2026', '/fotos/colombia.jpg'),
('Costa Rica', 'Costa Rica', 'America', 'María Alejandra Acosta García', 'Miss Universo Costa Rica 2026', '/fotos/costa-rica.jpg'),
('Croacia', 'Croatia', 'Europa', 'Antea Mršić', 'Miss Universe Croatia 2026', '/fotos/croatia.jpg'),
('Cuba', 'Cuba', 'Caribe', 'Mia Angelina Donadio Cancio', 'Miss Universe Cuba 2026', '/fotos/cuba.jpg'),
('Curazao', 'Curaçao', 'Caribe', 'Blanty Rojer Comperts', 'Miss Universe Curaçao 2026', '/fotos/curacao.jpg'),
('República Checa', 'Czech Republic', 'Europa', 'Dominika Viktorie Kotoučková', 'Miss Universe Czech Republic 2026', null),
('República Democrática del Congo', 'Democratic Republic of Congo', 'Africa', 'Jessi Longwe Kalambayi', 'Miss Universe RD Congo 2026', null),
('Dinamarca', 'Denmark', 'Europa', 'Fie Rose Lindegaard', 'Miss Universe Denmark 2026', '/fotos/denmark.jpg'),
('República Dominicana', 'Dominican Republic', 'Caribe', 'Melissa Núñez', 'Miss República Dominicana Universo 2026', null),
('Ecuador', 'Ecuador', 'America', 'Dalia Bucaram', 'Miss Universo Ecuador 2026', '/fotos/ecuador.jpg'),
('Egipto', 'Egypt', 'Africa', 'Sonia Gergis', 'Miss Universe Egypt 2026', '/fotos/egypt.jpg'),
('El Salvador', 'El Salvador', 'America', 'Sofía Córdova Moreno', 'Miss Universo El Salvador 2026', null),
('Guinea Ecuatorial', 'Equatorial Guinea', 'Africa', 'Teresa Isabel Mbomio Ada', 'Miss Universe Guinea Ecuatorial 2026', null),
('Estonia', 'Estonia', 'Europa', 'Emili Denneng', 'Miss Universe Estonia 2025', null),
('Etiopía', 'Ethiopia', 'Africa', 'Bruktawit Belete Woldeyes', 'Miss Universe Ethiopia 2026', null),
('Finlandia', 'Finland', 'Europa', 'Veera Grönlund', 'Miss Universe Finland 2026', null),
('Francia', 'France', 'Europa', 'Garance Authié', 'Miss Universe France 2026', null),
('Alemania', 'Germany', 'Europa', 'Celina Weil', 'Miss Universe Germany 2026', '/fotos/germany.jpg'),
('Ghana', 'Ghana', 'Africa', 'Belvy Naa Teide Ofori', 'Miss Universe Ghana 2026', null),
('Reino Unido', 'Great Britain', 'Europa', 'Angela Magienda Pitao Aumonier', 'Miss Universe Great Britain 2026', null),
('Grecia', 'Greece', 'Europa', 'Olivia Vasilopoulos', 'Miss Universe Greece 2026', null),
('Guadalupe', 'Guadeloupe', 'Caribe', 'Chloé Mathilde Marie Deher', 'Miss Universe Guadeloupe 2026', null),
('Guatemala', 'Guatemala', 'America', 'María Adelina Castillo Birba', 'Miss Universe Guatemala 2026', null),
('Guinea', 'Guinea', 'Africa', 'Justine Kamara', 'Miss Universe Guinea 2026', null),
('Guyana', 'Guyana', 'America', 'Angel Bhathal', 'Miss Universe Guyana 2026', null),
('Haití', 'Haiti', 'Caribe', 'Tatenda Josephina Rameau', 'Miss Universe Haiti 2026', null),
('Honduras', 'Honduras', 'America', 'Luisa Paola Pineda Barahona', 'Miss Honduras Universo 2026', null),
('Hong Kong', 'Hong Kong', 'Asia', 'Jennifer Kraft Zhou', 'Miss Universe Hong Kong 2026', null),
('Hungría', 'Hungary', 'Europa', 'Kiss Kamilla', 'Miss Universe Hungary 2026', null),
('Islandia', 'Iceland', 'Europa', 'Sigga Özk', 'Miss Universe Iceland 2026', null),
('India', 'India', 'Asia', 'Kaziah Liz Mejo', 'Miss Universe India 2026', null),
('Irak', 'Iraq', 'Asia', 'Samantha Slewa', 'Miss Universe Iraq 2026', null),
('Irlanda', 'Ireland', 'Europa', 'Aideen Howard', 'Miss Universe Ireland 2026', null),
('Israel', 'Israel', 'Asia', 'Danielle Sophie Yablonka', 'Miss Universe Israel 2026', null),
('Italia', 'Italy', 'Europa', 'Giada Folcia', 'Miss Universe Italy 2026', null),
('Jamaica', 'Jamaica', 'Caribe', 'Celene Hall', 'Miss Universe Jamaica 2026', null),
('Japón', 'Japan', 'Asia', 'Sayuki Ito', 'Miss Universe Japan 2026', null),
('Jordania', 'Jordan', 'Asia', 'Destiny Anbar', 'Miss Universe Jordan 2026', null),
('Kazajistán', 'Kazakhstan', 'Asia', 'Alina Ekaterinecheva', 'Miss Universe Kazakhstan 2026', null),
('Kenia', 'Kenya', 'Africa', 'Jean Ojiro', 'Miss Universe Kenya 2026', null),
('Corea del Sur', 'Korea', 'Asia', 'Yurim Kim', null, '/fotos/korea.jpg'),
('Kosovo', 'Kosovo', 'Europa', 'Evisa Pacolli', 'Miss Universe Kosovo 2026', null),
('Kirguistán', 'Kyrgyzstan', 'Asia', 'Medina Ermekova', 'Miss Universe Kyrgyzstan 2026', null),
('Letonia', 'Latvia', 'Europa', 'Lāsma Kuhtarska', 'Miss Universe Latvia 2026', null),
('Líbano', 'Lebanon', 'Asia', 'Perla Harb', 'Miss Universe Lebanon 2026', null),
('Lituania', 'Lithuania', 'Europa', 'Olga Bykadorova', 'Miss Universe Lithuania 2026', null),
('Macao', 'Macau', 'Asia', 'Hou Xuhe', 'Miss Universe Macau 2026', null),
('Malta', 'Malta', 'Europa', 'Francesca Mercieca', 'Miss Universe Malta 2026', null),
('Martinica', 'Martinique', 'Caribe', 'Larissa Ségarel', 'Miss Universe Martinique 2026', null),
('Mayotte', 'Mayotte', 'Africa', 'Maëva Toumbou Dani', 'Miss Universe Mayotte 2026', null),
('México', 'Mexico', 'America', 'María Vargas', 'Miss Universe México 2026', null),
('Moldavia', 'Moldova', 'Europa', 'Dorina Darii', 'Miss Universe Moldova 2026', null),
('Mongolia', 'Mongolia', 'Asia', 'Enkhdelgerekh Enkhbold', 'Miss Universe Mongolia 2026', null),
('Montenegro', 'Montenegro', 'Europa', 'Maria Aleksandra Ivezaj', 'Miss Universe Montenegro 2026', null),
('Myanmar (Birmania)', 'Myanmar', 'Asia', 'May Grace Parry', 'Miss Universe Myanmar 2026', null),
('Namibia', 'Namibia', 'Africa', 'Charene Elizabeth Labuschagne', 'Miss Namibia 2026', null),
('Nepal', 'Nepal', 'Asia', 'Prayashna Gurung', 'Miss Universe Nepal 2026', null),
('Países Bajos', 'Netherlands', 'Europa', 'Melissa Tjemma Janneke Bottema', 'Miss Nederland 2026', null),
('Nueva Zelanda', 'New Zealand', 'Oceania', 'Georgia Waddington', 'Miss Universe New Zealand 2026', null),
('Nicaragua', 'Nicaragua', 'America', 'Jasmine Chola', 'Miss Universe Nicaragua 2026', null),
(null, 'Nigeria', 'Africa', 'Nigeria', null, null),
('Macedonia del Norte', 'North Macedonia', 'Europa', 'Katia Doneva', 'Miss Universe North Macedonia 2026', null),
('Noruega', 'Norway', 'Europa', 'Abelone Smedsrud', 'Miss Norway 2026', null),
('Pakistán', 'Pakistan', 'Asia', 'Misbah Arshad', 'Miss Universe Pakistan 2026', null),
('Panamá', 'Panama', 'America', 'Gabriela Lineth González Del Valle', 'Miss Universo Panamá 2026', null),
('Paraguay', 'Paraguay', 'America', 'Gretha Milagros Estigarribia Matiauda', 'Miss Universo Paraguay 2026', null),
('Perú', 'Peru', 'America', 'Luren Leticia Márquez Canales', 'Miss Perú Universo 2026', null),
('Filipinas', 'Philippines', 'Asia', 'Bea Millan-Windorski', 'Miss Universe Philippines 2026', null),
('Polonia', 'Poland', 'Europa', 'Vivica Lewandowski', 'Miss Universe Poland 2026', null),
('Portugal', 'Portugal', 'Europa', 'Isabela Santos', 'Miss Universe Portugal 2026', null),
('Puerto Rico', 'Puerto Rico', 'Caribe', 'Jennifer Barreto', 'Miss Universe Puerto Rico 2026', null),
('República del Congo', 'Republic of the Congo', 'Africa', 'Georgina Kambongo', 'Miss Universe République du Congo 2026', null),
('Reunión', 'Reunion Island', 'Africa', 'Abigaëlle Tailamée', 'Miss Universe Reunion 2026', null),
('Rumania', 'Romania', 'Europa', 'Sabina Gabriela Parmac', 'Miss Universe Romania 2026', null),
('Rusia', 'Russia', 'Europa', 'Aleksandra Stashkevich', 'Miss Universe Russia 2026', null),
('Santa Lucía', 'Saint Lucia', 'Caribe', 'Bernella Velinor', 'Miss Universe Saint Lucia 2026', null),
(null, 'Saint Martin', 'Caribe', 'Saint Martin', null, null),
('Serbia', 'Serbia', 'Europa', 'Nikolina Vujčić', 'Miss Universe Serbia 2026', null),
('Sierra Leona', 'Sierra Leone', 'Africa', 'Katti Fofanah', 'Miss Universe Sierra Leone 2026', null),
('Eslovaquia', 'Slovakia', 'Europa', 'Anna Ličková', 'Miss Universe Slovakia 2026', null),
('Sudáfrica', 'South Africa', 'Africa', 'Bajabulise Thela', 'Miss Universe South Africa 2026', null),
('Sudán del Sur', 'South Sudan', 'Africa', 'Adut Deng', 'Miss Universe South Sudan 2026', null),
('España', 'Spain', 'Europa', 'Susana Lucía Medina', 'Miss Universe Spain 2026', null),
('Sri Lanka', 'Sri Lanka', 'Asia', 'Nimhara Sasindi', 'Miss Universe Sri Lanka 2026', null),
('Surinam', 'Suriname', 'America', 'Maruschka Sahiboe', 'Miss Universe Suriname 2026', null),
('Suecia', 'Sweden', 'Europa', 'Josefin Strand', 'Miss Universe Sweden 2026', null),
('Suiza', 'Switzerland', 'Europa', 'Itiya Dube', 'Miss Universe Switzerland 2026', null),
('Tanzania', 'Tanzania', 'Africa', 'Queen Elizabeth William Makune', 'Miss Universe Tanzania 2026', null),
('Trinidad y Tobago', 'Trinidad and Tobago', 'Caribe', 'Vinita Manoo', 'Miss Universe Trinidad and Tobago 2026', null),
('Túnez', 'Tunisia', 'Africa', 'Sarrah Brahmi', 'Miss Universe Tunisia 2026', null),
('Turquía', 'Türkiye', 'Asia', 'Alara Eric', 'Miss Universe Türkiye 2026', null),
('Islas Turcas y Caicos', 'Turks and Caicos', 'Caribe', 'Selena Grant', 'Miss Universe Turks and Caicos 2026', null),
('Uganda', 'Uganda', 'Africa', 'Mitchelle Daka', 'Miss Universe Uganda 2026', null),
('Ucrania', 'Ukraine', 'Europa', 'Anna Nikonova', 'Miss Universe Ukraine 2026', null),
('Uruguay', 'Uruguay', 'America', 'Lucía Piñeyro Lima', 'Miss Universo Uruguay 2026', null),
('Islas Vírgenes de los EE. UU.', 'US Virgin Islands', 'Caribe', 'Jenna-Monét Queeley', 'Miss Universe U.S. Virgin Islands 2026', null),
('Estados Unidos', 'USA', 'America', 'Justus Anye Coleman Kelley', 'Miss USA 2026', null),
('Venezuela', 'Venezuela', 'America', 'Clara Vegas Goetz', 'Miss Universo Venezuela 2025', null),
('Zambia', 'Zambia', 'Africa', 'Mubanga Pamela Hatyoka', 'Miss Universe Zambia 2026', null),
('Zimbabue', 'Zimbabwe', 'Africa', 'Roseanna Hall', 'Miss Universe Zimbabwe 2026', null);

-- 1) Renombra las que ya existen (por nombre anterior o nombre nuevo) y actualiza región y foto.
update candidatas c
set pais = o.pais,
    region = o.region,
    foto_url = coalesce(o.foto_url, c.foto_url)
from oficial o
where c.pais = o.pais_anterior or c.pais = o.pais;

-- 2) Agrega las que faltan.
insert into candidatas (nombre, pais, region, descripcion, foto_url)
select coalesce(o.nombre, o.pais), o.pais, o.region, o.descripcion, o.foto_url
from oficial o
where not exists (select 1 from candidatas c where c.pais = o.pais);

-- 3) Quita las que no están en la lista oficial.
delete from candidatas c
where not exists (select 1 from oficial o where o.pais = c.pais);

drop table oficial;

end $$;

-- Verificación: debe devolver 125.
select count(*) as total_candidatas from candidatas;
