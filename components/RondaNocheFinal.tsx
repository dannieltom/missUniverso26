"use client";

import type { Candidata } from "@/lib/tipos";
import { TopOficialCompartido } from "@/components/TopOficialCompartido";
import { ComparacionTop } from "@/components/ComparacionTop";

// Noche final: el top oficial se comparte en vivo y tu top sale de tus puntajes de la preliminar.
export function RondaNocheFinal({ candidatas }: { candidatas: Candidata[] }) {
  return (
    <div className="space-y-10">
      <TopOficialCompartido candidatas={candidatas} />
      <ComparacionTop candidatas={candidatas} />
    </div>
  );
}
