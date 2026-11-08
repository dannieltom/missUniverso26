"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Candidata } from "@/lib/tipos";
import { urlBandera } from "@/lib/banderas";
import { CLAVE_FINAL } from "@/lib/etapas";
import { NOMBRE_LUGAR_FINAL, PUNTOS_FINAL_POR_LUGAR } from "@/lib/puntajes";
import { guardarParticipacion } from "@/lib/participacion";

const SEPARACION = 12; // espacio entre filas (gap-3)
const VACIO: string[] = [];

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

type Props = {
  porId: Map<string, Candidata>;
  top5: string[];
  /** Solo en la vista del administrador: el orden oficial guardado y cómo guardarlo. */
  oficialGuardado?: string[];
  onGuardarOficial?: (ids: string[]) => void;
  trabajando?: boolean;
  mensaje?: string | null;
};

// Ronda final: arrastra a cada oficial hasta el lugar que crees que queda.
// Personal: tu orden se guarda y cuenta para el ranking. Oficial (admin): el orden real.
export function RondaFinal({ porId, top5, oficialGuardado, onGuardarOficial, trabajando = false, mensaje = null }: Props) {
  const esOficial = !!onGuardarOficial;
  const [guardadoPersonal, setGuardadoPersonal] = useState<string[]>(VACIO);
  const [orden, setOrden] = useState<string[]>(VACIO);
  const [arrastre, setArrastre] = useState<Arrastre | null>(null);
  const alturaFila = useRef(80);

  useEffect(() => {
    if (!esOficial) setGuardadoPersonal(leerOrden());
  }, [esOficial]);

  const guardadoBase = esOficial ? (oficialGuardado ?? VACIO) : guardadoPersonal;

  // Orden guardado, con las oficiales que vayan entrando al final.
  const ordenBase = useMemo(
    () => [...guardadoBase.filter((id) => top5.includes(id)), ...top5.filter((id) => !guardadoBase.includes(id))],
    [guardadoBase, top5],
  );

  useEffect(() => {
    setOrden(ordenBase);
  }, [ordenBase]);

  function guardarOrden(nuevo: string[]) {
    setOrden(nuevo);
    if (esOficial) return;
    setGuardadoPersonal(nuevo);
    localStorage.setItem(CLAVE_FINAL, JSON.stringify({ orden: nuevo }));
    void guardarParticipacion(
      "final",
      nuevo.map((id, i) => ({ candidata_id: id, orden: i + 1 })),
    );
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
    guardarOrden(orden);
  }

  const pendiente = esOficial && orden.join(",") !== ordenBase.join(",");

  return (
    <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
      <h4 className="text-xl font-black uppercase">{esOficial ? "Orden oficial de la final" : "Ronda de preguntas"}</h4>
      <p className="mt-2 text-sm text-white/60">
        {esOficial
          ? "Arrastra a las 5 en el orden oficial y guárdalo. Se ve en vivo para todos."
          : "Mira la respuesta en la TV y arrastra a cada candidata hasta el lugar que crees que queda. Usa el agarre (≡) de la izquierda."}
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
                  <span className="w-24 flex-none text-xs font-black uppercase leading-tight text-[#facc15]">
                    {NOMBRE_LUGAR_FINAL[i]}
                    {!esOficial && (
                      <span className="mt-1 block text-[10px] font-semibold normal-case text-white/50">
                        Acierto: {PUNTOS_FINAL_POR_LUGAR[i + 1]} pts
                      </span>
                    )}
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

          {esOficial ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={trabajando || !pendiente}
                onClick={() => onGuardarOficial?.(orden)}
                className="rounded-full bg-white px-6 py-2 font-bold text-black transition hover:bg-[#facc15] disabled:opacity-40"
              >
                Guardar orden oficial
              </button>
              {mensaje && <p className="text-sm text-red-400">{mensaje}</p>}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => guardarOrden([])}
              className="mt-6 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white"
            >
              Reiniciar orden
            </button>
          )}
        </>
      )}
    </div>
  );
}
