/**
 * pages/api/analyze-document.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Serverless Route — Análisis de documentos laborales con IA de Visión
 *
 * Recibe: { base64: string, mimeType: string }
 * Retorna: { datos: {...}, alertas: [...], textoExtraido: string }
 *
 * Usa GPT-4o Vision para:
 *  1. Extraer campos estructurados (fechas, salario)
 *  2. Detectar cláusulas abusivas o renuncia de derechos
 *  3. Devolver el JSON exacto que necesita el motor de cálculos
 * ─────────────────────────────────────────────────────────────────────────────
 */

import OpenAI from "openai";
import {
  checkRateLimit,
  getClientIp,
  buildLimitExceededPayload,
} from "../../utils/rateLimit";

// Groq es compatible con el SDK de OpenAI — solo cambia la baseURL y la key
function getClient() {
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  const isGroq = !!process.env.GROQ_API_KEY;
  return new OpenAI({
    apiKey,
    ...(isGroq ? { baseURL: "https://api.groq.com/openai/v1" } : {}),
  });
}

// ─── PROMPT DEL SISTEMA ───────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres un abogado laboral experto en el Código de Trabajo de Guatemala (Decreto 1441) y un analista forense de documentos. Tu única función es analizar documentos laborales guatemaltecos (contratos, finiquitos, cartas de despido, cartas de renuncia, liquidaciones) y devolver un JSON estructurado ESTRICTAMENTE en el formato indicado. NO agregues texto fuera del JSON.

INSTRUCCIONES DE EXTRACCIÓN:
1. Extrae fecha_inicio: La fecha en que inició la relación laboral (formato ISO YYYY-MM-DD). Si no aparece, usa null.
2. Extrae fecha_fin: La fecha de terminación del contrato o fecha del documento (formato ISO YYYY-MM-DD). Si no aparece, usa la fecha actual.
3. Extrae salario_base: El salario mensual ordinario en GTQ (solo número, sin símbolo). Si aparecen bonos separados del salario base, extrae solo el salario base aquí.
4. Extrae bonos_mensuales: Suma de bonos fijos mensuales adicionales en GTQ (solo número). Si no hay, devuelve 0.
5. Determina es_despido_unilateral: true si el documento indica despido, terminación por voluntad del patrono, o "mutuo acuerdo" forzado. false si es renuncia genuinamente voluntaria. IMPORTANTE: "Mutuo Acuerdo" casi siempre encubre un despido unilateral — márcalo como true a menos que haya evidencia clara de voluntariedad del trabajador.

ANÁLISIS DE CLÁUSULAS ABUSIVAS — Genera alertas para cada uno que detectes:
- ALERTA ROJA (nivel: "rojo"): Cláusulas que violan derechos irrenunciables del trabajador:
  * "Recibo conforme y en total satisfacción de todas mis prestaciones" sin montos detallados
  * Renuncia a derechos futuros o indeterminados
  * Monto de liquidación manifiestamente inferior al legal
  * "Mutuo acuerdo" que oculta un despido unilateral
  * Cláusulas de confidencialidad que impiden denunciar ante el MINTRAB o IGSS
  * Renuncia al derecho de acudir a instancias laborales
- ALERTA AMARILLA (nivel: "amarillo"): Cláusulas dudosas o potencialmente perjudiciales:
  * Montos que se ven incompletos o incorrectos
  * Fechas inconsistentes
  * Falta de desglose de prestaciones
  * Período de preaviso inusualmente largo o corto
  * Plazos de pago que exceden lo legal (más de 30 días)
- INFO (nivel: "info"): Observaciones neutras o datos faltantes pero no críticos

