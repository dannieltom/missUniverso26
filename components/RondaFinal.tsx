"use client";

import { useEffect, useMemo, useState } from "react";
import type { Candidata } from "@/lib/tipos";
import { urlBandera } from "@/lib/banderas";
import { CLAVE_FINAL } from "@/lib/etapas";

const LUGARES = ["Ganadora", "Segunda", "Tercera", "Cuarta", "Quinta"];
const PUNTAJES = Array.from({ length: 10 }, (_, k) => k + 1);

type Guardado = { orden: string[]; puntajes: Record<string, number> };

function leerGuardado(): Guardado {
  try {
    const guardado = localStorage.getItem(CLAVE_FINAL);
    return guardado ? (JSON.parse(guardado) as Guardado) : { orden: [], puntajes: {} };
  } catch {
    return { orden: [], puntajes: {} };
  }
}

// Ronda final: las 5 oficiales. Las acomodas de 1.º a 5.º y les pones un puntaje del 1 al 10.
export function RondaFinal({ porId, top5 }: { porId: Map<string, Candidata>; top5: string[] }) {
  const [guardadoOrden, setGuardadoOrden] = useState<string[]>([]);
  const [puntajes, setPuntajes] = useState<Record<string, number>>({});

  useEffect(() => {
    const guardado = leerGuardado();
    setGuardadoOrden(guardado.orden);
    setPuntajes(guardado.puntajes);
  }, []);

  // Tu orden guardado, con las candidatas oficiales que vayan entrando al final.
  const orden = useMemo(
    () => [...guardadoOrden.filter((id) => top5.includes(id)), ...top5.filter((id) => !guardadoOrden.includes(id))],
    [guardadoOrden, top5],
  );

  function guardar(nuevoOrden: string[], nuevosPuntajes: Record<string, number>) {
    setGuardadoOrden(nuevoOrden);
    setPuntajes(nuevosPuntajes);
    localStorage.setItem(CLAVE_FINAL, JSON.stringify({ orden: nuevoOrden, puntajes: nuevosPuntajes }));
  }

  function mover(i: number, direccion: -1 | 1) {
    const j = i + direccion;
    if (j < 0 || j >= orden.length) return;
    const nuevo = [...orden];
    [nuevo[i], nuevo[j]] = [nuevo[j], nuevo[i]];
    guardar(nuevo, puntajes);
  }

  function ponerPuntaje(id: string, puntaje: number) {
    guardar(orden, { ...puntajes, [id]: puntaje });
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
      <h4 className="text-xl font-black uppercase">Ronda de preguntas</h4>
      <p className="mt-2 text-sm text-white/60">
        Mira la respuesta en la TV y acomoda a cada candidata. Sube o baja su lugar y ponle un puntaje del 1 al 10.
      </p>

      {top5.length === 0 ? (
        <p className="mt-6 text-sm text-white/50">Aún no se anuncia el top 5 oficial.</p>
      ) : (
        <>
          <ol className="mt-6 space-y-3">
            {orden.map((id, i) => {
              const c = porId.get(id);
              if (!c) return null;
              const bandera = urlBandera(c.pais);
              const puntaje = puntajes[id];
              return (
                <li key={id} className="rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <span className="w-24 flex-none text-sm font-black uppercase text-[#facc15]">
                      {i + 1}.º {LUGARES[i]}
                    </span>
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
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{c.pais}</span>
                      <span className="block truncate text-xs text-white/50">{c.nombre}</span>
                    </span>
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => mover(i, -1)}
                      aria-label="Subir lugar"
                      className="rounded-full border border-white/15 px-3 py-1 text-sm transition hover:border-white disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={i === orden.length - 1}
                      onClick={() => mover(i, 1)}
                      aria-label="Bajar lugar"
                      className="rounded-full border border-white/15 px-3 py-1 text-sm transition hover:border-white disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {PUNTAJES.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => ponerPuntaje(id, n)}
                        className={`h-8 w-8 rounded-full border text-sm font-bold transition ${
                          puntaje === n
                            ? "border-[#facc15] bg-[#facc15] text-black"
                            : "border-white/15 text-white/70 hover:border-white"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={() => guardar([], {})}
            className="mt-6 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white"
          >
            Reiniciar
          </button>
        </>
      )}
    </div>
  );
}
