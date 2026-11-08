import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODELO = "gemini-3.1-flash-lite";

// Fuentes que aceptamos como confiables para el top oficial.
const FUENTES_PERMITIDAS = [
  "missuniverse.com",
  "metro.style",
  "eltiempo.com",
  "gestion.pe",
  "hola.com",
];

type Resultado = {
  top: string[] | null;
  fuentes: { titulo: string; url: string; confiable: boolean }[];
  noReconocidos: string[];
  duplicados: boolean;
  estado: "ok" | "revisar" | "sin_resultado";
  motivo: string;
  textoCrudo?: string;
};

function sinAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export async function POST(req: Request) {
  const clave = process.env.GEMINI_API_KEY;
  if (!clave) {
    return NextResponse.json({ error: "Falta GEMINI_API_KEY en el servidor." }, { status: 500 });
  }

  const { anio, cantidad, paises } = (await req.json()) as {
    anio: number;
    cantidad: number;
    paises: string[];
  };

  const prompt = `Busca el top ${cantidad} oficial de Miss Universe ${anio}, en el orden en que se anunció.
Prioriza missuniverse.com y medios de noticias confiables.
Responde SOLO con JSON válido con esta forma: {"top":["Pais1","Pais2"],"fuentes":["url1","url2"]}.
Usa exactamente estos nombres de país, sin cambiarlos: ${paises.join(", ")}.
Si no encuentras la información, responde {"top":null,"fuentes":[]}.`;

  const respuesta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": clave,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
      }),
    },
  );

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    return NextResponse.json(
      { error: `Gemini respondió ${respuesta.status}.`, detalle },
      { status: 502 },
    );
  }

  const datos = await respuesta.json();
  const candidato = datos.candidates?.[0];
  const texto: string = (candidato?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? "")
    .join("");

  // Fuentes que usó la búsqueda de Google.
  const chunks: { web?: { title?: string; uri?: string } }[] =
    candidato?.groundingMetadata?.groundingChunks ?? [];
  const fuentes = chunks
    .filter((c) => c.web)
    .map((c) => {
      const titulo = c.web?.title ?? "";
      const confiable = FUENTES_PERMITIDAS.some((d) => titulo.toLowerCase().includes(d));
      return { titulo, url: c.web?.uri ?? "", confiable };
    });

  let json: { top?: string[] | null } = {};
  try {
    json = JSON.parse(texto.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch {
    const resultado: Resultado = {
      top: null,
      fuentes,
      noReconocidos: [],
      duplicados: false,
      estado: "sin_resultado",
      motivo: "La respuesta no vino en el formato esperado.",
      textoCrudo: texto,
    };
    return NextResponse.json(resultado);
  }

  const top = Array.isArray(json.top) ? json.top : null;
  if (!top || top.length === 0) {
    return NextResponse.json({
      top: null,
      fuentes,
      noReconocidos: [],
      duplicados: false,
      estado: "sin_resultado",
      motivo: "No se encontró el top oficial.",
    } satisfies Resultado);
  }

  // Validación contra los nombres de la base de datos.
  const mapa = new Map(paises.map((p) => [sinAcentos(p), p]));
  const noReconocidos = top.filter((p) => !mapa.has(sinAcentos(p)));
  const normalizados = top.map((p) => mapa.get(sinAcentos(p)) ?? p);
  const duplicados = new Set(normalizados).size !== normalizados.length;
  const cantidadOk = normalizados.length === cantidad;
  const hayConfiable = fuentes.some((f) => f.confiable);

  const problemas: string[] = [];
  if (noReconocidos.length) problemas.push(`nombres no reconocidos: ${noReconocidos.join(", ")}`);
  if (duplicados) problemas.push("hay países repetidos");
  if (!cantidadOk) problemas.push(`llegaron ${normalizados.length} de ${cantidad}`);
  if (!hayConfiable) problemas.push("ninguna fuente de la lista confiable");

  const resultado: Resultado = {
    top: normalizados,
    fuentes,
    noReconocidos,
    duplicados,
    estado: problemas.length === 0 ? "ok" : "revisar",
    motivo: problemas.length === 0 ? "Todo validado. Confirma antes de usarlo." : problemas.join("; "),
  };
  return NextResponse.json(resultado);
}
