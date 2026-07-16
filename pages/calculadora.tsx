/**
 * pages/calculadora.tsx
 * Pantalla 1 — Entrada de datos del trabajador.
 * Integra el componente DashboardInput dentro del layout de la app.
 */
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";
import DashboardInput from "@/components/DashboardInput";

const CalculadoraPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Consultar mis derechos — LaborIA GT</title>
        <meta
          name="description"
          content="Calcula tus prestaciones laborales según el Código de Trabajo de Guatemala"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
        {/* Navbar */}
        <nav
          className="sticky top-0 z-50 border-b px-4 py-3"
          style={{
            backgroundColor: "var(--color-brand-dark)",
            borderColor: "var(--color-brand-navy)",
          }}
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
              style={{
                backgroundColor: "var(--color-brand-navy)",
                color: "var(--color-brand-green-light)",
              }}
            >
              Paso 1 de 2
            </span>
          </div>
        </nav>

        {/* Contenido */}
        <div className="mx-auto max-w-lg px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "var(--color-brand-green)" }}
            >
              Tu consulta laboral
            </p>
            <h1
              className="text-2xl font-extrabold leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              ¿Qué está pasando con tu trabajo?
            </h1>
          </div>

          {/* Componente principal */}
          <DashboardInput />
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
