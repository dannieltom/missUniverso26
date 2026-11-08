import { supabaseNavegador } from "@/lib/supabase-navegador";
import { ANIO, type EtapaClave } from "@/lib/etapas";

/**
 * Guarda lo que eligió la persona conectada en una etapa (reemplaza lo anterior).
 * Si nadie inició sesión, no hace nada: el ranking solo cuenta a quien tiene cuenta.
 */
export async function guardarParticipacion(
  etapa: EtapaClave | "final",
  filas: { candidata_id: string; orden?: number }[],
): Promise<void> {
  const db = supabaseNavegador();
  if (!db) return;
  const { data } = await db.auth.getUser();
  const uid = data.user?.id;
  if (!uid) return;

  await db.from("participacion").delete().eq("user_id", uid).eq("anio", ANIO).eq("etapa", etapa);
  if (filas.length === 0) return;
  await db.from("participacion").insert(
    filas.map((f) => ({
      user_id: uid,
      anio: ANIO,
      etapa,
      candidata_id: f.candidata_id,
      orden: f.orden ?? null,
    })),
  );
}
