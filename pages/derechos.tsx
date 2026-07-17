import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Baby,
  Banknote,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  Heart,
  HeartPulse,
  Hospital,
  Palmtree,
  Search,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type Categoria = "Todos" | "Descanso" | "Familia" | "Salud" | "Prestaciones" | "Recreación";

interface Derecho {
  id: string;
  titulo: string;
  resumen: string;
  categoria: Exclude<Categoria, "Todos">;
  datoClave: string;
  icono: LucideIcon;
  aplica: string;
  derecho: string[];
  necesitas: string[];
  fundamento: string;
  fuente?: string;
}

const CATEGORIAS: Categoria[] = [
  "Todos",
  "Descanso",
  "Familia",
  "Salud",
  "Prestaciones",
  "Recreación",
];

const DERECHOS: Derecho[] = [
  {
    id: "vacaciones",
    titulo: "Vacaciones",
    resumen: "Descanso anual pagado después de cada año de trabajo continuo.",
    categoria: "Descanso",
    datoClave: "15 días hábiles",
    icono: Palmtree,
    aplica: "Al completar un año continuo con el mismo patrono y al menos 150 días trabajados durante ese año.",
    derecho: [
      "15 días hábiles de descanso remunerado por cada año trabajado.",
      "El patrono debe fijarlas dentro de los 60 días siguientes a cumplir el año.",
      "Solo pueden pagarse en dinero cuando termina la relación laboral y quedaron días sin gozar.",
    ],
    necesitas: ["Coordinar las fechas con el patrono.", "Guardar constancia escrita de la autorización y de los días gozados."],
    fundamento: "Artículos 130, 131, 132 y 136 del Código de Trabajo.",
  },
  {
    id: "matrimonio",
    titulo: "Me voy a casar",
    resumen: "Licencia pagada para celebrar tu matrimonio.",
    categoria: "Familia",
    datoClave: "5 días pagados",
    icono: Heart,
    aplica: "Cuando contraes matrimonio.",
    derecho: ["5 días de licencia con goce de salario."],
    necesitas: ["Avisar al patrono con anticipación.", "Presentar la constancia o certificación de matrimonio si te la solicitan."],
    fundamento: "Artículo 61, literal ñ), numeral 1 del Código de Trabajo.",
  },
  {
    id: "nacimiento",
    titulo: "Va a nacer mi hijo",
    resumen: "Permiso pagado por el nacimiento de un hijo.",
    categoria: "Familia",
    datoClave: "2 días pagados",
    icono: Baby,
    aplica: "Cuando nace tu hijo o hija.",
    derecho: ["2 días de licencia con goce de salario."],
    necesitas: ["Informar al patrono.", "Presentar la constancia de nacimiento cuando sea requerida."],
    fundamento: "Artículo 61, literal ñ), numeral 3 del Código de Trabajo.",
  },
  {
    id: "duelo",
    titulo: "Falleció un familiar",
    resumen: "Licencia pagada para acompañar a tu familia durante el duelo.",
    categoria: "Familia",
    datoClave: "3 días pagados",
    icono: HeartPulse,
    aplica: "Por fallecimiento de cónyuge o conviviente, padres o hijos.",
    derecho: ["3 días de licencia con goce de salario."],
    necesitas: ["Notificar al patrono lo antes posible.", "Presentar certificación de defunción o documento que acredite el parentesco si se solicita."],
    fundamento: "Artículo 61, literal ñ), numeral 2 del Código de Trabajo.",
  },
  {
    id: "maternidad",
    titulo: "Estoy embarazada",
    resumen: "Descanso pre y postnatal, lactancia y protección especial.",
    categoria: "Familia",
    datoClave: "84 días de descanso",
    icono: Baby,
    aplica: "Durante el embarazo, parto y período de lactancia.",
    derecho: [
      "Descanso remunerado de 30 días antes y 54 días después del parto.",
      "Protección contra el despido durante el embarazo y la lactancia, salvo causa justificada autorizada judicialmente.",
      "Durante la lactancia puedes disponer de una hora diaria, según la modalidad acordada legalmente.",
    ],
    necesitas: ["Dar aviso del embarazo al patrono y entregar certificado médico.", "Realizar el control prenatal y los trámites de suspensión ante el IGSS cuando corresponda."],
    fundamento: "Artículos 151, 152 y 153 del Código de Trabajo; reglamentos del IGSS.",
  },
  {
    id: "igss",
    titulo: "¿Cuándo puedo usar el IGSS?",
    resumen: "Atención médica, maternidad, accidentes y subsidios por suspensión.",
    categoria: "Salud",
    datoClave: "Afiliación desde el día 1",
    icono: Hospital,
    aplica: "Desde el inicio de la relación laboral con un patrono inscrito. Los requisitos de cuotas cambian según el servicio o subsidio.",
    derecho: [
      "Tu patrono debe inscribirte desde el primer día de trabajo.",
      "Como regla informada por el IGSS, para atención por enfermedad y suspensión se requieren 4 aportes dentro de los últimos 6 meses.",
      "En una emergencia deben brindarte atención inmediata; los requisitos específicos dependen del riesgo y del programa.",
      "El subsidio por enfermedad se paga desde el cuarto día de suspensión y equivale a dos tercios del salario base diario, sujeto al límite vigente.",
    ],
    necesitas: ["DPI.", "Certificado de trabajo del patrono para la primera atención.", "Papeleta de cita para atenciones posteriores."],
    fundamento: "Decreto 295 y reglamentos de Enfermedad, Maternidad y Accidentes del IGSS.",
    fuente: "https://www.igssgt.org/preguntas-frecuentes/afiliados/",
  },
  {
    id: "enfermedad",
    titulo: "Estoy enfermo",
    resumen: "Qué hacer si no puedes trabajar por enfermedad.",
    categoria: "Salud",
    datoClave: "Suspensión médica",
    icono: HeartPulse,
    aplica: "Cuando un médico determina que la enfermedad te impide trabajar.",
    derecho: [
      "El IGSS puede emitir una suspensión temporal y otorgar atención médica.",
      "Si cumples las cuotas requeridas, puedes recibir subsidio por los días cubiertos.",
      "Una ausencia sin constancia médica puede tratarse de forma distinta; informa al patrono inmediatamente.",
    ],
    necesitas: ["DPI y certificado de trabajo.", "Constancia o suspensión emitida o validada por el IGSS.", "Aviso inmediato al patrono."],
    fundamento: "Reglamentos de Enfermedad, Maternidad y Accidentes del IGSS.",
    fuente: "https://www.igssgt.org/preguntas-frecuentes/ema/subsidio-por-enfermedad/",
  },
  {
    id: "irtra",
    titulo: "¿Cuándo puedo usar el IRTRA?",
    resumen: "Acceso a parques recreativos como trabajador afiliado.",
    categoria: "Recreación",
    datoClave: "Ingreso gratis con carné vigente",
    icono: Sparkles,
    aplica: "Cuando trabajas para una empresa privada afiliada, el patrono está al día en sus contribuciones y tu carné está vigente.",
    derecho: [
      "El afiliado con carné vigente puede ingresar sin costo a los parques abiertos del IRTRA.",
      "La vigencia anual se renueva con la información reportada por el patrono en la planilla electrónica.",
      "El hospedaje, alimentos y algunos servicios tienen tarifas independientes.",
    ],
    necesitas: ["Carné IRTRA vigente.", "Documento de identificación.", "Confirmar la vigencia antes de visitar el parque."],
    fundamento: "Ley de Creación del IRTRA y requisitos oficiales de afiliación.",
    fuente: "https://irtra.org.gt/afiliaciones/",
  },
  {
    id: "aguinaldo",
    titulo: "Aguinaldo",
    resumen: "Prestación anual adicional al salario.",
    categoria: "Prestaciones",
    datoClave: "100% de un salario",
    icono: Banknote,
    aplica: "Cada año; si trabajaste menos de un año, corresponde la parte proporcional.",
    derecho: [
      "El equivalente al 100% de un salario ordinario mensual por un año trabajado.",
      "Puede pagarse 50% en la primera quincena de diciembre y 50% en la primera quincena de enero, o completo en diciembre.",
    ],
    necesitas: ["Revisar recibos y el promedio del salario ordinario del período.", "Solicitar comprobante del pago."],
    fundamento: "Decreto 76-78, Ley Reguladora de la Prestación del Aguinaldo.",
  },
  {
    id: "bono-14",
    titulo: "Bono 14",
    resumen: "Bonificación anual independiente del aguinaldo.",
    categoria: "Prestaciones",
    datoClave: "100% de un salario",
    icono: Banknote,
    aplica: "Se paga durante la primera quincena de julio; corresponde proporcionalmente si no completaste el año.",
    derecho: ["El equivalente al 100% de un salario ordinario mensual por el período anual completo.", "Es adicional e independiente del aguinaldo."],
    necesitas: ["Verificar el promedio del salario ordinario devengado.", "Conservar el comprobante de pago."],
    fundamento: "Decreto 42-92, Ley de Bonificación Anual para Trabajadores.",
  },
  {
    id: "horas-extra",
    titulo: "Jornada y horas extra",
    resumen: "Límites de jornada y pago adicional por tiempo extraordinario.",
    categoria: "Descanso",
    datoClave: "Mínimo 1.5×",
    icono: Clock3,
    aplica: "Cuando trabajas fuera de la jornada ordinaria o superas sus límites legales.",
    derecho: [
      "Jornada diurna máxima: 8 horas diarias y 48 semanales.",
      "Jornada nocturna máxima: 6 horas diarias y 36 semanales.",
      "La jornada extraordinaria debe pagarse con al menos 50% más que la hora ordinaria.",
    ],
    necesitas: ["Guardar horarios, marcajes, mensajes y comprobantes de pago.", "Comparar las horas trabajadas con tu contrato y recibos."],
    fundamento: "Artículos 116, 117, 121 y 102 literal g) de la Constitución.",
  },
  {
    id: "descanso-semanal",
    titulo: "Descanso semanal y asuetos",
    resumen: "Descanso remunerado después de cada semana de trabajo.",
    categoria: "Descanso",
    datoClave: "1 día por semana",
    icono: CalendarDays,
    aplica: "Después de cada semana de trabajo y durante los asuetos reconocidos por ley.",
    derecho: [
      "Un día de descanso remunerado por cada semana ordinaria de trabajo o seis días consecutivos.",
      "Los días de asueto legal también son remunerados; si se trabajan, aplica la remuneración correspondiente.",
    ],
    necesitas: ["Revisar el calendario laboral y conservar registros si trabajaste durante el descanso o asueto."],
    fundamento: "Artículos 126, 127 y 129 del Código de Trabajo.",
  },
];

