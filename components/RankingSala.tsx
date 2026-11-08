"use client";

import { useCallback, useEffect, useState } from "react";
import { supabaseNavegador } from "@/lib/supabase-navegador";
import { PUNTOS_FINAL_POR_LUGAR, PUNTOS_POR_ETAPA } from "@/lib/puntajes";

type Fila = {
  user_id: string;
  nombre: string;
  aciertos_inicial: number;
  puntos_inicial: number;
  aciertos_top10: number;
  puntos_top10: number;
  aciertos_top5: number;
  puntos_top5: number;
  aciertos_final: number;
  puntos_final: number;
  total: number;
};

// Ranking de la sala: nombre, aciertos por etapa y puntos acumulados. No muestra qué eligió cada persona.
export function RankingSala({ salaId }: { salaId: string }) {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const db = supabaseNavegador();
    if (!db) return;
    const { data, error: errorRpc } = await db.rpc("puntajes_sala", { p_sala: salaId });
    if (errorRpc) {
      setError(errorRpc.message);
      return;
    }
    setError(null);
    setFilas((data ?? []) as Fila[]);
  }, [salaId]);

  useEffect(() => {
    cargar();
    const db = supabaseNavegador();
    const intervalo = setInterval(cargar, 10000);
    const canal = db
      ?.channel(`ranking-${salaId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "top_etapa_oficial" }, () => cargar())
      .subscribe();
    return () => {
      clearInterval(intervalo);
      if (db && canal) db.removeChannel(canal);
    };
  }, [cargar, salaId]);

  return (
    <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
      <h4 className="text-xl font-black uppercase">Ranking de la sala</h4>
      <p className="mt-2 text-sm text-white/60">
        Cada acierto vale: Top inicial {PUNTOS_POR_ETAPA.inicial} pts · Top 10 {PUNTOS_POR_ETAPA.top10} pts · Top 5{" "}
        {PUNTOS_POR_ETAPA.top5} pts · Ronda final de {PUNTOS_FINAL_POR_LUGAR[5]} a {PUNTOS_FINAL_POR_LUGAR[1]} pts según el lugar.
      </p>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {filas.length === 0 && !error ? (
        <p className="mt-5 text-sm text-white/50">Todavía no hay participantes en la sala.</p>
      ) : (
        <ol className="mt-5 space-y-2">
          {filas.map((f, i) => (
            <li key={f.user_id} className="rounded-xl border border-white/10 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">
                  <span className="mr-2 font-black text-[#facc15]">{i + 1}.</span>
                  {f.nombre}
                </span>
                <span className="font-black">{f.total} pts</span>
              </div>
              <p className="mt-1 text-xs text-white/50">
                Inicial {f.aciertos_inicial} ac. ({f.puntos_inicial} pts) · Top 10 {f.aciertos_top10} ac. ({f.puntos_top10}) ·
                Top 5 {f.aciertos_top5} ac. ({f.puntos_top5}) · Final {f.aciertos_final} ac. ({f.puntos_final})
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
