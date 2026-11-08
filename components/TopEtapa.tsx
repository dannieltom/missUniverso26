"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import type { Candidata } from "@/lib/tipos";
import { urlBandera } from "@/lib/banderas";
import { CLAVE_BANIO, CLAVE_GALA, clavePick, type EtapaClave } from "@/lib/etapas";
import { guardarParticipacion } from "@/lib/participacion";

function sinAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function leerPuntajes(clave: string): Record<string, number> {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? (JSON.parse(guardado) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

// Una candidata: número, bandera, foto pequeña, país y nombre.
function FilaCandidata({
  c,
  numero,
  derecha,
  colorNumero = "text-[#ed1c24]",
}: {
  c: Candidata;
  numero?: number;
  derecha?: ReactNode;
  colorNumero?: string;
}) {
  const bandera = urlBandera(c.pais);
  return (
    <li className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm">
      {numero !== undefined && (
        <span className={`w-7 flex-none text-right font-black ${colorNumero}`}>{numero}.</span>
      )}
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
      {derecha}
    </li>
  );
}

// Buscador: escribe "col" y aparecen los países que coinciden.
function Buscador({
  pool,
  excluir,
  deshabilitado,
  onElegir,
}: {
  pool: Candidata[];
  excluir: Set<string>;
  deshabilitado: boolean;
  onElegir: (id: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const coincidencias = useMemo(() => {
    const q = sinAcentos(texto.trim());
    if (!q) return [];
    return pool
      .filter((c) => !excluir.has(c.id) && (sinAcentos(c.pais).includes(q) || sinAcentos(c.nombre).includes(q)))
      .slice(0, 8);
  }, [texto, pool, excluir]);

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={texto}
        disabled={deshabilitado}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={deshabilitado ? "Ya está completo" : "Escribe un país, ej. col"}
        className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2 text-white outline-none focus:border-[#facc15] disabled:opacity-40"
      />
      {coincidencias.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {coincidencias.map((c) => {
            const bandera = urlBandera(c.pais);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    onElegir(c.id);
                    setTexto("");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-2 text-left text-sm transition hover:border-[#facc15]"
                >
                  {bandera && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bandera} alt="" className="h-5 w-7 flex-none rounded-sm object-cover" />
                  )}
                  <span className="font-semibold">{c.pais}</span>
                  <span className="truncate text-white/50">{c.nombre}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export type AnteriorInfo = { etiqueta: string; tamano: number; cantidad: number; completo: boolean };

type Props = {
  clave: EtapaClave;
  tamano: number;
  oficial: string[];
  anterior: AnteriorInfo | null;
  /** Candidatas entre las que se puede elegir (la etapa anterior oficial, o todas en la inicial). */
  pool: Candidata[];
  candidatas: Candidata[];
  porId: Map<string, Candidata>;
  soyAdmin: boolean;
  trabajando: boolean;
  mensaje: string | null;
  enviarAdmin: (payload: Record<string, unknown>) => Promise<boolean>;
};

// Una etapa completa: top oficial a un lado, tu top al otro, y abajo el resumen de aciertos.
export function TopEtapa({
  clave,
  tamano,
  oficial,
  anterior,
  pool,
  candidatas,
  porId,
  soyAdmin,
  trabajando,
  mensaje,
  enviarAdmin,
}: Props) {
  const esInicial = clave === "inicial";
  const [miTop, setMiTop] = useState<string[]>([]);
  const [tamanoPendiente, setTamanoPendiente] = useState(tamano);

  useEffect(() => {
    setTamanoPendiente(tamano);
  }, [tamano]);

  // Tu top: en la inicial sale de la preliminar; en las demás lo armas tú con el oficial anterior.
  useEffect(() => {
    if (esInicial) {
      const banio = leerPuntajes(CLAVE_BANIO);
      const gala = leerPuntajes(CLAVE_GALA);
      const ordenados = candidatas
        .map((c) => ({
          id: c.id,
          total: banio[c.id] !== undefined && gala[c.id] !== undefined ? (banio[c.id] + gala[c.id]) / 2 : undefined,
        }))
        .filter((x): x is { id: string; total: number } => x.total !== undefined)
        .sort((a, b) => b.total - a.total)
        .map((x) => x.id);
      setMiTop(ordenados.slice(0, tamano));
      if (ordenados.length > 0) {
        void guardarParticipacion(
          "inicial",
          ordenados.slice(0, tamano).map((id) => ({ candidata_id: id })),
        );
      }
      return;
    }
    try {
      const guardado = localStorage.getItem(clavePick(clave));
      setMiTop(guardado ? (JSON.parse(guardado) as string[]) : []);
    } catch {
      setMiTop([]);
    }
  }, [esInicial, clave, tamano, candidatas]);

  function guardarMiTop(nuevo: string[]) {
    setMiTop(nuevo);
    if (!esInicial) localStorage.setItem(clavePick(clave), JSON.stringify(nuevo));
    void guardarParticipacion(
      clave,
      nuevo.map((id) => ({ candidata_id: id })),
    );
  }

  const enOficial = new Set(oficial);
  const completo = oficial.length >= tamano;
  const picks = miTop.slice(0, tamano);
  const aciertos = picks.filter((id) => enOficial.has(id));
  const fallos = picks.filter((id) => !enOficial.has(id));
  // ---------- Administrador ----------
  const bloqueAdmin = soyAdmin ? (
      <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
        <h4 className="text-xl font-black uppercase">Top {tamano} oficial</h4>
        <p className="mt-2 text-sm text-white/50">
          Marcadas: {oficial.length} de {tamano}. Se ve en vivo para todos.
        </p>

        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm text-white/70">
              Tamaño de este top
              <input
                type="number"
                min={1}
                value={tamanoPendiente}
                onChange={(e) => setTamanoPendiente(Math.max(1, Number(e.target.value)))}
                className="w-28 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-[#facc15]"
              />
            </label>
            <button
              type="button"
              disabled={trabajando || tamanoPendiente === tamano}
              onClick={() => enviarAdmin({ accion: "fijar_tamano", tamano: tamanoPendiente })}
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white disabled:opacity-40"
            >
              Guardar tamaño
            </button>
          </div>

          {anterior ? (
            <div className="space-y-3">
              <p className="text-sm text-white/70">
                Toca las candidatas que pasan al top oficial. Marcadas: {oficial.length} de {tamano}.
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {pool.map((c) => {
                  const marcada = enOficial.has(c.id);
                  const bloqueada = trabajando || (!marcada && completo);
                  const bandera = urlBandera(c.pais);
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        disabled={bloqueada}
                        onClick={() =>
                          enviarAdmin(
                            marcada ? { accion: "quitar", candidata_id: c.id } : { accion: "agregar", candidata_id: c.id },
                          )
                        }
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition disabled:opacity-30 ${
                          marcada ? "border-[#ed1c24] bg-[#ed1c24]/10" : "border-white/10 hover:border-white"
                        }`}
                      >
                        <span className={`w-5 flex-none font-black ${marcada ? "text-[#ed1c24]" : "text-white/20"}`}>
                          {marcada ? "✓" : "○"}
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
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-white/70">Agregar al top oficial</p>
              <Buscador
                pool={pool}
                excluir={enOficial}
                deshabilitado={completo || trabajando}
                onElegir={(id) => enviarAdmin({ accion: "agregar", candidata_id: id })}
              />
            </div>
          )}

          {oficial.length === 0 ? (
            <p className="text-sm text-white/50">Todavía no hay candidatas marcadas.</p>
          ) : (
            <ol className="space-y-2">
              {oficial.map((id, i) => {
                const c = porId.get(id);
                if (!c) return null;
                return (
                  <FilaCandidata
                    key={id}
                    c={c}
                    numero={i + 1}
                    derecha={
                      <button
                        type="button"
                        disabled={trabajando}
                        onClick={() => enviarAdmin({ accion: "quitar", candidata_id: id })}
                        className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-white disabled:opacity-40"
                      >
                        Quitar
                      </button>
                    }
                  />
                );
              })}
            </ol>
          )}

          {oficial.length > 0 && (
            <button
              type="button"
              disabled={trabajando}
              onClick={() => {
                if (window.confirm("¿Borrar todo este top oficial?")) enviarAdmin({ accion: "limpiar" });
              }}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white disabled:opacity-40"
            >
              Borrar todo
            </button>
          )}

          {mensaje && <p className="text-sm text-red-400">{mensaje}</p>}
        </div>
      </div>
    ) : null;

  // ---------- Participantes (también las ve el admin, para armar su propio top) ----------
  const pickearDisponible = !esInicial && !!anterior;
  // Puedes elegir de las candidatas que ya salieron en el top anterior, aunque no esté completo.
  const poolBloqueado = pickearDisponible && pool.length === 0;

  return (
    <div className="space-y-6">
    {bloqueAdmin}
    <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
      <h4 className="text-xl font-black uppercase">Top {tamano}</h4>

      {pickearDisponible && (
        <div className="mt-5 space-y-3 rounded-2xl border border-white/10 p-4">
          <p className="text-sm text-white/70">
            Arma tu top {tamano} con candidatas del {anterior!.etiqueta} oficial. Marcadas: {picks.length} de {tamano}.
          </p>
          {poolBloqueado ? (
            <p className="text-sm text-white/50">
              Todavía no hay candidatas oficiales en el {anterior!.etiqueta}.
            </p>
          ) : (
            <>
              {!anterior!.completo && (
                <p className="text-sm text-white/50">
                  Van {anterior!.cantidad} de {anterior!.tamano} en el {anterior!.etiqueta} oficial. Puedes elegir de las que ya salieron.
                </p>
              )}
              <p className="text-sm text-white/70">
                Toca las {tamano} que crees que entran. Llevas {picks.length} de {tamano}.
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {pool.map((c) => {
                  const elegida = picks.includes(c.id);
                  const lleno = picks.length >= tamano && !elegida;
                  const bandera = urlBandera(c.pais);
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        disabled={lleno}
                        onClick={() =>
                          guardarMiTop(elegida ? picks.filter((x) => x !== c.id) : [...picks, c.id])
                        }
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition disabled:opacity-30 ${
                          elegida ? "border-[#facc15] bg-[#facc15]/10" : "border-white/10 hover:border-white"
                        }`}
                      >
                        <span className={`w-5 flex-none font-black ${elegida ? "text-[#facc15]" : "text-white/20"}`}>
                          {elegida ? "✓" : "○"}
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
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          {picks.length > 0 && (
            <button
              type="button"
              onClick={() => guardarMiTop([])}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white"
            >
              Vaciar mi top
            </button>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-white/60">
        Aciertos: {aciertos.length} de {tamano}
        {!completo && " (se va actualizando conforme se anuncian)"}
      </p>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-4">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Top {tamano} oficial</p>
          {oficial.length === 0 ? (
            <p className="text-sm text-white/50">Aún no se anuncia.</p>
          ) : (
            <ol className="space-y-2">
              {oficial.map((id, i) => {
                const c = porId.get(id);
                if (!c) return null;
                return <FilaCandidata key={id} c={c} numero={i + 1} />;
              })}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Tu top {tamano}</p>
          {esInicial && picks.length === 0 ? (
            <p className="text-sm text-white/50">Termina de calificar baño y gala en la preliminar para armar tu top {tamano}.</p>
          ) : picks.length === 0 ? (
            <p className="text-sm text-white/50">Todavía no eliges candidatas.</p>
          ) : (
            <ol className="space-y-2">
              {picks.map((id, i) => {
                const c = porId.get(id);
                if (!c) return null;
                const acerto = enOficial.has(id);
                const marca = acerto ? "✓" : completo ? "✗" : null;
                const derecha: ReactNode =
                  marca !== null ? (
                    <span className={`w-6 text-center text-lg font-black ${acerto ? "text-emerald-400" : "text-red-400"}`}>
                      {marca}
                    </span>
                  ) : !esInicial ? (
                    <button
                      type="button"
                      onClick={() => guardarMiTop(picks.filter((x) => x !== id))}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-white"
                    >
                      Quitar
                    </button>
                  ) : null;
                return <FilaCandidata key={id} c={c} numero={i + 1} colorNumero="text-white/50" derecha={derecha} />;
              })}
            </ol>
          )}
        </div>
      </div>

      {completo && picks.length > 0 && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-400/30 p-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">Acertaste ({aciertos.length})</p>
            {aciertos.length === 0 ? (
              <p className="text-sm text-white/50">Ninguna.</p>
            ) : (
              <ol className="space-y-2">
                {aciertos.map((id) => {
                  const c = porId.get(id);
                  return c ? <FilaCandidata key={id} c={c} /> : null;
                })}
              </ol>
            )}
          </div>
          <div className="rounded-2xl border border-red-400/30 p-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-400">No acertaste ({fallos.length})</p>
            {fallos.length === 0 ? (
              <p className="text-sm text-white/50">Ninguna.</p>
            ) : (
              <ol className="space-y-2">
                {fallos.map((id) => {
                  const c = porId.get(id);
                  return c ? <FilaCandidata key={id} c={c} /> : null;
                })}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
