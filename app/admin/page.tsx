import { getCandidatas } from "@/lib/candidatas";
import { TopOficialCompartido } from "@/components/TopOficialCompartido";

export const dynamic = "force-dynamic";

// Página de administrador. No aparece en la app; solo se llega escribiendo /admin.
export default async function PaginaAdmin() {
  const { candidatas, error } = await getCandidatas();

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-black uppercase">Administrador</h1>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <TopOficialCompartido candidatas={candidatas} admin />
    </main>
  );
}
