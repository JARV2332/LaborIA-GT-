import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  FileText,
  Info,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldAlert,
  UploadCloud,
} from "lucide-react";

type NivelAlerta = "rojo" | "amarillo" | "info";

interface Alerta {
  nivel: NivelAlerta;
  titulo: string;
  descripcion: string;
  clausula?: string | null;
}

interface ResultadoAnalisis {
  alertas: Alerta[];
  tipoDocumento: string;
  resumenDocumento: string;
  confianzaExtraccion: "alta" | "media" | "baja";
}

interface ImagenDocumento {
  base64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}

const RevisionContrato: NextPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const [progreso, setProgreso] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);

  async function seleccionarArchivo(file?: File) {
    if (!file) return;
    const tiposValidos = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

    setResultado(null);
    setError(null);

    if (!tiposValidos.includes(file.type)) {
      setError("El formato no es compatible. Sube un PDF, JPG, PNG o WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo supera el límite de 10 MB.");
      return;
    }

    setArchivo(file);
  }

  async function analizar() {
    if (!archivo) return;
    setAnalizando(true);
    setResultado(null);
    setError(null);

    try {
      setProgreso(archivo.type === "application/pdf" ? "Preparando las páginas del PDF..." : "Preparando la imagen...");
      const images = await convertirArchivo(archivo);

      setProgreso("Buscando cláusulas ocultas o perjudiciales...");
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No fue posible analizar el documento.");
      }

      setResultado(data);
      setProgreso("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrió un error durante el análisis.");
    } finally {
      setAnalizando(false);
    }
  }

  function reiniciar() {
    setArchivo(null);
    setResultado(null);
    setError(null);
    setProgreso("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const alertasRojas = resultado?.alertas.filter((alerta) => alerta.nivel === "rojo").length ?? 0;
  const alertasAmarillas = resultado?.alertas.filter((alerta) => alerta.nivel === "amarillo").length ?? 0;

  return (
    <>
      <Head>
        <title>Revisión de contrato — Mi Cuate Laboral</title>
        <meta name="description" content="Analiza contratos laborales y detecta cláusulas que podrían perjudicar al trabajador." />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
        <nav className="sticky top-0 z-50 border-b px-4 py-3" style={{ backgroundColor: "var(--color-brand-dark)", borderColor: "var(--color-brand-navy)" }}>
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <Link href="/" aria-label="Volver al inicio" className="rounded-lg p-2 text-white transition-colors hover:bg-white/10">
              <ArrowLeft size={20} />
            </Link>
            <FileSearch size={21} style={{ color: "var(--color-brand-green-light)" }} />
            <span className="font-bold text-white">Revisión de contrato</span>
            <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Con IA</span>
          </div>
        </nav>

        <main className="mx-auto max-w-3xl px-4 py-8">
          <header className="mb-7">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide" style={{ color: "var(--color-brand-green)" }}>Antes de firmar</p>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>Revisa tu contrato</h1>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Sube el contrato en PDF o una foto legible. Analizaremos montos, fechas, renuncias de derechos, restricciones y texto que podría perjudicarte.
            </p>
          </header>

          {!resultado && (
            <section className="rounded-2xl border bg-white p-5 sm:p-7" style={{ borderColor: "var(--color-surface-border)", boxShadow: "var(--shadow-card)" }}>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => seleccionarArchivo(event.target.files?.[0])}
              />

              <button
                type="button"
                disabled={analizando}
                onClick={() => inputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setArrastrando(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setArrastrando(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setArrastrando(false);
                  seleccionarArchivo(event.dataTransfer.files?.[0]);
                }}
                className="flex min-h-64 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors disabled:cursor-wait"
                style={{
                  borderColor: arrastrando ? "var(--color-brand-green)" : "var(--color-surface-border)",
                  backgroundColor: arrastrando ? "#ecfdf5" : "var(--color-surface)",
                }}
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "#dbeafe", color: "var(--color-brand-navy)" }}>
                  {archivo ? <FileText size={27} /> : <UploadCloud size={27} />}
                </span>
                {archivo ? (
                  <>
                    <strong className="max-w-full truncate text-base" style={{ color: "var(--color-text-primary)" }}>{archivo.name}</strong>
                    <span className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>{formatearTamano(archivo.size)} · Haz clic para cambiarlo</span>
                  </>
                ) : (
                  <>
                    <strong style={{ color: "var(--color-text-primary)" }}>Arrastra tu contrato aquí</strong>
                    <span className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>o haz clic para seleccionar un archivo</span>
                    <span className="mt-3 text-xs" style={{ color: "var(--color-text-muted)" }}>PDF de hasta 6 páginas o imagen · Máximo 10 MB</span>
                  </>
                )}
              </button>

              {error && (
                <div role="alert" className="mt-4 flex gap-2 rounded-lg border p-3 text-sm" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}>
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                disabled={!archivo || analizando}
                onClick={analizar}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--color-brand-green)" }}
              >
                {analizando ? <LoaderCircle className="animate-spin" size={19} /> : <ShieldAlert size={19} />}
                {analizando ? progreso : "Analizar cláusulas del contrato"}
              </button>

              <div className="mt-4 flex items-start gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                <LockKeyhole size={15} className="mt-0.5 shrink-0" />
                <p>El documento se envía temporalmente al proveedor de IA configurado para analizarlo; Mi Cuate Laboral no lo guarda en una base de datos.</p>
              </div>
            </section>
          )}

          {resultado && (
            <section>
              <div className="mb-4 rounded-2xl border bg-white p-5" style={{ borderColor: "var(--color-surface-border)", boxShadow: "var(--shadow-card)" }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>{normalizarTipo(resultado.tipoDocumento)}</span>
                    <h2 className="mt-1 text-xl font-extrabold" style={{ color: "var(--color-text-primary)" }}>
                      {alertasRojas > 0 ? "Encontramos riesgos importantes" : alertasAmarillas > 0 ? "Hay puntos que debes revisar" : "No detectamos alertas críticas"}
                    </h2>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: "#dbeafe", color: "#1e3a8a" }}>
                    Confianza {resultado.confianzaExtraccion}
                  </span>
                </div>
                <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>{resultado.resumenDocumento}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Contador label="Riesgos altos" cantidad={alertasRojas} color="#dc2626" fondo="#fef2f2" />
                  <Contador label="Revisar" cantidad={alertasAmarillas} color="#d97706" fondo="#fffbeb" />
                </div>
              </div>

              <div className="space-y-3">
                {resultado.alertas.map((alerta, index) => (
                  <AlertaResultado key={`${alerta.titulo}-${index}`} alerta={alerta} />
                ))}
                {resultado.alertas.length === 0 && (
                  <div className="flex gap-3 rounded-xl border bg-white p-5" style={{ borderColor: "#a7f3d0" }}>
                    <CheckCircle2 className="shrink-0" size={22} style={{ color: "var(--color-brand-green)" }} />
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>No se identificaron cláusulas perjudiciales evidentes. Aun así, verifica que salario, horario, funciones y prestaciones coincidan con lo ofrecido.</p>
                  </div>
                )}
              </div>

              <aside className="mt-5 rounded-xl border p-4 text-xs" style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a", color: "#78350f" }}>
                Este análisis es orientativo y puede omitir texto borroso o ambiguo. No firmes si hay espacios en blanco, montos incorrectos o presión. Solicita una copia y consulta al MINTRAB o a un abogado laboral.
              </aside>

              <button type="button" onClick={reiniciar} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-bold" style={{ borderColor: "var(--color-surface-border)", color: "var(--color-brand-navy)" }}>
                <RotateCcw size={17} /> Revisar otro documento
              </button>
            </section>
          )}
        </main>
      </div>
    </>
  );
};

