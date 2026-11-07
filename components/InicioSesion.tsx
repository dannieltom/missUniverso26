"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseNavegador } from "@/lib/supabase-navegador";

/**
 * Muestra el botón de inicio de sesión con Google.
 * Si hay sesión, muestra el contenido (children) y el botón para cerrarla.
 */
export function InicioSesion({ children }: { children: ReactNode }) {
  const supabase = supabaseNavegador();
  const [sesion, setSesion] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setCargando(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion);
    });

    return () => data.subscription.unsubscribe();
  }, [supabase]);

  if (!supabase) {
    return (
      <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
        Falta configurar NEXT_PUBLIC_SUPABASE_URL y la clave pública en .env.local.
      </p>
    );
  }

  if (cargando) {
    return <p className="text-white/50">Cargando…</p>;
  }

  async function iniciarSesion() {
    setError(null);
    const { error: errorLogin } = await supabase!.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (errorLogin) setError(errorLogin.message);
  }

  async function cerrarSesion() {
    await supabase!.auth.signOut();
  }

  if (!sesion) {
    return (
      <section className="aparecer rounded-3xl border border-white/10 bg-black/50 p-10 text-center backdrop-blur">
        <p className="mb-6 text-lg text-white/70">Inicia sesión con Google para calificar.</p>
        <button
          type="button"
          onClick={iniciarSesion}
          className="rounded-full bg-white px-8 py-3 font-bold uppercase tracking-wider text-black transition hover:bg-[#facc15] active:scale-95"
        >
          Iniciar sesión con Google
        </button>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </section>
    );
  }

  const nombre =
    (sesion.user.user_metadata?.full_name as string | undefined) ??
    sesion.user.email ??
    "Jugador";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>
          Sesión: <span className="font-semibold text-white">{nombre}</span>
        </span>
        <button type="button" onClick={cerrarSesion} className="underline underline-offset-4 hover:text-white">
          Cerrar sesión
        </button>
      </div>
      {children}
    </div>
  );
}
