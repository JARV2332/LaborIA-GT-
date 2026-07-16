/**
 * components/LegalConsultant.tsx
 * Chat simulado de consultas legales laborales — Guatemala.
 * Respuestas en español chapín: amigables, directas y respaldadas
 * con el artículo de ley exacto al final de cada respuesta.
 */
import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Scale, Sparkles, ChevronDown } from "lucide-react";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface FAQ {
  id: string;
  pregunta: string;
  emoji: string;
  categoria: string;
}

interface Mensaje {
  id: string;
  tipo: "usuario" | "ia";
  texto: string;
  ley?: string;
  timestamp: Date;
}

// ─── BASE DE CONOCIMIENTO ─────────────────────────────────────────────────────

const FAQS: FAQ[] = [
  { id: "igss",         pregunta: "¿Cuándo puedo usar el IGSS?",                    emoji: "🏥", categoria: "Seguridad Social" },
  { id: "horas-extra",  pregunta: "¿Las horas extras son obligatorias?",             emoji: "⏰", categoria: "Jornada Laboral" },
  { id: "renuncia",     pregunta: "¿Qué pasa si renuncio?",                          emoji: "🚪", categoria: "Egreso" },
  { id: "documentos",   pregunta: "¿Qué documentos debo o no firmar?",               emoji: "📝", categoria: "Documentos" },
  { id: "periodo-pago", pregunta: "¿Cada cuánto me tienen que pagar?",               emoji: "💸", categoria: "Salario" },
  { id: "vacaciones",   pregunta: "¿Cuántos días de vacaciones me tocan?",           emoji: "🏖️", categoria: "Vacaciones" },
  { id: "bono14",       pregunta: "¿Qué es el Bono 14 y cuándo lo pagan?",          emoji: "💰", categoria: "Prestaciones" },
  { id: "despido",      pregunta: "¿Cómo sé si mi despido fue injustificado?",       emoji: "⚖️", categoria: "Despido" },
];

