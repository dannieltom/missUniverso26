"use client";

import { useState } from "react";
import type { Candidata } from "@/lib/tipos";

type Fuente = { titulo: string; url: string; confiable: boolean };
type Respuesta = {
  top: string[] | null;
  fuentes: Fuente[];
  noReconocidos: string[];
  estado: "ok" | "revisar" | "sin_resultado";
  motivo: string;
  error?: string;
};

// Panel de prueba: pregunta a Gemini por el top oficial y muestra el resultado y sus fuentes.
// Todavía no guarda nada como oficial.
export function BuscarTopOficial({ candidatas }: { candidatas: Candidata[] }) {
  const [anio, setAnio] = useState(2025);
  const [cantidad, setCantidad] = useState(12);
  const [cargando, setCargando] = useState(false);
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);

  async function buscar() {
    setCargando(true);
    setRespuesta(null);
    try {
      const res = await fetch("/api/oficiales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anio, cantidad, paises: candidatas.map((c) => c.pais) }),
      });
      const datos = (await res.json()) as Respuesta;
      setRespuesta(res.ok ? datos : { ...datos, top: null, fuentes: [], noReconocidos: [], estado: "sin_resultado", motivo: datos.error ?? "Error" });
    } catch {
      setRespuesta({ top: null, fuentes: [], noReconocidos: [], estado: "sin_resultado", motivo: "No se pudo conectar con el servidor." });
    } finally {
      setCargando(false);
    }
  }

  const colorEstado =
    respuesta?.estado === "ok" ? "text-emerald-400" : respuesta?.estado === "revisar" ? "text-amber-400" : "text-red-400";

  return (
    <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur md:p-8">
      <h4 className="text-xl font-black uppercase">Prueba: buscar top oficial con IA</h4>
      <p className="mt-2 text-sm text-white/50">
        Busca el top en internet y valida los nombres. No guarda nada: solo muestra el resultado para revisarlo.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Año
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="w-28 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-[#facc15]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Cantidad
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className="w-28 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-[#facc15]"
          />
        </label>
        <button
          type="button"
          onClick={buscar}
          disabled={cargando}
          className="rounded-full bg-[#facc15] px-6 py-2 font-bold text-black transition hover:brightness-110 disabled:opacity-50"
        >
          {cargando ? "Buscando…" : "Buscar"}
        </button>
      </div>

      {respuesta && (
        <div className="mt-6 space-y-4">
          <p className={`text-sm font-semibold ${colorEstado}`}>
            {respuesta.estado === "ok" ? "Validado" : respuesta.estado === "revisar" ? "Revisar" : "Sin resultado"}:{" "}
            {respuesta.motivo}
          </p>

          {respuesta.top && (
            <ol className="grid gap-2 sm:grid-cols-2">
              {respuesta.top.map((pais, i) => (
                <li key={`${pais}-${i}`} className="rounded-xl border border-white/10 px-4 py-2 text-sm">
                  <span className="font-black text-[#ed1c24]">{i + 1}.</span>{" "}
                  <span className="font-semibold">{pais}</span>
                </li>
              ))}
            </ol>
          )}

          {respuesta.fuentes.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Fuentes</p>
              <ul className="space-y-1 text-sm">
                {respuesta.fuentes.map((f, i) => (
                  <li key={`${f.titulo}-${i}`} className="flex items-center gap-2">
                    <span className={f.confiable ? "text-emerald-400" : "text-white/40"}>
                      {f.confiable ? "✓" : "·"}
                    </span>
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-[#facc15] underline-offset-4 hover:underline">
                      {f.titulo || f.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
