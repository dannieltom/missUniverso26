import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "crypto";

export const runtime = "nodejs";

type Cuerpo = {
  pin: string;
  accion: "agregar" | "quitar" | "limpiar" | "fijar_corte";
  anio: number;
  corte: number;
  candidata_id?: string;
};

// Compara el PIN en tiempo constante para no filtrar información por tiempos de respuesta.
function pinValido(recibido: string): boolean {
  const esperado = process.env.ADMIN_PIN;
  if (!esperado || !recibido) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const cuerpo = (await req.json()) as Cuerpo;

  if (!pinValido(cuerpo.pin)) {
    return NextResponse.json({ error: "PIN incorrecto." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !servicio) {
    return NextResponse.json(
      { error: "Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el servidor." },
      { status: 500 },
    );
  }

  // La clave de servicio salta las reglas de seguridad: solo se usa aquí, después de validar el PIN.
  const db = createClient(url, servicio, { auth: { persistSession: false } });
  const { anio, corte, accion } = cuerpo;

  if (!Number.isInteger(anio) || !Number.isInteger(corte) || corte < 1) {
    return NextResponse.json({ error: "Año o tamaño de corte inválido." }, { status: 400 });
  }

  // Filas actuales del corte, en orden.
  async function filasActuales() {
    const { data, error } = await db
      .from("top_oficial")
      .select("candidata_id, orden")
      .eq("anio", anio)
      .eq("corte", corte)
      .order("orden", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  try {
    if (accion === "fijar_corte") {
      const { error } = await db
        .from("top_oficial_config")
        .upsert({ anio, corte }, { onConflict: "anio" });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (accion === "agregar") {
      if (!cuerpo.candidata_id) {
        return NextResponse.json({ error: "Falta la candidata." }, { status: 400 });
      }
      const filas = await filasActuales();
      if (filas.length >= corte) {
        return NextResponse.json({ error: `El top ${corte} ya está completo.` }, { status: 400 });
      }
      if (filas.some((f) => f.candidata_id === cuerpo.candidata_id)) {
        return NextResponse.json({ error: "Esa candidata ya está en el top." }, { status: 400 });
      }
      const { error } = await db.from("top_oficial").insert({
        anio,
        corte,
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
        .from("top_oficial")
        .delete()
        .eq("anio", anio)
        .eq("corte", corte)
        .eq("candidata_id", cuerpo.candidata_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Renumera el orden para que quede 1, 2, 3... sin huecos.
      const restantes = await filasActuales();
      for (let i = 0; i < restantes.length; i++) {
        if (restantes[i].orden !== i + 1) {
          await db
            .from("top_oficial")
            .update({ orden: i + 1 })
            .eq("anio", anio)
            .eq("corte", corte)
            .eq("candidata_id", restantes[i].candidata_id);
        }
      }
      return NextResponse.json({ ok: true });
    }

    if (accion === "limpiar") {
      const { error } = await db.from("top_oficial").delete().eq("anio", anio).eq("corte", corte);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Acción desconocida." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error desconocido." }, { status: 500 });
  }
}
