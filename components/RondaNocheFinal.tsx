"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Candidata } from "@/lib/tipos";
import { PUNTAJE_MAX, PUNTAJE_MIN, parsearPuntaje } from "@/lib/tipos";
import { urlBandera } from "@/lib/banderas";

// Semifinalistas de la noche final: las N mejores según tu preliminar (baño + gala) / 2.
// Se califican traje de baño y vestido de noche. Luego se compara con el top oficial.
type Seccion = "banio" | "noche";
type Puntajes = Record<string, number>;
type PorSeccion = Record<Seccion, Puntajes>;

const CLAVE = {
  banio: "mu26-nf-banio",
  noche: "mu26-nf-noche",
  oficial: "mu26-nf-oficial",
  n: "mu26-nf-n",
};
const CLAVE_PRELIMINAR = { banio: "mu26-r2-banio", gala: "mu26-r2-gala" };

const ETIQUETA: Record<Seccion, string> = {
  banio: "Traje de baño",
  noche: "Vestido de noche",
};

const OPCIONES_N = [10, 15, 20, 25, 30];
const N_POR_DEFECTO = 20;
const FILAS_INICIALES = 30;
const FILAS_POR_PAGINA = 20;

function leerJSON<T>(clave: string, respaldo: T): T {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? (JSON.parse(guardado) as T) : respaldo;
  } catch {
    return respaldo;
  }
}

function formato(valor: number | undefined, decimales = 1): string {
  return valor === undefined ? "—" : valor.toFixed(decimales);
}

