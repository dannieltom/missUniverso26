import { RondaTipica } from "@/components/RondaTipica";
import { InicioSesion } from "@/components/InicioSesion";
import { GaleriaCandidatas } from "@/components/GaleriaCandidatas";
import { PortadaVideo } from "@/components/PortadaVideo";
import { getCandidatas } from "@/lib/candidatas";

// Siempre lee las candidatas al momento de la visita.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { candidatas, error } = await getCandidatas();

  return (
    <>
      <div className="cosmos" aria-hidden="true">
        <div className="estrellas" />
      </div>

      <PortadaVideo />

      <main className="mx-auto w-full max-w-7xl px-6 pb-24">
        <section className="aparecer mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#ed1c24]">
            Ronda 1
          </p>
          <h2 className="text-4xl font-black uppercase sm:text-5xl">Desfile de traje típico</h2>
        </section>

        <InicioSesion>
          {error ? (
            <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
              {error}
            </p>
          ) : (
            <>
              <RondaTipica candidatas={candidatas} />
              <GaleriaCandidatas candidatas={candidatas} />
            </>
          )}
        </InicioSesion>
      </main>
    </>
  );
}
