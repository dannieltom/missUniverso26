"use client";

import { useEffect, useMemo, useState } from "react";
import type { Candidata } from "@/lib/tipos";
import { supabaseNavegador } from "@/lib/supabase-navegador";
import { ANIO, ETAPA_CLAVES, TAMANOS_POR_DEFECTO, etapaInfo, type EtapaClave } from "@/lib/etapas";
import { PUNTOS_POR_ETAPA } from "@/lib/puntajes";
import { TopEtapa } from "@/components/TopEtapa";
import { RondaFinal } from "@/components/RondaFinal";
import { RankingSala } from "@/components/RankingSala";

type Vista = EtapaClave | "final";
const VISTAS: Vista[] = [...ETAPA_CLAVES, "final"];
const CLAVE_SALA = "mu26-sala-actual";
const VACIO_OFICIALES: Record<EtapaClave, string[]> = { inicial: [], top10: [], top5: [] };

// admin = true: página /admin, donde el administrador entra con su cuenta de Google.
export function RondaNocheFinal({ candidatas, admin = false }: { candidatas: Candidata[]; admin?: boolean }) {
  const [vista, setVista] = useState<Vista>("inicial");
  const [tamanos, setTamanos] = useState<Record<EtapaClave, number>>(TAMANOS_POR_DEFECTO);
  const [oficiales, setOficiales] = useState<Record<EtapaClave, string[]>>(VACIO_OFICIALES);
  const [oficialFinal, setOficialFinal] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  // null = comprobando; true/false = si la cuenta de Google es la de administrador.
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  // Sala a la que perteneces (se configura después, al unirte a una sala).
  const [salaId, setSalaId] = useState<string | null>(null);

  const porId = useMemo(() => new Map(candidatas.map((c) => [c.id, c])), [candidatas]);

  useEffect(() => {
    setSalaId(localStorage.getItem(CLAVE_SALA));
  }, []);

  // Tamaños y tops oficiales de todas las etapas, en vivo.
  useEffect(() => {
    const db = supabaseNavegador();
    if (!db) {
      setError("Falta configurar Supabase en .env.local.");
      return;
    }
    let cancelado = false;

    async function cargar() {
      const [cfg, filas] = await Promise.all([
        db!.from("top_etapa").select("etapa, tamano").eq("anio", ANIO),
        db!.from("top_etapa_oficial").select("etapa, candidata_id, orden").eq("anio", ANIO).order("orden", { ascending: true }),
      ]);
      if (cancelado) return;
      if (cfg.error || filas.error) {
        setError(`No se pudo cargar el top oficial: ${(cfg.error ?? filas.error)?.message}`);
        return;
      }
      setError(null);

      const nuevosTamanos = { ...TAMANOS_POR_DEFECTO };
      for (const fila of (cfg.data ?? []) as { etapa: string; tamano: number }[]) {
        if (ETAPA_CLAVES.includes(fila.etapa as EtapaClave)) nuevosTamanos[fila.etapa as EtapaClave] = fila.tamano;
      }
      setTamanos(nuevosTamanos);

      const nuevosOficiales: Record<EtapaClave, string[]> = { inicial: [], top10: [], top5: [] };
      const nuevaFinal: string[] = [];
      for (const fila of (filas.data ?? []) as { etapa: string; candidata_id: string }[]) {
        if (fila.etapa === "final") {
          nuevaFinal.push(fila.candidata_id);
        } else if (ETAPA_CLAVES.includes(fila.etapa as EtapaClave)) {
          nuevosOficiales[fila.etapa as EtapaClave].push(fila.candidata_id);
        }
      }
      setOficiales(nuevosOficiales);
      setOficialFinal(nuevaFinal);
    }

    cargar();
    const canal = db
      .channel(`top-etapa-${ANIO}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "top_etapa_oficial" }, () => cargar())
      .on("postgres_changes", { event: "*", schema: "public", table: "top_etapa" }, () => cargar())
      .subscribe();

    return () => {
      cancelado = true;
      db.removeChannel(canal);
    };
  }, []);

  // Comprueba en silencio si la cuenta de Google con la que entraste es la de administrador.
  useEffect(() => {
    async function comprobar() {
      const db = supabaseNavegador();
      if (!db) return false;
      const { data } = await db.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return false;
      try {
        const res = await fetch("/api/top-oficial", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ anio: ANIO, etapa: "inicial", accion: "verificar" }),
        });
        return res.ok;
      } catch {
        return false;
      }
    }
    comprobar().then((ok) => setAutorizado(ok));
  }, []);

  async function enviarAdmin(etapa: string, payload: Record<string, unknown>): Promise<boolean> {
    setTrabajando(true);
    setMensaje(null);
    try {
      // Manda la sesión de Google para que el servidor compruebe que eres tú.
      const db = supabaseNavegador();
      const { data } = db ? await db.auth.getSession() : { data: { session: null } };
      const token = data.session?.access_token ?? "";
      const res = await fetch("/api/top-oficial", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ anio: ANIO, etapa, ...payload }),
      });
      const datos = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMensaje(datos.error ?? "Error al guardar.");
        return false;
      }
      return true;
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
      return false;
    } finally {
      setTrabajando(false);
    }
  }

  // Página /admin sin sesión de administrador: pide entrar con Google.
  if (admin && autorizado === null) {
    return <p className="text-sm text-white/50">Comprobando tu cuenta…</p>;
  }
  if (admin && autorizado === false) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-white/70">
          Esta página es solo para el administrador. Inicia sesión con la cuenta de administrador.
        </p>
        <button
          type="button"
          onClick={() =>
            supabaseNavegador()?.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: window.location.href },
            })
          }
          className="rounded-full bg-white px-6 py-2 font-bold text-black transition hover:bg-[#facc15]"
        >
          Iniciar sesión con Google
        </button>
      </div>
    );
  }

  const soyAdmin = autorizado === true;
  const info = vista === "final" ? null : etapaInfo(vista);
  const anteriorClave = info?.anterior ?? null;
  const anterior =
    anteriorClave === null
      ? null
      : {
          etiqueta: `Top ${tamanos[anteriorClave]}`,
          tamano: tamanos[anteriorClave],
          cantidad: oficiales[anteriorClave].length,
          completo: oficiales[anteriorClave].length >= tamanos[anteriorClave],
        };
  const pool = anteriorClave
    ? oficiales[anteriorClave].map((id) => porId.get(id)).filter((c): c is Candidata => !!c)
    : candidatas;

  const siguiente = info?.siguiente ?? null;

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2">
        {VISTAS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVista(v)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              vista === v ? "border-[#facc15] bg-[#facc15] text-black" : "border-white/15 text-white/70 hover:border-white"
            }`}
          >
            {v === "final" ? "Preguntas" : `Top ${tamanos[v as EtapaClave]}`}
          </button>
        ))}
      </nav>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {vista !== "final" && (
        <p className="text-sm text-white/60">Cada acierto vale {PUNTOS_POR_ETAPA[vista]} puntos.</p>
      )}

      {vista === "final" ? (
        <div className="space-y-6">
          {soyAdmin && (
            <RondaFinal
              porId={porId}
              top5={oficiales.top5}
              oficialGuardado={oficialFinal}
              onGuardarOficial={(ids) => {
                void enviarAdmin("final", { accion: "fijar_orden", ids });
              }}
              trabajando={trabajando}
              mensaje={mensaje}
            />
          )}
          <RondaFinal porId={porId} top5={oficiales.top5} />
        </div>
      ) : (
        <TopEtapa
          key={vista}
          clave={vista}
          tamano={tamanos[vista]}
          oficial={oficiales[vista]}
          anterior={anterior}
          pool={pool}
          candidatas={candidatas}
          porId={porId}
          soyAdmin={soyAdmin}
          trabajando={trabajando}
          mensaje={mensaje}
          enviarAdmin={(payload) => enviarAdmin(vista, payload)}
        />
      )}

      {salaId && <RankingSala salaId={salaId} />}

      <div className="flex justify-end">
        {vista === "final" ? (
          <button
            type="button"
            onClick={() => setVista("top5")}
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white"
          >
            Volver al top 5
          </button>
        ) : vista === "top5" ? (
          <button
            type="button"
            onClick={() => setVista("final")}
            className="rounded-full bg-white px-6 py-2 font-bold text-black transition hover:bg-[#facc15]"
          >
            Ir a ronda de preguntas
          </button>
        ) : siguiente ? (
          <button
            type="button"
            onClick={() => setVista(siguiente)}
            className="rounded-full bg-white px-6 py-2 font-bold text-black transition hover:bg-[#facc15]"
          >
            Elegir top {tamanos[siguiente]}
          </button>
        ) : null}
      </div>
    </div>
  );
}
