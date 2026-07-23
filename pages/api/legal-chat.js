/**
 * pages/api/legal-chat.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Serverless Route — Consultor Legal Laboral con IA
 *
 * Recibe: { mensaje: string, historial?: Array<{rol, contenido}> }
 * Retorna: { respuesta: string, ley: string, categoria: string }
 *
 * Usa el Código de Trabajo de Guatemala conceptualizado en el prompt del
 * sistema como contexto RAG (Retrieval-Augmented Generation) para dar
 * respuestas precisas, empáticas y legalmente respaldadas.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import OpenAI from "openai";
import {
  checkRateLimit,
  getClientIp,
  buildLimitExceededPayload,
} from "../../utils/rateLimit";

function getClient() {
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  const isGroq = !!process.env.GROQ_API_KEY;
  return new OpenAI({
    apiKey,
    ...(isGroq ? { baseURL: "https://api.groq.com/openai/v1" } : {}),
  });
}

// ─── PROMPT DEL SISTEMA — CONTEXTO RAG DEL CÓDIGO DE TRABAJO GT ──────────────
const SYSTEM_PROMPT = `Sos un asesor legal laboral experto en el Código de Trabajo de Guatemala (Decreto 1441 del Congreso de la República) y leyes laborales complementarias. Tu misión es empoderar a los trabajadores guatemaltecos para que conozcan y defiendan sus derechos frente a patronos abusivos, con información precisa, empática y accesible.

CONOCIMIENTO BASE — CÓDIGO DE TRABAJO GUATEMALA:

JORNADAS Y SALARIOS:
- Jornada ordinaria diurna: 8 horas/día, 44 horas/semana (Art. 116 CT)
- Jornada ordinaria nocturna: 6 horas/día, 36 horas/semana (Art. 116 CT)
- Jornada mixta: 7 horas/día, 42 horas/semana (Art. 116 CT)
- Salario mínimo 2026 no agrícola: Q3,559.60/mes + Q250 Bono Incentivo = Q3,809.60 total
- Horas extra: máximo 4/día, 12/semana, pago al 150% (Art. 121, 122 CT)
- Pago de salario: semanal, quincenal o mensual (Art. 92 CT)

PRESTACIONES LABORALES:
- Aguinaldo: 1 salario mensual, período Dic-Nov, pago 1-15 diciembre (Decreto 76-78)
- Bono 14: 1 salario mensual, período Jul-Jun, pago 1-15 julio (Decreto 42-92)
- Vacaciones: 15 días hábiles por año trabajado (Art. 130 CT)
- Bono Incentivo: Q250 fijos mensuales (Decreto 37-2001)
- IGSS: obligatorio inscribir al trabajador desde el inicio. Accidentes: desde día 1. Enfermedad: mínimo 4 meses cotizados (Decreto 295 IGSS)

TERMINACIÓN DE CONTRATO:
- Despido injustificado: Indemnización = 1 mes × factor 14/12 × años trabajados (Art. 82 CT)
- Renuncia voluntaria: NO hay indemnización pero SÍ hay Aguinaldo + Bono 14 + Vacaciones (Art. 83 CT)
- Causas justificadas de despido: robo, fraude, daños intencionales, abandono (Art. 77 CT)
- "Mutuo Acuerdo": frecuentemente ilegal si encubre un despido forzado (Art. 102 CPRG)
- Preaviso recomendado: 30 días (Art. 83 CT)

DERECHOS FUNDAMENTALES IRRENUNCIABLES (Art. 102 CPRG):
- Salario mínimo garantizado
- Jornada máxima legal
- Descanso semanal (1 día por cada 6 trabajados)
- Vacaciones remuneradas
- Aguinaldo
- Bono 14
- Igualdad de salario por igual trabajo
- Prohibición de trabajo forzado
- Protección a la maternidad (Art. 102 lit. k) CPRG — 84 días de licencia)
- Derecho de sindicalización

DOCUMENTOS:
- Todo contrato debe ser escrito (Art. 29 CT)
- Contrato verbal tiene validez legal pero es más difícil de probar
- Finiquito con "recibo conforme de todas las prestaciones" en blanco NO debe firmarse
- El patrono debe dar constancia de trabajo al terminar la relación (Art. 87 CT)
- Carta de despido debe indicar la causa justificada (Art. 78 CT)

IGSS Y SEGURIDAD SOCIAL:
- Patrono que no inscribe al trabajador comete infracción grave (multa + responsabilidad)
- Trabajador puede reportar al IGSS: 1635 o igssgt.org
- Accidente laboral cubre desde el primer día de trabajo
- Incapacidad temporal: 66.67% del salario pagado por IGSS

INSTITUCIONES DE APOYO:
- MINTRAB (Ministerio de Trabajo): denuncias laborales, 1548, mintrabajo.gob.gt
- IGSS: afiliación y prestaciones, 1635, igssgt.org
- Procuraduría de los Derechos Humanos: pdh.org.gt
- Defensa Pública Penal: asesoría gratuita para casos laborales penales

REGLAS DE RESPUESTA OBLIGATORIAS:
1. Hablá siempre en español guatemalteco (chapín): informal pero respetuoso, como un abogado amigo
2. Usá "vos/te/tu" en lugar de "usted" para crear cercanía
3. Sé directo/a: comenzá con la respuesta más importante, no con introducciones largas
4. Siempre terminá con la base legal exacta (artículo, decreto o ley)
5. Si la situación es urgente o el trabajador puede estar siendo timado, decilo claramente
6. NUNCA minimices el problema del trabajador ni justifiques prácticas ilegales del patrono
7. Si no tenés certeza, decilo honestamente y recomendá consultar con el MINTRAB o un abogado
8. Limitá la respuesta a máximo 250 palabras para que sea fácil de leer en móvil
9. Usá emojis con moderación para hacer el texto más amigable
10. Si alguien te saluda o pregunta algo fuera del tema laboral, respondé amablemente y redirigí la conversación a temas laborales guatemaltecos. Nunca ignores al usuario.
11. SIEMPRE respondé únicamente con el objeto JSON indicado, sin texto previo ni posterior, sin bloques de código, sin markdown.

Tu respuesta debe ser EXCLUSIVAMENTE este objeto JSON (nada más):
{
  "respuesta": "Respuesta en español chapín (máx 250 palabras). Nunca incluyas JSON aquí, solo texto natural.",
  "ley": "Artículo(s) y decreto(s) específicos, o cadena vacía si no aplica ley específica",
  "categoria": "salario|jornada|prestaciones|despido|igss|documentos|acoso|maternidad|general",
  "urgente": true o false
}`;

// ─── HANDLER PRINCIPAL ────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  const { mensaje, historial = [] } = req.body;

  if (!mensaje || typeof mensaje !== "string" || mensaje.trim().length === 0) {
    return res.status(400).json({ error: "El campo mensaje es obligatorio." });
  }

  if (mensaje.trim().length > 1000) {
    return res.status(400).json({ error: "La pregunta es demasiado larga (máximo 1000 caracteres)." });
  }

  // Freemium: N chats gratis por IP / hora (default 3)
  const chatLimit = Number(process.env.RATE_LIMIT_CHAT || 3);
  const chatWindowMs = Number(process.env.RATE_LIMIT_CHAT_WINDOW_MS || 60 * 60 * 1000);
  const ip = getClientIp(req);
  const rate = checkRateLimit(`chat:${ip}`, chatLimit, chatWindowMs);

  if (!rate.allowed) {
    const payload = buildLimitExceededPayload({
      featureLabel: "consultas al chat",
      limit: rate.limit,
      resetAt: rate.resetAt,
    });
    res.setHeader("Retry-After", Math.ceil((rate.resetAt - Date.now()) / 1000));
    return res.status(429).json(payload);
  }

  if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
    return res.status(200).json(buildDemoResponse(mensaje));
  }

  try {
    const openai = getClient();
    const model = process.env.GROQ_CHAT_MODEL || process.env.OPENAI_CHAT_MODEL || "llama-3.3-70b-versatile";

    // Construir historial de conversación (máximo últimos 6 mensajes para no exceder tokens)
    const mensajesHistorial = historial
      .slice(-6)
      .map((m) => ({
        role: m.rol === "usuario" ? "user" : "assistant",
        content: m.contenido,
      }));

    const completion = await openai.chat.completions.create({
      model,
      max_tokens: 600,
      temperature: 0.4,
      response_format: { type: "json_object" }, // Fuerza JSON puro — Groq lo soporta
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...mensajesHistorial,
        { role: "user", content: mensaje.trim() },
      ],
    });

    const rawText = completion.choices[0]?.message?.content?.trim() ?? "";

    // Extraer JSON de forma robusta — busca el primer { y el último }
    let jsonText = rawText;
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = rawText.slice(firstBrace, lastBrace + 1);
    } else {
      // Fallback: quitar fences de markdown si los hubiera
      jsonText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
      // Sanidad: asegurarse de que respuesta no contenga JSON incrustado
      if (typeof parsed.respuesta === "string" && parsed.respuesta.includes('{"respuesta"')) {
        const innerMatch = parsed.respuesta.match(/^([\s\S]*?)\s*\{[\s\S]*\}[\s\S]*$/);
        parsed.respuesta = innerMatch ? innerMatch[1].trim() : parsed.respuesta.split("{")[0].trim();
      }
    } catch {
      // Último recurso: mostrar el texto limpio sin JSON
      const textoLimpio = rawText.replace(/\{[\s\S]*\}/g, "").trim();
      return res.status(200).json({
        respuesta: textoLimpio || "No pude generar una respuesta en este momento. Intentá de nuevo.",
        ley: "Código de Trabajo de Guatemala (Decreto 1441)",
        categoria: "general",
        urgente: false,
      });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Error en legal-chat:", err);
    const status = err?.status ?? 500;
    const mensaje_err =
      status === 429
        ? "Mucho tráfico en este momento. Esperá un momento e intentá de nuevo."
        : status === 401
        ? "Configuración inválida del servidor."
        : "Error procesando tu consulta. Intentá de nuevo.";
    return res.status(status).json({ error: mensaje_err });
  }
}

// ─── RESPUESTA DE DEMOSTRACIÓN ────────────────────────────────────────────────

function buildDemoResponse(mensaje) {
  const lower = mensaje.toLowerCase();

  if (lower.includes("igss")) {
    return {
      respuesta:
        "¡El IGSS es tu derecho desde el primer día! Si tu patrono te inscribió formalmente, los accidentes de trabajo te cubren desde que empezás. Para enfermedad común necesitás 4 meses cotizados seguidos. Si tu jefe no te inscribió al IGSS, eso es una violación grave — podés reportarlo al 1635 y al MINTRAB al 1548. El patrono se expone a multas y a pagar retroactivamente.",
      ley: "Art. 100 y 102 CPRG · Decreto 295 IGSS, Art. 27 y 28",
      categoria: "igss",
      urgente: false,
    };
  }

  if (lower.includes("despido") || lower.includes("despidieron")) {
    return {
      respuesta:
        "Si te despidieron sin una causa justificada válida según el Art. 77 del Código de Trabajo, tenés derecho a indemnización. El monto es: salario mensual × 14/12 × años trabajados. Además, aunque te hayan despedido, te corresponden Aguinaldo proporcional, Bono 14 proporcional y vacaciones no gozadas. ¡No firmes nada ni recibas ningún cheque sin antes revisar que el monto sea el correcto!",
      ley: "Art. 77, 82 y 83 del Código de Trabajo (Decreto 1441)",
      categoria: "despido",
      urgente: true,
    };
  }

  return {
    respuesta:
      "Esta es una respuesta de demostración. Para obtener respuestas reales de IA sobre el Código de Trabajo guatemalteco, el administrador debe configurar la API Key de OpenAI en el archivo .env.local. Mientras tanto, usá los botones de preguntas frecuentes que tienen respuestas predefinidas completas.",
    ley: "Código de Trabajo de Guatemala (Decreto 1441)",
    categoria: "general",
    urgente: false,
  };
}
