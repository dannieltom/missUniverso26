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
      <p className="rounded-2xl border border-white/10 bg-black/50 p-6 text-center text-white/70 backdrop-blur">
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

  const progreso = ((indice + 1) / candidatas.length) * 100;

  return (
    <div className="space-y-10">
      <div className="aparecer grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* Foto grande de la candidata */}
        <div className="relative min-h-[32rem] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0050f0]/40 via-black to-[#ed1c24]/40">
          {actual.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={actual.foto_url}
              alt={`Candidata ${actual.nombre}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm uppercase tracking-widest text-white/40">
              Sin foto
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6">
            <p className="text-sm uppercase tracking-widest text-[#facc15]">{actual.pais}</p>
            <h2 className="text-3xl font-black uppercase leading-tight sm:text-4xl">
              {actual.nombre}
            </h2>
          </div>
        </div>

        {/* Calificación */}
        <section className="flex flex-col rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-10">
          <div className="flex items-center justify-between text-sm text-white/60">
            <span>
              Candidata {indice + 1} de {candidatas.length}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ed1c24] via-[#facc15] to-[#0050f0] transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm uppercase tracking-widest text-white/60">
              Ir a un país
            </span>
            <select
              value={indice}
              onChange={(e) => setIndice(Number(e.target.value))}
              className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-white outline-none focus:border-[#facc15]"
            >
              {candidatas.map((c, i) => (
                <option key={c.id} value={i} className="bg-black">
                  {c.pais} · {c.nombre}
                </option>
              ))}
            </select>
          </label>

          {actual.descripcion && (
            <p className="mt-6 text-white/70">{actual.descripcion}</p>
          )}

          <form
            className="mt-8"
            onSubmit={(e) => {
              e.preventDefault();
              guardarPuntaje();
            }}
          >
            <label className="block">
              <span className="mb-2 block text-sm uppercase tracking-widest text-white/60">
                Puntaje ({PUNTAJE_MIN.toFixed(1)} a {PUNTAJE_MAX.toFixed(1)})
              </span>
              <input
                inputMode="decimal"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder="9.5"
                className="w-full rounded-2xl border border-white/15 bg-black/60 px-5 py-4 text-center text-6xl font-black tabular-nums text-[#facc15] outline-none transition placeholder:text-white/20 focus:border-[#facc15] focus:shadow-[0_0_30px_rgba(250,204,21,0.25)]"
              />
            </label>

            <button
              type="submit"
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#ed1c24] to-[#0050f0] px-6 py-4 text-lg font-bold uppercase tracking-wider text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
            >
              Guardar y seguir
            </button>
          </form>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <div className="mt-auto flex justify-between pt-8">
            <button
              type="button"
              onClick={anterior}
              disabled={indice === 0}
              className="rounded-full border border-white/15 px-5 py-2 text-white/80 transition hover:border-white disabled:opacity-30"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={siguiente}
              disabled={indice === candidatas.length - 1}
              className="rounded-full border border-white/15 px-5 py-2 text-white/80 transition hover:border-white disabled:opacity-30"
            >
              Siguiente →
            </button>
          </div>
        </section>
      </div>

      <section>
        <h3 className="mb-4 text-2xl font-black uppercase">Ranking</h3>
        {ranking.length === 0 ? (
          <p className="text-white/50">Aún no has calificado a ninguna candidata.</p>
        ) : (
          <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ranking.map(({ candidata, puntaje }, posicion) => (
              <li
                key={candidata.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/50 px-5 py-3 backdrop-blur"
              >
                <span className="min-w-0">
                  <span className="mr-3 font-black text-[#ed1c24]">{posicion + 1}</span>
                  <span className="font-semibold">{candidata.nombre}</span>{" "}
                  <span className="text-white/50">({candidata.pais})</span>
                </span>
                <span className="ml-4 flex-none text-xl font-black tabular-nums text-[#facc15]">
                  {puntaje.toFixed(1)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
