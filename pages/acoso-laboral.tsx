import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  FileWarning,
  HeartHandshake,
  MessageSquareWarning,
  Phone,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";

interface Paso {
  titulo: string;
  detalle: string;
}

const CONDUCTAS = [
  "Insultos, gritos, burlas o humillaciones repetidas.",
  "Amenazas para obligarte a renunciar o aceptar condiciones ilegales.",
  "Aislarte deliberadamente, ocultarte información o impedir que hagas tu trabajo.",
  "Asignarte tareas degradantes, imposibles o sin relación con tu puesto para castigarte.",
  "Difundir rumores, atacar tu reputación o desacreditarte constantemente.",
  "Trato perjudicial por sexo, embarazo, edad, origen, discapacidad, religión u otra condición protegida.",
  "Comentarios, mensajes, insinuaciones o contacto de naturaleza sexual no deseados.",
];

const NO_SIEMPRE_ACOSO = [
  "Una corrección respetuosa y basada en hechos.",
  "Una evaluación de desempeño con criterios claros.",
  "Una instrucción laboral razonable dentro de tus funciones.",
  "Un conflicto aislado sin amenazas, discriminación ni repetición.",
];

const PASOS: Paso[] = [
  {
    titulo: "Prioriza tu seguridad",
    detalle: "Si hay violencia, amenazas creíbles o riesgo inmediato, retírate a un lugar seguro y busca apoyo. Una emergencia puede requerir a la PNC o servicios de emergencia, no solo una denuncia laboral.",
  },
  {
    titulo: "Registra cada incidente",
    detalle: "Anota fecha, hora, lugar, qué ocurrió, palabras utilizadas y quiénes estaban presentes. Hazlo pronto para conservar detalles precisos.",
  },
  {
    titulo: "Guarda evidencia",
    detalle: "Conserva correos, mensajes, memorandos, evaluaciones, cambios de horario y nombres de testigos. No alteres archivos ni obtengas pruebas violando la privacidad de otras personas.",
  },
  {
    titulo: "Reporta por escrito",
    detalle: "Si es seguro, informa a Recursos Humanos, al superior correspondiente o al canal interno. Describe hechos concretos y solicita número o constancia de recepción.",
  },
  {
    titulo: "Acude al MINTRAB",
    detalle: "La Inspección General de Trabajo puede recibir la denuncia e investigar incumplimientos laborales. Lleva identificación, datos del patrono, relato cronológico y copias de las pruebas.",
  },
  {
    titulo: "Busca asesoría antes de renunciar",
    detalle: "Ciertas conductas patronales pueden permitir terminar el contrato por causa atribuible al patrono, pero debe evaluarse y probarse correctamente. No firmes una renuncia o finiquito bajo presión.",
  },
];

