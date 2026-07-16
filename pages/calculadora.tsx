/**
 * pages/calculadora.tsx
 * Pantalla 1 — Hub principal con tres pestañas:
 *   • Calcular   → DashboardInput (formulario / OCR)
 *   • Salarios   → SalaryExplorer (educación financiera)
 *   • Consultas  → LegalConsultant (chat FAQ legal)
 */
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { Scale, ArrowLeft, Calculator, TrendingUp, MessageCircle } from "lucide-react";
import DashboardInput from "@/components/DashboardInput";
import SalaryExplorer from "@/components/SalaryExplorer";
import LegalConsultant from "@/components/LegalConsultant";

type Tab = "calcular" | "salarios" | "consultas";

const TABS: { id: Tab; label: string; icon: React.ReactNode; sub: string }[] = [
  { id: "calcular",  label: "Calcular",  icon: <Calculator  size={16} />, sub: "Mis prestaciones" },
  { id: "salarios",  label: "Salarios",  icon: <TrendingUp  size={16} />, sub: "¿Cuánto debo ganar?" },
  { id: "consultas", label: "Consultas", icon: <MessageCircle size={16} />, sub: "Dudas frecuentes" },
];

const CalculadoraPage: NextPage = () => {
  const [tab, setTab] = useState<Tab>("calcular");

  return (
    <>
      <Head>
        <title>Consultar mis derechos — LaborIA GT</title>
        <meta name="description" content="Calcula prestaciones, explora salarios y resuelve dudas laborales en Guatemala" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
        {/* ── Navbar ── */}
        <nav
          className="sticky top-0 z-50 border-b px-4 py-3"
          style={{ backgroundColor: "var(--color-brand-dark)", borderColor: "var(--color-brand-navy)" }}
        >
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft size={16} style={{ color: "var(--color-text-muted)" }} />
              <Scale size={18} style={{ color: "var(--color-brand-green)" }} />
              <span className="font-bold text-sm" style={{ color: "#fff" }}>
                LaborIA <span style={{ color: "var(--color-brand-green)" }}>GT</span>
              </span>
            </Link>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: "var(--color-brand-navy)", color: "var(--color-brand-green-light)" }}
            >
              Centro de consulta
            </span>
          </div>
        </nav>

        {/* ── Tab bar ── */}
        <div
          className="sticky z-40 px-4 pt-3 pb-0"
          style={{ top: "49px", backgroundColor: "var(--color-brand-dark)", borderBottom: "1px solid var(--color-brand-navy)" }}
        >
          <div className="mx-auto flex max-w-lg gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-t-lg px-2 pb-3 pt-2 transition-all"
                style={{
                  backgroundColor: tab === t.id ? "var(--color-surface)" : "transparent",
                  borderBottom: tab === t.id ? "3px solid var(--color-brand-green)" : "3px solid transparent",
                }}
              >
                <span style={{ color: tab === t.id ? "var(--color-brand-green)" : "var(--color-text-muted)" }}>
                  {t.icon}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: tab === t.id ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
                >
                  {t.label}
                </span>
                <span
                  className="hidden text-xs sm:block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {t.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Contenido del tab activo ── */}
        <div className="mx-auto max-w-lg px-4 py-6">

          {/* TAB: CALCULAR */}
          {tab === "calcular" && (
            <div>
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-brand-green)" }}>
                  Tu consulta laboral
                </p>
                <h1 className="text-2xl font-extrabold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                  ¿Qué está pasando con tu trabajo?
                </h1>
              </div>
              <DashboardInput />
            </div>
          )}

          {/* TAB: SALARIOS */}
          {tab === "salarios" && (
            <div>
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-brand-green)" }}>
                  Educación financiera
                </p>
                <h1 className="text-2xl font-extrabold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                  ¿Cuánto debés estar ganando?
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  Rangos de mercado en Guatemala y recordatorio del salario mínimo legal.
                </p>
              </div>
              <SalaryExplorer />
            </div>
          )}

          {/* TAB: CONSULTAS */}
          {tab === "consultas" && (
            <div>
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-brand-green)" }}>
                  Asesoría legal
                </p>
                <h1 className="text-2xl font-extrabold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                  Tus dudas, respondidas
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  Respuestas en chapín con base en el Código de Trabajo GT.
                </p>
              </div>
              <LegalConsultant />
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

export default CalculadoraPage;
