import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  Users,
  FileText,
  ArrowRight,
  Heart,
} from "lucide-react";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Mi Cuate Laboral — Asesoría Laboral Inteligente</title>
        <meta
          name="description"
          content="Plataforma de asesoría laboral con inteligencia artificial para Guatemala"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
        {/* ── NAVBAR ── */}
        <nav
          className="sticky top-0 z-50 border-b px-4 py-3"
          style={{
            backgroundColor: "var(--color-brand-dark)",
            borderColor: "var(--color-brand-navy)",
          }}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale
                size={22}
                style={{ color: "var(--color-brand-green)" }}
              />
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: "var(--color-text-inverse)" }}
              >
                Mi Cuate <span style={{ color: "var(--color-brand-green)" }}>Laboral</span>
              </span>
            </div>
            <Link
              href="/calculadora"
              className="rounded-lg px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--color-brand-green)",
                color: "var(--color-text-inverse)",
              }}
            >
              Consultar ahora
            </Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section
          className="px-4 py-16 text-center"
          style={{ backgroundColor: "var(--color-brand-dark)" }}
        >
          <div className="mx-auto max-w-2xl">
            <span
              className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: "var(--color-brand-navy)",
                color: "var(--color-brand-green-light)",
              }}
            >
              Plataforma Legal-Tech · Guatemala
            </span>
            <h1
              className="mb-4 text-3xl font-extrabold leading-tight sm:text-4xl"
              style={{ color: "var(--color-text-inverse)" }}
            >
              Tus derechos laborales,{" "}
              <span style={{ color: "var(--color-brand-green)" }}>
                siempre contigo
              </span>
            </h1>
            <p
              className="mb-8 text-base sm:text-lg"
              style={{ color: "var(--color-text-muted)" }}
            >
              Consulta tu situación laboral al instante. Sin abogados caros,
              sin filas, sin esperas.
            </p>
            <Link
              href="/calculadora"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-bold shadow-lg transition-transform active:scale-95"
              style={{
                backgroundColor: "var(--color-brand-green)",
                color: "#fff",
              }}
            >
              Empezar consulta gratis
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* ── ALERT BANNER (amber) ── */}
        <div
          className="flex items-start gap-3 px-4 py-3"
          style={{
            backgroundColor: "#fffbeb",
            borderBottom: "1px solid var(--color-brand-amber)",
          }}
        >
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--color-brand-amber-dark)" }}
          />
          <p className="text-sm" style={{ color: "#92400e" }}>
            <strong>Importante:</strong> Esta plataforma brinda orientación
            informativa. Para casos específicos, siempre consulta con un
            abogado certificado.
          </p>
        </div>

        {/* ── CARDS DE SERVICIOS ── */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <h2
              className="mb-2 text-center text-xl font-bold sm:text-2xl"
              style={{ color: "var(--color-text-primary)" }}
            >
              ¿En qué te podemos ayudar?
            </h2>
            <p
              className="mb-8 text-center text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Selecciona tu situación y recibe orientación inmediata
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s) => (
                <ServiceCard key={s.title} {...s} />
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          className="px-4 py-6 text-center text-xs"
          style={{
            backgroundColor: "var(--color-brand-dark)",
            color: "var(--color-text-muted)",
          }}
        >
          © {new Date().getFullYear()} Mi Cuate Laboral — Todos los derechos reservados
        </footer>
      </div>
    </>
  );
};

/* ─── Sub-componente: ServiceCard ─── */
interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
  tagColor: "green" | "amber" | "navy";
  href?: string;
  linkLabel?: string;
}

const TAG_STYLES: Record<string, React.CSSProperties> = {
  green: { backgroundColor: "#d1fae5", color: "#065f46" },
  amber: { backgroundColor: "#fef3c7", color: "#92400e" },
  navy:  { backgroundColor: "#dbeafe", color: "#1e3a8a" },
};

function ServiceCard({ icon, title, description, tag, tagColor, href, linkLabel }: ServiceCardProps) {
  const inner = (
    <>
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: "var(--color-surface-secondary)" }}
      >
        {icon}
      </div>
      <div>
        <div className="mb-1 flex items-center gap-2">
          <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
            {title}
          </h3>
          <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={TAG_STYLES[tagColor]}>
            {tag}
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {description}
        </p>
        {href && (
          <span
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold"
            style={{ color: "var(--color-brand-green)" }}
          >
            {linkLabel ?? "Ver detalles"} <ArrowRight size={12} />
          </span>
        )}
      </div>
    </>
  );

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    border: "1px solid var(--color-surface-border)",
    boxShadow: "var(--shadow-card)",
  };

  if (href) {
    return (
      <Link
        href={href}
        className="flex flex-col gap-3 rounded-xl p-5 transition-shadow hover:shadow-md"
        style={cardStyle}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl p-5" style={cardStyle}>
      {inner}
    </div>
  );
}

/* ─── Data ─── */
const SERVICES: ServiceCardProps[] = [
  {
    icon: <ShieldCheck size={20} style={{ color: "var(--color-brand-green)" }} />,
    title: "Verificar prestaciones",
    description: "Revisa si tus prestaciones de ley están correctamente calculadas.",
    tag: "Más consultado",
    tagColor: "green",
    href: "/test-calculo",
  },
  {
    icon: <FileText size={20} style={{ color: "var(--color-brand-navy)" }} />,
    title: "Revisión de contrato",
    description: "Analiza las cláusulas de tu contrato laboral ante la ley guatemalteca.",
    tag: "Nuevo",
    tagColor: "navy",
    href: "/revision-contrato",
    linkLabel: "Revisar mi contrato",
  },
  {
    icon: <Heart size={20} style={{ color: "var(--color-brand-amber)" }} />,
    title: "¿A qué tengo derecho?",
    description: "Conoce tus permisos y protecciones por matrimonio, nacimiento, enfermedad, duelo o embarazo.",
    tag: "Vida laboral",
    tagColor: "amber",
    href: "/derechos",
    linkLabel: "Explorar mis derechos",
  },
  {
    icon: <Briefcase size={20} style={{ color: "var(--color-brand-navy)" }} />,
    title: "Liquidación laboral",
    description: "Calcula lo que te corresponde al finalizar tu relación laboral.",
    tag: "Popular",
    tagColor: "navy",
    href: "/test-calculo",
  },
  {
    icon: <Users size={20} style={{ color: "var(--color-brand-green)" }} />,
    title: "Acoso laboral",
    description: "Aprende a identificar y denunciar situaciones de acoso en el trabajo.",
    tag: "Importante",
    tagColor: "green",
    href: "/acoso-laboral",
    linkLabel: "Conocer y actuar",
  },
  {
    icon: <CheckCircle2 size={20} style={{ color: "var(--color-brand-green)" }} />,
    title: "Jornada y horas extra",
    description: "Verifica si tu jornada laboral y pago de horas extra es legal.",
    tag: "Frecuente",
    tagColor: "green",
  },
];

export default Home;
