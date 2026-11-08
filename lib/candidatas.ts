import { createClient } from "@supabase/supabase-js";
import type { Candidata } from "@/lib/tipos";

/**
 * Lee las candidatas desde Supabase, en orden alfabético por país y luego por nombre.
 * Si falta la configuración o hay error, devuelve una lista vacía y el error como texto.
 */
export async function getCandidatas(): Promise<{ candidatas: Candidata[]; error: string | null }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !clave) {
    return {
      candidatas: [],
      error: "Falta configurar NEXT_PUBLIC_SUPABASE_URL o la clave pública en .env.local.",
    };
  }

  const supabase = createClient(url, clave);
  const { data, error } = await supabase
    .from("candidatas")
    .select("id, nombre, pais, region, foto_url, descripcion")
    .order("pais", { ascending: true })
    .order("nombre", { ascending: true });

  if (error) {
    return { candidatas: [], error: `No se pudieron cargar las candidatas: ${error.message}` };
  }

  return { candidatas: (data ?? []) as Candidata[], error: null };
}