function AlertaResultado({ alerta }: { alerta: Alerta }) {
  const estilos = {
    rojo: { fondo: "#fef2f2", borde: "#fecaca", color: "#991b1b", Icono: ShieldAlert },
    amarillo: { fondo: "#fffbeb", borde: "#fde68a", color: "#92400e", Icono: AlertTriangle },
    info: { fondo: "#eff6ff", borde: "#bfdbfe", color: "#1e40af", Icono: Info },
  }[alerta.nivel] ?? { fondo: "#eff6ff", borde: "#bfdbfe", color: "#1e40af", Icono: Info };
  const { Icono } = estilos;

  return (
    <article className="rounded-xl border p-4" style={{ backgroundColor: estilos.fondo, borderColor: estilos.borde }}>
      <div className="flex gap-3">
        <Icono size={20} className="mt-0.5 shrink-0" style={{ color: estilos.color }} />
        <div>
          <h3 className="text-sm font-extrabold" style={{ color: estilos.color }}>{alerta.titulo}</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{alerta.descripcion}</p>
          {alerta.clausula && (
            <blockquote className="mt-3 border-l-2 pl-3 text-xs italic" style={{ borderColor: estilos.color, color: "var(--color-text-secondary)" }}>
              “{alerta.clausula}”
            </blockquote>
          )}
        </div>
      </div>
    </article>
  );
}

function Contador({ label, cantidad, color, fondo }: { label: string; cantidad: number; color: string; fondo: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ backgroundColor: fondo }}>
      <strong className="block text-2xl" style={{ color }}>{cantidad}</strong>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

async function convertirArchivo(file: File): Promise<ImagenDocumento[]> {
  if (file.type !== "application/pdf") {
    return [{ base64: await fileToBase64(file), mimeType: file.type as ImagenDocumento["mimeType"] }];
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;

  if (pdf.numPages > 6) {
    throw new Error("El PDF tiene más de 6 páginas. Divide el contrato en archivos más pequeños para revisar todo el contenido.");
  }

  const paginas: ImagenDocumento[] = [];
  for (let numero = 1; numero <= pdf.numPages; numero += 1) {
    const pagina = await pdf.getPage(numero);
    const viewport = pagina.getViewport({ scale: 1.35 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar el PDF en este navegador.");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await pagina.render({ canvas, canvasContext: context, viewport }).promise;
    paginas.push({
      base64: canvas.toDataURL("image/jpeg", 0.82).split(",")[1],
      mimeType: "image/jpeg",
    });
  }
  return paginas;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

function formatearTamano(bytes: number) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function normalizarTipo(tipo: string) {
  return tipo.replaceAll("_", " ").replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export default RevisionContrato;