FORMATO JSON DE RESPUESTA OBLIGATORIO (devuelve SOLO esto, sin markdown, sin texto extra):
{
  "datos": {
    "fechaInicio": "YYYY-MM-DD o null",
    "fechaFin": "YYYY-MM-DD",
    "salarioBase": 0,
    "bonosMensuales": 0,
    "diasVacacionesPendientes": 0,
    "esDespidoUnilateral": true
  },
  "alertas": [
    {
      "nivel": "rojo|amarillo|info",
      "titulo": "Título corto de la alerta",
      "descripcion": "Explicación en español guatemalteco, empática y clara para el trabajador",
      "clausula": "Texto exacto del documento que genera la alerta (si aplica)"
    }
  ],
  "tipoDocumento": "contrato|finiquito|carta_despido|carta_renuncia|liquidacion|otro",
  "resumenDocumento": "Resumen en 2-3 oraciones del documento en español chapín, indicando de qué trata y la situación general del trabajador",
  "confianzaExtraccion": "alta|media|baja"
}`;

// ─── HANDLER PRINCIPAL ────────────────────────────────────────────────────────

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "15mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  const { base64, mimeType, images } = req.body;
  const archivos = Array.isArray(images) && images.length > 0
    ? images
    : base64 && mimeType
      ? [{ base64, mimeType }]
      : [];

  if (archivos.length === 0) {
    return res.status(400).json({ error: "Se requiere al menos una imagen del documento." });
  }

  if (archivos.length > 6) {
    return res.status(400).json({ error: "Solo se pueden analizar hasta 6 páginas por documento." });
  }

  const TIPOS_VALIDOS = ["image/jpeg", "image/png", "image/webp"];
  const archivoInvalido = archivos.find(
    (archivo) => !archivo?.base64 || !TIPOS_VALIDOS.includes(archivo?.mimeType)
  );
  if (archivoInvalido) {
    return res.status(400).json({ error: "Formato no soportado. Envía imágenes JPG, PNG o WebP." });
  }

  // Freemium: N análisis gratis por IP / día (default 3)
  const analyzeLimit = Number(process.env.RATE_LIMIT_ANALYZE || 3);
  const analyzeWindowMs = Number(process.env.RATE_LIMIT_ANALYZE_WINDOW_MS || 24 * 60 * 60 * 1000);
  const ip = getClientIp(req);
  const rate = checkRateLimit(`analyze:${ip}`, analyzeLimit, analyzeWindowMs);

  if (!rate.allowed) {
    const payload = buildLimitExceededPayload({
      featureLabel: "análisis de documentos",
      limit: rate.limit,
      resetAt: rate.resetAt,
    });
    res.setHeader("Retry-After", Math.ceil((rate.resetAt - Date.now()) / 1000));
    return res.status(429).json(payload);
  }

  if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
    return res.status(200).json(buildDemoResponse());
  }

  try {
    const openai = getClient();
    const model = process.env.GROQ_VISION_MODEL || process.env.OPENAI_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

    const contenidoPaginas = archivos.map((archivo) => ({
      type: "image_url",
      image_url: {
        url: `data:${archivo.mimeType};base64,${archivo.base64}`,
        detail: "high",
      },
    }));

    const completion = await openai.chat.completions.create({
      model,
      max_tokens: 1500,
      temperature: 0.1, // Temperatura baja = máxima precisión en extracción
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            ...contenidoPaginas,
            {
              type: "text",
              text: `Analiza las ${archivos.length} página(s) de este documento laboral guatemalteco como un solo documento. Busca cláusulas perjudiciales incluso en letra pequeña y devuelve ÚNICAMENTE el JSON estructurado según las instrucciones del sistema.`,
            },
          ],
        },
      ],
    });

    const rawText = completion.choices[0]?.message?.content?.trim() ?? "";

    // Limpiar posible markdown si el modelo lo agrega
    const jsonText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error("Error parseando JSON de OpenAI:", jsonText);
      return res.status(422).json({
        error: "No se pudo interpretar la respuesta de la IA. Intenta con una imagen más clara.",
        rawResponse: jsonText,
      });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Error en analyze-document:", err);
    const status = err?.status ?? 500;
    const mensaje =
      status === 429
        ? "Límite de la API alcanzado. Intenta en unos segundos."
        : status === 401
        ? "API Key inválida. Verifica tu configuración."
        : "Error al procesar el documento. Intenta de nuevo.";
    return res.status(status).json({ error: mensaje });
  }
}

// ─── RESPUESTA DE DEMOSTRACIÓN (sin API key) ──────────────────────────────────

function buildDemoResponse() {
  return {
    datos: {
      fechaInicio: "2022-03-01",
      fechaFin: new Date().toISOString().split("T")[0],
      salarioBase: 4500,
      bonosMensuales: 250,
      diasVacacionesPendientes: 12,
      esDespidoUnilateral: true,
    },
    alertas: [
      {
        nivel: "rojo",
        titulo: "Cláusula de 'Mutuo Acuerdo' detectada",
        descripcion:
          "El documento usa la figura de 'Mutuo Acuerdo' para terminar el contrato. En Guatemala, esto es frecuentemente usado para disfrazar un despido unilateral y evitar el pago de indemnización. Antes de firmar, verificá que estés recibiendo todos tus derechos completos.",
        clausula: "Las partes de común acuerdo dan por terminada la relación laboral...",
      },
      {
        nivel: "amarillo",
        titulo: "No se especifica desglose de prestaciones",
        descripcion:
          "El documento menciona un monto global pero no desglosa Aguinaldo, Bono 14, Vacaciones e Indemnización por separado. Exigí el desglose completo antes de firmar.",
        clausula: "Se paga la cantidad de Q12,000 en concepto de prestaciones laborales.",
      },
      {
        nivel: "info",
        titulo: "Modo demostración activo",
        descripcion:
          "Estás viendo datos de ejemplo. Para análisis real de tu documento, el administrador de la app debe configurar la API Key de OpenAI.",
        clausula: null,
      },
    ],
    tipoDocumento: "finiquito",
    resumenDocumento:
      "Este es un finiquito de demostración. En el modo real, la IA extrae los datos de tu documento y analiza cláusulas abusivas para proteger tus derechos laborales.",
    confianzaExtraccion: "alta",
  };
}
