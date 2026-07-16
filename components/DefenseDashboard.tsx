/**
 * components/DefenseDashboard.tsx
 * Pantalla 2 — Dashboard de Defensa Laboral.
 *
 * Sección 1: Gráfica comparativa empresa vs. motor de cálculo legal
 * Sección 2: Semáforo de alertas (OCR + formulario)
 * Sección 3: Guía MINTRAB — Mochila de supervivencia + script de conciliación
 */
import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Leaf,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Banknote,
  Scale,
  FileWarning,
  Briefcase,
  ClipboardList,
  MessageSquareQuote,
  ArrowLeft,
  RefreshCcw,
} from "lucide-react";
import { useLaborContext } from "@/context/LaborContext";
import type { ResultadoPrestaciones } from "@/utils/laborCalculations";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(n);
}

function pct(parcial: number, total: number) {
  if (total === 0) return 0;
  return Math.min(100, Math.round((parcial / total) * 100));
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function DefenseDashboard() {
  const { resultado, ocrResult, formData, ofertaEmpresa, setOfertaEmpresa, resetSesion } =
    useLaborContext();

  if (!resultado) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Scale size={40} style={{ color: "var(--color-text-muted)" }} />
        <p className="text-base font-semibold" style={{ color: "var(--color-text-secondary)" }}>
          No hay resultados todavía.
        </p>
        <Link
          href="/calculadora"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
          style={{ backgroundColor: "var(--color-brand-green)", color: "#fff" }}
        >
          <ArrowLeft size={16} /> Ir a calcular
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── 1. GRÁFICA COMPARATIVA ── */}
      <GraficaComparativa
        resultado={resultado}
        ofertaEmpresa={ofertaEmpresa}
        setOfertaEmpresa={setOfertaEmpresa}
      />

      {/* ── 2. SEMÁFORO DE ALERTAS ── */}
      <Semaforo resultado={resultado} ocrResult={ocrResult} formData={formData} />

      {/* ── 3. GUÍA MINTRAB ── */}
      <GuiaMINTRAB resultado={resultado} />

      {/* Botón de nueva consulta */}
      <button
        type="button"
        onClick={() => { resetSesion(); window.location.href = "/calculadora"; }}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-80"
        style={{
          backgroundColor: "var(--color-surface-secondary)",
          border: "1px solid var(--color-surface-border)",
          color: "var(--color-text-secondary)",
        }}
      >
        <RefreshCcw size={15} /> Nueva consulta
      </button>
    </div>
  );
}

// ─── SECCIÓN 1: GRÁFICA COMPARATIVA ──────────────────────────────────────────

