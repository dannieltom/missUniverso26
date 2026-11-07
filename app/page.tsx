import { InicioSesion } from "@/components/InicioSesion";
import { ComoFunciona } from "@/components/ComoFunciona";
import { Juego } from "@/components/Juego";
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

      <main className="mx-auto w-full max-w-7xl space-y-24 px-6 pb-24">
        <ComoFunciona />

        <InicioSesion>
          {error ? (
            <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
              {error}
            </p>
          ) : (
            <Juego candidatas={candidatas} />
          )}
        </InicioSesion>
      </main>
    </>
  );
}
