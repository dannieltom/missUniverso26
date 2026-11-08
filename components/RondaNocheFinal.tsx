"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Candidata } from "@/lib/tipos";
import { PUNTAJE_MAX, PUNTAJE_MIN, parsearPuntaje } from "@/lib/tipos";
import { urlBandera } from "@/lib/banderas";
import { truncarTexto } from "@/lib/formato";
import { TopOficialCompartido } from "@/components/TopOficialCompartido";
import { ComparacionTop } from "@/components/ComparacionTop";

// Noche final en cascada:
// 1. Tu top N1 sale de tu preliminar. Calificas baño y gala. Cuando se anuncia el top N1 oficial, se compara.
// 2. El grupo pasa a ser el top N1 oficial. Eliges tu top N2 de ahí, y cuando se anuncia el oficial, se compara.
// 3. Lo mismo con el top 5, y al final respuesta final y ganadora.
type Seccion = "banio" | "gala";
type Puntajes = Record<string, number>;

const CLAVE = {
  n1: "mu26-nf-n1",
  n2: "mu26-nf-n2",
  banio: "mu26-nf-banio",
  gala: "mu26-nf-gala",
  respuesta: "mu26-nf-respuesta",
  oficial1: "mu26-nf-oficial1",
  oficial2: "mu26-nf-oficial2",
  oficial3: "mu26-nf-oficial3",
  ganadora: "mu26-nf-ganadora",
};
// Claves de la versión anterior, para no perder lo ya marcado.
const CLAVE_ANTERIOR = { oficial1: "mu26-nf-oficial", oficial3: "mu26-nf-oficial5" };
const CLAVE_PRELIMINAR = { banio: "mu26-r2-banio", gala: "mu26-r2-gala" };

const ETIQUETA: Record<Seccion, string> = {
  banio: "Traje de baño",
  gala: "Traje de gala",
};

const TAMANOS = Array.from({ length: 125 }, (_, i) => i + 1);
const N1_POR_DEFECTO = 20;
const N2_POR_DEFECTO = 10;
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
  return valor === undefined ? "—" : truncarTexto(valor, decimales);
}

function Bandera({ pais }: { pais: string }) {
  const url = urlBandera(pais);
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-5 w-7 flex-none rounded-sm object-cover" />;
}

type Ranking = { id: string; total: number | undefined };

