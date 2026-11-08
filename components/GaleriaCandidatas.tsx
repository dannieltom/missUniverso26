"use client";

import { useState } from "react";
import mapa from "@/lib/mapa-subregiones.json";
import { SUBREGIONES, subregionDePais, type SubregionId } from "@/lib/regiones";
import type { Candidata } from "@/lib/tipos";

/**
 * Consulta de candidatas por región. Se toca una región en el mapa (o en los botones)
 * y se muestran solo las candidatas de esa región.
 */
export function GaleriaCandidatas({ candidatas }: { candidatas: Candidata[] }) {
  const [activa, setActiva] = useState<SubregionId>("america-sur");

  const conteo = (id: SubregionId) =>
    candidatas.filter((c) => subregionDePais(c.pais) === id).length;
  const grupo = candidatas.filter((c) => subregionDePais(c.pais) === activa);
  const nombreActiva = SUBREGIONES.find((s) => s.id === activa)?.nombre ?? "";

  return (
    <section className="mt-20 space-y-8">
      <h2 className="text-4xl font-black uppercase sm:text-5xl">Consulta candidatas por región</h2>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#070d1a] p-3 sm:p-6">
        <svg
          viewBox={mapa.viewBox}
          role="img"
          aria-label="Mapa del mundo por regiones"
          className="h-auto w-full"
        >
          {mapa.paises.map((p) => {
            const sub = p.s as SubregionId;
            const seleccionada = sub === activa;
            return (
              <path
                key={p.c}
                d={p.d}
                onClick={() => setActiva(sub)}
                className={`cursor-pointer stroke-[#070d1a] transition-colors duration-200 ${
                  seleccionada ? "fill-[#ed1c24]" : "fill-[#1c2a44] hover:fill-[#33507a]"
                }`}
                strokeWidth={0.6}
              >
                <title>{SUBREGIONES.find((s) => s.id === sub)?.nombre}</title>
              </path>
            );
          })}

          {mapa.etiquetas.map((e) => {
            const id = e.id as SubregionId;
            const nombre = SUBREGIONES.find((s) => s.id === id)?.nombre ?? "";
            return (
              <text
                key={e.id}
                x={e.x}
                y={e.y}
                textAnchor="middle"
                onClick={() => setActiva(id)}
                className="cursor-pointer select-none fill-white text-[13px] font-black uppercase"
                stroke="#000"
                strokeWidth={3}
                paintOrder="stroke"
              >
                {nombre}
                <tspan x={e.x} dy="15" className="fill-[#facc15] text-[12px]">
                  ({conteo(id)})
                </tspan>
              </text>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-3">
        {SUBREGIONES.map(({ id, nombre }) => {
          const seleccion = id === activa;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiva(id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                seleccion
                  ? "bg-[#facc15] text-black"
                  : "border border-white/15 text-white/80 hover:border-white"
              }`}
            >
              {nombre}
              <span className={`ml-2 ${seleccion ? "text-black/60" : "text-white/40"}`}>
                ({conteo(id)})
              </span>
            </button>
          );
        })}
      </div>

      <div>
        <h3 className="mb-5 flex items-center gap-4 text-2xl font-black uppercase">
          <span className="h-1 w-10 rounded-full bg-[#ed1c24]" />
          {nombreActiva}
          <span className="text-base font-semibold text-white/40">({grupo.length})</span>
        </h3>

        {grupo.length === 0 ? (
          <p className="text-white/40">Sin candidatas en esta región.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-6">
            {grupo.map((c) => (
              <li
                key={c.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#facc15]/60"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#0050f0]/30 to-[#ed1c24]/30">
                  {c.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.foto_url}
                      alt={`${c.nombre}, ${c.pais}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-widest text-white/40">
                      Sin foto
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold leading-tight">{c.nombre}</p>
                  <p className="mt-1 text-sm text-white/60">{c.pais}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
