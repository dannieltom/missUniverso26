import { supabaseNavegador } from "@/lib/supabase-navegador";

/** miNombre es el nombre que escribiste al entrar a la sala. */
export type Sala = { id: string; codigo: string; nombre: string; miNombre: string };

type FilaSala = { id: string; codigo: string; nombre: string; mi_nombre: string };

function cliente() {
  const db = supabaseNavegador();
  if (!db) throw new Error("Falta configurar Supabase en .env.local.");
  return db;
}

function aSala(fila: FilaSala | undefined): Sala | null {
  if (!fila) return null;
  return { id: fila.id, codigo: fila.codigo, nombre: fila.nombre, miNombre: fila.mi_nombre };
}

/** La sala en la que estás, o null si no estás en ninguna. */
export async function miSala(): Promise<Sala | null> {
  const db = supabaseNavegador();
  if (!db) return null;
  const { data, error } = await db.rpc("mi_sala");
  if (error) throw new Error(error.message);
  return aSala(((data ?? []) as FilaSala[])[0]);
}

/** Crea una sala nueva y te agrega como miembro con tu nombre. */
export async function crearSala(nombreSala: string, tuNombre: string): Promise<Sala | null> {
  const { data, error } = await cliente().rpc("crear_sala", { p_nombre: nombreSala, p_tu_nombre: tuNombre });
  if (error) throw new Error(error.message);
  return aSala(((data ?? []) as FilaSala[])[0]);
}

/** Entra a una sala con su código y tu nombre. */
export async function unirseSala(codigo: string, tuNombre: string): Promise<Sala | null> {
  const { data, error } = await cliente().rpc("unirse_sala", { p_codigo: codigo, p_tu_nombre: tuNombre });
  if (error) throw new Error(error.message);
  return aSala(((data ?? []) as FilaSala[])[0]);
}

/** Nombres de quienes están en tu sala. */
export async function integrantesSala(): Promise<string[]> {
  const { data, error } = await cliente().rpc("integrantes_sala");
  if (error) throw new Error(error.message);
  return ((data ?? []) as { nombre: string }[]).map((f) => f.nombre);
}

/** Sale de la sala actual. */
export async function salirSala(): Promise<void> {
  const { error } = await cliente().rpc("salir_sala");
  if (error) throw new Error(error.message);
}
