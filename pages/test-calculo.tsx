/**
 * pages/test-calculo.tsx
 * Calculadora interactiva de prestaciones laborales — Guatemala
 */
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import {
  calculatePrestaciones,
  formatearQuetzales,
  formatearTiempoLaborado,
  type ResultadoPrestaciones,
} from "@/utils/laborCalculations";
import {
  Scale,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface FormState {
  fechaInicio: string;
  fechaFin: string;
  salarioBase: string;
  bonosMensuales: string;
  diasVacacionesPendientes: string;
  esDespidoUnilateral: boolean; // legacy — se mapea a tipoEgreso internamente
}

const INITIAL: FormState = {
  fechaInicio: "",
  fechaFin: "",
  salarioBase: "",
  bonosMensuales: "0",
  diasVacacionesPendientes: "0",
  esDespidoUnilateral: true,
};

const TestCalculo: NextPage = () => {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [resultado, setResultado] = useState<ResultadoPrestaciones | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultado(null);

    try {
      const res = calculatePrestaciones({
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        salarioBase: parseFloat(form.salarioBase),
        bonosMensuales: parseFloat(form.bonosMensuales) || 0,
        diasVacacionesPendientes: parseInt(form.diasVacacionesPendientes) || 0,
        tipoEgreso: form.esDespidoUnilateral ? "despido_injustificado" : "renuncia_voluntaria",
      });
      setResultado(res);
      // Scroll suave al resultado en móvil
      setTimeout(() => {
        document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al calcular. Verifica los datos.");
    }
  }

  function toggleDetalle(key: string) {
    setExpandido((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <Head>
        <title>Calculadora de Prestaciones — Mi Cuate Laboral</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
        {/* Navbar */}
        <nav
          className="sticky top-0 z-50 px-4 py-3 border-b"
          style={{ backgroundColor: "var(--color-brand-dark)", borderColor: "var(--color-brand-navy)" }}
        >
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <Scale size={20} style={{ color: "var(--color-brand-green)" }} />
            <span className="font-bold text-base" style={{ color: "#fff" }}>
              Mi Cuate <span style={{ color: "var(--color-brand-green)" }}>Laboral</span>
            </span>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: "var(--color-brand-navy)", color: "var(--color-brand-green-light)" }}
            >
              Calculadora
            </span>
          </div>
        </nav>

        <div className="mx-auto max-w-lg px-4 py-6 space-y-5">

          {/* Título */}
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: "var(--color-text-primary)" }}>
              Calcula tus prestaciones
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Ingresa tus datos y obtén el desglose exacto según el Código de Trabajo de Guatemala.
            </p>
          </div>

          {/* ── FORMULARIO ── */}
          <form onSubmit={handleCalcular} className="space-y-4">

            {/* Tipo de egreso */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "#fff", border: "1px solid var(--color-surface-border)", boxShadow: "var(--shadow-card)" }}
            >
              <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
                ¿Cómo terminó tu relación laboral?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: true, label: "Me despidieron", sub: "Aplica indemnización", color: "green" },
                  { value: false, label: "Renuncié", sub: "Sin indemnización", color: "amber" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, esDespidoUnilateral: opt.value }))}
                    className="rounded-lg p-3 text-left transition-all"
                    style={{
                      border: `2px solid ${
                        form.esDespidoUnilateral === opt.value
                          ? opt.color === "green"
                            ? "var(--color-brand-green)"
                            : "var(--color-brand-amber)"
                          : "var(--color-surface-border)"
                      }`,
                      backgroundColor:
                        form.esDespidoUnilateral === opt.value
                          ? opt.color === "green"
                            ? "#ecfdf5"
                            : "#fffbeb"
                          : "#fff",
                    }}
                  >
                    <p
                      className="text-sm font-bold"
                      style={{
                        color:
                          form.esDespidoUnilateral === opt.value
                            ? opt.color === "green"
                              ? "var(--color-brand-green-dark)"
                              : "var(--color-brand-amber-dark)"
                            : "var(--color-text-primary)",
                      }}
                    >
                      {opt.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {opt.sub}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Fechas */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ backgroundColor: "#fff", border: "1px solid var(--color-surface-border)", boxShadow: "var(--shadow-card)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Fechas de tu contrato
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fecha de inicio" htmlFor="fechaInicio">
                  <input
                    id="fechaInicio"
                    name="fechaInicio"
                    type="date"
                    required
                    value={form.fechaInicio}
                    onChange={handleChange}
                    className="input-base"
                  />
                </Field>
                <Field label="Fecha de egreso" htmlFor="fechaFin">
                  <input
                    id="fechaFin"
                    name="fechaFin"
                    type="date"
                    required
                    value={form.fechaFin}
                    onChange={handleChange}
                    className="input-base"
                  />
                </Field>
              </div>
            </div>

            {/* Salarios */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ backgroundColor: "#fff", border: "1px solid var(--color-surface-border)", boxShadow: "var(--shadow-card)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Salario mensual
              </p>
              <Field label="Salario base (Q)" htmlFor="salarioBase">
                <input
                  id="salarioBase"
                  name="salarioBase"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Ej. 4000.00"
                  required
                  value={form.salarioBase}
                  onChange={handleChange}
                  className="input-base"
                />
              </Field>
              <Field label="Bonos fijos mensuales (Q)" htmlFor="bonosMensuales">
                <input
                  id="bonosMensuales"
                  name="bonosMensuales"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej. 250.00"
                  value={form.bonosMensuales}
                  onChange={handleChange}
                  className="input-base"
                />
              </Field>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Incluye bonos fijos como Bono Incentivo (Q250) si aplica.
              </p>
            </div>

            {/* Vacaciones */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "#fff", border: "1px solid var(--color-surface-border)", boxShadow: "var(--shadow-card)" }}
            >
              <Field label="Días de vacaciones pendientes (sin gozar)" htmlFor="diasVacacionesPendientes">
                <input
                  id="diasVacacionesPendientes"
                  name="diasVacacionesPendientes"
                  type="number"
                  min="0"
                  max="365"
                  placeholder="Ej. 10"
                  value={form.diasVacacionesPendientes}
                  onChange={handleChange}
                  className="input-base"
                />
              </Field>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                Art. 136 CT — Si no sabes el número exacto, revisa tu tarjeta de control o acuerda con RRHH.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2 rounded-lg p-3"
                style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5" }}
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: "#dc2626" }} />
                <p className="text-sm" style={{ color: "#7f1d1d" }}>{error}</p>
              </div>
            )}

            {/* Botón calcular */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold transition-transform active:scale-95"
              style={{ backgroundColor: "var(--color-brand-green)", color: "#fff" }}
            >
              <Calculator size={20} />
              Calcular mis prestaciones
            </button>
          </form>

          {/* ── RESULTADOS ── */}
          {resultado && (
            <div id="resultado" className="space-y-4">
              <div className="flex items-center gap-2 pt-2">
                <div className="h-px flex-1" style={{ backgroundColor: "var(--color-surface-border)" }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
                  Resultados
                </span>
                <div className="h-px flex-1" style={{ backgroundColor: "var(--color-surface-border)" }} />
              </div>

              {/* Tiempo laborado */}
              <InfoCard
                title="Tiempo laborado"
                icon={<Clock size={15} />}
                color="navy"
                expandKey="tiempo"
                expandido={expandido}
                toggle={toggleDetalle}
              >
                <p className="text-lg font-bold" style={{ color: "var(--color-brand-navy)" }}>
                  {formatearTiempoLaborado(resultado.tiempoLaborado)}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {resultado.tiempoLaborado.totalDias} días totales · {resultado.tiempoLaborado.añosProporcionales} años prop.
                </p>
              </InfoCard>

              {/* Indemnización */}
              {resultado.indemnizacion.aplica ? (
                <InfoCard
                  title="Indemnización por tiempo de servicio"
                  icon={<Banknote size={15} />}
                  color="green"
                  expandKey="indem"
                  expandido={expandido}
                  toggle={toggleDetalle}
                  monto={formatearQuetzales(resultado.indemnizacion.monto)}
                >
                  {expandido["indem"] && (
                    <div className="mt-3 space-y-1 border-t pt-3" style={{ borderColor: "var(--color-surface-border)" }}>
                      <Row2 label="Salario mensual total" value={formatearQuetzales(resultado.metadatos.salarioMensualTotal)} />
                      <Row2 label="Factor 14/12" value={`× ${resultado.indemnizacion.factorAplicado.toFixed(4)}`} />
                      <Row2 label="Base con factor" value={formatearQuetzales(resultado.indemnizacion.baseMensualConFactor)} />
                      <Row2 label="Años proporcionales" value={`${resultado.indemnizacion.añosProporcionales}`} />
                      <p className="text-xs pt-1" style={{ color: "var(--color-text-muted)" }}>
                        {resultado.indemnizacion.fundamentoLegal}
                      </p>
                    </div>
                  )}
                </InfoCard>
              ) : (
                <div
                  className="flex items-start gap-2 rounded-xl p-4"
                  style={{ backgroundColor: "#fffbeb", border: "1px solid var(--color-brand-amber)" }}
                >
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-brand-amber-dark)" }} />
                  <p className="text-sm" style={{ color: "#92400e" }}>
                    <strong>Sin indemnización:</strong> {resultado.indemnizacion.fundamentoLegal}
                  </p>
                </div>
              )}

              {/* Aguinaldo */}
              <InfoCard
                title="Aguinaldo proporcional"
                icon={<CheckCircle2 size={15} />}
                color="green"
                expandKey="aguinaldo"
                expandido={expandido}
                toggle={toggleDetalle}
                monto={formatearQuetzales(resultado.aguinaldo.monto)}
              >
                {expandido["aguinaldo"] && (
                  <div className="mt-3 space-y-1 border-t pt-3" style={{ borderColor: "var(--color-surface-border)" }}>
                    <Row2 label="Período" value={`${resultado.aguinaldo.periodoCubierto.inicio} → ${resultado.aguinaldo.periodoCubierto.fin}`} />
                    <Row2 label="Días trabajados" value={`${resultado.aguinaldo.diasTrabajadosEnPeriodo} / ${resultado.aguinaldo.diasTotalesPeriodo}`} />
                    <Row2 label="Proporción" value={`${(resultado.aguinaldo.proporcion * 100).toFixed(2)}%`} />
                    <p className="text-xs pt-1" style={{ color: "var(--color-text-muted)" }}>{resultado.aguinaldo.fundamentoLegal}</p>
                  </div>
                )}
              </InfoCard>

              {/* Bono 14 */}
              <InfoCard
                title="Bono 14 proporcional"
                icon={<CheckCircle2 size={15} />}
                color="green"
                expandKey="bono14"
                expandido={expandido}
                toggle={toggleDetalle}
                monto={formatearQuetzales(resultado.bono14.monto)}
              >
                {expandido["bono14"] && (
                  <div className="mt-3 space-y-1 border-t pt-3" style={{ borderColor: "var(--color-surface-border)" }}>
                    <Row2 label="Período" value={`${resultado.bono14.periodoCubierto.inicio} → ${resultado.bono14.periodoCubierto.fin}`} />
                    <Row2 label="Días trabajados" value={`${resultado.bono14.diasTrabajadosEnPeriodo} / ${resultado.bono14.diasTotalesPeriodo}`} />
                    <Row2 label="Proporción" value={`${(resultado.bono14.proporcion * 100).toFixed(2)}%`} />
                    <p className="text-xs pt-1" style={{ color: "var(--color-text-muted)" }}>{resultado.bono14.fundamentoLegal}</p>
                  </div>
                )}
              </InfoCard>

              {/* Vacaciones */}
              <InfoCard
                title="Vacaciones proporcionales"
                icon={<CheckCircle2 size={15} />}
                color="green"
                expandKey="vac"
                expandido={expandido}
                toggle={toggleDetalle}
                monto={formatearQuetzales(resultado.vacaciones.monto)}
              >
                {expandido["vac"] && (
                  <div className="mt-3 space-y-1 border-t pt-3" style={{ borderColor: "var(--color-surface-border)" }}>
                    <Row2 label="Días pendientes" value={`${resultado.vacaciones.diasPendientes} días`} />
                    <Row2 label="Salario diario" value={formatearQuetzales(resultado.vacaciones.salarioDiario)} />
                    <p className="text-xs pt-1" style={{ color: "var(--color-text-muted)" }}>{resultado.vacaciones.fundamentoLegal}</p>
                  </div>
                )}
              </InfoCard>

              {/* Gran Total */}
              <div
                className="rounded-xl p-5 space-y-3"
                style={{ backgroundColor: "var(--color-brand-dark)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-brand-green-light)" }}>
                  Resumen final
                </p>
                <SumRow label="Bono 14" value={formatearQuetzales(resultado.resumen.bono14)} />
                <SumRow label="Aguinaldo" value={formatearQuetzales(resultado.resumen.aguinaldo)} />
                <SumRow label="Vacaciones" value={formatearQuetzales(resultado.resumen.vacaciones)} />
                {resultado.indemnizacion.aplica && (
                  <SumRow label="Indemnización" value={formatearQuetzales(resultado.resumen.indemnizacion)} />
                )}
                <div className="border-t pt-3" style={{ borderColor: "var(--color-brand-navy)" }}>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-extrabold" style={{ color: "#fff" }}>GRAN TOTAL</span>
                    <span className="text-2xl font-extrabold" style={{ color: "var(--color-brand-green)" }}>
                      {formatearQuetzales(resultado.resumen.granTotal.monto)}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                    {resultado.resumen.granTotal.descripcion}
                  </p>
                </div>
              </div>

              {/* Aviso legal */}
              <div
                className="flex items-start gap-2 rounded-lg p-3"
                style={{ backgroundColor: "#fffbeb", border: "1px solid var(--color-brand-amber-light)" }}
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: "var(--color-brand-amber-dark)" }} />
                <p className="text-xs" style={{ color: "#92400e" }}>
                  Este cálculo es orientativo. Para validar legalmente tu liquidación, consulta con el MINTRAB o un abogado laboral certificado.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .input-base {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--color-surface-border);
          background: var(--color-surface);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: var(--color-text-primary);
          outline: none;
          transition: border-color 0.15s;
        }
        .input-base:focus {
          border-color: var(--color-brand-navy-light);
          box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.12);
        }
      `}</style>
    </>
  );
};

/* ── Micro-componentes ── */
function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoCard({
  title, icon, color, monto, expandKey, expandido, toggle, children,
}: {
  title: string;
  icon: React.ReactNode;
  color: "navy" | "green";
  monto?: string;
  expandKey: string;
  expandido: Record<string, boolean>;
  toggle: (k: string) => void;
  children?: React.ReactNode;
}) {
  const accent = color === "green" ? "var(--color-brand-green)" : "var(--color-brand-navy)";
  const isOpen = expandido[expandKey];

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "#fff",
        border: "1px solid var(--color-surface-border)",
        borderLeft: `4px solid ${accent}`,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color: accent }}>{icon}</span>
          <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {monto && (
            <span className="text-sm font-bold" style={{ color: accent }}>{monto}</span>
          )}
          {children !== undefined && (
            <button type="button" onClick={() => toggle(expandKey)} style={{ color: "var(--color-text-muted)" }}>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>
      {!monto && children}
      {monto && isOpen && children}
    </div>
  );
}

function Row2({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>{value}</span>
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: "#cbd5e1" }}>{value}</span>
    </div>
  );
}

export default TestCalculo;
