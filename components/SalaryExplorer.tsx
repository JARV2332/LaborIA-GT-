/**
 * components/SalaryExplorer.tsx
 * Explorador de salarios de mercado para Guatemala.
 * Educación financiera preventiva: el trabajador sabe qué debería ganar
 * antes de negociar o de calcular sus prestaciones.
 */
import { useState, useMemo } from "react";
import { Search, TrendingUp, Info, ChevronRight, X } from "lucide-react";

// ─── DATOS: SALARIO MÍNIMO 2026 ───────────────────────────────────────────────
// Acuerdo Gubernativo: actividades no agrícolas + Bono Incentivo (Decreto 37-2001)
const SALARIO_MINIMO_MENSUAL = 3_559.60; // No agrícola 2026 (estimado vigente)
const BONO_INCENTIVO = 250.0;            // Decreto 37-2001, Art. 1
const TOTAL_MINIMO_LEGAL = SALARIO_MINIMO_MENSUAL + BONO_INCENTIVO;

// ─── PUESTOS DE MERCADO GUATEMALTECO ─────────────────────────────────────────
interface Puesto {
  id: string;
  nombre: string;
  categoria: string;
  emoji: string;
  min: number;
  max: number;
  nota?: string;
}

const PUESTOS: Puesto[] = [
  // Educación
  { id: "maestro-primaria",     nombre: "Maestro/a de Primaria",          categoria: "Educación",       emoji: "📚", min: 3_800,  max: 6_500,  nota: "Pago varía si es público (MINEDUC) o privado" },
  { id: "maestro-secundaria",   nombre: "Maestro/a de Secundaria",        categoria: "Educación",       emoji: "🎓", min: 4_200,  max: 7_800 },
  { id: "director-escuela",     nombre: "Director/a de Escuela",          categoria: "Educación",       emoji: "🏫", min: 5_500,  max: 9_000 },

  // Tecnología
  { id: "dev-junior",           nombre: "Desarrollador/a Junior",         categoria: "Tecnología",      emoji: "💻", min: 5_500,  max: 9_000,  nota: "Mercado local; remoto puede ser mayor" },
  { id: "dev-mid",              nombre: "Desarrollador/a Mid-Level",      categoria: "Tecnología",      emoji: "⌨️", min: 9_000,  max: 18_000 },
  { id: "dev-senior",           nombre: "Desarrollador/a Senior",         categoria: "Tecnología",      emoji: "🚀", min: 18_000, max: 35_000 },
  { id: "soporte-ti",           nombre: "Soporte Técnico TI",             categoria: "Tecnología",      emoji: "🖥️", min: 3_800,  max: 6_500 },
  { id: "diseniador-ux",        nombre: "Diseñador/a UX/UI",              categoria: "Tecnología",      emoji: "🎨", min: 6_000,  max: 14_000 },

  // Contabilidad / Finanzas
  { id: "auxiliar-contable",    nombre: "Auxiliar Contable",              categoria: "Finanzas",        emoji: "🔢", min: 3_800,  max: 5_500 },
  { id: "contador",             nombre: "Contador/a General",             categoria: "Finanzas",        emoji: "📊", min: 5_500,  max: 10_000 },
  { id: "auditor",              nombre: "Auditor/a Interno",              categoria: "Finanzas",        emoji: "🔍", min: 7_000,  max: 14_000 },
  { id: "analista-financiero",  nombre: "Analista Financiero/a",          categoria: "Finanzas",        emoji: "📈", min: 6_500,  max: 13_000 },

  // Salud
  { id: "medico-gp",            nombre: "Médico/a General",               categoria: "Salud",           emoji: "🩺", min: 8_000,  max: 18_000 },
  { id: "enfermero",            nombre: "Enfermero/a Graduado/a",         categoria: "Salud",           emoji: "💉", min: 4_500,  max: 8_000 },
  { id: "farmaceutico",         nombre: "Farmacéutico/a",                 categoria: "Salud",           emoji: "💊", min: 5_000,  max: 9_500 },

  // Administración / RRHH
  { id: "recepcionista",        nombre: "Recepcionista / Asistente",      categoria: "Administración",  emoji: "📋", min: 3_559,  max: 5_000 },
  { id: "asistente-admin",      nombre: "Asistente Administrativo/a",     categoria: "Administración",  emoji: "🗂️", min: 3_800,  max: 6_000 },
  { id: "rrhh-generalista",     nombre: "Recursos Humanos Generalista",   categoria: "Administración",  emoji: "👥", min: 5_000,  max: 10_000 },
  { id: "gerente-admin",        nombre: "Gerente Administrativo/a",       categoria: "Administración",  emoji: "🏢", min: 10_000, max: 22_000 },

  // Ventas / Comercial
  { id: "vendedor-campo",       nombre: "Vendedor/a de Campo",            categoria: "Ventas",          emoji: "🤝", min: 3_559,  max: 7_000,  nota: "Incluye comisiones variables" },
  { id: "ejecutivo-ventas",     nombre: "Ejecutivo/a de Ventas",          categoria: "Ventas",          emoji: "💼", min: 5_000,  max: 12_000, nota: "Depende mucho de las comisiones" },
  { id: "supervisor-ventas",    nombre: "Supervisor/a de Ventas",         categoria: "Ventas",          emoji: "📣", min: 6_500,  max: 14_000 },

  // Logística / Operaciones
  { id: "bodeguero",            nombre: "Bodeguero/a",                    categoria: "Logística",       emoji: "📦", min: 3_559,  max: 5_000 },
  { id: "piloto-repartidor",    nombre: "Piloto Repartidor",              categoria: "Logística",       emoji: "🚐", min: 4_000,  max: 6_500 },
  { id: "supervisor-logistica", nombre: "Supervisor/a de Logística",      categoria: "Logística",       emoji: "🏭", min: 5_500,  max: 10_000 },

  // Seguridad
  { id: "agente-seguridad",     nombre: "Agente de Seguridad",            categoria: "Seguridad",       emoji: "🛡️", min: 3_559,  max: 4_800 },

  // Legal
  { id: "abogado-junior",       nombre: "Abogado/a Junior",               categoria: "Legal",           emoji: "⚖️", min: 5_000,  max: 9_000 },
  { id: "abogado-senior",       nombre: "Abogado/a Senior",               categoria: "Legal",           emoji: "🏛️", min: 10_000, max: 25_000 },

  // Comunicación
  { id: "periodista",           nombre: "Periodista / Comunicador/a",     categoria: "Comunicación",    emoji: "📰", min: 4_000,  max: 8_000 },
  { id: "community-manager",    nombre: "Community Manager",              categoria: "Comunicación",    emoji: "📱", min: 4_000,  max: 8_500 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ", maximumFractionDigits: 0 }).format(n);
}

function porcentajeSobreMinimo(salario: number) {
  return Math.round(((salario - TOTAL_MINIMO_LEGAL) / TOTAL_MINIMO_LEGAL) * 100);
}

// ─── COMPONENTE ──────────────────────────────────────────────────────────────

export default function SalaryExplorer() {
  const [query, setQuery] = useState("");
  const [seleccionado, setSeleccionado] = useState<Puesto | null>(null);

  const resultados = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PUESTOS.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
    ).slice(0, 7);
  }, [query]);

  function seleccionar(p: Puesto) {
    setSeleccionado(p);
    setQuery(p.nombre);
  }

  function limpiar() {
    setQuery("");
    setSeleccionado(null);
  }

  const midSalario = seleccionado
    ? Math.round((seleccionado.min + seleccionado.max) / 2)
    : null;

  const pctMin = midSalario ? porcentajeSobreMinimo(midSalario) : null;
  const barWidth = seleccionado
    ? Math.min(100, Math.round((seleccionado.min / 30_000) * 100))
    : 0;
  const barWidthMax = seleccionado
    ? Math.min(100, Math.round((seleccionado.max / 30_000) * 100))
    : 0;

  return (
    <div className="space-y-4">
      <div>
        <h3
          className="text-base font-extrabold"
          style={{ color: "var(--color-text-primary)" }}
        >
          🔎 Explorador de Salarios de Mercado
        </h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Busca tu puesto y conoce el rango estimado en Guatemala
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <Search size={16} style={{ color: "var(--color-text-muted)" }} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSeleccionado(null); }}
          placeholder="Ej. Contador, Maestro, Desarrollador..."
          className="input-base pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={limpiar}
            className="absolute inset-y-0 right-3 flex items-center"
          >
            <X size={15} style={{ color: "var(--color-text-muted)" }} />
          </button>
        )}

        {/* Dropdown de sugerencias */}
        {resultados.length > 0 && !seleccionado && (
          <div
            className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl"
            style={{
              backgroundColor: "#fff",
              border: "1px solid var(--color-surface-border)",
              boxShadow: "var(--shadow-elevated)",
            }}
          >
            {resultados.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => seleccionar(p)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="text-lg">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                    {p.nombre}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {p.categoria}
                  </p>
                </div>
                <ChevronRight size={14} style={{ color: "var(--color-text-muted)" }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Widget de resultado */}
      {seleccionado && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--color-surface-border)", boxShadow: "var(--shadow-elevated)" }}
        >
          {/* Header del widget */}
          <div
            className="px-5 py-4"
            style={{ backgroundColor: "var(--color-brand-dark)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{seleccionado.emoji}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-brand-green-light)" }}>
                  {seleccionado.categoria}
                </p>
                <h4 className="text-base font-extrabold" style={{ color: "#fff" }}>
                  {seleccionado.nombre}
                </h4>
              </div>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="px-5 py-4 space-y-4" style={{ backgroundColor: "#fff" }}>
            {/* Rango */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-text-muted)" }}>
                Rango salarial estimado de mercado
              </p>
              <div className="flex items-end gap-4 mb-3">
                <div>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Mínimo</p>
                  <p className="text-xl font-extrabold" style={{ color: "var(--color-brand-navy)" }}>{fmt(seleccionado.min)}</p>
                </div>
                <div className="text-lg font-light" style={{ color: "var(--color-text-muted)" }}>—</div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Máximo</p>
                  <p className="text-xl font-extrabold" style={{ color: "var(--color-brand-green-dark)" }}>{fmt(seleccionado.max)}</p>
                </div>
              </div>

              {/* Barra visual */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
                  <span>Q0</span><span>Q30,000+</span>
                </div>
                <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface-secondary)" }}>
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                    style={{
                      left: `${barWidth}%`,
                      width: `${barWidthMax - barWidth}%`,
                      backgroundColor: "var(--color-brand-green)",
                      minWidth: "8px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Promedio vs mínimo */}
            {midSalario !== null && pctMin !== null && (
              <div
                className="flex items-center gap-3 rounded-lg p-3"
                style={{
                  backgroundColor: pctMin >= 0 ? "#ecfdf5" : "#fef2f2",
                  border: `1px solid ${pctMin >= 0 ? "var(--color-brand-green-light)" : "#fca5a5"}`,
                }}
              >
                <TrendingUp size={18} style={{ color: pctMin >= 0 ? "var(--color-brand-green)" : "#dc2626" }} />
                <p className="text-sm" style={{ color: pctMin >= 0 ? "var(--color-brand-green-dark)" : "#7f1d1d" }}>
                  El promedio estimado ({fmt(midSalario)}) está{" "}
                  <strong>{Math.abs(pctMin)}% {pctMin >= 0 ? "por encima" : "por debajo"}</strong>{" "}
                  del mínimo legal.
                </p>
              </div>
            )}

            {/* Nota del puesto */}
            {seleccionado.nota && (
              <div
                className="flex items-start gap-2 rounded-lg p-3"
                style={{ backgroundColor: "#fffbeb", border: "1px solid var(--color-brand-amber-light)" }}
              >
                <Info size={14} className="mt-0.5 shrink-0" style={{ color: "var(--color-brand-amber-dark)" }} />
                <p className="text-xs" style={{ color: "#92400e" }}>{seleccionado.nota}</p>
              </div>
            )}

            {/* Recordatorio salario mínimo */}
            <div
              className="rounded-xl p-4 space-y-2"
              style={{ backgroundColor: "var(--color-surface-secondary)", border: "1px solid var(--color-surface-border)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
                📌 Salario Mínimo Legal 2026
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-secondary)" }}>Salario mínimo (no agrícola)</span>
                  <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{fmt(SALARIO_MINIMO_MENSUAL)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-secondary)" }}>+ Bono Incentivo (Decreto 37-2001)</span>
                  <span className="font-semibold" style={{ color: "var(--color-brand-green)" }}>+ {fmt(BONO_INCENTIVO)}</span>
                </div>
                <div
                  className="flex justify-between border-t pt-2 mt-1"
                  style={{ borderColor: "var(--color-surface-border)" }}
                >
                  <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Total mínimo que debes recibir</span>
                  <span className="text-sm font-extrabold" style={{ color: "var(--color-brand-green-dark)" }}>{fmt(TOTAL_MINIMO_LEGAL)}</span>
                </div>
              </div>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Ningún empleador puede pagarte menos que esto. Art. 103 CPRG + Art. 88 CT.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estado vacío: sugerencias populares */}
      {!query && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>
            Búsquedas populares
          </p>
          <div className="flex flex-wrap gap-2">
            {["Maestro/a de Primaria", "Auxiliar Contable", "Desarrollador/a Junior", "Vendedor/a de Campo", "Enfermero/a Graduado/a"].map((nombre) => {
              const p = PUESTOS.find((x) => x.nombre === nombre);
              return p ? (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => seleccionar(p)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: "var(--color-surface-secondary)",
                    border: "1px solid var(--color-surface-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <span>{p.emoji}</span> {p.nombre}
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
