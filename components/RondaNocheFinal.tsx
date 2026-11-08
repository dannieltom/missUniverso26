"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Candidata } from "@/lib/tipos";
import { PUNTAJE_MAX, PUNTAJE_MIN, parsearPuntaje } from "@/lib/tipos";
import { urlBandera } from "@/lib/banderas";

// Noche final en tres pasos:
// 1. Top N (según tu preliminar): se califica traje de baño y traje de gala.
// 2. Tu top 5 sale de esos puntajes. Cuando se anuncia el top 5 oficial, se califica la respuesta final de esas 5.
// 3. Se compara tu top 5 y tu ganadora con las oficiales.
type Seccion = "banio" | "gala";
type Puntajes = Record<string, number>;
type PorSeccion = Record<Seccion, Puntajes>;

const CLAVE = {
  banio: "mu26-nf-banio",
  gala: "mu26-nf-gala",
  respuesta: "mu26-nf-respuesta",
  oficial: "mu26-nf-oficial",
  oficial5: "mu26-nf-oficial5",
  ganadora: "mu26-nf-ganadora",
  n: "mu26-nf-n",
};
const CLAVE_PRELIMINAR = { banio: "mu26-r2-banio", gala: "mu26-r2-gala" };

const ETIQUETA: Record<Seccion, string> = {
  banio: "Traje de baño",
  gala: "Traje de gala",
};

const OPCIONES_N = Array.from({ length: 125 }, (_, i) => i + 1);
const N_POR_DEFECTO = 20;
const FINALISTAS = 5;
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

function Bandera({ pais }: { pais: string }) {
  const url = urlBandera(pais);
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-5 w-7 flex-none rounded-sm object-cover" />;
}

