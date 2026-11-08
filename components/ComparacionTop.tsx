"use client";

import { useEffect, useMemo, useState } from "react";
import type { Candidata } from "@/lib/tipos";
import { urlBandera } from "@/lib/banderas";
import { supabaseNavegador } from "@/lib/supabase-navegador";

const ANIO = 2026;
const CORTE_POR_DEFECTO = 12;
// Mismas claves que guarda la ronda preliminar.
const CLAVE_BANIO = "mu26-r2-banio";
const CLAVE_GALA = "mu26-r2-gala";

function leerPuntajes(clave: string): Record<string, number> {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? (JSON.parse(guardado) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

// Compara tu top (sacado de la preliminar) contra el top oficial compartido, en vivo.
export function ComparacionTop({ candidatas }: { candidatas: Candidata[] }) {
  const [corte, setCorte] = useState(CORTE_POR_DEFECTO);
  const [oficial, setOficial] = useState<string[]>([]);
  const [miTop, setMiTop] = useState<string[]>([]);

  const porId = useMemo(() => new Map(candidatas.map((c) => [c.id, c])), [candidatas]);

  // Tamaño y top oficial, en vivo.
  useEffect(() => {
    const db = supabaseNavegador();
    if (!db) return;
    let cancelado = false;

    async function cargar() {
      const [cfg, top] = await Promise.all([
        db!.from("top_oficial_config").select("corte").eq("anio", ANIO).maybeSingle(),
        db!.from("top_oficial").select("candidata_id, orden").eq("anio", ANIO).order("orden", { ascending: true }),
      ]);
      if (cancelado) return;
      setCorte(cfg.data?.corte ?? CORTE_POR_DEFECTO);
      setOficial(((top.data ?? []) as { candidata_id: string }[]).map((f) => f.candidata_id));
    }

    cargar();
    const canal = db
      .channel(`comparacion-top-${ANIO}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "top_oficial" }, () => cargar())
      .on("postgres_changes", { event: "*", schema: "public", table: "top_oficial_config" }, () => cargar())
      .subscribe();

    return () => {
      cancelado = true;
      db.removeChannel(canal);
    };
  }, []);

  // Tu top: las mejores según la preliminar (promedio de baño y gala), con el tamaño oficial.
  useEffect(() => {
    const banio = leerPuntajes(CLAVE_BANIO);
    const gala = leerPuntajes(CLAVE_GALA);
    const ordenados = candidatas
      .map((c) => ({
        id: c.id,
        total: banio[c.id] !== undefined && gala[c.id] !== undefined ? (banio[c.id] + gala[c.id]) / 2 : undefined,
      }))
      .filter((x): x is { id: string; total: number } => x.total !== undefined)
      .sort((a, b) => b.total - a.total)
      .map((x) => x.id);
    setMiTop(ordenados.slice(0, corte));
  }, [candidatas, corte]);

  if (miTop.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/50 p-6 text-white/60 backdrop-blur">
        Termina de calificar baño y gala en la preliminar para armar tu top {corte}.
      </div>
    );
  }

  const enOficial = new Set(oficial);
  const completo = oficial.length >= corte;
  const aciertos = miTop.filter((id) => enOficial.has(id)).length;

  return (
    <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
      <h4 className="text-xl font-black uppercase">Comparación del top {corte}</h4>
      <p className="mt-2 text-sm text-white/60">
        Aciertos: {aciertos} de {corte}
        {!completo && " (se va actualizando conforme se anuncian)"}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-4">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Top {corte} oficial</p>
          {oficial.length === 0 ? (
            <p className="text-sm text-white/50">Aún no se anuncia.</p>
          ) : (
            <ol className="space-y-2">
              {oficial.map((id, i) => {
                const c = porId.get(id);
                if (!c) return null;
                const bandera = urlBandera(c.pais);
                return (
                  <li key={id} className="flex items-center gap-3 text-sm">
                    <span className="w-7 text-right font-black text-[#ed1c24]">{i + 1}.</span>
                    {bandera && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bandera} alt="" className="h-5 w-7 flex-none rounded-sm object-cover" />
                    )}
                    {c.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.foto_url} alt="" className="h-10 w-8 flex-none rounded-md object-cover" />
                    ) : (
                      <span className="h-10 w-8 flex-none rounded-md bg-white/10" />
                    )}
                    <span className="font-semibold">{c.pais}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Tu top {corte}</p>
          <ol className="space-y-2">
            {miTop.map((id, i) => {
              const c = porId.get(id);
              if (!c) return null;
              const bandera = urlBandera(c.pais);
              const acerto = enOficial.has(id);
              const marca = acerto ? "✓" : completo ? "✗" : "";
              return (
                <li key={id} className="flex items-center gap-3 text-sm">
                  <span className="w-7 text-right font-black text-white/50">{i + 1}.</span>
                  {bandera && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bandera} alt="" className="h-5 w-7 flex-none rounded-sm object-cover" />
                  )}
                  {c.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.foto_url} alt="" className="h-10 w-8 flex-none rounded-md object-cover" />
                  ) : (
                    <span className="h-10 w-8 flex-none rounded-md bg-white/10" />
                  )}
                  <span className="flex-1 font-semibold">{c.pais}</span>
                  <span
                    className={`w-6 text-center text-lg font-black ${acerto ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {marca}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
