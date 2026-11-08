import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ETAPA_CLAVES, TAMANOS_POR_DEFECTO, etapaInfo, type EtapaClave } from "@/lib/etapas";

export const runtime = "nodejs";

type Cuerpo = {
  anio: number;
  etapa: string;
  accion: "verificar" | "agregar" | "quitar" | "limpiar" | "fijar_tamano" | "fijar_orden";
  candidata_id?: string;
  tamano?: number;
  /** Orden de la ronda final, de 1.º a 5.º. */
  ids?: string[];
};

// Solo la cuenta de Google indicada en ADMIN_EMAIL puede cambiar los tops oficiales.
async function esAdministrador(req: Request): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const correoAdmin = process.env.ADMIN_EMAIL;
  if (!token || !url || !servicio || !correoAdmin) return false;

  const db = createClient(url, servicio, { auth: { persistSession: false } });
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user?.email) return false;
  return data.user.email.toLowerCase() === correoAdmin.toLowerCase();
}

export async function POST(req: Request) {
  if (!(await esAdministrador(req))) {
    return NextResponse.json({ error: "No autorizado. Inicia sesión con la cuenta de administrador." }, { status: 401 });
  }

  const cuerpo = (await req.json()) as Cuerpo;

  // Solo comprueba la cuenta, sin cambiar nada.
  if (cuerpo.accion === "verificar") {
    return NextResponse.json({ ok: true });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !servicio) {
    return NextResponse.json({ error: "Falta configurar Supabase en el servidor." }, { status: 500 });
  }

  // La clave de servicio salta las reglas de seguridad: solo se usa aquí, después de validar la cuenta.
  const db = createClient(url, servicio, { auth: { persistSession: false } });
  const { anio, accion } = cuerpo;

  if (!Number.isInteger(anio)) {
    return NextResponse.json({ error: "Año inválido." }, { status: 400 });
  }

  const esFinal = cuerpo.etapa === "final";
  if (!esFinal && !ETAPA_CLAVES.includes(cuerpo.etapa as EtapaClave)) {
    return NextResponse.json({ error: "Etapa inválida." }, { status: 400 });
  }
  if (esFinal && accion !== "fijar_orden") {
    return NextResponse.json({ error: "La ronda final solo admite fijar_orden." }, { status: 400 });
  }
  if (accion === "fijar_orden" && !esFinal) {
    return NextResponse.json({ error: "fijar_orden solo aplica a la ronda final." }, { status: 400 });
  }

  const etapa = cuerpo.etapa as EtapaClave;
  const info = esFinal ? null : etapaInfo(etapa);

  // Tamaño actual de la etapa (si no está fijado, el de por defecto).
  async function tamanoActual(): Promise<number> {
    const { data, error } = await db
      .from("top_etapa")
      .select("tamano")
      .eq("anio", anio)
      .eq("etapa", etapa)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.tamano ?? TAMANOS_POR_DEFECTO[etapa];
  }

  // Candidatas oficiales de una etapa, en orden.
  async function filasDe(clave: string) {
    const { data, error } = await db
      .from("top_etapa_oficial")
      .select("candidata_id, orden")
      .eq("anio", anio)
      .eq("etapa", clave)
      .order("orden", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  try {
    if (accion === "fijar_tamano") {
      const tamano = cuerpo.tamano;
      if (!Number.isInteger(tamano) || (tamano ?? 0) < 1) {
        return NextResponse.json({ error: "El tamaño debe ser un número mayor que 0." }, { status: 400 });
      }
      const { error } = await db
        .from("top_etapa")
        .upsert({ anio, etapa, tamano }, { onConflict: "anio,etapa" });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (accion === "agregar") {
      if (!cuerpo.candidata_id) {
        return NextResponse.json({ error: "Falta la candidata." }, { status: 400 });
      }
      const tamano = await tamanoActual();
      const filas = await filasDe(etapa);
      if (filas.length >= tamano) {
        return NextResponse.json({ error: `El top ${tamano} ya está completo.` }, { status: 400 });
      }
      if (filas.some((f) => f.candidata_id === cuerpo.candidata_id)) {
        return NextResponse.json({ error: "Esa candidata ya está en el top." }, { status: 400 });
      }
      // Top 10 y top 5 solo pueden salir de la etapa anterior oficial.
      if (info?.anterior) {
        const previas = await filasDe(info.anterior);
        if (!previas.some((f) => f.candidata_id === cuerpo.candidata_id)) {
          return NextResponse.json(
            { error: "Esa candidata no está en el top oficial de la etapa anterior." },
            { status: 400 },
          );
        }
      }
      const { error } = await db.from("top_etapa_oficial").insert({
        anio,
        etapa,
        orden: filas.length + 1,
        candidata_id: cuerpo.candidata_id,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (accion === "quitar") {
      if (!cuerpo.candidata_id) {
        return NextResponse.json({ error: "Falta la candidata." }, { status: 400 });
      }
      const { error } = await db
        .from("top_etapa_oficial")
        .delete()
        .eq("anio", anio)
        .eq("etapa", etapa)
        .eq("candidata_id", cuerpo.candidata_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Renumera el orden para que quede 1, 2, 3... sin huecos.
      const restantes = await filasDe(etapa);
      for (let i = 0; i < restantes.length; i++) {
        if (restantes[i].orden !== i + 1) {
          await db
            .from("top_etapa_oficial")
            .update({ orden: i + 1 })
            .eq("anio", anio)
            .eq("etapa", etapa)
            .eq("candidata_id", restantes[i].candidata_id);
        }
      }
      return NextResponse.json({ ok: true });
    }

    if (accion === "limpiar") {
      const { error } = await db.from("top_etapa_oficial").delete().eq("anio", anio).eq("etapa", etapa);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (accion === "fijar_orden") {
      const ids = cuerpo.ids ?? [];
      if (ids.length > 5 || new Set(ids).size !== ids.length) {
        return NextResponse.json({ error: "El orden debe tener hasta 5 candidatas, sin repetir." }, { status: 400 });
      }
      // La ronda final solo puede tener candidatas del top 5 oficial.
      const top5 = await filasDe("top5");
      if (!ids.every((id) => top5.some((f) => f.candidata_id === id))) {
        return NextResponse.json({ error: "Todas deben estar en el top 5 oficial." }, { status: 400 });
      }
      const { error: errorBorrar } = await db
        .from("top_etapa_oficial")
        .delete()
        .eq("anio", anio)
        .eq("etapa", "final");
      if (errorBorrar) return NextResponse.json({ error: errorBorrar.message }, { status: 500 });
      if (ids.length > 0) {
        const { error } = await db.from("top_etapa_oficial").insert(
          ids.map((candidata_id, i) => ({ anio, etapa: "final", orden: i + 1, candidata_id })),
        );
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Acción desconocida." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error desconocido." }, { status: 500 });
  }
}
