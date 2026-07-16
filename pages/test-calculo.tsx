/**
 * pages/test-calculo.tsx
 * Página de prueba del motor matemático laboral.
 * Solo para desarrollo — se eliminará cuando se construya la UI real.
 */
import type { NextPage } from "next";
import Head from "next/head";
import { calculatePrestaciones, formatearQuetzales, formatearTiempoLaborado } from "@/utils/laborCalculations";
import { CheckCircle2, AlertTriangle, Scale, Clock, Banknote } from "lucide-react";

// Caso de prueba: trabajador con 3 años, despido unilateral
const CASO_PRUEBA = {
  fechaInicio: "2022-01-15",
  fechaFin: "2025-07-16",
  salarioBase: 4000,
  bonosMensuales: 250,
  diasVacacionesPendientes: 10,
  esDespidoUnilateral: true,
};

const resultado = calculatePrestaciones(CASO_PRUEBA);

const TestCalculo: NextPage = () => {
  const { metadatos, tiempoLaborado, indemnizacion, aguinaldo, bono14, vacaciones, resumen } = resultado;

  return (
    <>
      <Head>
        <title>Test Motor de Cálculo — LaborIA GT</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen px-4 py-8" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto max-w-2xl space-y-5">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Scale size={28} style={{ color: "var(--color-brand-navy)" }} />
            <div>
              <h1 className="text-xl font-extrabold" style={{ color: "var(--color-text-primary)" }}>
                Motor de Cálculo Laboral
              </h1>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Resultado con datos de prueba — Guatemala
              </p>
            </div>
          </div>

          {/* Datos de entrada */}
          <Card title="Datos de Entrada" icon={<Clock size={16} />} color="navy">
            <Row label="Fecha inicio" value={metadatos.fechaInicio} />
            <Row label="Fecha fin" value={metadatos.fechaFin} />
            <Row label="Salario base" value={formatearQuetzales(metadatos.salarioBase)} />
            <Row label="Bonos mensuales" value={formatearQuetzales(metadatos.bonosMensuales)} />
            <Row label="Salario mensual total" value={formatearQuetzales(metadatos.salarioMensualTotal)} bold />
            <Row label="Salario diario (Art. 92 CT)" value={formatearQuetzales(metadatos.salarioDiario)} />
            <Row label="Tipo de egreso" value={metadatos.tipoEgreso} highlight="amber" />
          </Card>

          {/* Tiempo laborado */}
          <Card title="Tiempo Laborado" icon={<Clock size={16} />} color="navy">
            <Row label="Tiempo total" value={formatearTiempoLaborado(tiempoLaborado)} bold />
            <Row label="Total de días" value={`${tiempoLaborado.totalDias} días`} />
            <Row label="Años proporcionales" value={tiempoLaborado.añosProporcionales.toString()} />
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
              Base legal: Art. 82 CT
            </p>
          </Card>

          {/* Indemnización */}
          <Card
            title="Indemnización por Tiempo de Servicio"
            icon={<Banknote size={16} />}
            color={indemnizacion.aplica ? "green" : "amber"}
          >
            {indemnizacion.aplica ? (
              <>
                <Row label="Salario mensual base" value={formatearQuetzales(indemnizacion.salarioMensualBase)} />
                <Row label="Factor 14/12 aplicado" value={`× ${indemnizacion.factorAplicado.toFixed(4)}`} />
                <Row label="Base con factor" value={formatearQuetzales(indemnizacion.baseMensualConFactor)} />
                <Row label="Años proporcionales" value={indemnizacion.añosProporcionales.toString()} />
                <Row label="TOTAL INDEMNIZACIÓN" value={formatearQuetzales(indemnizacion.monto)} bold highlight="green" />
              </>
            ) : (
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} style={{ color: "var(--color-brand-amber)" }} className="mt-0.5" />
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {indemnizacion.fundamentoLegal}
                </p>
              </div>
            )}
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
              {indemnizacion.fundamentoLegal}
            </p>
          </Card>

          {/* Aguinaldo */}
          <Card title="Aguinaldo Proporcional" icon={<CheckCircle2 size={16} />} color="green">
            <Row label="Período cubierto" value={`${aguinaldo.periodoCubierto.inicio} → ${aguinaldo.periodoCubierto.fin}`} />
            <Row label="Días trabajados en período" value={`${aguinaldo.diasTrabajadosEnPeriodo} / ${aguinaldo.diasTotalesPeriodo}`} />
            <Row label="Proporción" value={`${(aguinaldo.proporcion * 100).toFixed(2)}%`} />
            <Row label="AGUINALDO PROPORCIONAL" value={formatearQuetzales(aguinaldo.monto)} bold highlight="green" />
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>{aguinaldo.fundamentoLegal}</p>
          </Card>

          {/* Bono 14 */}
          <Card title="Bono 14 Proporcional" icon={<CheckCircle2 size={16} />} color="green">
            <Row label="Período cubierto" value={`${bono14.periodoCubierto.inicio} → ${bono14.periodoCubierto.fin}`} />
            <Row label="Días trabajados en período" value={`${bono14.diasTrabajadosEnPeriodo} / ${bono14.diasTotalesPeriodo}`} />
            <Row label="Proporción" value={`${(bono14.proporcion * 100).toFixed(2)}%`} />
            <Row label="BONO 14 PROPORCIONAL" value={formatearQuetzales(bono14.monto)} bold highlight="green" />
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>{bono14.fundamentoLegal}</p>
          </Card>

          {/* Vacaciones */}
          <Card title="Vacaciones Proporcionales" icon={<CheckCircle2 size={16} />} color="green">
            <Row label="Días pendientes" value={`${vacaciones.diasPendientes} días`} />
            <Row label="Salario diario" value={formatearQuetzales(vacaciones.salarioDiario)} />
            <Row label="VACACIONES" value={formatearQuetzales(vacaciones.monto)} bold highlight="green" />
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>{vacaciones.fundamentoLegal}</p>
          </Card>

          {/* Resumen final */}
          <div
            className="rounded-xl p-5 space-y-3"
            style={{ backgroundColor: "var(--color-brand-dark)", border: "1px solid var(--color-brand-navy)" }}
          >
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--color-brand-green-light)" }}>
              Resumen Final
            </h2>
            <SummaryRow label="Bono 14" value={formatearQuetzales(resumen.bono14)} />
            <SummaryRow label="Aguinaldo" value={formatearQuetzales(resumen.aguinaldo)} />
            <SummaryRow label="Vacaciones" value={formatearQuetzales(resumen.vacaciones)} />
            <div className="border-t pt-2" style={{ borderColor: "var(--color-brand-navy)" }}>
              <SummaryRow label="Total Irrenunciables" value={formatearQuetzales(resumen.totalIrrenunciables.monto)} accent="green" />
            </div>
            {indemnizacion.aplica && (
              <SummaryRow label="Indemnización" value={formatearQuetzales(resumen.indemnizacion)} />
            )}
            <div className="border-t pt-3" style={{ borderColor: "var(--color-brand-green)" }}>
              <div className="flex justify-between items-center">
                <span className="text-base font-extrabold" style={{ color: "#fff" }}>GRAN TOTAL</span>
                <span className="text-xl font-extrabold" style={{ color: "var(--color-brand-green)" }}>
                  {formatearQuetzales(resumen.granTotal.monto)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

/* ── Micro-componentes ── */
function Card({ title, icon, color, children }: {
  title: string;
  icon: React.ReactNode;
  color: "navy" | "green" | "amber";
  children: React.ReactNode;
}) {
  const accent = {
    navy: "var(--color-brand-navy)",
    green: "var(--color-brand-green)",
    amber: "var(--color-brand-amber)",
  }[color];

  return (
    <div
      className="rounded-xl p-5 space-y-2"
      style={{
        backgroundColor: "#fff",
        border: `1px solid var(--color-surface-border)`,
        borderLeft: `4px solid ${accent}`,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: accent }}>{icon}</span>
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, bold = false, highlight }: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: "green" | "amber";
}) {
  const valueColor = highlight === "green"
    ? "var(--color-brand-green-dark)"
    : highlight === "amber"
    ? "var(--color-brand-amber-dark)"
    : "var(--color-text-primary)";

  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span
        className={`text-sm ${bold ? "font-bold" : "font-medium"}`}
        style={{ color: valueColor }}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: "green" }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span
        className="text-sm font-semibold"
        style={{ color: accent === "green" ? "var(--color-brand-green-light)" : "#cbd5e1" }}
      >
        {value}
      </span>
    </div>
  );
}

export default TestCalculo;
