/** Puntos por cada acierto en cada etapa. Tiene que coincidir con la función puntajes_sala de la base de datos. */
export const PUNTOS_POR_ETAPA = {
  inicial: 10,
  top10: 20,
  top5: 25,
  top3: 30,
} as const;

/** Nombre de cada lugar de la ronda final, del 1.º al 3.º. */
export const NOMBRE_LUGAR_FINAL = ["Miss Universo 2026", "1.ª finalista", "2.ª finalista"];

/** Puntos por acertar el lugar en la ronda final (1 = Miss Universo 2026). */
export const PUNTOS_FINAL_POR_LUGAR: Record<number, number> = {
  1: 70,
  2: 50,
  3: 40,
};
