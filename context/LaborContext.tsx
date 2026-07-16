/**
 * context/LaborContext.tsx
 * Estado global de la sesión de consulta laboral.
 * Mantiene los datos del formulario y el resultado calculado
 * para compartirlos entre pantallas sin prop-drilling.
 */
import { createContext, useContext, useState, ReactNode } from "react";
import type { ResultadoPrestaciones, TipoEgreso } from "@/utils/laborCalculations";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type { TipoEgreso };

export interface FormDataLaboral {
  fechaInicio: string;
  fechaFin: string;
  salarioBase: string;
  tieneBonos: boolean;
  bonosMensuales: string;
  diasVacacionesPendientes: string;
  tipoEgreso: TipoEgreso;
}

export interface OCRAlerta {
  nivel: "rojo" | "amarillo" | "info";
  titulo: string;
  descripcion: string;
  clausula: string | null;
}

export interface OCRResult {
  datos: {
    fechaInicio: string | null;
    fechaFin: string;
    salarioBase: number;
    bonosMensuales: number;
    diasVacacionesPendientes: number;
    esDespidoUnilateral: boolean;
  };
  alertas: OCRAlerta[];
  tipoDocumento: string;
  resumenDocumento: string;
  confianzaExtraccion: string;
}

export type OpcionConsulta = "A" | "B" | null;

interface LaborContextType {
  opcion: OpcionConsulta;
  formData: FormDataLaboral;
  archivoOCR: File | null;
  ocrResult: OCRResult | null;
  resultado: ResultadoPrestaciones | null;
  ofertaEmpresa: string;
  setOpcion: (o: OpcionConsulta) => void;
  setFormData: (patch: Partial<FormDataLaboral>) => void;
  setArchivoOCR: (f: File | null) => void;
  setOcrResult: (r: OCRResult | null) => void;
  setResultado: (r: ResultadoPrestaciones | null) => void;
  setOfertaEmpresa: (v: string) => void;
  resetSesion: () => void;
}

// ─── ESTADO INICIAL ───────────────────────────────────────────────────────────

const FORM_INICIAL: FormDataLaboral = {
  fechaInicio: "",
  fechaFin: "",
  salarioBase: "",
  tieneBonos: false,
  bonosMensuales: "",
  diasVacacionesPendientes: "0",
  tipoEgreso: "despido_injustificado",
};

// ─── CONTEXTO ─────────────────────────────────────────────────────────────────

const LaborContext = createContext<LaborContextType | null>(null);

export function LaborProvider({ children }: { children: ReactNode }) {
  const [opcion, setOpcion] = useState<OpcionConsulta>(null);
  const [formData, setFormDataState] = useState<FormDataLaboral>(FORM_INICIAL);
  const [archivoOCR, setArchivoOCR] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [resultado, setResultado] = useState<ResultadoPrestaciones | null>(null);
  const [ofertaEmpresa, setOfertaEmpresa] = useState<string>("");

  function setFormData(patch: Partial<FormDataLaboral>) {
    setFormDataState((prev) => ({ ...prev, ...patch }));
  }

  function resetSesion() {
    setOpcion(null);
    setFormDataState(FORM_INICIAL);
    setArchivoOCR(null);
    setOcrResult(null);
    setResultado(null);
    setOfertaEmpresa("");
  }

  return (
    <LaborContext.Provider
      value={{
        opcion,
        formData,
        archivoOCR,
        ocrResult,
        resultado,
        ofertaEmpresa,
        setOpcion,
        setFormData,
        setArchivoOCR,
        setOcrResult,
        setResultado,
        setOfertaEmpresa,
        resetSesion,
      }}
    >
      {children}
    </LaborContext.Provider>
  );
}

export function useLaborContext(): LaborContextType {
  const ctx = useContext(LaborContext);
  if (!ctx) throw new Error("useLaborContext debe usarse dentro de <LaborProvider>");
  return ctx;
}
