import { supabaseNavegador } from "@/lib/supabase-navegador";

export type Sala = { id: string; codigo: string; nombre: string };

function cliente() {
  const db = supabaseNavegador();
  if (!db) throw new Error("Falta configurar Supabase en .env.local.");
  return db;
}

/** La sala en la que estás, o null si no estás en ninguna. */
export async function miSala(): Promise<Sala | null> {
  const db = supabaseNavegador();
  if (!db) return null;
  const { data, error } = await db.rpc("mi_sala");
  if (error) throw new Error(error.message);
  return ((data ?? []) as Sala[])[0] ?? null;
}

/** Crea una sala nueva y te agrega como miembro. */
export async function crearSala(nombre: string): Promise<Sala> {
  const { data, error } = await cliente().rpc("crear_sala", { p_nombre: nombre });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Sala[])[0];
}

/** Entra a una sala con su código. */
export async function unirseSala(codigo: string): Promise<Sala> {
  const { data, error } = await cliente().rpc("unirse_sala", { p_codigo: codigo });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Sala[])[0];
}

/** Sale de la sala actual. */
export async function salirSala(): Promise<void> {
  const { error } = await cliente().rpc("salir_sala");
  if (error) throw new Error(error.message);
}
