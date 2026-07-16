/**
 * components/DashboardInput.tsx
 * Pantalla 1 — Entrada de datos híbrida.
 * Opción A: Formulario manual rápido
 * Opción B: Drag-and-drop de documento con simulación OCR
 */
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import {
  FileText,
  FormInput,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ScanLine,
  Calendar,
  Banknote,
  Clock,
  ChevronRight,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useLaborContext } from "@/context/LaborContext";
import { calculatePrestaciones } from "@/utils/laborCalculations";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type DroppedFileState = "idle" | "dragging" | "scanning" | "done" | "error";

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function DashboardInput() {
  const { opcion, setOpcion, formData, setFormData, setArchivoOCR, setResultado } =
    useLaborContext();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* ── Selector de opción ── */}
      <OptionSelector opcion={opcion} onSelect={setOpcion} />

      {/* ── Formulario según opción ── */}
      {opcion === "A" && (
        <OpcionAForm
          formData={formData}
          onChange={setFormData}
          error={error}
          onSubmit={() => {
            setError(null);
            try {
              const res = calculatePrestaciones({
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.fechaFin,
                salarioBase: parseFloat(formData.salarioBase),
                bonosMensuales: formData.tieneBonos ? parseFloat(formData.bonosMensuales || "0") : 0,
                diasVacacionesPendientes: parseInt(formData.diasVacacionesPendientes || "0"),
                esDespidoUnilateral: formData.esDespidoUnilateral,
              });
              setResultado(res);
              router.push("/resultados");
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : "Error al calcular. Verifica los datos.");
            }
          }}
        />
      )}

      {opcion === "B" && (
        <OpcionBDrop
          onArchivoListo={async (file, ocrResult) => {
            setArchivoOCR(file);
            // Si el OCR devolvió datos estructurados, pre-calcular y guardar
            if (ocrResult?.datos) {
              try {
                const { datos } = ocrResult;
                if (datos.fechaInicio && datos.fechaFin && datos.salarioBase > 0) {
                  const res = calculatePrestaciones({
                    fechaInicio: datos.fechaInicio,
                    fechaFin: datos.fechaFin,
                    salarioBase: datos.salarioBase,
                    bonosMensuales: datos.bonosMensuales ?? 0,
                    diasVacacionesPendientes: datos.diasVacacionesPendientes ?? 0,
                    esDespidoUnilateral: datos.esDespidoUnilateral ?? true,
                  });
                  setResultado(res);
                }
              } catch (_) { /* silenciar — los datos del OCR pueden ser incompletos */ }
            }
            router.push("/resultados");
          }}
          ocrAlertas={undefined}
        />
      )}
    </div>
  );
}

// ─── SELECTOR DE OPCIÓN ───────────────────────────────────────────────────────

function OptionSelector({
  opcion,
  onSelect,
}: {
  opcion: "A" | "B" | null;
  onSelect: (o: "A" | "B") => void;
}) {
  return (
    <div>
      <h2
        className="mb-1 text-lg font-extrabold"
        style={{ color: "var(--color-text-primary)" }}
      >
        ¿Cómo llegaste aquí?
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Elige la forma más rápida de consultar tu situación laboral.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Opción A */}
        <OptionCard
          selected={opcion === "A"}
          onSelect={() => onSelect("A")}
          icon={<FormInput size={22} />}
          colorVar="var(--color-brand-navy)"
          bgSelected="#dbeafe"
          label="Me despidieron o voy a renunciar"
          sublabel="Formulario Manual Rápido"
          description="Ingresa tus datos y calcula exactamente lo que te deben."
          badge="Más rápido"
          badgeBg="#dbeafe"
          badgeColor="#1e3a8a"
        />

        {/* Opción B */}
        <OptionCard
          selected={opcion === "B"}
          onSelect={() => onSelect("B")}
          icon={<FileText size={22} />}
          colorVar="var(--color-brand-green)"
          bgSelected="#d1fae5"
          label="Me quieren hacer firmar un documento"
          sublabel="Sube tu finiquito o carta"
          description="Sube el documento y la IA lo escanea por ti."
          badge="Con IA"
          badgeBg="#d1fae5"
          badgeColor="#065f46"
        />
      </div>
    </div>
  );
}

