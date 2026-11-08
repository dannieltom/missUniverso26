/**
 * Explicación del sistema y pasos para empezar. Se muestra antes del juego.
 */
export function ComoFunciona() {
  return (
    <div className="space-y-24">
      <section className="aparecer">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#facc15]">Qué es</p>
        <h2 className="mt-2 text-4xl font-black uppercase sm:text-5xl">
          Califica mientras ves el concurso
        </h2>
      </section>

      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-[#facc15]">Cómo funciona</p>
        <h2 className="mt-2 text-3xl font-black uppercase sm:text-4xl">Tres rondas, un ranking</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-black/50 p-8 backdrop-blur">
            <p className="text-4xl font-black text-[#ed1c24]">01</p>
            <h3 className="mt-4 text-xl font-bold">Califica cada ronda</h3>
            <p className="mt-2 text-white/70">
              Pon un puntaje del 1.0 al 10.0 a cada candidata en el desfile de traje típico, la
              preliminar y la noche final.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-black/50 p-8 backdrop-blur">
            <p className="text-4xl font-black text-white">02</p>
            <h3 className="mt-4 text-xl font-bold">Mira tu ranking</h3>
            <p className="mt-2 text-white/70">
              Tus puntajes se ordenan automáticamente de mayor a menor, para que veas quién va
              primera en tu opinión.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-black/50 p-8 backdrop-blur">
            <p className="text-4xl font-black text-[#0050f0]">03</p>
            <h3 className="mt-4 text-xl font-bold">Compara con los resultados</h3>
            <p className="mt-2 text-white/70">
              Cuando se carguen los resultados oficiales de cada ronda, verás qué tanto acertaste.
              Esta parte llega pronto.
            </p>
          </article>
        </div>
      </section>

      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-[#facc15]">Cómo empezar</p>
        <h2 className="mt-2 text-3xl font-black uppercase sm:text-4xl">En tres pasos</h2>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          <li className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <span className="font-black text-[#facc15]">1.</span> Inicia sesión con tu cuenta de
            Google para guardar tus puntajes.
          </li>
          <li className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <span className="font-black text-[#facc15]">2.</span> Elige jugar solo o unirte a una
            sala de tus amigos.
          </li>
          <li className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <span className="font-black text-[#facc15]">3.</span> Elige la ronda y empieza a
            calificar a las candidatas.
          </li>
        </ol>
      </section>
    </div>
  );
}
