"use client";

import { useEffect, useRef, useState } from "react";

const CLAVE_INTRO = "mu26-intro-visto";

/**
 * Encabezado a pantalla completa con el video del evento de fondo.
 * La primera vez que se abre la página en la sesión, una pantalla de entrada con el
 * cielo estrellado bloquea la vista hasta que el visitante pulsa "Entrar".
 * Ese clic permite que el video arranque con sonido (los navegadores no lo permiten antes).
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

  // Mientras la pantalla de entrada está abierta, no se puede desplazar la página.
  useEffect(() => {
    document.body.style.overflow = mostrarIntro ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mostrarIntro]);

  function entrar() {
    const v = video.current;
    if (v) {
      v.muted = false;
      setConSonido(true);
      void v.play().catch(() => {});
    }
    try {
      sessionStorage.setItem(CLAVE_INTRO, "1");
    } catch {
      // Si el almacenamiento no está disponible, la intro vuelve a aparecer.
    }
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
    <header className="relative z-40 isolate flex min-h-[80vh] items-end overflow-hidden">
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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-hidden bg-[#05060d]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 15% 0%, rgba(0, 80, 240, 0.45), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(237, 28, 36, 0.35), transparent 55%)",
            }}
          />
          <div className="estrellas" aria-hidden="true" />

          <div className="relative flex flex-col items-center gap-6 text-center">
            <p className="aparecer text-sm font-semibold uppercase tracking-[0.35em] text-white/70">
              Edición 75 · Puerto Rico
            </p>
            <h1 className="titulo-pr aparecer text-5xl font-black uppercase leading-none sm:text-7xl">
              Miss Universo 2026
            </h1>
            <div className="aparecer flex items-center gap-2">
              <span className="h-1.5 w-16 rounded-full bg-[#ed1c24]" />
              <span className="h-1.5 w-16 rounded-full bg-white" />
              <span className="h-1.5 w-16 rounded-full bg-[#0050f0]" />
            </div>
            <button
              type="button"
              onClick={entrar}
              className="aparecer mt-4 rounded-full bg-gradient-to-r from-[#ed1c24] to-[#0050f0] px-14 py-4 text-lg font-black uppercase tracking-[0.2em] text-white shadow-[0_0_40px_rgba(0,80,240,0.35)] transition hover:brightness-110 active:scale-[0.98]"
            >
              Entrar
            </button>
          </div>
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