export function RondaNocheFinal({ candidatas }: { candidatas: Candidata[] }) {
  const [n1, setN1] = useState(N1_POR_DEFECTO);
  const [n2, setN2] = useState(N2_POR_DEFECTO);
  const [banio, setBanio] = useState<Puntajes>({});
  const [gala, setGala] = useState<Puntajes>({});
  const [respuesta, setRespuesta] = useState<Puntajes>({});
  const [oficial1, setOficial1] = useState<string[]>([]);
  const [oficial2, setOficial2] = useState<string[]>([]);
  const [oficial3, setOficial3] = useState<string[]>([]);
  const [ganadoraOficial, setGanadoraOficial] = useState("");
  const [prelimBanio, setPrelimBanio] = useState<Puntajes>({});
  const [prelimGala, setPrelimGala] = useState<Puntajes>({});
  const [seccion, setSeccion] = useState<Seccion>("banio");
  const [indice, setIndice] = useState(0);
  const [entrada, setEntrada] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [visibles, setVisibles] = useState(FILAS_INICIALES);
  const editorRef = useRef<HTMLDivElement>(null);

  // Recupera lo guardado en este navegador.
  useEffect(() => {
    setN1(leerJSON(CLAVE.n1, N1_POR_DEFECTO));
    setN2(leerJSON(CLAVE.n2, N2_POR_DEFECTO));
    setBanio(leerJSON<Puntajes>(CLAVE.banio, {}));
    setGala(leerJSON<Puntajes>(CLAVE.gala, {}));
    setRespuesta(leerJSON<Puntajes>(CLAVE.respuesta, {}));
    setOficial1(leerJSON<string[]>(CLAVE.oficial1, leerJSON<string[]>(CLAVE_ANTERIOR.oficial1, [])));
    setOficial2(leerJSON<string[]>(CLAVE.oficial2, []));
    setOficial3(leerJSON<string[]>(CLAVE.oficial3, leerJSON<string[]>(CLAVE_ANTERIOR.oficial3, [])));
    setGanadoraOficial(leerJSON<string>(CLAVE.ganadora, ""));
    setPrelimBanio(leerJSON<Puntajes>(CLAVE_PRELIMINAR.banio, {}));
    setPrelimGala(leerJSON<Puntajes>(CLAVE_PRELIMINAR.gala, {}));
    setListo(true);
  }, []);

  // Guarda cada cambio.
  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE.banio, JSON.stringify(banio));
    localStorage.setItem(CLAVE.gala, JSON.stringify(gala));
  }, [banio, gala, listo]);

  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE.respuesta, JSON.stringify(respuesta));
  }, [respuesta, listo]);

  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE.oficial1, JSON.stringify(oficial1));
    localStorage.setItem(CLAVE.oficial2, JSON.stringify(oficial2));
    localStorage.setItem(CLAVE.oficial3, JSON.stringify(oficial3));
    localStorage.setItem(CLAVE.ganadora, JSON.stringify(ganadoraOficial));
  }, [oficial1, oficial2, oficial3, ganadoraOficial, listo]);

  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE.n1, JSON.stringify(n1));
    localStorage.setItem(CLAVE.n2, JSON.stringify(n2));
  }, [n1, n2, listo]);

  // Total de cada candidata en la noche final: promedio de baño y gala (solo si tiene ambos).
  const totales = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const c of candidatas) {
      const b = banio[c.id];
      const g = gala[c.id];
      if (b !== undefined && g !== undefined) mapa.set(c.id, (b + g) / 2);
    }
    return mapa;
  }, [candidatas, banio, gala]);

  // Etapa 1: tu top N1 sale de la preliminar (baño + gala) / 2.
  const pool1 = useMemo(() => {
    return candidatas
      .map((c) => {
        const b = prelimBanio[c.id];
        const g = prelimGala[c.id];
        return { id: c.id, total: b !== undefined && g !== undefined ? (b + g) / 2 : undefined };
      })
      .filter((x): x is { id: string; total: number } => x.total !== undefined)
      .sort((a, b) => b.total - a.total)
      .slice(0, n1)
      .map((x) => x.id);
  }, [candidatas, prelimBanio, prelimGala, n1]);

  // Ordena un grupo por total de la noche final. Los que no tienen total van al final.
  function ordenar(ids: string[]): Ranking[] {
    return ids
      .map((id) => ({ id, total: totales.get(id) }))
      .sort((a, b) => {
        if (a.total !== undefined && b.total !== undefined) return b.total - a.total;
        if (a.total !== undefined) return -1;
        if (b.total !== undefined) return 1;
        return 0;
      });
  }

  function topDe(ranking: Ranking[], k: number): string[] {
    return ranking
      .filter((r) => r.total !== undefined)
      .slice(0, k)
      .map((r) => r.id);
  }

  // Etapa 2: el grupo es el top N1 oficial si ya se anunció; si no, tu top N1.
  const pool2 = oficial1.length > 0 ? oficial1 : pool1;
  const rank2 = useMemo(() => ordenar(pool2), [pool2, totales]); // eslint-disable-line react-hooks/exhaustive-deps
  const pred2 = topDe(rank2, n2);

  // Etapa 3: el grupo es el top N2 oficial si ya se anunció; si no, tu top N2.
  const pool3 = oficial2.length > 0 ? oficial2 : pred2;
  const rank3 = useMemo(() => ordenar(pool3), [pool3, totales]); // eslint-disable-line react-hooks/exhaustive-deps
  const pred3 = topDe(rank3, FINALISTAS);

  // Candidatas a las que se les pone puntaje: las que están en juego en alguna etapa.
  const enJuegoIds = useMemo(
    () => new Set([...pool1, ...oficial1, ...oficial2, ...oficial3]),
    [pool1, oficial1, oficial2, oficial3],
  );
  const enJuego = useMemo(() => candidatas.filter((c) => enJuegoIds.has(c.id)), [candidatas, enJuegoIds]);

  const rankJuego = useMemo(() => ordenar(enJuego.map((c) => c.id)), [enJuego, totales]); // eslint-disable-line react-hooks/exhaustive-deps
  const posicionJuego = new Map<string, number>();
  rankJuego
    .filter((r) => r.total !== undefined)
    .forEach((r, i) => posicionJuego.set(r.id, i + 1));

  const actual = enJuego[indice];
  const actualId = actual?.id;

  // Al cambiar de candidata o de sección, muestra su puntaje guardado.
  useEffect(() => {
    if (!actualId) return;
    const previo = (seccion === "banio" ? banio : gala)[actualId];
    setEntrada(previo !== undefined ? previo.toFixed(1) : "");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, seccion, actualId, listo]);

  const porId = useMemo(() => new Map(candidatas.map((c) => [c.id, c])), [candidatas]);

  function editarPuntaje(id: string, nueva: Seccion) {
    const posicion = enJuego.findIndex((c) => c.id === id);
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
    if (seccion === "banio") setBanio((p) => ({ ...p, [actual.id]: valor }));
    else setGala((p) => ({ ...p, [actual.id]: valor }));
    setError(null);
    setEntrada(valor.toFixed(1));
    if (indice < enJuego.length - 1) setIndice(indice + 1);
  }

  // Etapa final: respuesta final de las 5 oficiales.
  const grupoFinal = useMemo(() => candidatas.filter((c) => oficial3.includes(c.id)), [candidatas, oficial3]);
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
  const ganadoraUsuario = filasFinal[0]?.puntaje !== undefined ? filasFinal[0].candidata.id : "";

  function guardarRespuesta(id: string, texto: string) {
    const valor = parsearPuntaje(texto);
    if (valor === null) return;
    setRespuesta((previos) => ({ ...previos, [id]: valor }));
  }

  return (
    <div className="space-y-10">
      <TopOficialCompartido candidatas={candidatas} />
      <ComparacionTop candidatas={candidatas} />

      {/* Etapa 1: top N1 */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <h3 className="text-2xl font-black uppercase">Top {n1} de la preliminar</h3>
            <p className="mt-1 text-sm text-white/50">
              Según tu preliminar tienes {pool1.length} de {n1} listas.
            </p>
          </div>
          <label className="flex items-center gap-3 text-sm text-white/70">
            Top
            <select
              value={n1}
              onChange={(e) => {
                setN1(Number(e.target.value));
                setIndice(0);
              }}
              className="rounded-xl border border-white/15 bg-black/60 px-4 py-2 text-white outline-none focus:border-[#facc15]"
            >
              {TAMANOS.map((op) => (
                <option key={op} value={op} className="bg-black">
                  {op}
                </option>
              ))}
            </select>
          </label>
        </div>

        {enJuego.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-black/50 p-6 text-center text-white/70 backdrop-blur">
            Termina de calificar baño y gala en la ronda preliminar para armar tu top {n1}.
          </p>
        ) : (
          <>
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
                  {ETIQUETA[seccion]} · Candidata {indice + 1} de {enJuego.length}
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
                    {enJuego.map((c, i) => (
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
                    onClick={() => setIndice((i) => Math.min(enJuego.length - 1, i + 1))}
                    disabled={indice === enJuego.length - 1}
                    className="rounded-full border border-white/15 px-5 py-2 text-white/80 transition hover:border-white disabled:opacity-30"
                  >
                    Siguiente →
                  </button>
                </div>
              </section>
            </div>

            <section>
              <h4 className="mb-4 text-lg font-black uppercase">Calificaciones</h4>
              <ul className="space-y-2">
                <li className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem_4.5rem_5.5rem] gap-2 px-4 text-xs uppercase tracking-widest text-white/50">
                  <span>#</span>
                  <span>País</span>
                  <span className="text-right">Baño</span>
                  <span className="text-right">Gala</span>
                  <span className="text-right">Total</span>
                </li>
                {rankJuego.slice(0, visibles).map(({ id, total }) => {
                  const c = porId.get(id);
                  if (!c) return null;
                  return (
                    <li
                      key={id}
                      className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem_4.5rem_5.5rem] items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur transition-all duration-500"
                    >
                      <span className="font-black text-[#ed1c24]">{posicionJuego.get(id) ?? "—"}</span>
                      <span className="flex min-w-0 items-center gap-3">
                        <Bandera pais={c.pais} />
                        <span className="truncate font-semibold">{c.pais}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => editarPuntaje(id, "banio")}
                        className="text-right tabular-nums text-white/80 underline-offset-4 hover:text-[#facc15] hover:underline"
                      >
                        {formato(banio[id])}
                      </button>
                      <button
                        type="button"
                        onClick={() => editarPuntaje(id, "gala")}
                        className="text-right tabular-nums text-white/80 underline-offset-4 hover:text-[#facc15] hover:underline"
                      >
                        {formato(gala[id])}
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
                  Mostrando {Math.min(visibles, rankJuego.length)} de {rankJuego.length}
                </p>
                {visibles < rankJuego.length && (
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

        <Oficiales
          titulo={`Top ${n1} oficial`}
          descripcion={`Marca a las ${n1} candidatas que anunciaron.`}
          candidatas={candidatas}
          marcadas={oficial1}
          max={n1}
          setMarcadas={setOficial1}
        />

        {oficial1.length > 0 && (
          <Comparacion
            titulo={`Acertaste ${oficial1.filter((id) => pool1.includes(id)).length} de ${pool1.length} en el top ${n1}`}
            predicho={pool1}
            oficial={oficial1}
            porId={porId}
          />
        )}
      </section>

      {/* Etapa 2: top N2 dentro del grupo oficial de la etapa 1 */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <h3 className="text-2xl font-black uppercase">
              Top {n2} {oficial1.length > 0 ? `de las ${n1} oficiales` : `de tu top ${n1}`}
            </h3>
            <p className="mt-1 text-sm text-white/50">
              Elige tu top {n2} con los puntajes de la etapa anterior.
            </p>
          </div>
          <label className="flex items-center gap-3 text-sm text-white/70">
            Top
            <select
              value={n2}
              onChange={(e) => setN2(Number(e.target.value))}
              className="rounded-xl border border-white/15 bg-black/60 px-4 py-2 text-white outline-none focus:border-[#facc15]"
            >
              {TAMANOS.filter((op) => op <= pool2.length || op <= n2).map((op) => (
                <option key={op} value={op} className="bg-black">
                  {op}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Ranking2
          rank={rank2}
          predicho={pred2}
          porId={porId}
          k={n2}
        />

        <Oficiales
          titulo={`Top ${n2} oficial`}
          descripcion={`Marca a las ${n2} candidatas que anunciaron.`}
          candidatas={candidatas}
          marcadas={oficial2}
          max={n2}
          setMarcadas={setOficial2}
        />

        {oficial2.length > 0 && (
          <Comparacion
            titulo={`Acertaste ${oficial2.filter((id) => pred2.includes(id)).length} de ${pred2.length} en el top ${n2}`}
            predicho={pred2}
            oficial={oficial2}
            porId={porId}
          />
        )}
      </section>

      {/* Etapa 3: top 5 dentro del grupo oficial de la etapa 2 */}
      <section className="space-y-6">
        <h3 className="text-2xl font-black uppercase">
          Top {FINALISTAS} {oficial2.length > 0 ? `de las ${n2} oficiales` : `de tu top ${n2}`}
        </h3>

        <Ranking2 rank={rank3} predicho={pred3} porId={porId} k={FINALISTAS} />

        <Oficiales
          titulo={`Top ${FINALISTAS} oficial`}
          descripcion={`Marca a las ${FINALISTAS} finalistas. Al completarlas aparece la respuesta final.`}
          candidatas={candidatas}
          marcadas={oficial3}
          max={FINALISTAS}
          setMarcadas={setOficial3}
        />

        {oficial3.length > 0 && (
          <Comparacion
            titulo={`Acertaste ${oficial3.filter((id) => pred3.includes(id)).length} de ${FINALISTAS} en el top ${FINALISTAS}`}
            predicho={pred3}
            oficial={oficial3}
            porId={porId}
          />
        )}

        {oficial3.length > 0 && (
          <div>
            <h4 className="text-lg font-black uppercase">Ganadora oficial</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {oficial3.map((id) => {
                const c = porId.get(id);
                if (!c) return null;
                const marcada = ganadoraOficial === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setGanadoraOficial(marcada ? "" : id)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      marcada
                        ? "border-[#facc15] bg-[#facc15]/15 text-white"
                        : "border-white/10 text-white/60 hover:border-white/40"
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

        {oficial3.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-black uppercase">Preguntas</h4>
            <p className="text-sm text-white/50">
              Califica las preguntas de cada finalista del top 5 oficial. Tu ganadora es la de mayor puntaje.
              Marcadas: {oficial3.length} de {FINALISTAS}.
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
            {ganadoraOficial && (
              <p className="text-lg">
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
    </div>
  );
}

// Lista de candidatas de una etapa con su total. Las que están en el top del usuario van resaltadas.
function Ranking2({
  rank,
  predicho,
  porId,
  k,
}: {
  rank: Ranking[];
  predicho: string[];
  porId: Map<string, Candidata>;
  k: number;
}) {
  const setPredicho = new Set(predicho);
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/50">
        Tu top {k} aparece resaltado. Califica a quienes aún no tengan puntaje en la etapa de arriba.
      </p>
      <ul className="space-y-2">
        {rank.map(({ id, total }, i) => {
          const c = porId.get(id);
          if (!c) return null;
          const enTop = setPredicho.has(id);
          return (
            <li
              key={id}
              className={`grid grid-cols-[2.5rem_minmax(0,1fr)_5.5rem] items-center gap-2 rounded-2xl border px-4 py-3 ${
                enTop ? "border-[#facc15]/60 bg-[#facc15]/10" : "border-white/10 bg-black/50"
              }`}
            >
              <span className="font-black text-[#ed1c24]">{total !== undefined ? i + 1 : "—"}</span>
              <span className="flex min-w-0 items-center gap-3">
                <Bandera pais={c.pais} />
                <span className="truncate font-semibold">{c.pais}</span>
              </span>
              <span className="text-right text-lg font-black tabular-nums text-[#facc15]">
                {formato(total, 2)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Marcar a las candidatas que realmente quedaron en el top oficial de la etapa.
function Oficiales({
  titulo,
  descripcion,
  candidatas,
  marcadas,
  max,
  setMarcadas,
}: {
  titulo: string;
  descripcion: string;
  candidatas: Candidata[];
  marcadas: string[];
  max: number;
  setMarcadas: (v: string[]) => void;
}) {
  const set = new Set(marcadas);
  function alternar(id: string) {
    if (set.has(id)) setMarcadas(marcadas.filter((x) => x !== id));
    else if (marcadas.length < max) setMarcadas([...marcadas, id]);
  }
  return (
    <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
      <h4 className="text-xl font-black uppercase">{titulo}</h4>
      <p className="mt-2 text-sm text-white/50">
        {descripcion} Marcadas: {marcadas.length} de {max}. Se guardan en este navegador hasta que exista el panel de administrador.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
        {candidatas.map((c) => {
          const marcada = set.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => alternar(c.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                marcada
                  ? "border-[#facc15] bg-[#facc15]/15 text-white"
                  : "border-white/10 text-white/60 hover:border-white/40"
              }`}
            >
              <Bandera pais={c.pais} />
              <span className="truncate">{c.pais}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Compara lo que predijo el usuario con lo oficial.
function Comparacion({
  titulo,
  predicho,
  oficial,
  porId,
}: {
  titulo: string;
  predicho: string[];
  oficial: string[];
  porId: Map<string, Candidata>;
}) {
  const setOficial = new Set(oficial);
  const setPredicho = new Set(predicho);
  return (
    <div className="space-y-4">
      <h4 className="text-xl font-black uppercase">{titulo}</h4>
      <div className="grid gap-6 md:grid-cols-2">
        <ListaMarcada titulo={`Top oficial (${oficial.length})`} ids={oficial} referencia={setPredicho} porId={porId} />
        <ListaMarcada titulo={`Tu top (${predicho.length})`} ids={predicho} referencia={setOficial} porId={porId} />
      </div>
    </div>
  );
}

// Lista de un lado con ✓ si la otra lista la tiene, y ✗ si no.
function ListaMarcada({
  titulo,
  ids,
  referencia,
  porId,
}: {
  titulo: string;
  ids: string[];
  referencia: Set<string>;
  porId: Map<string, Candidata>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-5">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">{titulo}</p>
      <ul className="space-y-2">
        {ids.map((id) => {
          const c = porId.get(id);
          if (!c) return null;
          const acerto = referencia.has(id);
          return (
            <li key={id} className="flex items-center gap-3">
              <Bandera pais={c.pais} />
              <span className="flex-1 font-semibold">{c.pais}</span>
              <span className={`text-lg font-black ${acerto ? "text-emerald-400" : "text-red-400"}`}>
                {acerto ? "✓" : "✗"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
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
        {esGanadora && (
          <span className="rounded-full bg-[#facc15] px-3 py-1 text-xs font-black text-black">GANADORA</span>
        )}
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