function OptionCard({
  selected,
  onSelect,
  icon,
  colorVar,
  bgSelected,
  label,
  sublabel,
  description,
  badge,
  badgeBg,
  badgeColor,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  colorVar: string;
  bgSelected: string;
  label: string;
  sublabel: string;
  description: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col gap-3 rounded-xl p-4 text-left transition-all"
      style={{
        backgroundColor: selected ? bgSelected : "#fff",
        border: `2px solid ${selected ? colorVar : "var(--color-surface-border)"}`,
        boxShadow: selected ? `0 0 0 3px ${colorVar}22` : "var(--shadow-card)",
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: selected ? colorVar : "var(--color-surface-secondary)", color: selected ? "#fff" : colorVar }}
        >
          {icon}
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold"
          style={{ backgroundColor: badgeBg, color: badgeColor }}
        >
          {badge}
        </span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: colorVar }}>
          {sublabel}
        </p>
        <p className="mt-0.5 text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
          {label}
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {description}
        </p>
      </div>
      {selected && (
        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: colorVar }}>
          <CheckCircle2 size={13} /> Seleccionado
        </div>
      )}
    </button>
  );
}

// ─── OPCIÓN A: FORMULARIO MANUAL ──────────────────────────────────────────────

function OpcionAForm({
  formData,
  onChange,
  error,
  onSubmit,
}: {
  formData: ReturnType<typeof useLaborContext>["formData"];
  onChange: (p: Partial<typeof formData>) => void;
  error: string | null;
  onSubmit: () => void;
}) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo de egreso */}
      <Card borderColor="var(--color-brand-navy)">
        <SectionLabel icon={<ToggleRight size={15} />} text="Tipo de salida" />
        <div className="grid grid-cols-2 gap-2 mt-3">
          <ToggleBtn
            active={formData.esDespidoUnilateral}
            color="green"
            onClick={() => onChange({ esDespidoUnilateral: true })}
            label="Me despidieron"
            sub="Aplica indemnización"
          />
          <ToggleBtn
            active={!formData.esDespidoUnilateral}
            color="amber"
            onClick={() => onChange({ esDespidoUnilateral: false })}
            label="Voy a renunciar"
            sub="Sin indemnización"
          />
        </div>
      </Card>

      {/* Fechas */}
      <Card borderColor="var(--color-brand-navy)">
        <SectionLabel icon={<Calendar size={15} />} text="Período laboral" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <InputField
            label="Fecha de inicio"
            type="date"
            value={formData.fechaInicio}
            onChange={(v) => onChange({ fechaInicio: v })}
            required
          />
          <InputField
            label="Fecha de egreso"
            type="date"
            value={formData.fechaFin}
            onChange={(v) => onChange({ fechaFin: v })}
            required
          />
        </div>
      </Card>

      {/* Salario */}
      <Card borderColor="var(--color-brand-green)">
        <SectionLabel icon={<Banknote size={15} />} text="Salario mensual" />
        <div className="mt-3 space-y-3">
          <InputField
            label="Salario neto mensual (Q)"
            type="number"
            placeholder="Ej. 4,000.00"
            value={formData.salarioBase}
            onChange={(v) => onChange({ salarioBase: v })}
            required
            min="1"
            step="0.01"
          />

          {/* Switch de bonos */}
          <div
            className="flex items-center justify-between rounded-lg px-4 py-3"
            style={{ backgroundColor: "var(--color-surface-secondary)", border: "1px solid var(--color-surface-border)" }}
          >
            <div className="pr-3">
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                ¿Recibías bonos, depósitos en efectivo o comisiones recurrentes?
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                Incluye cualquier pago extra fijo fuera del salario base
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange({ tieneBonos: !formData.tieneBonos })}
              className="shrink-0 transition-transform"
              aria-label="Toggle bonos"
            >
              {formData.tieneBonos ? (
                <ToggleRight size={36} style={{ color: "var(--color-brand-green)" }} />
              ) : (
                <ToggleLeft size={36} style={{ color: "var(--color-text-muted)" }} />
              )}
            </button>
          </div>

          {/* Campo extra si tiene bonos */}
          {formData.tieneBonos && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: "#ecfdf5", border: "1px solid var(--color-brand-green-light)" }}
            >
              <InputField
                label="Total promedio mensual de bonos (Q)"
                type="number"
                placeholder="Ej. 500.00"
                value={formData.bonosMensuales}
                onChange={(v) => onChange({ bonosMensuales: v })}
                min="0"
                step="0.01"
              />
              <p className="mt-1 text-xs" style={{ color: "var(--color-brand-green-dark)" }}>
                Suma todos los pagos extras que recibías consistentemente cada mes.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Vacaciones */}
      <Card borderColor="var(--color-brand-amber)">
        <SectionLabel icon={<Clock size={15} />} text="Vacaciones pendientes" />
        <div className="mt-3">
          <InputField
            label="Días de vacaciones que te quedaron debiendo"
            type="number"
            placeholder="Ej. 10"
            value={formData.diasVacacionesPendientes}
            onChange={(v) => onChange({ diasVacacionesPendientes: v })}
            min="0"
            max="365"
          />
          <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Art. 136 CT — Si no estás seguro, pon 0 y ajusta después.
          </p>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-2 rounded-lg p-3"
          style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5" }}
        >
          <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: "#dc2626" }} />
          <p className="text-sm" style={{ color: "#7f1d1d" }}>{error}</p>
        </div>
      )}

      {/* CTA */}
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 rounded-xl py-4 text-base font-extrabold tracking-wide transition-transform active:scale-95"
        style={{ backgroundColor: "var(--color-brand-green)", color: "#fff" }}
      >
        Calcular mis prestaciones
        <ChevronRight size={20} />
      </button>
    </form>
  );
}