const RESPUESTAS: Record<string, { texto: string; ley: string }> = {
  igss: {
    texto: `¡Buena pregunta! El IGSS (Instituto Guatemalteco de Seguridad Social) es tu derecho desde el primer día que tu patrono te inscribe. Mero cuando empezás a trabajar formalmente y tu jefe te registra, tenés derecho a atención médica de accidentes laborales. Para enfermedad común y maternidad, necesitás mínimo 4 meses consecutivos cotizando (o sea, que tu patrono te haya descontado y pagado el IGSS esos 4 meses seguidos). Para invalidez, vejez y sobrevivencia (jubilación) ya se necesita más tiempo acumulado.

¡Ojo importante! Si tu patrono no te inscribió al IGSS, eso es una violación grave a la ley. Podés reportarlo directamente al IGSS o al MINTRAB sin miedo, y el patrono se expone a multas bien saladas.`,
    ley: "Art. 100 y 102 de la Constitución Política de la República de Guatemala · Decreto 295 (Ley Orgánica del IGSS), Art. 27 y 28.",
  },

  "horas-extra": {
    texto: `Las horas extra no son obligatorias, ¡y esto es bien importante que lo sepás! Tu patrono te las puede pedir, sí, pero vos tenés el derecho de decir que no si no querés hacerlas. Ahora, si las hacés (porque querés o porque fue urgencia de la empresa), el pago es obligatorio y es el doble de tu hora normal.

¿Cómo se calcula? Agarrás tu salario mensual, lo dividís entre 30 días y luego entre 8 horas. Eso es tu hora ordinaria. Las horas extra se pagan al 150% de esa tarifa (o sea, hora y media por cada hora extra en jornada diurna). Y si son en jornada nocturna o mixta, el recargo puede ser mayor.

También hay límite: no podés hacer más de 4 horas extra al día ni más de 12 a la semana. Si tu jefe te exige más que eso, ya está violando la ley.`,
    ley: "Art. 121, 122 y 124 del Código de Trabajo de Guatemala (Decreto 1441).",
  },

  renuncia: {
    texto: `Si vas a renunciar, hay cosas que sí y cosas que no te tocan, así que prestá atención:

✅ LO QUE SÍ TE CORRESPONDE siempre, aunque renuncies:
• Aguinaldo proporcional (de diciembre a noviembre, lo que hayas acumulado)
• Bono 14 proporcional (de julio a junio, lo acumulado)
• Vacaciones no gozadas (los días que te quedaron debiendo)
• Tu último salario completo hasta el día que te vas

❌ LO QUE NO TE TOCA si renunciás voluntariamente:
• Indemnización por tiempo de servicio (esa solo aplica para despido injustificado)

¡Recomendación chapín! Avisá con mínimo 30 días de anticipación (eso se llama preaviso) para no tener problemas ni que te descuenten nada. Aunque la ley permite renunciar sin preaviso en ciertos casos.`,
    ley: "Art. 83 CT (renuncia voluntaria) · Art. 130 CT (vacaciones) · Decreto 76-78 (Aguinaldo) · Decreto 42-92 (Bono 14).",
  },

  documentos: {
    texto: `¡Este tema es súper importante y mucha gente lo sufre! Acá van las reglas de oro:

📄 DOCUMENTOS QUE SÍ PODÉS FIRMAR con confianza:
• Tu contrato individual de trabajo (asegurate que diga tu salario real, tu horario y tus funciones)
• Recibos de pago de prestaciones donde los montos estén correctos y completos
• Tu carta de renuncia (si vos la decidís escribir)

🚫 DOCUMENTOS QUE JAMÁS DEBÉS FIRMAR sin revisar:
• Finiquitos o cartas de renuncia con el monto en blanco — si está en blanco, no firmés
• Documentos que digan "recibo conforme todas mis prestaciones" si no te han pagado todo
• Cartas de renuncia que el patrono te escribió por su cuenta y te pide que firmés (eso es ilegal)
• Cualquier documento que no entendás completamente

💡 Consejo de oro: Si te presionan a firmar algo, pedí tiempo, tomá foto del documento, y consultá antes. Ningún patrono serio te va a negar ese derecho.`,
    ley: "Art. 103 CT (contratos) · Art. 102 lit. f) CPRG (irrenunciabilidad de derechos) · Art. 106 CPRG.",
  },

  "periodo-pago": {
    texto: `La ley es bien clara con esto: el patrono tiene la obligación de pagarte de forma regular y no puede atrasarse más de lo acordado en tu contrato.

Los períodos de pago permitidos son:
• Semanal (cada 7 días) — común en construcción y trabajo por día
• Quincenal (cada 15 días) — muy usado en oficinas y comercio
• Mensual (cada 30 días) — también válido, pero el salario no puede ser menor al mínimo mensual

¡El patrono NO puede retenerte el salario! Si se atrasa más de una semana del día acordado, ya está en falta. Si te retrasan más de dos semanas sin justificación, eso constituye causa para que vos puedas terminar el contrato con responsabilidad del patrono y recibir indemnización, aunque hayas sido vos quien se vaya.`,
    ley: "Art. 92 y 93 del Código de Trabajo (Decreto 1441) · Art. 102 lit. a) CPRG.",
  },

  vacaciones: {
    texto: `Las vacaciones son un derecho irrenunciable, o sea que ni aunque vos quieras, no podés "regalarlas" o dejar de recibirlas. Acá el desglose:

🏖️ Te corresponden 15 días hábiles de vacaciones por cada año completo de trabajo continuo. Eso equivale más o menos a 3 semanas.

¿Cuándo se pagan? Deben tomarse dentro de los 60 días siguientes al cumpleaños de tu año laboral, y te tienen que pagar el salario normal durante esos días (no te pueden bajar el sueldo mientras estás de vaca).

¿Y si no las tomé? Si terminás el contrato (ya sea despido o renuncia) y tenés vacaciones acumuladas sin gozar, el patrono te las tiene que pagar en efectivo, calculadas a tu salario diario actual.

¿Puedo cambiarlas por dinero? Solo al finalizar el contrato. Mientras seguís trabajando, las vacaciones son para descansar, no para cambiarlas por efectivo.`,
    ley: "Art. 130, 131, 136 del Código de Trabajo · Art. 102 lit. h) CPRG.",
  },

  bono14: {
    texto: `El Bono 14 es uno de esos beneficios bien chapines que mucha gente en otros países no tiene. Se llama "Bono 14" porque básicamente es como si recibieras 14 salarios al año en lugar de 12.

💰 ¿Qué es exactamente? Es una bonificación anual equivalente a un salario mensual completo (tomando en cuenta salario base + bonos fijos).

📅 ¿Cuándo se paga? El patrono tiene que pagártelo entre el 1 y el 15 de julio de cada año, sí o sí.

⏳ ¿Y si tengo menos de un año? No hay problema, te pagan proporcional. El período va del 1 de julio al 30 de junio del año siguiente. Si entraste en enero y te van el abril, calculan solo esos meses trabajados.

¿Quién tiene derecho? ¡Todos los trabajadores del sector privado! No importa si sos de planta, por contrato, a prueba (si completaste el período), o si ganás más del mínimo.`,
    ley: "Decreto 42-92 del Congreso de la República (Ley de Bonificación Anual para Trabajadores del Sector Privado y Público), Art. 1, 2 y 5.",
  },

  despido: {
    texto: `¡Este es un tema caliente y muy importante! Un despido es injustificado (o "unilateral" como dice la ley) cuando el patrono te cesa sin tener una causa válida según el Código de Trabajo.

🔴 Causas que SÍ justifican un despido (y por las que no recibirías indemnización):
• Robo o fraude comprobado
• Daños intencionales a la empresa
• Violencia o acoso contra compañeros
• Abandono de trabajo (faltar sin avisar varios días)
• Revelar secretos de la empresa con daño comprobado

🟢 Si ninguna de esas aplica en tu caso, tu despido probablemente FUE injustificado y tenés derecho a:
• Indemnización por tiempo de servicio (un salario mensual × factor 14/12 × años trabajados)
• Aguinaldo proporcional
• Bono 14 proporcional
• Vacaciones pendientes

💡 Tip importante: Si te despidieron de palabra, pedí por escrito la causa. El patrono está obligado a dártela. Si no te la dan o la causa no tiene fundamento legal, ya tenés argumento para reclamar tu indemnización.`,
    ley: "Art. 77 y 82 del Código de Trabajo (causas justificadas e injustificadas) · Art. 102 lit. o) CPRG.",
  },
};

