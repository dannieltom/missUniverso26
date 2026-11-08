"use client";

import { useState } from "react";
import { REGIONES, type Candidata, type Region } from "@/lib/tipos";

/**
 * Galería de candidatas. Se elige una región (América, Caribe, Europa, África, Asia, Oceanía)
 * y solo se muestran las candidatas de esa región.
 */
export function GaleriaCandidatas({ candidatas }: { candidatas: Candidata[] }) {
  const [regionActiva, setRegionActiva] = useState<Region>(REGIONES[0].clave);
  const region = REGIONES.find((r) => r.clave === regionActiva) ?? REGIONES[0];
  const grupo = candidatas.filter((c) => c.region === region.clave);

  return (
    <section className="mt-20 space-y-8">
      <h2 className="text-4xl font-black uppercase sm:text-5xl">Candidatas</h2>

      <div className="flex flex-wrap gap-3">
        {REGIONES.map(({ clave, etiqueta }) => {
          const activa = clave === regionActiva;
          const cantidad = candidatas.filter((c) => c.region === clave).length;
          return (
            <button
              key={clave}
              type="button"
              onClick={() => setRegionActiva(clave)}
              className={`rounded-full px-5 py-2 font-semibold transition ${
                activa
                  ? "bg-[#facc15] text-black"
                  : "border border-white/15 text-white/80 hover:border-white"
              }`}
            >
              {etiqueta}
              <span className={`ml-2 text-sm ${activa ? "text-black/60" : "text-white/40"}`}>
                ({cantidad})
              </span>
            </button>
          );
        })}
      </div>

      <div>
        <h3 className="mb-5 flex items-center gap-4 text-2xl font-black uppercase">
          <span className="h-1 w-10 rounded-full bg-[#ed1c24]" />
          {region.etiqueta}
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