// ─── TIPOS PARA OCR ───────────────────────────────────────────────────────────

interface OCRResult {
  datos: {
    fechaInicio: string | null;
    fechaFin: string;
    salarioBase: number;
    bonosMensuales: number;
    diasVacacionesPendientes: number;
    esDespidoUnilateral: boolean;
  };
  alertas: Array<{ nivel: "rojo" | "amarillo" | "info"; titulo: string; descripcion: string; clausula: string | null }>;
  tipoDocumento: string;
  resumenDocumento: string;
  confianzaExtraccion: string;
}

// ─── OPCIÓN B: DRAG & DROP ────────────────────────────────────────────────────

function OpcionBDrop({
  onArchivoListo,
}: {
  onArchivoListo: (f: File, result?: OCRResult) => void;
  ocrAlertas?: undefined;
}) {
  const [estado, setEstado] = useState<DroppedFileState>("idle");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [progreso, setProgreso] = useState(0);
  const [mensajeProgreso, setMensajeProgreso] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const TIPOS_VALIDOS = ["image/jpeg", "image/png", "application/pdf"];

  const procesarArchivo = useCallback(
    async (file: File) => {
      if (!TIPOS_VALIDOS.includes(file.type)) {
        setErrorMsg("Solo se aceptan archivos JPG, PNG o PDF.");
        setEstado("error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("El archivo no puede superar 10 MB.");
        setEstado("error");
        return;
      }

      setErrorMsg(null);
      setArchivo(file);
      setEstado("scanning");
      setProgreso(0);

      try {
        // Fase 1: Leer el archivo como base64
        setProgreso(15);
        setMensajeProgreso("Preparando documento...");
        const base64 = await fileToBase64(file);

        // Fase 2: Llamar a la API de análisis
        setProgreso(35);
        setMensajeProgreso("Detectando tipo de documento...");

        // Simular progreso visual mientras espera la respuesta de la API
        const progresoInterval = setInterval(() => {
          setProgreso((p) => {
            if (p < 80) return p + 5;
            return p;
          });
          setMensajeProgreso((m) => {
            if (progreso < 55) return "Extrayendo cifras y fechas...";
            if (progreso < 75) return "Verificando con el Código de Trabajo GT...";
            return "Analizando cláusulas del documento...";
          });
        }, 800);

        const response = await fetch("/api/analyze-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, mimeType: file.type }),
        });

        clearInterval(progresoInterval);

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Error al analizar el documento.");
        }

        const ocrResult: OCRResult = await response.json();

        setProgreso(100);
        setMensajeProgreso("¡Análisis completado!");
        setEstado("done");

        setTimeout(() => onArchivoListo(file, ocrResult), 800);
      } catch (err: unknown) {
        setEstado("error");
        setErrorMsg(err instanceof Error ? err.message : "Error al procesar el documento.");
      }
    },
    [onArchivoListo]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setEstado("idle");
    const file = e.dataTransfer.files[0];
    if (file) procesarArchivo(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) procesarArchivo(file);
  }

  function resetear() {
    setEstado("idle");
    setArchivo(null);
    setProgreso(0);
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {/* Zona de drop */}
      <div
        onDragOver={(e) => { e.preventDefault(); if (estado === "idle") setEstado("dragging"); }}
        onDragLeave={() => { if (estado === "dragging") setEstado("idle"); }}
        onDrop={onDrop}
        onClick={() => estado === "idle" && inputRef.current?.click()}
        className="relative flex flex-col items-center justify-center rounded-2xl px-6 py-10 text-center transition-all"
        style={{
          border: `2px dashed ${
            estado === "dragging"
              ? "var(--color-brand-green)"
              : estado === "done"
              ? "var(--color-brand-green)"
              : estado === "error"
              ? "#f87171"
              : "var(--color-surface-border)"
          }`,
          backgroundColor:
            estado === "dragging"
              ? "#ecfdf5"
              : estado === "done"
              ? "#ecfdf5"
              : estado === "error"
              ? "#fef2f2"
              : "var(--color-surface-secondary)",
          cursor: estado === "idle" || estado === "dragging" ? "pointer" : "default",
          minHeight: "220px",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={onInputChange}
        />

        {/* Estado: idle o dragging */}
        {(estado === "idle" || estado === "dragging") && (
          <>
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all"
              style={{
                backgroundColor: estado === "dragging" ? "var(--color-brand-green)" : "var(--color-surface-border)",
              }}
            >
              <Upload
                size={28}
                style={{ color: estado === "dragging" ? "#fff" : "var(--color-text-muted)" }}
              />
            </div>
            <p className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
              {estado === "dragging" ? "¡Suelta el archivo aquí!" : "Arrastra tu documento aquí"}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              o <span style={{ color: "var(--color-brand-navy-light)", fontWeight: 600 }}>haz clic para buscar</span>
            </p>
            <p className="mt-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
              JPG · PNG · PDF · Máximo 10 MB
            </p>
          </>
        )}

        {/* Estado: scanning */}
        {estado === "scanning" && (
          <div className="w-full max-w-xs space-y-4">
            <div className="flex items-center justify-center gap-3">
              <ScanLine
                size={28}
                className="animate-pulse"
                style={{ color: "var(--color-brand-navy)" }}
              />
              <p className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                La IA está escaneando tu documento...
              </p>
            </div>

            {/* Barra de progreso */}
            <div
              className="h-2 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "var(--color-surface-border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progreso}%`,
                  backgroundColor: "var(--color-brand-navy)",
                }}
              />
            </div>
            <p className="text-xs font-semibold" style={{ color: "var(--color-brand-navy)" }}>
              {mensajeProgreso || (
                progreso < 40 ? "Detectando tipo de documento..." :
                progreso < 70 ? "Extrayendo cifras y fechas..." :
                progreso < 100 ? "Verificando con el Código de Trabajo GT..." :
                "¡Análisis completado!"
              )}
            </p>

            {/* Nombre del archivo */}
            <p className="truncate text-xs" style={{ color: "var(--color-text-muted)" }}>
              📄 {archivo?.name}
            </p>
          </div>
        )}

        {/* Estado: done */}
        {estado === "done" && (
          <div className="space-y-2">
            <CheckCircle2
              size={40}
              className="mx-auto"
              style={{ color: "var(--color-brand-green)" }}
            />
            <p className="text-base font-bold" style={{ color: "var(--color-brand-green-dark)" }}>
              Documento analizado
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Redirigiendo a resultados...
            </p>
          </div>
        )}

        {/* Estado: error */}
        {estado === "error" && (
          <div className="space-y-3">
            <AlertTriangle size={36} className="mx-auto" style={{ color: "#dc2626" }} />
            <p className="text-sm font-bold" style={{ color: "#7f1d1d" }}>
              {errorMsg}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); resetear(); }}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold"
              style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" }}
            >
              <X size={14} /> Intentar de nuevo
            </button>
          </div>
        )}
      </div>

      {/* Info adicional */}
      <div
        className="flex items-start gap-2 rounded-lg p-3"
        style={{ backgroundColor: "#fffbeb", border: "1px solid var(--color-brand-amber-light)" }}
      >
        <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: "var(--color-brand-amber-dark)" }} />
        <p className="text-xs" style={{ color: "#92400e" }}>
          <strong>Privacidad:</strong> Tu documento se procesa localmente y no se almacena en ningún servidor.
          Esta función es orientativa — revisa siempre con un abogado.
        </p>
      </div>
    </div>
  );
}

// ─── MICRO-COMPONENTES REUTILIZABLES ──────────────────────────────────────────

function Card({ children, borderColor }: { children: React.ReactNode; borderColor: string }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "#fff",
        border: "1px solid var(--color-surface-border)",
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: "var(--shadow-card)",
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: "var(--color-text-muted)" }}>{icon}</span>
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
        {text}
      </span>
    </div>
  );
}

function ToggleBtn({
  active,
  color,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  color: "green" | "amber";
  onClick: () => void;
  label: string;
  sub: string;
}) {
  const accent = color === "green" ? "var(--color-brand-green)" : "var(--color-brand-amber)";
  const bg = color === "green" ? "#ecfdf5" : "#fffbeb";

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-3 text-left transition-all"
      style={{
        border: `2px solid ${active ? accent : "var(--color-surface-border)"}`,
        backgroundColor: active ? bg : "#fff",
      }}
    >
      <p
        className="text-sm font-bold"
        style={{ color: active ? accent : "var(--color-text-primary)" }}
      >
        {label}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
        {sub}
      </p>
    </button>
  );
}

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  min,
  max,
  step,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="input-base"
      />
    </div>
  );
}

// ─── HELPER: Archivo → Base64 ─────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Quitar el prefijo "data:mime/type;base64," — solo enviar los datos puros
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