function GraficaComparativa({
  resultado,
  ofertaEmpresa,
  setOfertaEmpresa,
}: {
  resultado: ResultadoPrestaciones;
  ofertaEmpresa: string;
  setOfertaEmpresa: (v: string) => void;
}) {
  const [desglose, setDesglose] = useState(false);
  const granTotal = resultado.resumen.granTotal.monto;
  const oferta = parseFloat(ofertaEmpresa) || 0;
  const diferencia = granTotal - oferta;
  const ofertaEsInferior = oferta > 0 && oferta < granTotal;
  const ofertaEsJusta = oferta > 0 && oferta >= granTotal;

  // Barras
  const maxVal = Math.max(granTotal, oferta, 1);
  const barLegal = pct(granTotal, maxVal);
  const barOferta = oferta > 0 ? pct(oferta, maxVal) : 0;

  // Desglose de prestaciones
  const items = [
    { label: "Indemnización", monto: resultado.resumen.indemnizacion, color: "var(--color-brand-navy)", aplica: resultado.indemnizacion.aplica },
    { label: "Aguinaldo prop.", monto: resultado.resumen.aguinaldo, color: "var(--color-brand-green)", aplica: true },
    { label: "Bono 14 prop.", monto: resultado.resumen.bono14, color: "var(--color-brand-green-dark)", aplica: true },
    { label: "Vacaciones", monto: resultado.resumen.vacaciones, color: "var(--color-brand-amber)", aplica: true },
  ].filter((i) => i.aplica);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--color-surface-border)", boxShadow: "var(--shadow-elevated)" }}
    >
      {/* Header */}
      <div className="px-5 py-4" style={{ backgroundColor: "var(--color-brand-dark)" }}>
        <div className="flex items-center gap-2">
          <Banknote size={18} style={{ color: "var(--color-brand-green)" }} />
          <h2 className="text-base font-extrabold" style={{ color: "#fff" }}>
            Lo que te corresponde vs. lo que ofrecen
          </h2>
        </div>
        <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          Compará los números y sabé si te están dando lo justo
        </p>
      </div>

      <div className="px-5 py-5 space-y-5" style={{ backgroundColor: "#fff" }}>
        {/* Input oferta empresa */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-text-secondary)" }}>
            ¿Cuánto te está ofreciendo la empresa? (opcional)
          </label>
          <div className="relative">
            <span
              className="absolute inset-y-0 left-3 flex items-center text-sm font-bold"
              style={{ color: "var(--color-text-muted)" }}
            >
              Q
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={ofertaEmpresa}
              onChange={(e) => setOfertaEmpresa(e.target.value)}
              className="input-base pl-7"
            />
          </div>
        </div>

        {/* Barras comparativas */}
        <div className="space-y-4">
          {/* Barra legal */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold" style={{ color: "var(--color-brand-green-dark)" }}>
                ⚖️ Lo que dice la ley que te corresponde
              </span>
              <span className="text-base font-extrabold" style={{ color: "var(--color-brand-green-dark)" }}>
                {fmt(granTotal)}
              </span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface-secondary)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${barLegal}%`, backgroundColor: "var(--color-brand-green)" }}
              />
            </div>
          </div>

          {/* Barra oferta */}
          {oferta > 0 && (
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span
                  className="text-xs font-bold"
                  style={{ color: ofertaEsJusta ? "var(--color-brand-navy)" : "#dc2626" }}
                >
                  🏢 Lo que ofrece la empresa
                </span>
                <span
                  className="text-base font-extrabold"
                  style={{ color: ofertaEsJusta ? "var(--color-brand-navy)" : "#dc2626" }}
                >
                  {fmt(oferta)}
                </span>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface-secondary)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${barOferta}%`,
                    backgroundColor: ofertaEsJusta ? "var(--color-brand-navy)" : "#ef4444",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Alerta de diferencia */}
        {oferta > 0 && (
          <div
            className="flex items-start gap-3 rounded-xl p-4"
            style={{
              backgroundColor: ofertaEsJusta ? "#ecfdf5" : "#fef2f2",
              border: `1px solid ${ofertaEsJusta ? "var(--color-brand-green-light)" : "#fca5a5"}`,
            }}
          >
            {ofertaEsJusta ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color: "var(--color-brand-green)" }} />
            ) : (
              <XCircle size={18} className="mt-0.5 shrink-0" style={{ color: "#dc2626" }} />
            )}
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: ofertaEsJusta ? "var(--color-brand-green-dark)" : "#7f1d1d" }}
              >
                {ofertaEsJusta
                  ? "¡La oferta parece justa!"
                  : `Te están debiendo ${fmt(Math.abs(diferencia))}`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: ofertaEsJusta ? "#065f46" : "#991b1b" }}>
                {ofertaEsJusta
                  ? "La oferta cubre o supera lo que calculamos. Revisá el desglose para confirmar."
                  : "No firmes nada hasta que los números cuadren. Tenés el derecho de pedir el desglose completo."}
              </p>
            </div>
          </div>
        )}

        {/* Desglose interactivo */}
        <button
          type="button"
          onClick={() => setDesglose(!desglose)}
          className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 transition-colors"
          style={{
            backgroundColor: "var(--color-surface-secondary)",
            border: "1px solid var(--color-surface-border)",
          }}
        >
          <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
            Ver desglose detallado
          </span>
          {desglose ? (
            <ChevronUp size={16} style={{ color: "var(--color-text-muted)" }} />
          ) : (
            <ChevronDown size={16} style={{ color: "var(--color-text-muted)" }} />
          )}
        </button>

        {desglose && (
          <div className="space-y-3 pt-1">
            {items.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                    {item.label}
                  </span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>
                    {fmt(item.monto)}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface-secondary)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct(item.monto, granTotal)}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
            <div
              className="flex justify-between border-t pt-3 mt-1"
              style={{ borderColor: "var(--color-surface-border)" }}
            >
              <span className="text-sm font-extrabold" style={{ color: "var(--color-text-primary)" }}>
                GRAN TOTAL
              </span>
              <span className="text-base font-extrabold" style={{ color: "var(--color-brand-green-dark)" }}>
                {fmt(granTotal)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SECCIÓN 2: SEMÁFORO DE ALERTAS ──────────────────────────────────────────

function Semaforo({
  resultado,
  ocrResult,
  formData,
}: {
  resultado: ResultadoPrestaciones;
  ocrResult: ReturnType<typeof useLaborContext>["ocrResult"];
  formData: ReturnType<typeof useLaborContext>["formData"];
}) {
  const alertas: Array<{
    nivel: "rojo" | "amarillo" | "verde";
    icon: React.ReactNode;
    titulo: string;
    cuerpo: string;
    accion?: string;
  }> = [];

  // ── Alerta ROJA: Mutuo Acuerdo detectado por OCR ──
  const tieneMutuoAcuerdo = ocrResult?.alertas?.some(
    (a) => a.nivel === "rojo" && a.titulo.toLowerCase().includes("mutuo acuerdo")
  );
  if (tieneMutuoAcuerdo) {
    alertas.push({
      nivel: "rojo",
      icon: <FileWarning size={20} />,
      titulo: '🚨 ¡Cuidado! Detectamos "Mutuo Acuerdo"',
      cuerpo:
        'La figura de "Mutuo Acuerdo" es la trampa más común del mundo laboral chapín. En palabras simples: si firmás ese papel, estás renunciando voluntariamente a tu indemnización, aunque te hayan obligado a firmar bajo presión. La empresa lo sabe y por eso lo usa. Si te despidieron y te están haciendo firmar esto, NO lo firmes hasta recibir el 100% de lo que calculamos arriba, incluyendo la indemnización.',
      accion: "Ir al MINTRAB con el documento antes de firmar.",
    });
  }

  // ── Alerta ROJA: Alertas rojas del OCR en general ──
  const alertasRojasOCR = ocrResult?.alertas?.filter(
    (a) => a.nivel === "rojo" && !a.titulo.toLowerCase().includes("mutuo acuerdo")
  ) ?? [];
  alertasRojasOCR.forEach((a) => {
    alertas.push({
      nivel: "rojo",
      icon: <ShieldAlert size={20} />,
      titulo: `🚨 ${a.titulo}`,
      cuerpo: a.descripcion,
      accion: a.clausula ? `Cláusula detectada: "${a.clausula}"` : undefined,
    });
  });

  // ── Alerta AMARILLA: Despido de palabra (Opción A sin documento) ──
  const esDespidoDePalabra = formData.tipoEgreso === "despido_injustificado" && !ocrResult;
  if (esDespidoDePalabra) {
    alertas.push({
      nivel: "amarillo",
      icon: <AlertTriangle size={20} />,
      titulo: "⚠️ Despido de palabra: actuá rápido",
      cuerpo:
        'Si te avisaron de palabra que estás despedido, tenés menos tiempo del que creés. La empresa puede girar el libreto y declararte en "abandono de trabajo" si no movés ficha primero. Andá al MINTRAB (Ministerio de Trabajo) HOY O MAÑANA a interponer una denuncia. Esto crea un registro oficial de que fuiste despedido y protege tu derecho a indemnización. No necesitás abogado para ir — el MINTRAB es gratuito.',
      accion: "MINTRAB: 1548 · 7a Av. 3-33, Zona 9, Ciudad de Guatemala",
    });
  }

  // ── Alerta AMARILLA: del OCR ──
  const alertasAmarillasOCR = ocrResult?.alertas?.filter((a) => a.nivel === "amarillo") ?? [];
  alertasAmarillasOCR.forEach((a) => {
    alertas.push({
      nivel: "amarillo",
      icon: <AlertTriangle size={20} />,
      titulo: `⚠️ ${a.titulo}`,
      cuerpo: a.descripcion,
      accion: a.clausula ?? undefined,
    });
  });

  // ── Alerta VERDE (menta): Bonos registrados → Principio de Primacía de la Realidad ──
  const tieneBonos =
    (parseFloat(formData.bonosMensuales) > 0 && formData.tieneBonos) ||
    (ocrResult?.datos?.bonosMensuales ?? 0) > 0;

  if (tieneBonos) {
    alertas.push({
      nivel: "verde",
      icon: <Leaf size={20} />,
      titulo: "💚 Tus bonos cuentan — así los defendés",
      cuerpo:
        'Si recibías bonos, depósitos en efectivo o comisiones cada mes de forma regular y consistente, eso forma parte de tu salario real aunque no aparezca en tu contrato. A esto el Código de Trabajo lo llama "Principio de Primacía de la Realidad" (Art. 106 CPRG): lo que realmente ocurrió vale más que lo que dice el papel.\n\nPara defenderlos necesitás: 3 o más estados de cuenta bancarios mostrando los depósitos, capturas de mensajes donde te los confirmaron, o testimonios de compañeros. Con eso, un inspector del MINTRAB puede obligar a la empresa a incluirlos en el cálculo de prestaciones.',
      accion: "Juntá tus últimos 6 estados de cuenta bancarios.",
    });
  }

  if (alertas.length === 0) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl p-5"
        style={{ backgroundColor: "#ecfdf5", border: "1px solid var(--color-brand-green-light)" }}
      >
        <CheckCircle2 size={24} style={{ color: "var(--color-brand-green)" }} />
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--color-brand-green-dark)" }}>
            Sin alertas críticas detectadas
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#065f46" }}>
            No se detectaron cláusulas abusivas ni situaciones de riesgo inmediato.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} style={{ color: "var(--color-brand-amber)" }} />
        <h2 className="text-base font-extrabold" style={{ color: "var(--color-text-primary)" }}>
          Semáforo de alertas
        </h2>
      </div>
      {alertas.map((a, i) => (
        <AlertaCard key={i} alerta={a} />
      ))}
    </div>
  );
}

