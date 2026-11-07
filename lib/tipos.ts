/** Regiones en el orden en que se muestran. La clave es la que se guarda en la base de datos. */
export const REGIONES = [
  { clave: "America", etiqueta: "América" },
  { clave: "Caribe", etiqueta: "Caribe" },
  { clave: "Europa", etiqueta: "Europa" },
  { clave: "Africa", etiqueta: "África" },
  { clave: "Asia", etiqueta: "Asia" },
  { clave: "Oceania", etiqueta: "Oceanía" },
] as const;

export type Region = (typeof REGIONES)[number]["clave"];

export type Candidata = {
  id: string;
  nombre: string;
  pais: string;
  region: Region | null;
  foto_url: string | null;
  descripcion: string | null;
};

/** Puntaje válido: de 1.0 a 10.0 con un decimal. */
export const PUNTAJE_MIN = 1.0;
export const PUNTAJE_MAX = 10.0;

/**
 * Convierte el texto ingresado en un puntaje válido (1.0 a 10.0, un decimal).
 * Acepta coma o punto decimal. Devuelve null si no es válido.
 */
export function parsearPuntaje(texto: string): number | null {
  const normalizado = texto.trim().replace(",", ".");
  if (normalizado === "") return null;
  const valor = Number(normalizado);
  if (!Number.isFinite(valor)) return null;
  const redondeado = Math.round(valor * 10) / 10;
  if (redondeado < PUNTAJE_MIN || redondeado > PUNTAJE_MAX) return null;
  return redondeado;
}
