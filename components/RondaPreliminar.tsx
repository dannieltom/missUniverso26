"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Candidata } from "@/lib/tipos";
import { PUNTAJE_MAX, PUNTAJE_MIN, parsearPuntaje } from "@/lib/tipos";
import { urlBandera } from "@/lib/banderas";

// Primero desfilan en traje de baño. El traje de gala se puede calificar en cualquier momento.
type Seccion = "banio" | "gala";
type Puntajes = Record<string, number>;
type PuntajesPorSeccion = Record<Seccion, Puntajes>;

const CLAVE_STORAGE: Record<Seccion, string> = {
  banio: "mu26-r2-banio",
  gala: "mu26-r2-gala",
};

const ETIQUETA: Record<Seccion, string> = {
  banio: "Traje de baño",
  gala: "Traje de gala",
};

const FILAS_INICIALES = 30;
const FILAS_POR_PAGINA = 20;

function leerPuntajes(clave: string): Puntajes {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? (JSON.parse(guardado) as Puntajes) : {};
  } catch {
    return {};
  }
}

function formato(valor: number | undefined, decimales = 1): string {
  return valor === undefined ? "—" : valor.toFixed(decimales);
}

export function RondaPreliminar({ candidatas }: { candidatas: Candidata[] }) {
  const [seccion, setSeccion] = useState<Seccion>("banio");
  const [indice, setIndice] = useState(0);
  const [puntajes, setPuntajes] = useState<PuntajesPorSeccion>({ banio: {}, gala: {} });
  const [entrada, setEntrada] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [visibles, setVisibles] = useState(FILAS_INICIALES);
  const editorRef = useRef<HTMLDivElement>(null);

  // Recupera los puntajes guardados en este navegador.
  useEffect(() => {
    setPuntajes({
      banio: leerPuntajes(CLAVE_STORAGE.banio),
      gala: leerPuntajes(CLAVE_STORAGE.gala),
    });
    setListo(true);
  }, []);

  // Guarda los puntajes cada vez que cambian.
  useEffect(() => {
    if (!listo) return;
    localStorage.setItem(CLAVE_STORAGE.banio, JSON.stringify(puntajes.banio));
    localStorage.setItem(CLAVE_STORAGE.gala, JSON.stringify(puntajes.gala));
  }, [puntajes, listo]);

  // Total = promedio de baño y gala. Solo tienen total las candidatas con ambos puntajes.
  // Se ordena de mayor a menor total; las que aún no tienen total van al final, en orden de desfile.
  const filas = useMemo(() => {
    const base = candidatas.map((c) => {
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
  }, [candidatas, puntajes]);

  const actual = candidatas[indice];

  // Al cambiar de candidata o de sección, muestra el puntaje guardado (si existe).
  useEffect(() => {
    if (!actual) return;
    const previo = puntajes[seccion][actual.id];
    setEntrada(previo !== undefined ? previo.toFixed(1) : "");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, seccion, actual?.id, listo]);

  if (candidatas.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-black/50 p-6 text-center text-white/70 backdrop-blur">
        Aún no hay candidatas cargadas.
      </p>
    );
  }

  // Carga la candidata y la sección en el editor para corregir su puntaje.
  function editarPuntaje(id: string, nueva: Seccion) {
    const posicion = candidatas.findIndex((c) => c.id === id);
    if (posicion < 0) return;
    setSeccion(nueva);
    setIndice(posicion);
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cambiarSeccion(nueva: Seccion) {
    setSeccion(nueva);
    setIndice(0);
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
    if (indice < candidatas.length - 1) setIndice(indice + 1);
  }

  const progreso = ((indice + 1) / candidatas.length) * 100;
  const banioActual = actual ? puntajes.banio[actual.id] : undefined;
  const posicionTotal = new Map<string, number>();
  filas.forEach((f, i) => {
    if (f.total !== undefined) posicionTotal.set(f.candidata.id, i + 1);
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => cambiarSeccion("banio")}
          className={`rounded-full px-5 py-2 font-semibold transition ${
            seccion === "banio"
              ? "bg-[#facc15] text-black"
              : "border border-white/15 text-white/80 hover:border-white"
          }`}
        >
          Traje de baño
        </button>
        <button
          type="button"
          onClick={() => cambiarSeccion("gala")}
          className={`rounded-full px-5 py-2 font-semibold transition ${
            seccion === "gala"
              ? "bg-[#facc15] text-black"
              : "border border-white/15 text-white/80 hover:border-white"
          }`}
        >
          Traje de gala
        </button>
      </div>

      <div ref={editorRef} className="aparecer grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
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
              {ETIQUETA[seccion]} · Candidata {indice + 1} de {candidatas.length}
            </span>
            {seccion === "gala" && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">
                Baño:{" "}
                <span className="font-black tabular-nums text-[#facc15]">
                  {formato(banioActual)}
                </span>
              </span>
            )}
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

          {actual.descripcion && <p className="mt-6 text-white/70">{actual.descripcion}</p>}

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
              onClick={() => setIndice((i) => Math.min(candidatas.length - 1, i + 1))}
              disabled={indice === candidatas.length - 1}
              className="rounded-full border border-white/15 px-5 py-2 text-white/80 transition hover:border-white disabled:opacity-30"
            >
              Siguiente →
            </button>
          </div>
        </section>
      </div>

      <section>
        <h3 className="mb-4 text-2xl font-black uppercase">Calificaciones</h3>

        <ul className="space-y-2">
          <li className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem_4.5rem_5.5rem] gap-2 px-4 text-xs uppercase tracking-widest text-white/50">
            <span>#</span>
            <span>País</span>
            <span className="text-right">Baño</span>
            <span className="text-right">Gala</span>
            <span className="text-right">Total</span>
          </li>

          {filas.slice(0, visibles).map(({ candidata, banio, gala, total }) => {
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
                  title="Toca para corregir el puntaje de baño"
                  className="text-right tabular-nums text-white/80 underline-offset-4 hover:text-[#facc15] hover:underline"
                >
                  {formato(banio)}
                </button>
                <button
                  type="button"
                  onClick={() => editarPuntaje(candidata.id, "gala")}
                  title="Toca para corregir el puntaje de gala"
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
    </div>
  );
}
