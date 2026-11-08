"use client";

import { useEffect, useState } from "react";
import type { Candidata } from "@/lib/tipos";
import { crearSala, integrantesSala, miSala, salirSala, unirseSala, type Sala } from "@/lib/salas";
import { RondaTipica } from "@/components/RondaTipica";
import { RondaPreliminar } from "@/components/RondaPreliminar";
import { RondaNocheFinal } from "@/components/RondaNocheFinal";
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
    disponible: true,
  },
  {
    clave: "noche-final",
    etiqueta: "Noche final",
    descripcion: "Semifinalistas y Top 5 en la noche final.",
    disponible: true,
  },
];

/**
 * Elección de modo (solo o sala) y selector de rondas.
 * Las salas todavía no están conectadas, así que esa opción queda desactivada.
 */
function mensajeDe(error: unknown): string {
  return error instanceof Error ? error.message : "Algo salió mal. Intenta de nuevo.";
}

export function Juego({ candidatas }: { candidatas: Candidata[] }) {
  const [jugarSolo, setJugarSolo] = useState(false);
  const [claveRonda, setClaveRonda] = useState(RONDAS[0].clave);

  const [sala, setSala] = useState<Sala | null>(null);
  const [codigo, setCodigo] = useState("");
  const [nombreSala, setNombreSala] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [tuNombre, setTuNombre] = useState("");
  const [integrantes, setIntegrantes] = useState<string[]>([]);

  // Mientras estás en una sala, la lista de integrantes se actualiza sola.
  useEffect(() => {
    if (!sala) {
      setIntegrantes([]);
      return;
    }
    let cancelado = false;
    async function cargarIntegrantes() {
      try {
        const nombres = await integrantesSala();
        if (!cancelado) setIntegrantes(nombres);
      } catch {
        // Si falla, se intenta de nuevo en el siguiente ciclo.
      }
    }
    cargarIntegrantes();
    const intervalo = setInterval(cargarIntegrantes, 10000);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [sala]);

  useEffect(() => {
    miSala()
      .then(setSala)
      .catch(() => setSala(null));
  }, []);

  async function entrar() {
    setCargando(true);
    setMensaje(null);
    try {
      setSala(await unirseSala(codigo, tuNombre));
      setCodigo("");
    } catch (error) {
      setMensaje(mensajeDe(error));
    } finally {
      setCargando(false);
    }
  }

  async function crear() {
    setCargando(true);
    setMensaje(null);
    try {
      setSala(await crearSala(nombreSala, tuNombre));
      setNombreSala("");
    } catch (error) {
      setMensaje(mensajeDe(error));
    } finally {
      setCargando(false);
    }
  }

  async function salir() {
    setCargando(true);
    setMensaje(null);
    try {
      await salirSala();
      setSala(null);
    } catch (error) {
      setMensaje(mensajeDe(error));
    } finally {
      setCargando(false);
    }
  }

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
            {sala ? (
              <>
                <h3 className="mt-2 text-2xl font-black uppercase">{sala.nombre}</h3>
                <p className="mt-3 text-white/70">Comparte este código con tus amigos para que entren:</p>
                <p className="mt-4 font-mono text-3xl font-black tracking-[0.3em] text-[#facc15]">{sala.codigo}</p>
                <p className="mt-4 text-sm text-white/50">
                  Estás como <span className="font-semibold text-white">{sala.miNombre}</span>
                </p>
                <p className="mt-5 text-sm uppercase tracking-widest text-white/50">Integrantes ({integrantes.length})</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {integrantes.map((nombre, i) => (
                    <li key={`${nombre}-${i}`} className="rounded-full border border-white/15 px-3 py-1 text-sm">
                      {nombre}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setJugarSolo(true)}
                  className="mt-6 rounded-full bg-white px-6 py-2 font-bold text-black transition hover:bg-[#facc15]"
                >
                  Jugar en la sala →
                </button>
                <button
                  type="button"
                  disabled={cargando}
                  onClick={salir}
                  className="ml-3 mt-6 rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/70 transition hover:border-white disabled:opacity-40"
                >
                  Salir de la sala
                </button>
              </>
            ) : (
              <>
                <h3 className="mt-2 text-2xl font-black uppercase">Unirme a una sala</h3>
                <p className="mt-3 text-white/70">
                  Entra con el código de tu grupo, o crea una sala y comparte su código.
                </p>
                <input
                  value={tuNombre}
                  onChange={(e) => setTuNombre(e.target.value)}
                  maxLength={30}
                  placeholder="Tu nombre (así te verán en la sala)"
                  className="mt-6 w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-white outline-none focus:border-[#facc15]"
                />
                <div className="mt-4 flex gap-3">
                  <input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="Código de sala"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-mono uppercase text-white outline-none focus:border-[#facc15]"
                  />
                  <button
                    type="button"
                    disabled={cargando || codigo.trim() === "" || tuNombre.trim() === ""}
                    onClick={entrar}
                    className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-[#facc15] disabled:opacity-40"
                  >
                    Entrar
                  </button>
                </div>
                <div className="mt-4 flex gap-3">
                  <input
                    value={nombreSala}
                    onChange={(e) => setNombreSala(e.target.value)}
                    maxLength={40}
                    placeholder="Nombre de la sala"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-white outline-none focus:border-[#facc15]"
                  />
                  <button
                    type="button"
                    disabled={cargando || nombreSala.trim() === "" || tuNombre.trim() === ""}
                    onClick={crear}
                    className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-white/80 transition hover:border-white disabled:opacity-40"
                  >
                    Crear sala
                  </button>
                </div>
              </>
            )}
            {mensaje && <p className="mt-4 text-sm text-red-400">{mensaje}</p>}
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
          Modo:{" "}
          <span className="font-semibold text-white">{sala ? `Sala ${sala.nombre}` : "Jugar solo"}</span>
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
          rondaActual.clave === "preliminar" ? (
            <RondaPreliminar candidatas={candidatas} />
          ) : rondaActual.clave === "noche-final" ? (
            <RondaNocheFinal candidatas={candidatas} salaId={sala?.id ?? null} />
          ) : (
            <RondaTipica candidatas={candidatas} />
          )
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
