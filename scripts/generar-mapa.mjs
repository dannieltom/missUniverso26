// Genera lib/mapa-subregiones.json: contornos de países agrupados por subregión y posiciones de etiquetas.
// Uso: node scripts/generar-mapa.mjs
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import worldCountries from "world-countries";
import { feature } from "topojson-client";
import * as d3 from "d3-geo";

const require = createRequire(import.meta.url);
const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const atlas = require("world-atlas/countries-110m.json");

const ANCHO = 960;
const ALTO = 500;

// Subregiones que muestra el mapa (coinciden con lib/regiones.ts).
const ETIQUETAS = {
  "america-sur": { lon: -61, lat: -18 },
  centroamerica: { lon: -86, lat: 13 },
  caribe: { lon: -72, lat: 19 },
  norteamerica: { lon: -100, lat: 47 },
  europa: { lon: 15, lat: 52 },
  asia: { lon: 92, lat: 42 },
  africa: { lon: 20, lat: 3 },
  oceania: { lon: 140, lat: -25 },
};

// Ajustes por país (códigos ISO alfa-3) donde la clasificación por UN no coincide con la usada en la app.
const AJUSTES = {
  MEX: "centroamerica", // México se trata como Centroamérica
  RUS: "asia",
  ARM: "europa",
  TUR: "asia",
};

function subregionDe(pais) {
  if (AJUSTES[pais.cca3]) return AJUSTES[pais.cca3];
  switch (pais.subregion) {
    case "South America":
      return "america-sur";
    case "Central America":
      return "centroamerica";
    case "Caribbean":
      return "caribe";
    case "North America":
      return "norteamerica";
  }
  switch (pais.region) {
    case "Europe":
      return "europa";
    case "Asia":
      return "asia";
    case "Africa":
      return "africa";
    case "Oceania":
      return "oceania";
  }
  return null;
}

// world-atlas usa identificadores numéricos de 3 dígitos (ej. "004", "250").
const subregionPorCodigo = new Map();
for (const pais of worldCountries) {
  const sub = subregionDe(pais);
  if (sub && pais.ccn3) subregionPorCodigo.set(pais.ccn3.padStart(3, "0"), { sub, cca3: pais.cca3 });
}

const contornos = feature(atlas, atlas.objects.countries).features;
const asignados = contornos
  .map((f) => {
    const info = subregionPorCodigo.get(String(f.id).padStart(3, "0"));
    return info ? { f, sub: info.sub, cca3: info.cca3 } : null;
  })
  .filter(Boolean);

const proyeccion = d3
  .geoNaturalEarth1()
  .fitExtent(
    [
      [8, 8],
      [ANCHO - 8, ALTO - 8],
    ],
    { type: "FeatureCollection", features: asignados.map((a) => a.f) },
  );

const trazo = d3.geoPath(proyeccion);

const paises = asignados
  .map(({ f, sub, cca3 }) => ({ c: cca3, s: sub, d: trazo(f) }))
  .filter((p) => p.d);

const etiquetas = Object.entries(ETIQUETAS).map(([id, { lon, lat }]) => {
  const [x, y] = proyeccion([lon, lat]);
  return { id, x: Math.round(x), y: Math.round(y) };
});

const salida = { viewBox: `0 0 ${ANCHO} ${ALTO}`, paises, etiquetas };
writeFileSync(join(raiz, "lib", "mapa-subregiones.json"), JSON.stringify(salida));

const sinAsignar = contornos.length - asignados.length;
console.log(`Países con subregión: ${paises.length}. Sin subregión (omitidos): ${sinAsignar}.`);
