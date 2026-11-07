"use client";

import { useEffect, useMemo, useState } from "react";
import type { Candidata } from "@/lib/tipos";
import { PUNTAJE_MAX, PUNTAJE_MIN, parsearPuntaje } from "@/lib/tipos";

const CLAVE_STORAGE = "mu26-r1-desfile-traje-tipico";

type Puntajes = Record<string, number>;

export function RondaTipica({ candidatas }: { candidatas: Candidata[] }) {
  const [indice, setIndice] = useState(0);
  const [puntajes, setPuntajes] = useState<Puntajes>({});
  const [entrada, setEntrada] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  // Recupera los puntajes guardados en este navegador.
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE);
      if (guardado) setPuntajes(JSON.parse(guardado) as Puntajes);
    } catch {
      // Si el dato está dañado, se empieza de cero.
    }
    setListo(true);
  }, []);

  // Guarda los puntajes cada vez que cambian.
  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(puntajes));
  }, [puntajes, listo]);

  const actual = candidatas[indice];

  // Al cambiar de candidata, muestra su puntaje guardado (si existe).
  useEffect(() => {
    if (!actual) return;
    const previo = puntajes[actual.id];
    setEntrada(previo !== undefined ? previo.toFixed(1) : "");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, actual?.id]);

  const ranking = useMemo(() => {
    return candidatas
      .filter((c) => puntajes[c.id] !== undefined)
      .map((c) => ({ candidata: c, puntaje: puntajes[c.id] }))
      .sort((a, b) => b.puntaje - a.puntaje);
  }, [candidatas, puntajes]);

  if (candidatas.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 p-6 text-center text-white/70">
        Aún no hay candidatas cargadas.
      </p>
    );
  }

  function guardarPuntaje() {
    if (!actual) return;
    const valor = parsearPuntaje(entrada);
    if (valor === null) {
      setError(`Escribe un puntaje entre ${PUNTAJE_MIN.toFixed(1)} y ${PUNTAJE_MAX.toFixed(1)}.`);
      return;
    }
    setPuntajes((previos) => ({ ...previos, [actual.id]: valor }));
    setError(null);
    setEntrada(valor.toFixed(1));
    if (indice < candidatas.length - 1) setIndice(indice + 1);
  }

  function anterior() {
    setIndice((i) => Math.max(0, i - 1));
  }

  function siguiente() {
    setIndice((i) => Math.min(candidatas.length - 1, i + 1));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm text-white/50">
          Candidata {indice + 1} de {candidatas.length}
        </p>

        <div className="mt-3 flex gap-4">
          {actual.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={actual.foto_url}
              alt={`Candidata ${actual.nombre}`}
              className="h-32 w-24 flex-none rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-32 w-24 flex-none items-center justify-center rounded-xl bg-white/5 text-xs text-white/40">
              Sin foto
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold leading-tight">{actual.nombre}</h2>
            <p className="text-white/70">{actual.pais}</p>
            {actual.descripcion && (
              <p className="mt-2 text-sm text-white/60">{actual.descripcion}</p>
            )}
          </div>
        </div>

        <form
          className="mt-6 flex items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            guardarPuntaje();
          }}
        >
          <label className="flex-1">
            <span className="mb-1 block text-sm text-white/60">
              Puntaje ({PUNTAJE_MIN.toFixed(1)} a {PUNTAJE_MAX.toFixed(1)})
            </span>
            <input
              inputMode="decimal"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder="9.5"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-2xl font-semibold outline-none focus:border-fuchsia-400"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-fuchsia-500 px-5 py-3 font-semibold text-white active:scale-95"
          >
            Guardar
          </button>
        </form>

        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            onClick={anterior}
            disabled={indice === 0}
            className="rounded-lg px-3 py-2 text-white/70 disabled:opacity-30"
          >
            ← Anterior
          </button>
          <button
            type="button"
            onClick={siguiente}
            disabled={indice === candidatas.length - 1}
            className="rounded-lg px-3 py-2 text-white/70 disabled:opacity-30"
          >
            Siguiente →
          </button>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold">Ranking</h3>
        {ranking.length === 0 ? (
          <p className="text-sm text-white/50">Aún no has calificado a ninguna candidata.</p>
        ) : (
          <ol className="space-y-2">
            {ranking.map(({ candidata, puntaje }, posicion) => (
              <li
                key={candidata.id}
                className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-2"
              >
                <span>
                  <span className="mr-3 text-white/40">{posicion + 1}.</span>
                  {candidata.nombre}{" "}
                  <span className="text-white/50">({candidata.pais})</span>
                </span>
                <span className="font-semibold tabular-nums">{puntaje.toFixed(1)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