function AlertaCard({
  alerta,
}: {
  alerta: {
    nivel: "rojo" | "amarillo" | "verde";
    icon: React.ReactNode;
    titulo: string;
    cuerpo: string;
    accion?: string;
  };
}) {
  const [abierto, setAbierto] = useState(true);

  const estilos = {
    rojo: {
      bg: "#fef2f2",
      border: "#fca5a5",
      iconBg: "#dc2626",
      textColor: "#7f1d1d",
      accionBg: "#fee2e2",
    },
    amarillo: {
      bg: "#fffbeb",
      border: "var(--color-brand-amber-light)",
      iconBg: "var(--color-brand-amber-dark)",
      textColor: "#92400e",
      accionBg: "#fef3c7",
    },
    verde: {
      bg: "#ecfdf5",
      border: "var(--color-brand-green-light)",
      iconBg: "var(--color-brand-green-dark)",
      textColor: "#065f46",
      accionBg: "#d1fae5",
    },
  }[alerta.nivel];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: estilos.bg, border: `1px solid ${estilos.border}` }}
    >
      {/* Header de la tarjeta */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: estilos.iconBg, color: "#fff" }}
        >
          {alerta.icon}
        </div>
        <span className="flex-1 text-sm font-bold" style={{ color: estilos.textColor }}>
          {alerta.titulo}
        </span>
        {abierto ? (
          <ChevronUp size={16} style={{ color: estilos.textColor }} />
        ) : (
          <ChevronDown size={16} style={{ color: estilos.textColor }} />
        )}
      </button>

      {abierto && (
        <div className="px-4 pb-4 space-y-3">
          <p
            className="text-sm leading-relaxed"
            style={{ color: estilos.textColor, whiteSpace: "pre-line" }}
          >
            {alerta.cuerpo}
          </p>
          {alerta.accion && (
            <div
              className="rounded-lg px-3 py-2 text-xs font-semibold"
              style={{ backgroundColor: estilos.accionBg, color: estilos.textColor }}
            >
              📌 {alerta.accion}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SECCIÓN 3: GUÍA MINTRAB ──────────────────────────────────────────────────

const MOCHILA_ITEMS = [
  { emoji: "🪪", item: "DPI original y fotocopia" },
  { emoji: "📄", item: "Contrato de trabajo (si tenés copia)" },
  { emoji: "🏦", item: "Estados de cuenta bancarios (últimos 6 meses)" },
  { emoji: "💰", item: "Capturas de mensajes de depósitos de bonos" },
  { emoji: "📋", item: "Nóminas o recibos de pago que hayas conservado" },
  { emoji: "📱", item: "Mensajes de WhatsApp con el jefe sobre el despido" },
  { emoji: "👥", item: "Nombre y teléfono de un compañero que pueda ser testigo" },
  { emoji: "📅", item: "Fechas exactas: inicio, fin, y fecha del despido" },
  { emoji: "🖨️", item: "Si tenés el finiquito o carta a firmar, llevala SIN firmar" },
];

const SCRIPT_PASOS = [
  {
    titulo: "Al llegar: registráte y pedí número de expediente",
    detalle:
      'Cuando llegués al MINTRAB, decís: "Buenos días, vengo a interponer una denuncia por despido injustificado." Te darán un número de expediente — ese número es tu escudo. Guardálo.',
  },
  {
    titulo: "En la junta de conciliación: no cedás a la presión",
    detalle:
      'El abogado de la empresa va a intentar intimidarte con papeles, frases técnicas y prisa. Cuando sientas presión, decí estas palabras: "Con todo respeto, necesito leer el documento completo antes de firmar. Es mi derecho." Nadie puede obligarte a firmar en el momento.',
  },
  {
    titulo: "Si te ofrecen menos de lo calculado",
    detalle:
      'Mostrá tu cálculo (el de esta app) y decí: "Según el Artículo 82 del Código de Trabajo y mi tiempo de servicio, el monto correcto es [tu gran total]. Me quedo en la conciliación hasta llegar a ese número." No es agresivo — es legal.',
  },
  {
    titulo: "Sobre los bonos en efectivo",
    detalle:
      'Si te pagaban bonos y no aparecen en el cálculo de la empresa, decí: "Invoco el Principio de Primacía de la Realidad. Tengo estados de cuenta que demuestran estos pagos mensuales. Solicito que sean incluidos en el cálculo base." Y mostrá tus impresiones bancarias.',
  },
  {
    titulo: "Si no llegan a un acuerdo",
    detalle:
      'No pasa nada. Si la conciliación falla, el caso va a juicio laboral. Pedí al inspector que quede constancia de que NO llegaron a acuerdo y que la empresa se negó a pagar lo legal. Ese documento vale oro para el juicio.',
  },
];

function GuiaMINTRAB({ resultado }: { resultado: ResultadoPrestaciones }) {
  const [mochilaAbierta, setMochilaAbierta] = useState(false);
  const [scriptAbierto, setScriptAbierto] = useState(false);
  const [pasoAbierto, setPasoAbierto] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Briefcase size={16} style={{ color: "var(--color-brand-navy)" }} />
        <h2 className="text-base font-extrabold" style={{ color: "var(--color-text-primary)" }}>
          🎒 Prepárate para el MINTRAB
        </h2>
      </div>

      {/* Acordeón: Qué llevar */}
      <Acordeon
        abierto={mochilaAbierta}
        onToggle={() => setMochilaAbierta(!mochilaAbierta)}
        icon={<ClipboardList size={16} />}
        titulo="Qué llevar en tu mochila"
        subtitulo="Documentos físicos para tu cita"
        colorAccent="var(--color-brand-navy)"
      >
        <div className="space-y-2 pt-1">
          {MOCHILA_ITEMS.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg w-7 shrink-0 text-center">{m.emoji}</span>
              <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                {m.item}
              </p>
            </div>
          ))}
          <div
            className="mt-3 rounded-lg p-3"
            style={{ backgroundColor: "#dbeafe", border: "1px solid #93c5fd" }}
          >
            <p className="text-xs font-semibold" style={{ color: "var(--color-brand-navy)" }}>
              📍 MINTRAB — Ciudad de Guatemala
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#1e3a8a" }}>
              7a Av. 3-33, Zona 9 · Lunes a viernes, 8:00–16:30 · Tel: 1548
            </p>
          </div>
        </div>
      </Acordeon>

      {/* Acordeón: Script de conciliación */}
      <Acordeon
        abierto={scriptAbierto}
        onToggle={() => setScriptAbierto(!scriptAbierto)}
        icon={<MessageSquareQuote size={16} />}
        titulo="Guion para la junta de conciliación"
        subtitulo="Qué decir para no intimidarte"
        colorAccent="var(--color-brand-green)"
      >
        <div className="space-y-2 pt-1">
          {/* Dato del cálculo como contexto */}
          <div
            className="rounded-lg p-3 mb-3"
            style={{ backgroundColor: "#ecfdf5", border: "1px solid var(--color-brand-green-light)" }}
          >
            <p className="text-xs font-semibold" style={{ color: "var(--color-brand-green-dark)" }}>
              Tu número de referencia para la negociación:
            </p>
            <p className="text-xl font-extrabold mt-1" style={{ color: "var(--color-brand-green)" }}>
              {fmt(resultado.resumen.granTotal.monto)}
            </p>
            <p className="text-xs" style={{ color: "#065f46" }}>
              {resultado.resumen.granTotal.descripcion}
            </p>
          </div>

          {SCRIPT_PASOS.map((paso, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--color-surface-border)" }}
            >
              <button
                type="button"
                onClick={() => setPasoAbierto(pasoAbierto === i ? null : i)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                style={{ backgroundColor: pasoAbierto === i ? "#ecfdf5" : "#fff" }}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold"
                  style={{ backgroundColor: "var(--color-brand-green)", color: "#fff" }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {paso.titulo}
                </span>
                {pasoAbierto === i ? (
                  <ChevronUp size={14} style={{ color: "var(--color-text-muted)" }} />
                ) : (
                  <ChevronDown size={14} style={{ color: "var(--color-text-muted)" }} />
                )}
              </button>
              {pasoAbierto === i && (
                <div className="px-4 pb-4 pt-1" style={{ backgroundColor: "#f0fdf4" }}>
                  <p className="text-sm leading-relaxed" style={{ color: "#065f46" }}>
                    {paso.detalle}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Acordeon>
    </div>
  );
}

// ─── MICRO-COMPONENTE: ACORDEÓN ───────────────────────────────────────────────

function Acordeon({
  abierto,
  onToggle,
  icon,
  titulo,
  subtitulo,
  colorAccent,
  children,
}: {
  abierto: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  titulo: string;
  subtitulo: string;
  colorAccent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: "1px solid var(--color-surface-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
        style={{ backgroundColor: abierto ? "#fff" : "var(--color-surface-secondary)" }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: colorAccent, color: "#fff" }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
            {titulo}
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {subtitulo}
          </p>
        </div>
        {abierto ? (
          <ChevronUp size={18} style={{ color: "var(--color-text-muted)" }} />
        ) : (
          <ChevronDown size={18} style={{ color: "var(--color-text-muted)" }} />
        )}
      </button>

      {abierto && (
        <div
          className="px-4 pb-4"
          style={{ backgroundColor: "#fff", borderTop: "1px solid var(--color-surface-border)" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
