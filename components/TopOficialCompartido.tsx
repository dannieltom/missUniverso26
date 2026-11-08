"use client";

import { useEffect, useState } from "react";
import type { Candidata } from "@/lib/tipos";
import { urlBandera } from "@/lib/banderas";
import { supabaseNavegador } from "@/lib/supabase-navegador";

type Fila = { candidata_id: string; orden: number };

// Top oficial compartido: todos lo ven en vivo. El administrador (con PIN) lo va llenando.
export function TopOficialCompartido({ candidatas }: { candidatas: Candidata[] }) {
  const [anio, setAnio] = useState(2026);
  const [corte, setCorte] = useState(12);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Admin
  const [pin, setPin] = useState("");
  const [eleccion, setEleccion] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const porId = new Map(candidatas.map((c) => [c.id, c]));

  // Carga el top del año y corte elegidos, y se actualiza cuando cambia en la base de datos.
  useEffect(() => {
    const db = supabaseNavegador();
    if (!db) {
      setError("Falta configurar Supabase en .env.local.");
      return;
    }
    let cancelado = false;

    async function cargar() {
      const { data, error } = await db!
        .from("top_oficial")
        .select("candidata_id, orden")
        .eq("anio", anio)
        .eq("corte", corte)
        .order("orden", { ascending: true });
      if (cancelado) return;
      if (error) setError(`No se pudo cargar el top oficial: ${error.message}`);
      else {
        setError(null);
        setFilas((data ?? []) as Fila[]);
      }
    }

    cargar();
    const canal = db
      .channel(`top-oficial-${anio}-${corte}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "top_oficial" }, () => cargar())
      .subscribe();

    return () => {
      cancelado = true;
      db.removeChannel(canal);
    };
  }, [anio, corte]);

  async function accion(payload: { accion: "agregar" | "quitar" | "limpiar"; candidata_id?: string }) {
    setTrabajando(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/top-oficial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, anio, corte, ...payload }),
      });
      const datos = (await res.json()) as { error?: string };
      if (!res.ok) setMensaje(datos.error ?? "Error al guardar.");
      else if (payload.accion === "agregar") setEleccion("");
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
    } finally {
      setTrabajando(false);
    }
  }

  const yaEnTop = new Set(filas.map((f) => f.candidata_id));
  const disponibles = candidatas.filter((c) => !yaEnTop.has(c.id));
  const completo = filas.length >= corte;

  return (
    <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
      <h4 className="text-xl font-black uppercase">Top {corte} oficial {anio}</h4>
      <p className="mt-2 text-sm text-white/50">
        Se actualiza en vivo para todos. Marcadas: {filas.length} de {corte}.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Año
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="w-28 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-[#facc15]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Tamaño del top
          <input
            type="number"
            min={1}
            value={corte}
            onChange={(e) => setCorte(Math.max(1, Number(e.target.value)))}
            className="w-28 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-[#facc15]"
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {filas.length > 0 ? (
        <ol className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {filas.map((f) => {
            const c = porId.get(f.candidata_id);
            if (!c) return null;
            const bandera = urlBandera(c.pais);
            return (
              <li key={f.candidata_id} className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-2 text-sm">
                <span className="font-black text-[#ed1c24]">{f.orden}.</span>
                {bandera && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bandera} alt="" className="h-5 w-7 flex-none rounded-sm object-cover" />
                )}
                <span className="font-semibold">{c.pais}</span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-6 text-sm text-white/50">Todavía no hay candidatas marcadas como oficiales.</p>
      )}

      <details className="mt-8 rounded-2xl border border-white/10 p-4">
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-widest text-white/70">
          Administrador
        </summary>

        <div className="mt-4 space-y-4">
          <label className="flex flex-col gap-1 text-sm text-white/70">
            PIN
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-56 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-[#facc15]"
            />
          </label>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm text-white/70">
              Siguiente candidata oficial
              <select
                value={eleccion}
                onChange={(e) => setEleccion(e.target.value)}
                className="w-72 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-[#facc15]"
              >
                <option value="" className="bg-black">Elige una candidata</option>
                {disponibles.map((c) => (
                  <option key={c.id} value={c.id} className="bg-black">
                    {c.pais} · {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={!pin || !eleccion || completo || trabajando}
              onClick={() => accion({ accion: "agregar", candidata_id: eleccion })}
              className="rounded-full bg-[#facc15] px-5 py-2 font-bold text-black transition hover:brightness-110 disabled:opacity-40"
            >
              Agregar al top
            </button>
            <button
              type="button"
              disabled={!pin || filas.length === 0 || trabajando}
              onClick={() => {
                if (window.confirm("¿Borrar todo el top oficial de este corte?")) accion({ accion: "limpiar" });
              }}
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white disabled:opacity-40"
            >
              Borrar todo
            </button>
          </div>

          {filas.length > 0 && (
            <ul className="space-y-2">
              {filas.map((f) => {
                const c = porId.get(f.candidata_id);
                if (!c) return null;
                return (
                  <li key={f.candidata_id} className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      {f.orden}. {c.pais}
                    </span>
                    <button
                      type="button"
                      disabled={!pin || trabajando}
                      onClick={() => accion({ accion: "quitar", candidata_id: f.candidata_id })}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-white disabled:opacity-40"
                    >
                      Quitar
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {mensaje && <p className="text-sm text-red-400">{mensaje}</p>}
        </div>
      </details>
    </div>
  );
}
