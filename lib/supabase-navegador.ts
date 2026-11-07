import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cliente: SupabaseClient | null = null;

/**
 * Cliente de Supabase para el navegador (inicio de sesión con Google).
 * Devuelve null si falta la configuración en .env.local.
 */
export function supabaseNavegador(): SupabaseClient | null {
  if (cliente) return cliente;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !clave) return null;

  cliente = createClient(url, clave);
  return cliente;
}
