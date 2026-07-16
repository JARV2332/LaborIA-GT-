/**
 * utils/laborCalculations.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor Matemático de Prestaciones Laborales — Guatemala
 * Basado en el Código de Trabajo (Decreto 1441 del Congreso de la República)
 * y leyes complementarias vigentes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── TIPOS PÚBLICOS ───────────────────────────────────────────────────────────

export interface CalculoPrestacionesParams {
  fechaInicio: string;
  fechaFin: string;
  salarioBase: number;
  bonosMensuales?: number;
  diasVacacionesPendientes?: number;
  esDespidoUnilateral?: boolean;
}

export interface TiempoLaborado {
  descripcion: string;
  años: number;
  meses: number;
  dias: number;
  totalDias: number;
  añosProporcionales: number;
}

export interface IndemnizacionAplica {
  aplica: true;
  fundamentoLegal: string;
  salarioMensualBase: number;
  factorAplicado: number;
  baseMensualConFactor: number;
  añosProporcionales: number;
  monto: number;
}

export interface IndemnizacionNoAplica {
  aplica: false;
  fundamentoLegal: string;
  monto: 0;
}

export type Indemnizacion = IndemnizacionAplica | IndemnizacionNoAplica;

export interface PeriodoBeneficio {
  fundamentoLegal: string;
  periodoCubierto: { inicio: string; fin: string };
  diasTrabajadosEnPeriodo: number;
  diasTotalesPeriodo: number;
  proporcion: number;
  monto: number;
}

export interface Vacaciones {
  fundamentoLegal: string;
  diasPendientes: number;
  salarioDiario: number;
  monto: number;
}

export interface ResultadoPrestaciones {
  metadatos: {
    fechaInicio: string;
    fechaFin: string;
    tipoEgreso: string;
    salarioBase: number;
    bonosMensuales: number;
    salarioMensualTotal: number;
    salarioDiario: number;
  };
  tiempoLaborado: TiempoLaborado;
  indemnizacion: Indemnizacion;
  aguinaldo: PeriodoBeneficio;
  bono14: PeriodoBeneficio;
  vacaciones: Vacaciones;
  resumen: {
    descripcion: string;
    indemnizacion: number;
    aguinaldo: number;
    bono14: number;
    vacaciones: number;
    totalIrrenunciables: { descripcion: string; fundamentoLegal: string; monto: number };
    granTotal: { descripcion: string; monto: number };
  };
}

// ─── CONSTANTES LEGALES ───────────────────────────────────────────────────────

/**
 * Factor de indemnización guatemalteco.
 * El año laboral tiene 14 salarios (12 ordinarios + Aguinaldo + Bono 14),
 * por lo que cada mes equivale a 14/12 salarios en la base de indemnización.
 * Referencia: Art. 82 CT + jurisprudencia CC + Art. 102 lit. j) CPRG.
 */
const FACTOR_INDEMNIZACION = 14 / 12;

/**
 * Días base para salario diario.
 * Referencia: Art. 92 CT — el mensual se divide entre 30 sin importar
 * los días reales del mes.
 */
const DIAS_MES_LABORAL = 30;

const DIAS_ANIO = 365;

// ─── HELPERS INTERNOS ─────────────────────────────────────────────────────────

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function calcularDiferenciaTemporal(
  inicio: Date,
  fin: Date
): { años: number; meses: number; dias: number; totalDias: number } {
  let años = fin.getFullYear() - inicio.getFullYear();
  let meses = fin.getMonth() - inicio.getMonth();
  let dias = fin.getDate() - inicio.getDate();

  if (dias < 0) {
    meses -= 1;
    const mesAnterior = new Date(fin.getFullYear(), fin.getMonth(), 0);
    dias += mesAnterior.getDate();
  }

  if (meses < 0) {
    años -= 1;
    meses += 12;
  }

  const totalDias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  return { años, meses, dias, totalDias };
}