const DerechosPage: NextPage = () => {
  const [categoria, setCategoria] = useState<Categoria>("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState<string | null>("vacaciones");

  const resultados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");
    return DERECHOS.filter((item) => {
      const coincideCategoria = categoria === "Todos" || item.categoria === categoria;
      const contenido = `${item.titulo} ${item.resumen} ${item.datoClave}`.toLocaleLowerCase("es");
      return coincideCategoria && (!termino || contenido.includes(termino));
    });
  }, [busqueda, categoria]);

  return (
    <>
      <Head>
        <title>¿A qué tengo derecho? — LaborIA GT</title>
        <meta name="description" content="Guía interactiva de derechos laborales, IGSS e IRTRA en Guatemala." />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
        <nav className="sticky top-0 z-50 border-b px-4 py-3" style={{ backgroundColor: "var(--color-brand-dark)", borderColor: "var(--color-brand-navy)" }}>
          <div className="mx-auto flex max-w-4xl items-center gap-3">
            <Link href="/" aria-label="Volver al inicio" className="rounded-lg p-2 text-white transition-colors hover:bg-white/10">
              <ArrowLeft size={20} />
            </Link>
            <ShieldCheck size={21} style={{ color: "var(--color-brand-green-light)" }} />
            <span className="font-bold text-white">LaborIA GT</span>
            <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Mis derechos</span>
          </div>
        </nav>

        <main className="mx-auto max-w-4xl px-4 py-8">
          <header className="mb-7">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide" style={{ color: "var(--color-brand-green)" }}>Guía laboral interactiva</p>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>¿A qué tengo derecho?</h1>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Selecciona una situación para conocer los días, requisitos y beneficios que pueden corresponderte en Guatemala.
            </p>
          </header>

          <section className="mb-6 space-y-4" aria-label="Filtros">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--color-text-muted)" }} />
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Busca vacaciones, IGSS, IRTRA, embarazo..."
                className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none transition-shadow focus:ring-2"
                style={{ borderColor: "var(--color-surface-border)", boxShadow: "var(--shadow-card)" }}
              />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIAS.map((item) => {
                const activo = categoria === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategoria(item)}
                    className="shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors"
                    style={{
                      backgroundColor: activo ? "var(--color-brand-navy)" : "#fff",
                      borderColor: activo ? "var(--color-brand-navy)" : "var(--color-surface-border)",
                      color: activo ? "#fff" : "var(--color-text-secondary)",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </section>

          <p className="mb-3 text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
            {resultados.length} {resultados.length === 1 ? "derecho encontrado" : "derechos encontrados"}
          </p>

          <section className="space-y-3">
            {resultados.map((item) => {
              const Icono = item.icono;
              const estaAbierto = abierto === item.id;
              return (
                <article key={item.id} className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: "var(--color-surface-border)", boxShadow: "var(--shadow-card)" }}>
                  <button
                    type="button"
                    onClick={() => setAbierto(estaAbierto ? null : item.id)}
                    aria-expanded={estaAbierto}
                    aria-controls={`detalle-${item.id}`}
                    className="flex w-full items-center gap-4 p-4 text-left"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#ecfdf5", color: "var(--color-brand-green)" }}>
                      <Icono size={21} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm" style={{ color: "var(--color-text-primary)" }}>{item.titulo}</strong>
                        <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>{item.datoClave}</span>
                      </span>
                      <span className="mt-1 block text-xs" style={{ color: "var(--color-text-secondary)" }}>{item.resumen}</span>
                    </span>
                    {estaAbierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {estaAbierto && (
                    <div id={`detalle-${item.id}`} className="border-t px-4 pb-5 pt-4 sm:px-6" style={{ borderColor: "var(--color-surface-border)" }}>
                      <DetailBlock titulo="¿Cuándo aplica?" contenido={[item.aplica]} />
                      <DetailBlock titulo="Lo que te corresponde" contenido={item.derecho} />
                      <DetailBlock titulo="¿Qué necesitas?" contenido={item.necesitas} />
                      <div className="mt-4 rounded-lg p-3 text-xs" style={{ backgroundColor: "var(--color-surface-secondary)", color: "var(--color-text-secondary)" }}>
                        <strong>Fundamento:</strong> {item.fundamento}
                        {item.fuente && (
                          <a href={item.fuente} target="_blank" rel="noreferrer" className="ml-2 font-bold underline" style={{ color: "var(--color-brand-navy)" }}>
                            Consultar fuente oficial
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          {resultados.length === 0 && (
            <div className="rounded-xl border bg-white p-8 text-center" style={{ borderColor: "var(--color-surface-border)" }}>
              <Search className="mx-auto mb-3" size={28} style={{ color: "var(--color-text-muted)" }} />
              <p className="font-bold">No encontramos ese derecho</p>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Prueba con otra palabra o selecciona “Todos”.</p>
            </div>
          )}

          <aside className="mt-7 rounded-xl border p-4 text-xs" style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a", color: "#78350f" }}>
            Esta guía es informativa. Los requisitos pueden variar según tu caso, el tipo de afiliación y las disposiciones vigentes. Confirma trámites directamente con el IGSS, IRTRA o MINTRAB.
          </aside>
        </main>
      </div>
    </>
  );
};

function DetailBlock({ titulo, contenido }: { titulo: string; contenido: string[] }) {
  return (
    <div className="mb-4">
      <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wide" style={{ color: "var(--color-brand-navy)" }}>{titulo}</h2>
      <ul className="space-y-2">
        {contenido.map((texto) => (
          <li key={texto} className="flex gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "var(--color-brand-green)" }} />
            <span>{texto}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DerechosPage;