export function RondaNocheFinal({ candidatas }: { candidatas: Candidata[] }) {
  const [n, setN] = useState(N_POR_DEFECTO);
  const [puntajes, setPuntajes] = useState<PorSeccion>({ banio: {}, gala: {} });
  const [respuesta, setRespuesta] = useState<Puntajes>({});
  const [oficial, setOficial] = useState<string[]>([]);
  const [oficial5, setOficial5] = useState<string[]>([]);
  const [ganadoraOficial, setGanadoraOficial] = useState("");
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
    setPuntajes({
      banio: leerJSON<Puntajes>(CLAVE.banio, {}),
      gala: leerJSON<Puntajes>(CLAVE.gala, {}),
    });
    setRespuesta(leerJSON<Puntajes>(CLAVE.respuesta, {}));
    setOficial(leerJSON<string[]>(CLAVE.oficial, []));
    setOficial5(leerJSON<string[]>(CLAVE.oficial5, []));
    setGanadoraOficial(leerJSON<string>(CLAVE.ganadora, ""));
    setPrelim({
      banio: leerJSON<Puntajes>(CLAVE_PRELIMINAR.banio, {}),
      gala: leerJSON<Puntajes>(CLAVE_PRELIMINAR.gala, {}),
    });
    setListo(true);
  }, []);

  // Guarda cada cambio.
  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE.banio, JSON.stringify(puntajes.banio));
    localStorage.setItem(CLAVE.gala, JSON.stringify(puntajes.gala));
  }, [puntajes, listo]);

  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE.respuesta, JSON.stringify(respuesta));
  }, [respuesta, listo]);

  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE.oficial, JSON.stringify(oficial));
    localStorage.setItem(CLAVE.oficial5, JSON.stringify(oficial5));
    localStorage.setItem(CLAVE.ganadora, JSON.stringify(ganadoraOficial));
  }, [oficial, oficial5, ganadoraOficial, listo]);

  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE.n, JSON.stringify(n));
  }, [n, listo]);

  // Top N predicho según la preliminar: total (baño + gala) / 2, solo con ambos puntajes.
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

  const idsTop = useMemo(() => new Set(topPredicho), [topPredicho]);

  // Grupo que se califica en la noche final, en orden de desfile.
  const grupo = useMemo(() => candidatas.filter((c) => idsTop.has(c.id)), [candidatas, idsTop]);

  // Filas ordenadas por total de la noche final. Las que no tienen total van al final.
  const filas = useMemo(() => {
    const base = grupo.map((c) => {
      const banio = puntajes.banio[c.id];
      const gala = puntajes.gala[c.id];
      const total = banio !== undefined && gala !== undefined ? (banio + gala) / 2 : undefined;
      return { candidata: c, banio, gala, total };
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

  // Tu top 5: las 5 primeras con total de la noche final.
  const top5Usuario = filas.filter((f) => f.total !== undefined).slice(0, FINALISTAS).map((f) => f.candidata.id);

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

  // Respuesta final: solo para las 5 oficiales.
  const grupoFinal = useMemo(() => candidatas.filter((c) => oficial5.includes(c.id)), [candidatas, oficial5]);
  const filasFinal = useMemo(() => {
    return grupoFinal
      .map((c) => ({ candidata: c, puntaje: respuesta[c.id] }))
      .sort((a, b) => {
        if (a.puntaje !== undefined && b.puntaje !== undefined) return b.puntaje - a.puntaje;
        if (a.puntaje !== undefined) return -1;
        if (b.puntaje !== undefined) return 1;
        return 0;
      });
  }, [grupoFinal, respuesta]);

  // Tu ganadora: la de mayor respuesta final entre las 5 oficiales.
  const ganadoraUsuario = filasFinal[0]?.puntaje !== undefined ? filasFinal[0].candidata.id : "";

  // Comparaciones.
  const oficialSet = useMemo(() => new Set(oficial), [oficial]);
  const oficial5Set = useMemo(() => new Set(oficial5), [oficial5]);
  const aciertosTop = topPredicho.filter((id) => oficialSet.has(id));
  const fallosTop = topPredicho.filter((id) => !oficialSet.has(id));
  const escapadasTop = oficial.filter((id) => !idsTop.has(id));

  const aciertos5 = top5Usuario.filter((id) => oficial5Set.has(id));
  const fallos5 = top5Usuario.filter((id) => !oficial5Set.has(id));
  const escapadas5 = oficial5.filter((id) => !top5Usuario.includes(id));

  const porId = new Map(candidatas.map((c) => [c.id, c]));

  function alternar(lista: string[], setLista: (v: string[]) => void, id: string, max?: number) {
    if (lista.includes(id)) {
      setLista(lista.filter((x) => x !== id));
      return;
    }
    if (max !== undefined && lista.length >= max) return;
    setLista([...lista, id]);
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

  function guardarRespuesta(id: string, texto: string) {
    const valor = parsearPuntaje(texto);
    if (valor === null) return;
    setRespuesta((previos) => ({ ...previos, [id]: valor }));
  }

  const faltan = n - topPredicho.length;

  return (
    <div className="space-y-10">
      {/* Paso 1: top N */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 text-sm text-white/70">
          Top
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
          Según tu preliminar: {topPredicho.length} de {n} listas
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
            {(["banio", "gala"] as Seccion[]).map((s) => (
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

          <div ref={editorRef} className="aparecer grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
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
                {ETIQUETA[seccion]} · Candidata {indice + 1} de {grupo.length}
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
                <span className="text-right">Gala</span>
                <span className="text-right">Total</span>
              </li>
              {filas.slice(0, visibles).map(({ candidata, banio, gala, total }) => {
                const posicion = posicionTotal.get(candidata.id);
                return (
                  <li
                    key={candidata.id}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem_4.5rem_5.5rem] items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur transition-all duration-500"
                  >
                    <span className="font-black text-[#ed1c24]">{posicion ?? "—"}</span>
                    <span className="flex min-w-0 items-center gap-3">
                      <Bandera pais={candidata.pais} />
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
                      onClick={() => editarPuntaje(candidata.id, "gala")}
                      className="text-right tabular-nums text-white/80 underline-offset-4 hover:text-[#facc15] hover:underline"
                    >
                      {formato(gala)}
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

          <section className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
            <h3 className="text-2xl font-black uppercase">Tu top {FINALISTAS}</h3>
            {top5Usuario.length === 0 ? (
              <p className="mt-3 text-white/50">Califica baño y gala para ver tu top 5.</p>
            ) : (
              <ol className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
                {top5Usuario.map((id, i) => {
                  const c = porId.get(id);
                  return c ? (
                    <li key={id} className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3">
                      <span className="font-black text-[#ed1c24]">{i + 1}</span>
                      <Bandera pais={c.pais} />
                      <span className="font-semibold">{c.pais}</span>
                    </li>
                  ) : null;
                })}
              </ol>
            )}
          </section>
        </>
      )}

      {/* Resultados oficiales */}
      <section className="space-y-6 rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
        <div>
          <h3 className="text-2xl font-black uppercase">Top {n} oficial</h3>
          <p className="mt-2 text-sm text-white/50">
            Marca las candidatas que realmente pasaron. Se guardan en este navegador hasta que exista el panel de administrador.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
            {candidatas.map((c) => (
              <BotonMarca
                key={c.id}
                candidata={c}
                marcada={oficialSet.has(c.id)}
                onClick={() => alternar(oficial, setOficial, c.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-black uppercase">Top {FINALISTAS} oficial</h3>
          <p className="mt-2 text-sm text-white/50">
            Marca las 5 finalistas oficiales. Al completarlas aparece la respuesta final. Marcadas: {oficial5.length} de {FINALISTAS}.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
            {candidatas.map((c) => (
              <BotonMarca
                key={c.id}
                candidata={c}
                marcada={oficial5Set.has(c.id)}
                onClick={() => alternar(oficial5, setOficial5, c.id, FINALISTAS)}
              />
            ))}
          </div>
        </div>

        {oficial5.length > 0 && (
          <div>
            <h3 className="text-2xl font-black uppercase">Ganadora oficial</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {oficial5.map((id) => {
                const c = porId.get(id);
                if (!c) return null;
                const marcada = ganadoraOficial === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setGanadoraOficial(marcada ? "" : id)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      marcada ? "border-[#facc15] bg-[#facc15]/15 text-white" : "border-white/10 text-white/60 hover:border-white/40"
                    }`}
                  >
                    <Bandera pais={c.pais} />
                    {c.pais}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Paso 2: respuesta final de las 5 oficiales */}
      {oficial5.length === FINALISTAS && (
        <section className="space-y-6">
          <h3 className="text-2xl font-black uppercase">Respuesta final</h3>
          <p className="text-sm text-white/50">
            Califica la respuesta final de cada finalista. Tu ganadora es la de mayor puntaje.
          </p>
          <ul className="space-y-2">
            {filasFinal.map(({ candidata, puntaje }) => (
              <FilaRespuesta
                key={candidata.id}
                candidata={candidata}
                puntaje={puntaje}
                esGanadora={ganadoraUsuario === candidata.id}
                onGuardar={(texto) => guardarRespuesta(candidata.id, texto)}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Paso 3: comparación */}
      {(oficial.length > 0 || oficial5.length > 0) && (
        <section className="space-y-6">
          {oficial.length > 0 && (
            <div>
              <h3 className="text-2xl font-black uppercase">
                Acertaste {aciertosTop.length} de {topPredicho.length} en el top {n}
              </h3>
              <div className="mt-4 grid gap-6 md:grid-cols-3">
                <Columna titulo={`✓ Sí pasaron (${aciertosTop.length})`} color="text-emerald-400" ids={aciertosTop} porId={porId} />
                <Columna titulo={`✗ No pasaron (${fallosTop.length})`} color="text-red-400" ids={fallosTop} porId={porId} />
                <Columna titulo={`Pasaron y no las elegiste (${escapadasTop.length})`} color="text-[#facc15]" ids={escapadasTop} porId={porId} />
              </div>
            </div>
          )}

          {oficial5.length > 0 && (
            <div>
              <h3 className="text-2xl font-black uppercase">
                Tu top {FINALISTAS}: acertaste {aciertos5.length} de {FINALISTAS}
              </h3>
              <div className="mt-4 grid gap-6 md:grid-cols-3">
                <Columna titulo={`✓ Sí pasaron (${aciertos5.length})`} color="text-emerald-400" ids={aciertos5} porId={porId} />
                <Columna titulo={`✗ No pasaron (${fallos5.length})`} color="text-red-400" ids={fallos5} porId={porId} />
                <Columna titulo={`Pasaron y no las elegiste (${escapadas5.length})`} color="text-[#facc15]" ids={escapadas5} porId={porId} />
              </div>
              {ganadoraOficial && (
                <p className="mt-6 text-lg">
                  Tu ganadora: <span className="font-black text-[#facc15]">{porId.get(ganadoraUsuario)?.pais ?? "—"}</span>
                  {" · "}Oficial: <span className="font-black text-[#facc15]">{porId.get(ganadoraOficial)?.pais ?? "—"}</span>
                  {" · "}
                  {ganadoraUsuario === ganadoraOficial ? (
                    <span className="font-black text-emerald-400">¡Acertaste!</span>
                  ) : (
                    <span className="font-black text-red-400">No coincide</span>
                  )}
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function BotonMarca({
  candidata,
  marcada,
  onClick,
}: {
  candidata: Candidata;
  marcada: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
        marcada ? "border-[#facc15] bg-[#facc15]/15 text-white" : "border-white/10 text-white/60 hover:border-white/40"
      }`}
    >
      <Bandera pais={candidata.pais} />
      <span className="truncate">{candidata.pais}</span>
    </button>
  );
}

function Columna({
  titulo,
  color,
  ids,
  porId,
}: {
  titulo: string;
  color: string;
  ids: string[];
  porId: Map<string, Candidata>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-5">
      <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${color}`}>{titulo}</p>
      <ul className="space-y-2">
        {ids.map((id) => {
          const c = porId.get(id);
          return c ? (
            <li key={id} className="flex items-center gap-3">
              <Bandera pais={c.pais} />
              <span className="font-semibold">{c.pais}</span>
            </li>
          ) : null;
        })}
      </ul>
    </div>
  );
}

function FilaRespuesta({
  candidata,
  puntaje,
  esGanadora,
  onGuardar,
}: {
  candidata: Candidata;
  puntaje: number | undefined;
  esGanadora: boolean;
  onGuardar: (texto: string) => void;
}) {
  const [texto, setTexto] = useState(puntaje !== undefined ? puntaje.toFixed(1) : "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTexto(puntaje !== undefined ? puntaje.toFixed(1) : "");
  }, [puntaje]);

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-black/50 px-5 py-3">
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <Bandera pais={candidata.pais} />
        <span className="font-semibold">{candidata.pais}</span>
        {esGanadora && <span className="rounded-full bg-[#facc15] px-3 py-1 text-xs font-black text-black">GANADORA</span>}
      </span>
      <input
        inputMode="decimal"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="9.5"
        className="w-24 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-center text-xl font-black tabular-nums text-[#facc15] outline-none focus:border-[#facc15]"
      />
      <button
        type="button"
        onClick={() => {
          if (parsearPuntaje(texto) === null) {
            setError(`Entre ${PUNTAJE_MIN.toFixed(1)} y ${PUNTAJE_MAX.toFixed(1)}.`);
            return;
          }
          setError(null);
          onGuardar(texto);
        }}
        className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white"
      >
        Guardar
      </button>
      {error && <span className="text-sm text-red-400">{error}</span>}
    </li>
  );
}
