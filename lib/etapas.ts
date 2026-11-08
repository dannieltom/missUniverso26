/** Etapas de la noche final, en orden. La clave es la que se guarda en la base de datos. */
export const ANIO = 2026;

export const CLAVE_BANIO = "mu26-r2-banio";
export const CLAVE_GALA = "mu26-r2-gala";
export const CLAVE_FINAL = `mu26-final-${ANIO}`;

export type EtapaClave = "inicial" | "top10" | "top5";

export type EtapaInfo = {
  clave: EtapaClave;
  /** Etapa de la que sale el pool para armar tu top. null en la inicial (sale de la preliminar). */
  anterior: EtapaClave | null;
  /** Etapa a la que se pasa con el botón de abajo. */
  siguiente: EtapaClave | null;
  tamanoPorDefecto: number;
};

export const ETAPAS: EtapaInfo[] = [
  { clave: "inicial", anterior: null, siguiente: "top10", tamanoPorDefecto: 20 },
  { clave: "top10", anterior: "inicial", siguiente: "top5", tamanoPorDefecto: 10 },
  { clave: "top5", anterior: "top10", siguiente: null, tamanoPorDefecto: 5 },
];

export const ETAPA_CLAVES: EtapaClave[] = ETAPAS.map((e) => e.clave);

export function etapaInfo(clave: string): EtapaInfo | null {
  return ETAPAS.find((e) => e.clave === clave) ?? null;
}

export const TAMANOS_POR_DEFECTO: Record<EtapaClave, number> = {
  inicial: 20,
  top10: 10,
  top5: 5,
};

/** Clave de localStorage para tu top de una etapa (no aplica a la inicial). */
export function clavePick(etapa: EtapaClave): string {
  return `mu26-pick-${etapa}-${ANIO}`;
}