const AcosoLaboral: NextPage = () => {
  const [pasoAbierto, setPasoAbierto] = useState<number | null>(0);

  return (
    <>
      <Head>
        <title>Acoso laboral — Mi Cuate Laboral</title>
        <meta name="description" content="Aprende a reconocer el acoso laboral y qué hacer en Guatemala." />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
        <nav className="sticky top-0 z-50 border-b px-4 py-3" style={{ backgroundColor: "var(--color-brand-dark)", borderColor: "var(--color-brand-navy)" }}>
          <div className="mx-auto flex max-w-4xl items-center gap-3">
            <Link href="/" aria-label="Volver al inicio" className="rounded-lg p-2 text-white transition-colors hover:bg-white/10">
              <ArrowLeft size={20} />
            </Link>
            <ShieldCheck size={21} style={{ color: "var(--color-brand-green-light)" }} />
            <span className="font-bold text-white">Acoso laboral</span>
            <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Guía de apoyo</span>
          </div>
        </nav>

        <main className="mx-auto max-w-4xl px-4 py-8">
          <header className="mb-7">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide" style={{ color: "var(--color-brand-green)" }}>Tu dignidad también es un derecho</p>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>¿Estoy viviendo acoso laboral?</h1>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Reconoce señales, documenta lo sucedido y conoce las rutas disponibles para protegerte.
            </p>
          </header>

          <section className="mb-5 rounded-2xl border bg-white p-5 sm:p-6" style={{ borderColor: "var(--color-surface-border)", boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#dbeafe", color: "var(--color-brand-navy)" }}>
                <BookOpen size={22} />
              </span>
              <div>
                <h2 className="text-lg font-extrabold">¿Qué es?</h2>
                <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Es un patrón de maltrato verbal, psicológico, moral, discriminatorio o sexual dentro del trabajo que busca intimidar, controlar, aislar, desacreditar o dañar la dignidad de una persona. Puede venir de un superior, un compañero o incluso un subordinado.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border p-4 text-xs" style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a", color: "#78350f" }}>
              Guatemala no cuenta con una única ley que reúna toda forma de acoso laboral como figura autónoma. La protección surge de la Constitución, el Código de Trabajo, normas contra la discriminación y, según la conducta, otras leyes.
            </div>
          </section>

          <div className="mb-5 grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border bg-white p-5" style={{ borderColor: "#fecaca", boxShadow: "var(--shadow-card)" }}>
              <div className="mb-4 flex items-center gap-2">
                <MessageSquareWarning size={20} style={{ color: "#dc2626" }} />
                <h2 className="font-extrabold">Señales de alerta</h2>
              </div>
              <ul className="space-y-3">
                {CONDUCTAS.map((conducta) => (
                  <li key={conducta} className="flex gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    <AlertTriangle className="mt-0.5 shrink-0" size={16} style={{ color: "#dc2626" }} />
                    <span>{conducta}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border bg-white p-5" style={{ borderColor: "#a7f3d0", boxShadow: "var(--shadow-card)" }}>
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} style={{ color: "var(--color-brand-green)" }} />
                <h2 className="font-extrabold">No siempre es acoso</h2>
              </div>
              <p className="mb-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                La exigencia laboral legítima debe ser respetuosa, proporcional y no discriminatoria.
              </p>
              <ul className="space-y-3">
                {NO_SIEMPRE_ACOSO.map((conducta) => (
                  <li key={conducta} className="flex gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    <CheckCircle2 className="mt-0.5 shrink-0" size={16} style={{ color: "var(--color-brand-green)" }} />
                    <span>{conducta}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg p-3 text-xs" style={{ backgroundColor: "var(--color-surface-secondary)", color: "var(--color-text-secondary)" }}>
                Un solo hecho grave —por ejemplo, agresión, amenaza o acoso sexual— puede requerir acción inmediata aunque no se haya repetido.
              </p>
            </section>
          </div>

          <section className="mb-5 rounded-2xl border bg-white p-5 sm:p-6" style={{ borderColor: "var(--color-surface-border)", boxShadow: "var(--shadow-card)" }}>
            <div className="mb-5 flex items-center gap-3">
              <ClipboardList size={22} style={{ color: "var(--color-brand-navy)" }} />
              <div>
                <h2 className="text-lg font-extrabold">Qué puedes hacer</h2>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Abre cada paso para ver la recomendación.</p>
              </div>
            </div>
            <div className="space-y-2">
              {PASOS.map((paso, index) => {
                const abierto = pasoAbierto === index;
                return (
                  <div key={paso.titulo} className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--color-surface-border)" }}>
                    <button
                      type="button"
                      onClick={() => setPasoAbierto(abierto ? null : index)}
                      aria-expanded={abierto}
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ backgroundColor: "var(--color-brand-green)" }}>{index + 1}</span>
                      <strong className="flex-1 text-sm">{paso.titulo}</strong>
                      {abierto ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                    </button>
                    {abierto && (
                      <p className="border-t px-4 py-4 pl-14 text-sm" style={{ borderColor: "var(--color-surface-border)", color: "var(--color-text-secondary)" }}>
                        {paso.detalle}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mb-5 rounded-2xl border p-5 sm:p-6" style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }}>
            <div className="flex items-start gap-3">
              <Scale className="mt-0.5 shrink-0" size={22} style={{ color: "var(--color-brand-navy)" }} />
              <div>
                <h2 className="font-extrabold" style={{ color: "var(--color-brand-navy)" }}>Base legal de protección</h2>
                <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <li><strong>Constitución:</strong> igualdad, dignidad, derecho al trabajo y garantías laborales.</li>
                  <li><strong>Código de Trabajo, artículo 61:</strong> el patrono debe guardar consideración y abstenerse de maltrato de palabra u obra.</li>
                  <li><strong>Artículo 79:</strong> contempla causas por las que el trabajador puede terminar el contrato por conducta grave del patrono.</li>
                  <li><strong>Artículos 197 y siguientes:</strong> obligaciones de salud y seguridad en el trabajo.</li>
                  <li><strong>Artículos 274 a 282:</strong> funciones de la Inspección General de Trabajo.</li>
                  <li><strong>Convenio 111 de la OIT:</strong> protección contra la discriminación en empleo y ocupación.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--color-surface-border)" }}>
              <Phone size={20} style={{ color: "var(--color-brand-green)" }} />
              <h2 className="mt-3 font-extrabold">Denuncia laboral</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>Contacta al MINTRAB o visita la Inspección General de Trabajo. La orientación y recepción de denuncias laborales es gratuita.</p>
              <a href="https://www.mintrabajo.gob.gt/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-bold" style={{ color: "var(--color-brand-navy)" }}>
                Portal oficial MINTRAB <ExternalLink size={14} />
              </a>
            </div>
            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--color-surface-border)" }}>
              <Users size={20} style={{ color: "var(--color-brand-green)" }} />
              <h2 className="mt-3 font-extrabold">No lo enfrentes a solas</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>Busca apoyo de una persona de confianza, sindicato, abogado laboral o la Procuraduría de los Derechos Humanos. Si afecta tu salud, solicita atención profesional.</p>
              <a href="https://www.pdh.org.gt/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-bold" style={{ color: "var(--color-brand-navy)" }}>
                Procuraduría de Derechos Humanos <ExternalLink size={14} />
              </a>
            </div>
          </section>

          <aside className="mt-5 flex gap-3 rounded-xl border p-4 text-xs" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}>
            <FileWarning className="shrink-0" size={18} />
            <p><strong>No firmes una renuncia bajo presión.</strong> Si existe violencia, acoso sexual, extorsión o amenazas, además de la vía laboral podría corresponder una denuncia penal. Busca orientación especializada cuanto antes.</p>
          </aside>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <HeartHandshake size={16} /> Pedir ayuda es una medida de protección, no una falta.
          </div>
        </main>
      </div>
    </>
  );
};

export default AcosoLaboral;