function diasEnPeriodoBeneficio(
  inicioContrato: Date,
  finContrato: Date,
  inicioPeriodo: Date,
  finPeriodo: Date
): number {
  const desde = inicioContrato > inicioPeriodo ? inicioContrato : inicioPeriodo;
  const hasta = finContrato < finPeriodo ? finContrato : finPeriodo;
  if (hasta < desde) return 0;
  return Math.floor((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────

export function calculatePrestaciones({
  fechaInicio,
  fechaFin,
  salarioBase,
  bonosMensuales = 0,
  diasVacacionesPendientes = 0,
  esDespidoUnilateral = false,
}: CalculoPrestacionesParams): ResultadoPrestaciones {
  if (!fechaInicio || !fechaFin) {
    throw new Error("Las fechas de inicio y fin son obligatorias.");
  }
  if (typeof salarioBase !== "number" || salarioBase <= 0) {
    throw new Error("El salario base debe ser un número positivo.");
  }

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (inicio >= fin) {
    throw new Error("La fecha de inicio debe ser anterior a la fecha de fin.");
  }

  // ── 1. TIEMPO LABORADO (Art. 82 CT) ──────────────────────────────────────
  const diff = calcularDiferenciaTemporal(inicio, fin);
  const añosProporcionales = diff.totalDias / DIAS_ANIO;

  const tiempoLaborado: TiempoLaborado = {
    descripcion: "Tiempo efectivo de servicio",
    años: diff.años,
    meses: diff.meses,
    dias: diff.dias,
    totalDias: diff.totalDias,
    añosProporcionales: redondear(añosProporcionales),
  };

  // ── 2. SALARIOS BASE (Art. 92 CT) ────────────────────────────────────────
  const salarioMensualTotal = salarioBase + bonosMensuales;
  const salarioDiario = redondear(salarioMensualTotal / DIAS_MES_LABORAL);

  // ── 3. INDEMNIZACIÓN (Art. 82 CT) ────────────────────────────────────────
  /**
   * Solo en despido unilateral. Factor 14/12 incluye aguinaldo y bono 14
   * proporcionales en la base de cálculo (criterio MINTRAB + CC).
   * En renuncia voluntaria no aplica (Art. 83 CT).
   */
  const indemnizacion: Indemnizacion = esDespidoUnilateral
    ? {
        aplica: true,
        fundamentoLegal: "Art. 82 Código de Trabajo (Decreto 1441)",
        salarioMensualBase: salarioMensualTotal,
        factorAplicado: FACTOR_INDEMNIZACION,
        baseMensualConFactor: redondear(salarioMensualTotal * FACTOR_INDEMNIZACION),
        añosProporcionales: redondear(añosProporcionales),
        monto: redondear(salarioMensualTotal * FACTOR_INDEMNIZACION * añosProporcionales),
      }
    : {
        aplica: false,
        fundamentoLegal: "Art. 83 CT — Renuncia voluntaria no genera derecho a indemnización",
        monto: 0,
      };

  // ── 4. AGUINALDO PROPORCIONAL (Decreto 76-78) ────────────────────────────
  /**
   * Período: 1 de diciembre → 30 de noviembre del año siguiente.
   * Valor: 1 salario mensual completo proporcional a días trabajados.
   */
  const aguinaldo: PeriodoBeneficio = (() => {
    const mesEgreso = fin.getMonth();
    const anioEgreso = fin.getFullYear();

    const inicioPeriodo =
      mesEgreso === 11
        ? new Date(anioEgreso, 11, 1)
        : new Date(anioEgreso - 1, 11, 1);

    const finPeriodo =
      mesEgreso === 11
        ? new Date(anioEgreso + 1, 10, 30)
        : new Date(anioEgreso, 10, 30);

    const diasTrabajados = diasEnPeriodoBeneficio(inicio, fin, inicioPeriodo, finPeriodo);
    const diasTotales =
      Math.floor((finPeriodo.getTime() - inicioPeriodo.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const proporcion = diasTrabajados / diasTotales;

    return {
      fundamentoLegal: "Decreto 76-78 — Ley Reguladora del Aguinaldo",
      periodoCubierto: {
        inicio: inicioPeriodo.toISOString().split("T")[0],
        fin: finPeriodo.toISOString().split("T")[0],
      },
      diasTrabajadosEnPeriodo: diasTrabajados,
      diasTotalesPeriodo: diasTotales,
      proporcion: redondear(proporcion),
      monto: redondear(salarioMensualTotal * proporcion),
    };
  })();

  // ── 5. BONO 14 PROPORCIONAL (Decreto 42-92) ──────────────────────────────
  /**
   * Período: 1 de julio → 30 de junio del año siguiente.
   * Valor: 1 salario mensual completo proporcional a días trabajados.
   */
  const bono14: PeriodoBeneficio = (() => {
    const mesEgreso = fin.getMonth();
    const anioEgreso = fin.getFullYear();

    const inicioPeriodo =
      mesEgreso >= 6
        ? new Date(anioEgreso, 6, 1)
        : new Date(anioEgreso - 1, 6, 1);

    const finPeriodo =
      mesEgreso >= 6
        ? new Date(anioEgreso + 1, 5, 30)
        : new Date(anioEgreso, 5, 30);

    const diasTrabajados = diasEnPeriodoBeneficio(inicio, fin, inicioPeriodo, finPeriodo);
    const diasTotales =
      Math.floor((finPeriodo.getTime() - inicioPeriodo.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const proporcion = diasTrabajados / diasTotales;

    return {
      fundamentoLegal: "Decreto 42-92 — Ley de Bonificación Anual (Bono 14)",
      periodoCubierto: {
        inicio: inicioPeriodo.toISOString().split("T")[0],
        fin: finPeriodo.toISOString().split("T")[0],
      },
      diasTrabajadosEnPeriodo: diasTrabajados,
      diasTotalesPeriodo: diasTotales,
      proporcion: redondear(proporcion),
      monto: redondear(salarioMensualTotal * proporcion),
    };
  })();

  // ── 6. VACACIONES (Art. 130 y 136 CT) ────────────────────────────────────
  /**
   * Los días no gozados se pagan al salario diario real al finalizar
   * la relación laboral, independientemente del tipo de egreso.
   */
  const vacaciones: Vacaciones = {
    fundamentoLegal: "Art. 130 y 136 Código de Trabajo (Decreto 1441)",
    diasPendientes: diasVacacionesPendientes,
    salarioDiario,
    monto: redondear(diasVacacionesPendientes * salarioDiario),
  };

  // ── 7. TOTALES ────────────────────────────────────────────────────────────
  /**
   * Irrenunciables: derechos que aplican sin importar la causa de egreso.
   * Art. 102 lit. g), h), j) CPRG.
   */
  const totalIrrenunciables = redondear(bono14.monto + aguinaldo.monto + vacaciones.monto);
  const granTotal = redondear(totalIrrenunciables + indemnizacion.monto);

  return {
    metadatos: {
      fechaInicio: inicio.toISOString().split("T")[0],
      fechaFin: fin.toISOString().split("T")[0],
      tipoEgreso: esDespidoUnilateral ? "Despido unilateral" : "Renuncia voluntaria",
      salarioBase,
      bonosMensuales,
      salarioMensualTotal,
      salarioDiario,
    },
    tiempoLaborado,
    indemnizacion,
    aguinaldo,
    bono14,
    vacaciones,
    resumen: {
      descripcion: "Resumen financiero del egreso",
      indemnizacion: indemnizacion.monto,
      aguinaldo: aguinaldo.monto,
      bono14: bono14.monto,
      vacaciones: vacaciones.monto,
      totalIrrenunciables: {
        descripcion: "Bono 14 + Aguinaldo + Vacaciones",
        fundamentoLegal: "Art. 102 lit. g), h), j) Constitución Política de la República",
        monto: totalIrrenunciables,
      },
      granTotal: {
        descripcion: esDespidoUnilateral
          ? "Total Irrenunciables + Indemnización"
          : "Total Irrenunciables (sin indemnización por renuncia voluntaria)",
        monto: granTotal,
      },
    },
  };
}

// ─── HELPERS EXPORTADOS ───────────────────────────────────────────────────────

export function formatearQuetzales(monto: number): string {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(monto);
}

export function formatearTiempoLaborado({
  años,
  meses,
  dias,
}: {
  años: number;
  meses: number;
  dias: number;
}): string {
  const partes: string[] = [];
  if (años > 0) partes.push(`${años} ${años === 1 ? "año" : "años"}`);
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? "mes" : "meses"}`);
  if (dias > 0) partes.push(`${dias} ${dias === 1 ? "día" : "días"}`);
  if (partes.length === 0) return "Menos de un día";
  if (partes.length === 1) return partes[0];
  return partes.slice(0, -1).join(", ") + " y " + partes[partes.length - 1];
}
