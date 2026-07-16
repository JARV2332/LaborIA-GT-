/**
 * context/LaborContext.tsx
 * Estado global de la sesión de consulta laboral.
 * Mantiene los datos del formulario y el resultado calculado
 * para compartirlos entre pantallas sin prop-drilling.
 */
import { createContext, useContext, useState, ReactNode } from "react";
import type { ResultadoPrestaciones } from "@/utils/laborCalculations";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface FormDataLaboral {
  fechaInicio: string;
  fechaFin: string;
  salarioBase: string;
  tieneBonos: boolean;
  bonosMensuales: string;
  diasVacacionesPendientes: string;
  esDespidoUnilateral: boolean;
}

export type OpcionConsulta = "A" | "B" | null;

interface LaborContextType {
  opcion: OpcionConsulta;
  formData: FormDataLaboral;
  archivoOCR: File | null;
  resultado: ResultadoPrestaciones | null;
  setOpcion: (o: OpcionConsulta) => void;
  setFormData: (patch: Partial<FormDataLaboral>) => void;
  setArchivoOCR: (f: File | null) => void;
  setResultado: (r: ResultadoPrestaciones | null) => void;
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
  esDespidoUnilateral: true,
};

// ─── CONTEXTO ─────────────────────────────────────────────────────────────────

const LaborContext = createContext<LaborContextType | null>(null);

export function LaborProvider({ children }: { children: ReactNode }) {
  const [opcion, setOpcion] = useState<OpcionConsulta>(null);
  const [formData, setFormDataState] = useState<FormDataLaboral>(FORM_INICIAL);
  const [archivoOCR, setArchivoOCR] = useState<File | null>(null);
  const [resultado, setResultado] = useState<ResultadoPrestaciones | null>(null);

  function setFormData(patch: Partial<FormDataLaboral>) {
    setFormDataState((prev) => ({ ...prev, ...patch }));
  }

  function resetSesion() {
    setOpcion(null);
    setFormDataState(FORM_INICIAL);
    setArchivoOCR(null);
    setResultado(null);
  }

  return (
    <LaborContext.Provider
      value={{
        opcion,
        formData,
        archivoOCR,
        resultado,
        setOpcion,
        setFormData,
        setArchivoOCR,
        setResultado,
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