// ─── COMPONENTE ──────────────────────────────────────────────────────────────

export default function LegalConsultant() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: "bienvenida",
      tipo: "ia",
      texto: "¡Hola! Soy tu asistente legal chapín 👋 Seleccioná una pregunta frecuente o escribí tu duda y te ayudo con información basada en el Código de Trabajo de Guatemala.",
      timestamp: new Date(),
    },
  ]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [faqExpandido, setFaqExpandido] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, escribiendo]);

  function enviarPregunta(preguntaId: string, textoPregunta: string) {
    const respuestaData = RESPUESTAS[preguntaId];
    if (!respuestaData) return;

    const msgUsuario: Mensaje = {
      id: `u-${Date.now()}`,
      tipo: "usuario",
      texto: textoPregunta,
      timestamp: new Date(),
    };

    setMensajes((prev) => [...prev, msgUsuario]);
    setFaqExpandido(false);
    setEscribiendo(true);

    // Simula el "está escribiendo..." por un momento
    const delay = 800 + respuestaData.texto.length * 1.2;
    setTimeout(() => {
      setEscribiendo(false);
      const msgIA: Mensaje = {
        id: `ia-${Date.now()}`,
        tipo: "ia",
        texto: respuestaData.texto,
        ley: respuestaData.ley,
        timestamp: new Date(),
      };
      setMensajes((prev) => [...prev, msgIA]);
    }, Math.min(delay, 3000));
  }

  function handleFAQ(faq: FAQ) {
    enviarPregunta(faq.id, faq.pregunta);
  }

  async function handleInputSend() {
    const q = inputVal.trim();
    if (!q) return;
    setInputVal("");

    // Primero verificar si coincide con un FAQ predefinido (respuesta instantánea)
    const match = FAQS.find((f) =>
      f.pregunta.toLowerCase().includes(q.toLowerCase()) ||
      q.toLowerCase().includes(f.id.replace("-", " "))
    );

    if (match) {
      enviarPregunta(match.id, q);
      return;
    }

    // Pregunta libre → llamar a la API de legal-chat
    const msgUsuario: Mensaje = { id: `u-${Date.now()}`, tipo: "usuario", texto: q, timestamp: new Date() };
    setMensajes((prev) => [...prev, msgUsuario]);
    setFaqExpandido(false);
    setEscribiendo(true);

    // Construir historial para contexto (últimos 6 mensajes)
    const historial = mensajes.slice(-6).map((m) => ({
      rol: m.tipo,
      contenido: m.texto,
    }));

    try {
      const response = await fetch("/api/legal-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: q, historial }),
      });

      const data = await response.json();
      setEscribiendo(false);

      if (!response.ok) {
        throw new Error(data.error || "Error al consultar.");
      }

      setMensajes((prev) => [
        ...prev,
        {
          id: `ia-${Date.now()}`,
          tipo: "ia" as const,
          texto: data.respuesta,
          ley: data.ley,
          timestamp: new Date(),
        },
      ]);
    } catch (err: unknown) {
      setEscribiendo(false);
      setMensajes((prev) => [
        ...prev,
        {
          id: `ia-err-${Date.now()}`,
          tipo: "ia" as const,
          texto: err instanceof Error
            ? `Lo siento, no pude procesar tu consulta: ${err.message}`
            : "Hubo un problema de conexión. Intentá de nuevo.",
          timestamp: new Date(),
        },
      ]);
    }
  }

  return (
    <div className="flex flex-col space-y-3">
      <div>
        <h3 className="text-base font-extrabold" style={{ color: "var(--color-text-primary)" }}>
          💬 Consultor Legal
        </h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Respuestas en chapín, respaldadas por el Código de Trabajo GT
        </p>
      </div>

      {/* Ventana del chat */}
      <div
        className="rounded-2xl overflow-hidden flex flex-col"
        style={{
          border: "1px solid var(--color-surface-border)",
          boxShadow: "var(--shadow-elevated)",
          minHeight: "420px",
          maxHeight: "600px",
        }}
      >
        {/* Header del chat */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ backgroundColor: "var(--color-brand-dark)", borderBottom: "1px solid var(--color-brand-navy)" }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--color-brand-green)" }}
          >
            <Scale size={16} color="#fff" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#fff" }}>LaborIA — Asesor Legal GT</p>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--color-brand-green)" }} />
              <p className="text-xs" style={{ color: "var(--color-brand-green-light)" }}>En línea</p>
            </div>
          </div>
          <div className="ml-auto">
            <Sparkles size={16} style={{ color: "var(--color-brand-amber)" }} />
          </div>
        </div>

        {/* Mensajes */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          style={{ backgroundColor: "var(--color-surface-secondary)" }}
        >
          {mensajes.map((msg) => (
            <MensajeBox key={msg.id} msg={msg} />
          ))}

          {/* Typing indicator */}
          {escribiendo && (
            <div className="flex items-end gap-2">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--color-brand-dark)" }}
              >
                <Scale size={13} color="var(--color-brand-green)" />
              </div>
              <div
                className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-2.5"
                style={{ backgroundColor: "#fff", border: "1px solid var(--color-surface-border)" }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "var(--color-text-muted)",
                      animationDelay: `${i * 150}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Preguntas frecuentes expandibles */}
        <div style={{ backgroundColor: "#fff", borderTop: "1px solid var(--color-surface-border)" }}>
          <button
            type="button"
            onClick={() => setFaqExpandido(!faqExpandido)}
            className="flex w-full items-center justify-between px-4 py-2.5"
          >
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
              Preguntas frecuentes
            </span>
            <ChevronDown
              size={15}
              style={{
                color: "var(--color-text-muted)",
                transform: faqExpandido ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {faqExpandido && (
            <div className="px-3 pb-3 flex flex-wrap gap-2">
              {FAQS.map((faq) => (
                <button
                  key={faq.id}
                  type="button"
                  onClick={() => handleFAQ(faq)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
                  style={{
                    backgroundColor: "var(--color-surface-secondary)",
                    border: "1px solid var(--color-surface-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  <span>{faq.emoji}</span>
                  {faq.pregunta}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input de texto */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ backgroundColor: "#fff", borderTop: "1px solid var(--color-surface-border)" }}
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInputSend()}
            placeholder="Escribí tu pregunta laboral..."
            className="input-base"
            style={{ flexGrow: 1 }}
          />
          <button
            type="button"
            onClick={handleInputSend}
            disabled={!inputVal.trim() || escribiendo}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: "var(--color-brand-navy)", color: "#fff" }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTE: MENSAJE ──────────────────────────────────────────────────

function MensajeBox({ msg }: { msg: Mensaje }) {
  const esIA = msg.tipo === "ia";

  return (
    <div className={`flex items-end gap-2 ${esIA ? "" : "flex-row-reverse"}`}>
      {esIA && (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--color-brand-dark)" }}
        >
          <Scale size={13} color="var(--color-brand-green)" />
        </div>
      )}

      <div className={`max-w-[85%] space-y-1.5 ${esIA ? "" : "items-end flex flex-col"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            esIA ? "rounded-bl-sm" : "rounded-br-sm"
          }`}
          style={{
            backgroundColor: esIA ? "#fff" : "var(--color-brand-navy)",
            color: esIA ? "var(--color-text-primary)" : "#fff",
            border: esIA ? "1px solid var(--color-surface-border)" : "none",
            whiteSpace: "pre-line",
          }}
        >
          {msg.texto}
        </div>

        {/* Base legal */}
        {esIA && msg.ley && (
          <div
            className="rounded-lg px-3 py-2"
            style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            <p className="text-xs font-bold mb-0.5" style={{ color: "var(--color-brand-navy)" }}>
              📖 Base legal
            </p>
            <p className="text-xs" style={{ color: "var(--color-brand-navy-light)" }}>
              {msg.ley}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs px-1" style={{ color: "var(--color-text-muted)" }}>
          {msg.timestamp.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
