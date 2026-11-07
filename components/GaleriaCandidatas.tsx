import { REGIONES, type Candidata } from "@/lib/tipos";

/**
 * Galería de candidatas agrupadas por región (América, Caribe, Europa, África, Asia, Oceanía).
 */
export function GaleriaCandidatas({ candidatas }: { candidatas: Candidata[] }) {
  return (
    <section className="mt-12 space-y-10">
      <h2 className="text-2xl font-bold">Candidatas por región</h2>

      {REGIONES.map(({ clave, etiqueta }) => {
        const grupo = candidatas.filter((c) => c.region === clave);

        return (
          <div key={clave}>
            <h3 className="mb-3 text-lg font-semibold">
              {etiqueta}{" "}
              <span className="text-sm font-normal text-white/40">({grupo.length})</span>
            </h3>

            {grupo.length === 0 ? (
              <p className="text-sm text-white/40">Sin candidatas en esta región.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {grupo.map((c) => (
                  <li key={c.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    {c.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.foto_url}
                        alt={`${c.nombre}, ${c.pais}`}
                        className="aspect-[3/4] w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg bg-white/5 text-xs text-white/40">
                        Sin foto
                      </div>
                    )}
                    <p className="mt-2 font-medium leading-tight">{c.nombre}</p>
                    <p className="text-sm text-white/60">{c.pais}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}
