/**
 * components/ActionTools.tsx
 * Herramientas de acción final del Dashboard de Defensa.
 *
 * 1. Generador de PDF institucional para presentar al Inspector del MINTRAB
 * 2. Mensajes pre-redactados para WhatsApp / correo con botón de copia
 */
"use client";
import { useState } from "react";
import {
  FileDown,
  Copy,
  CheckCheck,
  MessageCircle,
  Mail,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
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

function fmtFecha(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function hoy() {
  return new Date().toLocaleDateString("es-GT", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function ActionTools() {
  const { resultado, formData } = useLaborContext();

  if (!resultado) return null;

  return (
    <div className="space-y-4">
      {/* Título de sección */}
      <div className="flex items-center gap-2">
        <Sparkles size={16} style={{ color: "var(--color-brand-amber)" }} />
        <h2 className="text-base font-extrabold" style={{ color: "var(--color-text-primary)" }}>
          Herramientas de acción
        </h2>
      </div>

      {/* ── PDF ── */}
      <PDFGenerator resultado={resultado} formData={formData} />

      {/* ── Mensajes ── */}
      <MensajesRapidos resultado={resultado} formData={formData} />
    </div>
  );
}

// ─── SECCIÓN 1: GENERADOR DE PDF ─────────────────────────────────────────────

function PDFGenerator({
  resultado,
  formData,
}: {
  resultado: ResultadoPrestaciones;
  formData: ReturnType<typeof useLaborContext>["formData"];
}) {
  const [generando, setGenerando] = useState(false);

  async function generarPDF() {
    setGenerando(true);
    try {
      // Importación dinámica para no bloquear SSR
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
      const W = doc.internal.pageSize.getWidth();
      const MARGEN = 20;
      const ANCHO = W - MARGEN * 2;
      let y = MARGEN;

      // ── PALETA ──
      const NAVY   = [30, 58, 138]  as [number, number, number];
      const GREEN  = [5, 150, 105]  as [number, number, number];
      const AMBER  = [245, 158, 11] as [number, number, number];
      const SLATE  = [71, 85, 105]  as [number, number, number];
      const WHITE  = [255, 255, 255] as [number, number, number];
      const LIGHT  = [248, 250, 252] as [number, number, number];
      const BORDER = [226, 232, 240] as [number, number, number];

      // ── HEADER MEMBRETADO ──
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, W, 38, "F");

      // Línea de acento verde
      doc.setFillColor(...GREEN);
      doc.rect(0, 38, W, 2.5, "F");

      // Título principal
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...WHITE);
      doc.text("LaborIA GT", MARGEN, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Plataforma de Asesoría Laboral — Guatemala", MARGEN, 21);

      // Título del documento (derecha)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...WHITE);
      doc.text("CÁLCULO DE PRESTACIONES LABORALES", W - MARGEN, 14, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generado el ${hoy()}`, W - MARGEN, 20, { align: "right" });
      doc.text("Código de Trabajo, Decreto 1441", W - MARGEN, 25, { align: "right" });

      y = 50;

      // ── AVISO LEGAL ──
      doc.setFillColor(...LIGHT);
      doc.setDrawColor(...BORDER);
      doc.roundedRect(MARGEN, y, ANCHO, 12, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...AMBER);
      doc.text("DOCUMENTO ORIENTATIVO:", MARGEN + 4, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...SLATE);
      doc.text(
        "Este reporte se basa en el Código de Trabajo de Guatemala (Decreto 1441) y legislación complementaria. Para validación legal definitiva, consulte con el MINTRAB o un abogado laboral.",
        MARGEN + 4, y + 9,
        { maxWidth: ANCHO - 8 }
      );
      y += 19;

      // ── DATOS DEL TRABAJADOR ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...NAVY);
      doc.text("DATOS DE LA RELACIÓN LABORAL", MARGEN, y + 6);
      doc.setFillColor(...GREEN);
      doc.rect(MARGEN, y + 7.5, 40, 0.8, "F");
      y += 12;

      const datosTabla = [
        ["Tipo de egreso", resultado.metadatos.tipoEgreso],
        ["Fecha de inicio", fmtFecha(resultado.metadatos.fechaInicio)],
        ["Fecha de egreso", fmtFecha(resultado.metadatos.fechaFin)],
        ["Tiempo laborado", `${resultado.tiempoLaborado.años} año(s), ${resultado.tiempoLaborado.meses} mes(es) y ${resultado.tiempoLaborado.dias} día(s)`],
        ["Salario base mensual", fmt(resultado.metadatos.salarioBase)],
        ["Bonos mensuales", fmt(resultado.metadatos.bonosMensuales)],
        ["Salario mensual total", fmt(resultado.metadatos.salarioMensualTotal)],
        ["Salario diario (Art. 92 CT)", fmt(resultado.metadatos.salarioDiario)],
      ];

      autoTable(doc, {
        startY: y,
        body: datosTabla,
        columnStyles: {
          0: { cellWidth: 70, fontStyle: "bold", fillColor: LIGHT, textColor: SLATE, fontSize: 8 },
          1: { cellWidth: ANCHO - 70, textColor: [15, 23, 42], fontSize: 8 },
        },
        styles: { cellPadding: 3.5, lineColor: BORDER, lineWidth: 0.3 },
        theme: "grid",
        margin: { left: MARGEN, right: MARGEN },
      });

      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

      // ── TABLA DE CÁLCULOS ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...NAVY);
      doc.text("DESGLOSE DE PRESTACIONES CALCULADAS", MARGEN, y + 6);
      doc.setFillColor(...GREEN);
      doc.rect(MARGEN, y + 7.5, 60, 0.8, "F");
      y += 12;

      const calculos: [string, string, string, string][] = [
        ["Bono 14 Proporcional", `${(resultado.bono14.proporcion * 100).toFixed(1)}% del período\n${resultado.bono14.periodoCubierto.inicio} → ${resultado.bono14.periodoCubierto.fin}`, "Decreto 42-92", fmt(resultado.bono14.monto)],
        ["Aguinaldo Proporcional", `${(resultado.aguinaldo.proporcion * 100).toFixed(1)}% del período\n${resultado.aguinaldo.periodoCubierto.inicio} → ${resultado.aguinaldo.periodoCubierto.fin}`, "Decreto 76-78", fmt(resultado.aguinaldo.monto)],
        ["Vacaciones no gozadas", `${resultado.vacaciones.diasPendientes} días × ${fmt(resultado.vacaciones.salarioDiario)}/día`, "Art. 136 CT", fmt(resultado.vacaciones.monto)],
      ];

      if (resultado.indemnizacion.aplica) {
        const ind = resultado.indemnizacion;
        calculos.unshift([
          "Indemnización por tiempo de servicio",
          `${fmt(resultado.metadatos.salarioMensualTotal)} × factor 14/12 × ${resultado.tiempoLaborado.añosProporcionales} años`,
          "Art. 82 CT",
          fmt(ind.monto),
        ]);
      }

      autoTable(doc, {
        startY: y,
        head: [["Prestación", "Cálculo aplicado", "Base legal", "Monto (GTQ)"]],
        body: calculos,
        headStyles: {
          fillColor: NAVY,
          textColor: WHITE,
          fontStyle: "bold",
          fontSize: 7.5,
          halign: "left",
        },
        columnStyles: {
          0: { cellWidth: 52, fontStyle: "bold", fontSize: 7.5 },
          1: { cellWidth: 58, fontSize: 7, textColor: SLATE },
          2: { cellWidth: 38, fontSize: 7, textColor: SLATE },
          3: { cellWidth: ANCHO - 148, fontStyle: "bold", halign: "right", fontSize: 8 },
        },
        styles: { cellPadding: 3.5, lineColor: BORDER, lineWidth: 0.3, overflow: "linebreak" },
        theme: "grid",
        margin: { left: MARGEN, right: MARGEN },
      });

      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2;

      // ── TOTALES ──
      const totales: [string, string][] = [
        ["Total Irrenunciables (Bono 14 + Aguinaldo + Vacaciones)", fmt(resultado.resumen.totalIrrenunciables.monto)],
      ];
      if (resultado.indemnizacion.aplica) {
        totales.push(["Indemnización por despido injustificado", fmt(resultado.resumen.indemnizacion)]);
      }

      autoTable(doc, {
        startY: y,
        body: [
          ...totales,
          ["GRAN TOTAL DE PRESTACIONES", fmt(resultado.resumen.granTotal.monto)],
        ],
        columnStyles: {
          0: { cellWidth: ANCHO - 55, fontStyle: "bold", fontSize: 8 },
          1: { cellWidth: 55, fontStyle: "bold", halign: "right", fontSize: 8 },
        },
        bodyStyles: { fillColor: LIGHT, textColor: [15, 23, 42] },
        styles: { cellPadding: 4, lineColor: BORDER, lineWidth: 0.3 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        didParseCell: (data: any) => {
          if (data.row.index === totales.length) {
            data.cell.styles.fillColor = NAVY;
            data.cell.styles.textColor = WHITE;
            data.cell.styles.fontSize = 9;
          }
        },
        theme: "grid",
        margin: { left: MARGEN, right: MARGEN },
      });

      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

      // ── BASES LEGALES ──
      if (y > 230) { doc.addPage(); y = MARGEN; }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...NAVY);
      doc.text("BASES LEGALES", MARGEN, y);
      y += 5;

      const leyes = [
        "• Art. 82 CT (Decreto 1441) — Indemnización por despido injustificado",
        "• Art. 83 CT — Renuncia voluntaria no genera indemnización",
        "• Art. 92 CT — Cálculo de salario diario (salario mensual / 30)",
        "• Art. 130 y 136 CT — Derecho a vacaciones y pago al egreso",
        "• Decreto 42-92 — Bono 14 (Bonificación Anual), período julio-junio",
        "• Decreto 76-78 — Aguinaldo, período diciembre-noviembre",
        "• Art. 102 lit. g), h), j) CPRG — Derechos irrenunciables del trabajador",
      ];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE);
      leyes.forEach((ley) => {
        doc.text(ley, MARGEN, y);
        y += 5;
      });

      // ── FIRMA / PIE ──
      y += 8;
      if (y > 245) { doc.addPage(); y = MARGEN; }

      doc.setDrawColor(...BORDER);
      doc.line(MARGEN, y, W - MARGEN, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "Generado por LaborIA GT — Plataforma de orientación laboral para trabajadores guatemaltecos",
        W / 2, y, { align: "center" }
      );
      y += 4;
      doc.text(
        "Este documento es de carácter informativo. Para asesoría legal definitiva contacte al MINTRAB (1548) o un abogado laboral.",
        W / 2, y, { align: "center" }
      );

      // ── GUARDAR ──
      const nombreArchivo = `LaborIA_GT_Prestaciones_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(nombreArchivo);
    } catch (e) {
      console.error("Error generando PDF:", e);
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--color-surface-border)", boxShadow: "var(--shadow-elevated)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ backgroundColor: "var(--color-brand-dark)" }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--color-brand-navy)" }}
        >
          <FileDown size={18} style={{ color: "var(--color-brand-green)" }} />
        </div>
        <div>
          <p className="text-sm font-extrabold" style={{ color: "#fff" }}>
            Reporte PDF para el MINTRAB
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Hoja membretada con desglose legal completo
          </p>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="px-5 py-4 space-y-3" style={{ backgroundColor: "#fff" }}>
        {/* Preview del contenido */}
        <div className="space-y-2">
          {[
            { label: "Encabezado institucional LaborIA GT", check: true },
            { label: "Datos del período laboral", check: true },
            { label: "Tabla de cálculos con fórmulas explicadas", check: true },
            { label: "Gran Total destacado", check: true },
            { label: "Artículos del Código de Trabajo citados", check: true },
            { label: "Aviso legal al pie de página", check: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#ecfdf5" }}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "var(--color-brand-green)" }}
                />
              </div>
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Botón */}
        <button
          type="button"
          onClick={generarPDF}
          disabled={generando}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold transition-all active:scale-95 disabled:opacity-60"
          style={{ backgroundColor: "var(--color-brand-navy)", color: "#fff" }}
        >
          {generando ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generando reporte...
            </>
          ) : (
            <>
              <Printer size={16} />
              Descargar PDF para el MINTRAB
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── SECCIÓN 2: MENSAJES RÁPIDOS ─────────────────────────────────────────────

interface MensajePlantilla {
  id: string;
  canal: "whatsapp" | "email";
  titulo: string;
  subtitulo: string;
  emoji: string;
  generar: (r: ResultadoPrestaciones, f: ReturnType<typeof useLaborContext>["formData"]) => string;
}

const PLANTILLAS: MensajePlantilla[] = [
  {
    id: "solicitud-liquidacion",
    canal: "whatsapp",
    emoji: "💬",
    titulo: "Solicitud de liquidación correcta",
    subtitulo: "Para enviarle a RRHH o al jefe",
    generar: (r, f) =>
      `Buenas tardes. Me dirijo a ustedes para solicitar de manera formal y respetuosa que la liquidación que me corresponde sea calculada conforme al Código de Trabajo de Guatemala.

Según mis cálculos —respaldados por el Decreto 1441 y legislación complementaria— el monto total que me corresponde asciende a *${fmt(r.resumen.granTotal.monto)}*, desglosado así:

${r.indemnizacion.aplica ? `• Indemnización por tiempo de servicio: ${fmt(r.resumen.indemnizacion)} _(Art. 82 CT)_\n` : ""}• Aguinaldo proporcional: ${fmt(r.resumen.aguinaldo)} _(Decreto 76-78)_
• Bono 14 proporcional: ${fmt(r.resumen.bono14)} _(Decreto 42-92)_
• Vacaciones no gozadas: ${fmt(r.resumen.vacaciones)} _(Art. 136 CT)_

*TOTAL: ${fmt(r.resumen.granTotal.monto)}*

Solicito que este monto sea revisado y confirmado antes de proceder con cualquier firma de finiquito. Quedo en espera de su respuesta.

Atentamente.`,
  },
  {
    id: "respuesta-intimidacion",
    canal: "whatsapp",
    emoji: "🛡️",
    titulo: "Respuesta ante presión o intimidación",
    subtitulo: "Si te presionan a firmar rápido",
    generar: (r) =>
      `Agradezco el contacto. Sin embargo, con todo el respeto, me es *imposible firmar ningún documento hasta revisar que los montos sean correctos conforme a la ley*.

Según el Artículo 102 de la Constitución Política de la República de Guatemala, mis derechos laborales son irrenunciables. El monto que me corresponde según el Código de Trabajo es de *${fmt(r.resumen.granTotal.monto)}*.

Si hay diferencia con la oferta actual, solicito que el caso sea tratado ante la *Inspección General de Trabajo del MINTRAB* (7a Av. 3-33 Zona 9, Tel. 1548), donde podremos resolver esto de forma transparente.

No es mi intención generar conflicto, sino únicamente recibir lo que me corresponde por ley. Gracias por su comprensión.`,
  },
  {
    id: "denuncia-mintrab",
    canal: "email",
    emoji: "📧",
    titulo: "Correo formal al inspector del MINTRAB",
    subtitulo: "Para adjuntar al expediente",
    generar: (r, f) =>
      `Señor(a) Inspector(a) de Trabajo:

Por este medio me dirijo a usted de forma respetuosa para exponer mi situación laboral y solicitar su intervención en el proceso de liquidación que me corresponde.

HECHOS:
- Laboré desde el ${fmtFecha(r.metadatos.fechaInicio)} hasta el ${fmtFecha(r.metadatos.fechaFin)}.
- Mi salario mensual total era de ${fmt(r.metadatos.salarioMensualTotal)} (incluye bonos fijos).
- La terminación fue por: ${r.metadatos.tipoEgreso}.

MONTO LEGAL CALCULADO:
${r.indemnizacion.aplica ? `- Indemnización (Art. 82 CT): ${fmt(r.resumen.indemnizacion)}\n` : ""}- Aguinaldo proporcional (Decreto 76-78): ${fmt(r.resumen.aguinaldo)}
- Bono 14 proporcional (Decreto 42-92): ${fmt(r.resumen.bono14)}
- Vacaciones no gozadas (Art. 136 CT): ${fmt(r.resumen.vacaciones)}

TOTAL QUE ME CORRESPONDE: *${fmt(r.resumen.granTotal.monto)}*

Adjunto a este correo el reporte detallado generado con base en el Código de Trabajo. Solicito respetuosamente su orientación y acompañamiento para hacer valer mis derechos.

Atentamente,
[Tu nombre completo]
[Tu DPI]
[Tu teléfono de contacto]`,
  },
  {
    id: "bonos-defensa",
    canal: "whatsapp",
    emoji: "💰",
    titulo: "Defensa de bonos extraoficiales",
    subtitulo: "Principio de Primacía de la Realidad",
    generar: (r) =>
      `Buenas tardes. En relación a mi liquidación, quiero señalar que durante mi relación laboral recibí pagos adicionales en forma *regular y consistente* fuera de mi salario base.

Según el *Principio de Primacía de la Realidad* (Art. 106 de la CPRG), lo que ocurrió en la práctica prevalece sobre lo que dice el contrato. Dichos pagos forman parte de mi salario real y *deben incluirse en el cálculo de mis prestaciones*.

Cuento con los comprobantes bancarios correspondientes que demuestran estos depósitos.

Solicito que el salario base de cálculo para mis prestaciones sea de *${fmt(r.metadatos.salarioMensualTotal)}*, lo que resulta en un total de *${fmt(r.resumen.granTotal.monto)}*.

Si no hay acuerdo, procederé a presentar estos comprobantes ante la Inspección de Trabajo del MINTRAB. Gracias.`,
  },
];

function MensajesRapidos({
  resultado,
  formData,
}: {
  resultado: ResultadoPrestaciones;
  formData: ReturnType<typeof useLaborContext>["formData"];
}) {
  const [abierto, setAbierto] = useState(true);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [activoId, setActivoId] = useState<string>("solicitud-liquidacion");

  async function copiar(texto: string, id: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2500);
    } catch {
      // Fallback para navegadores sin permisos
      const ta = document.createElement("textarea");
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2500);
    }
  }

  const plantillaActiva = PLANTILLAS.find((p) => p.id === activoId)!;
  const textoActivo = plantillaActiva.generar(resultado, formData);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--color-surface-border)", boxShadow: "var(--shadow-elevated)" }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
        style={{ backgroundColor: "var(--color-brand-dark)" }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--color-brand-navy)" }}
        >
          <MessageCircle size={18} style={{ color: "var(--color-brand-amber)" }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-extrabold" style={{ color: "#fff" }}>
            Mensajes para WhatsApp y correo
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Pre-redactados con tus montos reales — copiá y pegá
          </p>
        </div>
        {abierto ? (
          <ChevronUp size={16} style={{ color: "var(--color-text-muted)" }} />
        ) : (
          <ChevronDown size={16} style={{ color: "var(--color-text-muted)" }} />
        )}
      </button>

      {abierto && (
        <div className="px-5 py-4 space-y-4" style={{ backgroundColor: "#fff" }}>
          {/* Selector de plantilla */}
          <div className="grid grid-cols-2 gap-2">
            {PLANTILLAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivoId(p.id)}
                className="flex flex-col gap-1 rounded-xl p-3 text-left transition-all"
                style={{
                  border: `2px solid ${activoId === p.id ? "var(--color-brand-navy)" : "var(--color-surface-border)"}`,
                  backgroundColor: activoId === p.id ? "#dbeafe" : "#fff",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{p.emoji}</span>
                  {p.canal === "whatsapp" ? (
                    <MessageCircle size={11} style={{ color: activoId === p.id ? "var(--color-brand-navy)" : "var(--color-text-muted)" }} />
                  ) : (
                    <Mail size={11} style={{ color: activoId === p.id ? "var(--color-brand-navy)" : "var(--color-text-muted)" }} />
                  )}
                </div>
                <p
                  className="text-xs font-bold leading-tight"
                  style={{ color: activoId === p.id ? "var(--color-brand-navy)" : "var(--color-text-primary)" }}
                >
                  {p.titulo}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {p.subtitulo}
                </p>
              </button>
            ))}
          </div>

          {/* Preview del mensaje */}
          <div
            className="rounded-xl p-4 relative"
            style={{
              backgroundColor: "var(--color-surface-secondary)",
              border: "1px solid var(--color-surface-border)",
            }}
          >
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--color-text-primary)", fontFamily: "inherit" }}
            >
              {textoActivo}
            </p>
          </div>

          {/* Botón copiar */}
          <button
            type="button"
            onClick={() => copiar(textoActivo, activoId)}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold transition-all active:scale-95"
            style={{
              backgroundColor: copiado === activoId ? "var(--color-brand-green)" : "var(--color-brand-navy)",
              color: "#fff",
            }}
          >
            {copiado === activoId ? (
              <>
                <CheckCheck size={16} />
                ¡Copiado al portapapeles!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copiar mensaje
              </>
            )}
          </button>

          {/* Tip */}
          <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
            💡 Editá el mensaje antes de enviar si necesitás personalizar algún detalle.
          </p>
        </div>
      )}
    </div>
  );
}
