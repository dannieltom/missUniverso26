"use client";

import { useRef, useState } from "react";

/**
 * Encabezado a pantalla completa con el video del evento de fondo.
 * El video arranca en silencio (los navegadores no permiten audio automático);
 * el botón activa el sonido.
 */
export function PortadaVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [conSonido, setConSonido] = useState(false);

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
