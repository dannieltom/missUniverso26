"use client";

import { useEffect, useMemo, useState } from "react";
import type { Candidata } from "@/lib/tipos";
import { urlBandera } from "@/lib/banderas";
import { supabaseNavegador } from "@/lib/supabase-navegador";

const ANIO = 2026;
const CORTE_POR_DEFECTO = 12;

function sinAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Lista numerada con bandera, foto pequeña, país y nombre.
function ListaTop({ ids, porId, onQuitar }: { ids: string[]; porId: Map<string, Candidata>; onQuitar?: (id: string) => void }) {
  if (ids.length === 0) return <p className="text-sm text-white/50">Todavía no hay candidatas marcadas.</p>;
  return (
    <ol className="space-y-2">
      {ids.map((id, i) => {
        const c = porId.get(id);
        if (!c) return null;
        const bandera = urlBandera(c.pais);
        return (
          <li key={id} className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2">
            <span className="w-7 flex-none text-right font-black text-[#ed1c24]">{i + 1}.</span>
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
            {onQuitar && (
              <button
                type="button"
                onClick={() => onQuitar(id)}
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-white"
              >
                Quitar
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// Buscador: escribe "col" y aparecen los países que coinciden, para elegir rápido.
function Buscador({
  candidatas,
  excluir,
  deshabilitado,
  onElegir,
}: {
  candidatas: Candidata[];
  excluir: Set<string>;
  deshabilitado: boolean;
  onElegir: (id: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const coincidencias = useMemo(() => {
    const q = sinAcentos(texto.trim());
    if (!q) return [];
    return candidatas
      .filter((c) => !excluir.has(c.id) && (sinAcentos(c.pais).includes(q) || sinAcentos(c.nombre).includes(q)))
      .slice(0, 8);
  }, [texto, candidatas, excluir]);

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={texto}
        disabled={deshabilitado}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={deshabilitado ? "Ya completaste el top" : "Escribe un país, ej. col"}
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

export function TopOficialCompartido({ candidatas }: { candidatas: Candidata[] }) {
  const [corte, setCorte] = useState(CORTE_POR_DEFECTO);
  const [filas, setFilas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Hacer mi propio top (solo en este navegador)
  const [personalAbierto, setPersonalAbierto] = useState(false);
  const [propio, setPropio] = useState<string[]>([]);

  // Administrador (en modo admin no aparece "Hacer top oficial", porque ya eres tú quien lo define)
  const [adminAbierto, setAdminAbierto] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [pin, setPin] = useState("");
  const [cortePendiente, setCortePendiente] = useState(CORTE_POR_DEFECTO);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const porId = useMemo(() => new Map(candidatas.map((c) => [c.id, c])), [candidatas]);
  const clavePropio = `mu26-top-propio-${ANIO}-${corte}`;

  // Tamaño y top oficial, en vivo.
  useEffect(() => {
    const db = supabaseNavegador();
    if (!db) {
      setError("Falta configurar Supabase en .env.local.");
      return;
    }
    let cancelado = false;

    async function cargar() {
      const [cfg, top] = await Promise.all([
        db!.from("top_oficial_config").select("corte").eq("anio", ANIO).maybeSingle(),
        db!.from("top_oficial").select("candidata_id, orden").eq("anio", ANIO).order("orden", { ascending: true }),
      ]);
      if (cancelado) return;
      if (cfg.error || top.error) {
        setError(`No se pudo cargar el top oficial: ${(cfg.error ?? top.error)?.message}`);
        return;
      }
      setError(null);
      const nuevoCorte = cfg.data?.corte ?? CORTE_POR_DEFECTO;
      setCorte(nuevoCorte);
      setCortePendiente(nuevoCorte);
      setFilas(((top.data ?? []) as { candidata_id: string; orden: number }[]).map((f) => f.candidata_id));
    }

    cargar();
    const canal = db
      .channel(`top-oficial-${ANIO}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "top_oficial" }, () => cargar())
      .on("postgres_changes", { event: "*", schema: "public", table: "top_oficial_config" }, () => cargar())
      .subscribe();

    return () => {
      cancelado = true;
      db.removeChannel(canal);
    };
  }, []);

  // Recuerda en este navegador si ya entraste como administrador.
  useEffect(() => {
    setEsAdmin(localStorage.getItem("mu26-admin") === "1");
  }, []);

  // Mi top de este navegador para el tamaño actual.
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(clavePropio);
      setPropio(guardado ? (JSON.parse(guardado) as string[]) : []);
    } catch {
      setPropio([]);
    }
  }, [clavePropio]);

  function guardarPropio(nuevo: string[]) {
    setPropio(nuevo);
    localStorage.setItem(clavePropio, JSON.stringify(nuevo));
  }

  async function enviarAdmin(payload: Record<string, unknown>): Promise<boolean> {
    setTrabajando(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/top-oficial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, anio: ANIO, corte, ...payload }),
      });
      const datos = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMensaje(datos.error ?? "Error al guardar.");
        return false;
      }
      return true;
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
      return false;
    } finally {
      setTrabajando(false);
    }
  }

  const completoPropio = propio.length >= corte;
  const completoOficial = filas.length >= corte;

  return (
    <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
      <h4 className="text-xl font-black uppercase">Top {corte} oficial {ANIO}</h4>
      <p className="mt-2 text-sm text-white/50">
        Se actualiza en vivo. Marcadas: {filas.length} de {corte}.
      </p>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6">
        <ListaTop ids={filas} porId={porId} />
      </div>

      {!esAdmin && (
      <div className="mt-8 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={() => setPersonalAbierto((v) => !v)}
          className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white"
        >
          {personalAbierto ? "Cerrar" : "Hacer top oficial"}
        </button>

        {personalAbierto && (
          <div className="mt-5 space-y-4 rounded-2xl border border-white/10 p-5">
            <p className="text-sm text-white/60">
              Tu versión personal del top {corte}. Solo la ves tú, en este navegador. Marcadas: {propio.length} de {corte}.
            </p>
            <Buscador
              candidatas={candidatas}
              excluir={new Set(propio)}
              deshabilitado={completoPropio}
              onElegir={(id) => guardarPropio([...propio, id])}
            />
            <ListaTop ids={propio} porId={porId} onQuitar={(id) => guardarPropio(propio.filter((x) => x !== id))} />
            {propio.length > 0 && (
              <button
                type="button"
                onClick={() => guardarPropio([])}
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white"
              >
                Vaciar mi top
              </button>
            )}
          </div>
        )}
      </div>
      )}

      <details
        open={adminAbierto}
        onToggle={(e) => setAdminAbierto((e.target as HTMLDetailsElement).open)}
        className="mt-8 rounded-2xl border border-white/10 p-4"
      >
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-white/40">
          Administrador
        </summary>

        <div className="mt-4 space-y-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm text-white/70">
              PIN
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-56 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-[#facc15]"
              />
            </label>
            {esAdmin ? (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("mu26-admin");
                  setEsAdmin(false);
                  setPin("");
                }}
                className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white"
              >
                Salir del modo admin
              </button>
            ) : (
              <button
                type="button"
                disabled={!pin || trabajando}
                onClick={async () => {
                  const ok = await enviarAdmin({ accion: "verificar" });
                  if (ok) {
                    localStorage.setItem("mu26-admin", "1");
                    setEsAdmin(true);
                  }
                }}
                className="rounded-full bg-[#facc15] px-5 py-2 font-bold text-black transition hover:brightness-110 disabled:opacity-40"
              >
                Entrar como administrador
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm text-white/70">
              Tamaño del top oficial
              <input
                type="number"
                min={1}
                value={cortePendiente}
                onChange={(e) => setCortePendiente(Math.max(1, Number(e.target.value)))}
                className="w-28 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-[#facc15]"
              />
            </label>
            <button
              type="button"
              disabled={!pin || trabajando || cortePendiente === corte}
              onClick={() => enviarAdmin({ accion: "fijar_corte", corte: cortePendiente })}
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white disabled:opacity-40"
            >
              Guardar tamaño
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-white/70">Agregar al top oficial (se ve en vivo para todos)</p>
            <Buscador
              candidatas={candidatas}
              excluir={new Set(filas)}
              deshabilitado={!pin || completoOficial || trabajando}
              onElegir={(id) => enviarAdmin({ accion: "agregar", candidata_id: id })}
            />
          </div>

          <ListaTop
            ids={filas}
            porId={porId}
            onQuitar={(id) => {
              if (pin) enviarAdmin({ accion: "quitar", candidata_id: id });
            }}
          />

          {filas.length > 0 && (
            <button
              type="button"
              disabled={!pin || trabajando}
              onClick={() => {
                if (window.confirm("¿Borrar todo el top oficial?")) enviarAdmin({ accion: "limpiar" });
              }}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white disabled:opacity-40"
            >
              Borrar todo
            </button>
          )}

          {mensaje && <p className="text-sm text-red-400">{mensaje}</p>}
        </div>
      </details>
    </div>
  );
}