export function RondaNocheFinal({ candidatas }: { candidatas: Candidata[] }) {
  const [n, setN] = useState(N_POR_DEFECTO);
  const [oficial, setOficial] = useState<string[]>([]);
  const [puntajes, setPuntajes] = useState<PorSeccion>({ banio: {}, noche: {} });
  const [prelim, setPrelim] = useState<{ banio: Puntajes; gala: Puntajes }>({
    banio: {},
    gala: {},
  });
  const [seccion, setSeccion] = useState<Seccion>("banio");
  const [indice, setIndice] = useState(0);
  const [entrada, setEntrada] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [visibles, setVisibles] = useState(FILAS_INICIALES);
  const editorRef = useRef<HTMLDivElement>(null);

  // Recupera lo guardado en este navegador.
  useEffect(() => {
    setN(leerJSON(CLAVE.n, N_POR_DEFECTO));
    setOficial(leerJSON<string[]>(CLAVE.oficial, []));
    setPuntajes({
      banio: leerJSON<Puntajes>(CLAVE.banio, {}),
      noche: leerJSON<Puntajes>(CLAVE.noche, {}),
    });
    setPrelim({
      banio: leerJSON<Puntajes>(CLAVE_PRELIMINAR.banio, {}),
      gala: leerJSON<Puntajes>(CLAVE_PRELIMINAR.gala, {}),
    });
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE.banio, JSON.stringify(puntajes.banio));
    localStorage.setItem(CLAVE.noche, JSON.stringify(puntajes.noche));
  }, [puntajes, listo]);

  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE.oficial, JSON.stringify(oficial));
  }, [oficial, listo]);

  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE.n, JSON.stringify(n));
  }, [n, listo]);

  // Top N predicho según la preliminar. Solo entran las candidatas con baño y gala calificados.
  const topPredicho = useMemo(() => {
    return candidatas
      .map((c) => {
        const banio = prelim.banio[c.id];
        const gala = prelim.gala[c.id];
        const total = banio !== undefined && gala !== undefined ? (banio + gala) / 2 : undefined;
        return { id: c.id, total };
      })
      .filter((x): x is { id: string; total: number } => x.total !== undefined)
      .sort((a, b) => b.total - a.total)
      .slice(0, n)
      .map((x) => x.id);
  }, [candidatas, prelim, n]);

  const idsPredichos = useMemo(() => new Set(topPredicho), [topPredicho]);

  // Grupo que se califica, en orden de desfile.
  const grupo = useMemo(() => candidatas.filter((c) => idsPredichos.has(c.id)), [candidatas, idsPredichos]);

  // Filas ordenadas por total (promedio de baño y vestido). Las que no tienen total van al final.
  const filas = useMemo(() => {
    const base = grupo.map((c) => {
      const banio = puntajes.banio[c.id];
      const noche = puntajes.noche[c.id];
      const total = banio !== undefined && noche !== undefined ? (banio + noche) / 2 : undefined;
      return { candidata: c, banio, noche, total };
    });
    return base.sort((a, b) => {
      if (a.total !== undefined && b.total !== undefined) return b.total - a.total;
      if (a.total !== undefined) return -1;
      if (b.total !== undefined) return 1;
      return 0;
    });
  }, [grupo, puntajes]);

  const posicionTotal = new Map<string, number>();
  filas.forEach((f, i) => {
    if (f.total !== undefined) posicionTotal.set(f.candidata.id, i + 1);
  });

  const actual = grupo[indice];
  const actualId = actual?.id;

  // Al cambiar de candidata o de sección, muestra el puntaje guardado (si existe).
  useEffect(() => {
    if (!actualId) return;
    const previo = puntajes[seccion][actualId];
    setEntrada(previo !== undefined ? previo.toFixed(1) : "");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, seccion, actualId, listo]);

  // Comparación con el top oficial.
  const oficialSet = useMemo(() => new Set(oficial), [oficial]);
  const aciertos = topPredicho.filter((id) => oficialSet.has(id));
  const fallos = topPredicho.filter((id) => !oficialSet.has(id));
  const escapadas = oficial.filter((id) => !idsPredichos.has(id));

  const porId = new Map(candidatas.map((c) => [c.id, c]));

  function alternarOficial(id: string) {
    setOficial((previos) =>
      previos.includes(id) ? previos.filter((x) => x !== id) : [...previos, id],
    );
  }

  function editarPuntaje(id: string, nueva: Seccion) {
    const posicion = grupo.findIndex((c) => c.id === id);
    if (posicion < 0) return;
    setSeccion(nueva);
    setIndice(posicion);
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function guardarPuntaje() {
    if (!actual) return;
    const valor = parsearPuntaje(entrada);
    if (valor === null) {
      setError(`Escribe un puntaje entre ${PUNTAJE_MIN.toFixed(1)} y ${PUNTAJE_MAX.toFixed(1)}.`);
      return;
    }
    setPuntajes((previos) => ({
      ...previos,
      [seccion]: { ...previos[seccion], [actual.id]: valor },
    }));
    setError(null);
    setEntrada(valor.toFixed(1));
    if (indice < grupo.length - 1) setIndice(indice + 1);
  }

  const faltan = n - topPredicho.length;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 text-sm text-white/70">
          Pasan al top
          <select
            value={n}
            onChange={(e) => {
              setN(Number(e.target.value));
              setIndice(0);
            }}
            className="rounded-xl border border-white/15 bg-black/60 px-4 py-2 text-white outline-none focus:border-[#facc15]"
          >
            {OPCIONES_N.map((op) => (
              <option key={op} value={op} className="bg-black">
                {op}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-white/50">
          Top {n} según tu preliminar: {topPredicho.length} de {n} listas
        </span>
      </div>

      {grupo.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-black/50 p-6 text-center text-white/70 backdrop-blur">
          Aún no hay candidatas para la noche final. Termina de calificar baño y gala en la ronda preliminar.
        </p>
      ) : (
        <>
          {faltan > 0 && (
            <p className="text-sm text-white/60">
              Faltan {faltan} candidatas por completar en la preliminar para tener tu top {n} completo.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {(["banio", "noche"] as Seccion[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSeccion(s);
                  setIndice(0);
                }}
                className={`rounded-full px-5 py-2 font-semibold transition ${
                  seccion === s
                    ? "bg-[#facc15] text-black"
                    : "border border-white/15 text-white/80 hover:border-white"
                }`}
              >
                {ETIQUETA[s]}
              </button>
            ))}
          </div>

          <div
            ref={editorRef}
            className="aparecer grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
          >
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

            <section className="flex flex-col rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-10">
              <div className="text-sm text-white/60">
                {ETIQUETA[seccion]} · Semifinalista {indice + 1} de {grupo.length}
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
                  {grupo.map((c, i) => (
                    <option key={c.id} value={i} className="bg-black">
                      {c.pais} · {c.nombre}
                    </option>
                  ))}
                </select>
              </label>

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
                  onClick={() => setIndice((i) => Math.max(0, i - 1))}
                  disabled={indice === 0}
                  className="rounded-full border border-white/15 px-5 py-2 text-white/80 transition hover:border-white disabled:opacity-30"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setIndice((i) => Math.min(grupo.length - 1, i + 1))}
                  disabled={indice === grupo.length - 1}
                  className="rounded-full border border-white/15 px-5 py-2 text-white/80 transition hover:border-white disabled:opacity-30"
                >
                  Siguiente →
                </button>
              </div>
            </section>
          </div>

          <section>
            <h3 className="mb-4 text-2xl font-black uppercase">Calificaciones del top {n}</h3>
            <ul className="space-y-2">
              <li className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem_4.5rem_5.5rem] gap-2 px-4 text-xs uppercase tracking-widest text-white/50">
                <span>#</span>
                <span>País</span>
                <span className="text-right">Baño</span>
                <span className="text-right">Noche</span>
                <span className="text-right">Total</span>
              </li>
              {filas.slice(0, visibles).map(({ candidata, banio, noche, total }) => {
                const url = urlBandera(candidata.pais);
                const posicion = posicionTotal.get(candidata.id);
                return (
                  <li
                    key={candidata.id}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem_4.5rem_5.5rem] items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur transition-all duration-500"
                  >
                    <span className="font-black text-[#ed1c24]">{posicion ?? "—"}</span>
                    <span className="flex min-w-0 items-center gap-3">
                      {url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="" className="h-5 w-7 flex-none rounded-sm object-cover" />
                      )}
                      <span className="truncate font-semibold">{candidata.pais}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => editarPuntaje(candidata.id, "banio")}
                      className="text-right tabular-nums text-white/80 underline-offset-4 hover:text-[#facc15] hover:underline"
                    >
                      {formato(banio)}
                    </button>
                    <button
                      type="button"
                      onClick={() => editarPuntaje(candidata.id, "noche")}
                      className="text-right tabular-nums text-white/80 underline-offset-4 hover:text-[#facc15] hover:underline"
                    >
                      {formato(noche)}
                    </button>
                    <span className="text-right text-lg font-black tabular-nums text-[#facc15]">
                      {formato(total, 2)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-sm text-white/50">
                Mostrando {Math.min(visibles, filas.length)} de {filas.length}
              </p>
              {visibles < filas.length && (
                <button
                  type="button"
                  onClick={() => setVisibles((v) => v + FILAS_POR_PAGINA)}
                  className="rounded-full border border-white/15 px-6 py-2 font-semibold text-white/80 transition hover:border-white"
                >
                  Ver más
                </button>
              )}
            </div>
          </section>
        </>
      )}

      <section className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
        <h3 className="text-2xl font-black uppercase">Top oficial de la noche</h3>
        <p className="mt-2 text-sm text-white/50">
          Marca las candidatas que realmente pasaron al top {n}. Se guardan en este navegador hasta
          que exista el panel de administrador.
        </p>
        <p className="mt-4 text-sm text-white/70">Oficiales marcadas: {oficial.length}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
          {candidatas.map((c) => {
            const marcada = oficialSet.has(c.id);
            const url = urlBandera(c.pais);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => alternarOficial(c.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                  marcada
                    ? "border-[#facc15] bg-[#facc15]/15 text-white"
                    : "border-white/10 text-white/60 hover:border-white/40"
                }`}
              >
                {url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-4 w-6 flex-none rounded-sm object-cover" />
                )}
                <span className="truncate">{c.pais}</span>
              </button>
            );
          })}
        </div>
      </section>

      {oficial.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-2xl font-black uppercase">
            Acertaste {aciertos.length} de {topPredicho.length}
          </h3>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/30 bg-black/50 p-5">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
                ✓ Sí pasaron ({aciertos.length})
              </p>
              <ul className="space-y-2">
                {aciertos.map((id) => (
                  <Fila key={id} candidata={porId.get(id)} />
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-red-400/30 bg-black/50 p-5">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-400">
                ✗ No pasaron ({fallos.length})
              </p>
              <ul className="space-y-2">
                {fallos.map((id) => (
                  <Fila key={id} candidata={porId.get(id)} />
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#facc15]/30 bg-black/50 p-5">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#facc15]">
                Pasaron y no las elegiste ({escapadas.length})
              </p>
              <ul className="space-y-2">
                {escapadas.map((id) => (
                  <Fila key={id} candidata={porId.get(id)} />
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Fila({ candidata }: { candidata: Candidata | undefined }) {
  if (!candidata) return null;
  const url = urlBandera(candidata.pais);
  return (
    <li className="flex items-center gap-3">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-5 w-7 flex-none rounded-sm object-cover" />
      )}
      <span className="font-semibold">{candidata.pais}</span>
    </li>
  );
}
