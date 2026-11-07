import { RondaTipica } from "@/components/RondaTipica";
import { InicioSesion } from "@/components/InicioSesion";
import { GaleriaCandidatas } from "@/components/GaleriaCandidatas";
import { getCandidatas } from "@/lib/candidatas";

// Siempre lee las candidatas al momento de la visita.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { candidatas, error } = await getCandidatas();

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <p className="text-sm uppercase tracking-widest text-fuchsia-300">Miss Universo 2026</p>
      <h1 className="mb-6 text-3xl font-bold">Desfile de traje típico</h1>

      <InicioSesion>
        {error ? (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
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
  );
}
