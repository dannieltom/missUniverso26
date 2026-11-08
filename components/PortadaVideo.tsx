"use client";

import { useEffect, useRef, useState } from "react";

const CLAVE_INTRO = "mu26-intro-visto";

/**
 * Encabezado a pantalla completa con el video del evento de fondo.
 * La primera vez que se abre la página en la sesión, muestra una pantalla de entrada:
 * el clic del visitante permite que el video arranque con sonido (los navegadores
 * no lo permiten sin un clic previo). Después, el botón de sonido sigue disponible.
 */
export function PortadaVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [conSonido, setConSonido] = useState(false);
  const [mostrarIntro, setMostrarIntro] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(CLAVE_INTRO)) setMostrarIntro(true);
    } catch {
      setMostrarIntro(true);
    }
  }, []);

  function marcarIntroVista() {
    try {
      sessionStorage.setItem(CLAVE_INTRO, "1");
    } catch {
      // Si el almacenamiento no está disponible, la intro simplemente vuelve a aparecer.
    }
  }

  function entrarConSonido() {
    const v = video.current;
    if (v) {
      v.muted = false;
      setConSonido(true);
      void v.play().catch(() => {});
    }
    marcarIntroVista();
    setMostrarIntro(false);
  }

  function seguirSinSonido() {
    marcarIntroVista();
    setMostrarIntro(false);
  }

  function alternarSonido() {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setConSonido(!v.muted);
    if (v.paused) void v.play().catch(() => {});
  }

  return (
    <header className="relative isolate flex min-h-[80vh] items-end overflow-hidden">
      <video
        ref={video}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        src="/video/fondo-puerto-rico.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#05060d] via-[#05060d]/55 to-[#05060d]/15" />

      {mostrarIntro && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#05060d]/80 backdrop-blur-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-white/70">Miss Universo 2026</p>
          <button
            type="button"
            onClick={entrarConSonido}
            className="rounded-full bg-gradient-to-r from-[#ed1c24] to-[#0050f0] px-10 py-4 text-lg font-black uppercase tracking-wider text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
          >
            Entrar con sonido
          </button>
          <button
            type="button"
            onClick={seguirSinSonido}
            className="text-sm text-white/60 underline underline-offset-4 hover:text-white"
          >
            Seguir sin sonido
          </button>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-6 pb-14">
        <p className="aparecer text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
          Edición 75 · Puerto Rico
        </p>
        <h1 className="titulo-pr aparecer mt-3 text-6xl font-black uppercase leading-none sm:text-8xl">
          Miss Universo 2026
        </h1>

        <div className="aparecer mt-6 flex items-center gap-2">
          <span className="h-1.5 w-20 rounded-full bg-[#ed1c24]" />
          <span className="h-1.5 w-20 rounded-full bg-white" />
          <span className="h-1.5 w-20 rounded-full bg-[#0050f0]" />
        </div>

        <button
          type="button"
          onClick={alternarSonido}
          className="aparecer mt-8 rounded-full border border-white/30 bg-black/40 px-5 py-2 text-sm backdrop-blur transition hover:border-white"
        >
          {conSonido ? "Sonido activado" : "Activar sonido"}
        </button>
      </div>
    </header>
  );
}
