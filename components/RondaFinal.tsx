"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Candidata } from "@/lib/tipos";
import { urlBandera } from "@/lib/banderas";
import { CLAVE_FINAL } from "@/lib/etapas";

const LUGARES = ["Ganadora", "Segunda", "Tercera", "Cuarta", "Quinta"];
const SEPARACION = 12; // espacio entre filas (gap-3)

type Arrastre = { id: string; inicio: number; indice: number; dy: number };

function leerOrden(): string[] {
  try {
    const guardado = localStorage.getItem(CLAVE_FINAL);
    const datos = guardado ? (JSON.parse(guardado) as { orden?: string[] }) : {};
    return Array.isArray(datos.orden) ? datos.orden : [];
  } catch {
    return [];
  }
}

// Ronda final: arrastra a cada oficial hasta el lugar que crees que queda (1.º a 5.º). Sin puntajes.
export function RondaFinal({ porId, top5 }: { porId: Map<string, Candidata>; top5: string[] }) {
  const [guardado, setGuardado] = useState<string[]>([]);
  const [orden, setOrden] = useState<string[]>([]);
  const [arrastre, setArrastre] = useState<Arrastre | null>(null);
  const alturaFila = useRef(80);

  useEffect(() => {
    setGuardado(leerOrden());
  }, []);

  // Tu orden guardado, con las oficiales que vayan entrando al final.
  const ordenBase = useMemo(
    () => [...guardado.filter((id) => top5.includes(id)), ...top5.filter((id) => !guardado.includes(id))],
    [guardado, top5],
  );

  useEffect(() => {
    setOrden(ordenBase);
  }, [ordenBase]);

  function guardar(nuevo: string[]) {
    setOrden(nuevo);
    setGuardado(nuevo);
    localStorage.setItem(CLAVE_FINAL, JSON.stringify({ orden: nuevo }));
  }

  function alPresionar(e: ReactPointerEvent<HTMLButtonElement>, id: string, indice: number) {
    e.preventDefault();
    const fila = e.currentTarget.closest("li");
    alturaFila.current = (fila?.offsetHeight ?? 80) + SEPARACION;
    e.currentTarget.setPointerCapture(e.pointerId);
    setArrastre({ id, inicio: e.clientY, indice, dy: 0 });
  }

  function alMover(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!arrastre) return;
    const dy = e.clientY - arrastre.inicio;
    const salto = Math.round(dy / alturaFila.current);
    const nuevoIndice = Math.min(orden.length - 1, Math.max(0, arrastre.indice + salto));

    if (nuevoIndice !== arrastre.indice) {
      // Cambia de lugar la fila y reinicia el punto de referencia para que siga bajo el dedo.
      const nuevo = [...orden];
      const [item] = nuevo.splice(arrastre.indice, 1);
      nuevo.splice(nuevoIndice, 0, item);
      setOrden(nuevo);
      const inicioNuevo = arrastre.inicio + (nuevoIndice - arrastre.indice) * alturaFila.current;
      setArrastre({ ...arrastre, indice: nuevoIndice, inicio: inicioNuevo, dy: e.clientY - inicioNuevo });
    } else {
      setArrastre({ ...arrastre, dy });
    }
  }

  function alSoltar() {
    if (!arrastre) return;
    setArrastre(null);
    guardar(orden);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
      <h4 className="text-xl font-black uppercase">Ronda de preguntas</h4>
      <p className="mt-2 text-sm text-white/60">
        Mira la respuesta en la TV y arrastra a cada candidata hasta el lugar que crees que queda. Usa el agarre (≡) de la izquierda.
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
              const arrastrando = arrastre?.id === id;
              return (
                <li
                  key={id}
                  style={arrastrando ? { transform: `translateY(${arrastre!.dy}px)` } : undefined}
                  className={`relative flex items-center gap-3 rounded-2xl border p-3 ${
                    arrastrando
                      ? "z-10 border-[#facc15] bg-black/90 shadow-xl"
                      : "border-white/10 transition-transform duration-200"
                  }`}
                >
                  <span className="w-20 flex-none text-xs font-black uppercase leading-tight text-[#facc15]">
                    {i + 1}.º
                    <br />
                    {LUGARES[i]}
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
                    aria-label={`Arrastrar ${c.pais}`}
                    onPointerDown={(e) => alPresionar(e, id, i)}
                    onPointerMove={alMover}
                    onPointerUp={alSoltar}
                    onPointerCancel={alSoltar}
                    style={{ touchAction: "none" }}
                    className="flex h-12 w-12 flex-none cursor-grab items-center justify-center rounded-xl border border-white/15 text-xl text-white/70 active:cursor-grabbing"
                  >
                    ≡
                  </button>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={() => guardar([])}
            className="mt-6 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white"
          >
            Reiniciar orden
          </button>
        </>
      )}
    </div>
  );
}
