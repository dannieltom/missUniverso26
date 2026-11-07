export type Candidata = {
  id: string;
  nombre: string;
  pais: string;
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
