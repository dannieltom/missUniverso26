"use client";

import { useState } from "react";
import type { Candidata } from "@/lib/tipos";
import { RondaTipica } from "@/components/RondaTipica";
import { GaleriaCandidatas } from "@/components/GaleriaCandidatas";

type Ronda = {
  clave: string;
  etiqueta: string;
  descripcion: string;
  disponible: boolean;
};

const RONDAS: Ronda[] = [
  {
    clave: "traje-tipico",
    etiqueta: "Traje típico",
    descripcion: "Desfile de traje típico. Califica a cada candidata del 1.0 al 10.0.",
    disponible: true,
  },
  {
    clave: "preliminar",
    etiqueta: "Preliminar",
    descripcion: "Traje de baño y traje de gala, en la competencia preliminar.",
    disponible: false,
  },
  {
    clave: "noche-final",
    etiqueta: "Noche final",
    descripcion: "Semifinalistas y Top 5 en la noche final.",
    disponible: false,
  },
];

/**
 * Elección de modo (solo o sala) y selector de rondas.
 * Las salas todavía no están conectadas, así que esa opción queda desactivada.
 */
export function Juego({ candidatas }: { candidatas: Candidata[] }) {
  const [jugarSolo, setJugarSolo] = useState(false);
  const [claveRonda, setClaveRonda] = useState(RONDAS[0].clave);

  if (!jugarSolo) {
    return (
      <section className="aparecer">
        <h2 className="mb-2 text-3xl font-black uppercase sm:text-4xl">¿Cómo quieres jugar?</h2>
        <p className="mb-8 text-white/60">Puedes empezar solo o invitar a tus amigos a una sala.</p>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setJugarSolo(true)}
            className="group rounded-3xl border border-white/10 bg-black/50 p-8 text-left backdrop-blur transition hover:-translate-y-1 hover:border-[#facc15]/60"
          >
            <p className="text-sm uppercase tracking-widest text-white/50">Individual</p>
            <h3 className="mt-2 text-2xl font-black uppercase">Jugar solo</h3>
            <p className="mt-3 text-white/70">
              Califica por tu cuenta y mira tu ranking personal.
            </p>
            <span className="mt-6 inline-block font-semibold text-[#facc15] group-hover:underline">
              Empezar →
            </span>
          </button>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
            <p className="text-sm uppercase tracking-widest text-white/50">En grupo</p>
            <h3 className="mt-2 text-2xl font-black uppercase">Unirme a una sala</h3>
            <p className="mt-3 text-white/70">
              Entra con el código de tu grupo y compite con tus amigos en el ranking de la sala.
            </p>
            <div className="mt-6 flex gap-3">
              <input
                disabled
                placeholder="Código de sala"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white/40 outline-none"
              />
              <button
                type="button"
                disabled
                className="rounded-xl bg-white/10 px-5 py-3 font-semibold text-white/40"
              >
                Entrar
              </button>
            </div>
            <p className="mt-3 text-sm text-white/40">Las salas llegan pronto.</p>
          </div>
        </div>
      </section>
    );
  }

  const rondaActual = RONDAS.find((r) => r.clave === claveRonda) ?? RONDAS[0];

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>
          Modo: <span className="font-semibold text-white">Jugar solo</span>
        </span>
      </div>

      <nav className="grid gap-4 md:grid-cols-3">
        {RONDAS.map((ronda, posicion) => {
          const activa = ronda.clave === claveRonda;
          return (
            <button
              key={ronda.clave}
              type="button"
              onClick={() => setClaveRonda(ronda.clave)}
              className={`rounded-3xl border p-6 text-left backdrop-blur transition ${
                activa
                  ? "border-[#facc15] bg-black/70 shadow-[0_0_30px_rgba(250,204,21,0.15)]"
                  : "border-white/10 bg-black/40 hover:border-white/40"
              }`}
            >
              <p className="text-sm font-semibold text-white/50">Ronda {posicion + 1}</p>
              <p className="mt-1 text-xl font-black uppercase">{ronda.etiqueta}</p>
              {!ronda.disponible && (
                <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wider text-white/60">
                  Próximamente
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div>
        {rondaActual.disponible ? (
          <RondaTipica candidatas={candidatas} />
        ) : (
          <div className="rounded-3xl border border-white/10 bg-black/50 p-10 text-center backdrop-blur">
            <h3 className="text-2xl font-black uppercase">{rondaActual.etiqueta}</h3>
            <p className="mt-3 text-white/70">{rondaActual.descripcion}</p>
            <p className="mt-6 text-white/50">
              Esta ronda se habilita cuando comience esa fase del concurso.
            </p>
          </div>
        )}
      </div>

      <GaleriaCandidatas candidatas={candidatas} />
    </div>
  );
}
