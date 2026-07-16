/**
 * utils/laborCalculations.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor Matemático de Prestaciones Laborales — Guatemala
 * Basado en el Código de Trabajo (Decreto 1441 del Congreso de la República)
 * y leyes complementarias vigentes.
 *
 * Todas las funciones son puras (sin efectos secundarios) para facilitar
 * pruebas unitarias y reutilización en distintas capas de la aplicación.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── CONSTANTES LEGALES ───────────────────────────────────────────────────────

/**
 * Factor de indemnización guatemalteco.
 * Razón: el año laboral tiene 14 salarios (12 ordinarios + Aguinaldo + Bono 14),
 * por lo que cada mes trabajado equivale a 14/12 salarios al calcular la base
 * de indemnización por tiempo de servicio.
 * Referencia: Art. 82 CT — "salario ordinario y extraordinario promedio del último
 * semestre" interpretado por la jurisprudencia junto al Art. 102 lit. j) CPRG
 * para incluir las prestaciones complementarias proporcionales.
 */
const FACTOR_INDEMNIZACION = 14 / 12; // ≈ 1.16667

/**
 * Días base para salario diario en Guatemala.
 * Referencia: Art. 92 CT — el salario mensual se divide entre 30 para obtener
 * el salario diario, independientemente de los días reales del mes.
 */
const DIAS_MES_LABORAL = 30;

/**
 * Días del ciclo anual para cálculos proporcionales de aguinaldo y bono 14.
 */
const DIAS_ANIO = 365;

// ─── HELPERS INTERNOS ─────────────────────────────────────────────────────────

/**
 * Redondea un número a 2 decimales (moneda GTQ).
 * @param {number} valor
 * @returns {number}
 */
function redondear(valor) {
  return Math.round(valor * 100) / 100;
}

/**
 * Calcula la diferencia exacta entre dos fechas en años, meses y días.
 * Usa aritmética de calendario civil (no simplemente milisegundos divididos)
 * para respetar meses de distinta longitud.
 *
 * @param {Date} inicio
 * @param {Date} fin
 * @returns {{ años: number, meses: number, dias: number, totalDias: number }}
 */
function calcularDiferenciaTemporal(inicio, fin) {
  let años = fin.getFullYear() - inicio.getFullYear();
  let meses = fin.getMonth() - inicio.getMonth();
  let dias = fin.getDate() - inicio.getDate();

  if (dias < 0) {
    meses -= 1;
    // Días del mes anterior al mes de fin
    const mesAnterior = new Date(fin.getFullYear(), fin.getMonth(), 0);
    dias += mesAnterior.getDate();
  }

  if (meses < 0) {
    años -= 1;
    meses += 12;
  }

  // Total de días para cálculos proporcionales
  const totalDias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));

  return { años, meses, dias, totalDias };
}

/**
 * Calcula los días trabajados dentro de un período específico de beneficio
 * (aguinaldo o bono 14), dado el inicio y fin del contrato.
 *
 * Si el trabajador entró después del inicio del período, se cuenta desde
 * su fecha de entrada. Si salió antes del fin del período, se cuenta
 * hasta su fecha de salida.
 *
 * @param {Date} inicioContrato  — Fecha de inicio laboral
 * @param {Date} finContrato     — Fecha de fin laboral (corte)
 * @param {Date} inicioPeriodo   — Inicio del período del beneficio
 * @param {Date} finPeriodo      — Fin del período del beneficio
 * @returns {number} días trabajados dentro del período
 */
function diasEnPeriodoBeneficio(inicioContrato, finContrato, inicioPeriodo, finPeriodo) {
  const desde = inicioContrato > inicioPeriodo ? inicioContrato : inicioPeriodo;
  const hasta = finContrato < finPeriodo ? finContrato : finPeriodo;

  if (hasta < desde) return 0;

  return Math.floor((hasta - desde) / (1000 * 60 * 60 * 24)) + 1;
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────

/**
 * Calcula todas las prestaciones laborales de un trabajador guatemalteco
 * según su situación de egreso (despido unilateral o renuncia voluntaria).
 *
 * @param {Object} params
 * @param {string} params.fechaInicio            — ISO 8601 (ej: "2021-03-15")
 * @param {string} params.fechaFin               — ISO 8601 (ej: "2025-07-16")
 * @param {number} params.salarioBase            — Salario mensual base en GTQ
 * @param {number} params.bonosMensuales         — Suma de bonos fijos mensuales en GTQ
 * @param {number} params.diasVacacionesPendientes — Días de vacaciones no gozadas
 * @param {boolean} params.esDespidoUnilateral   — true = despido, false = renuncia
 *
 * @returns {Object} Objeto estructurado con todos los cálculos y metadatos legales
 */
export function calculatePrestaciones({
  fechaInicio,
  fechaFin,
  salarioBase,
  bonosMensuales = 0,
  diasVacacionesPendientes = 0,
  esDespidoUnilateral = false,
}) {
  // ── Validaciones básicas ──────────────────────────────────────────────────
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

  // ── 1. TIEMPO LABORADO ────────────────────────────────────────────────────
  /**
   * Art. 82 CT — La indemnización se calcula con base en el tiempo efectivo
   * de servicio, computado en años, meses y días.
   */
  const tiempoLaborado = calcularDiferenciaTemporal(inicio, fin);

  // Tiempo total expresado en fracción de año para cálculos proporcionales
  const añosProporcionales = tiempoLaborado.totalDias / DIAS_ANIO;

  // ── 2. SALARIOS BASE DE CÁLCULO ───────────────────────────────────────────
  /**
   * Art. 92 CT — El salario mensual total incluye el salario base más
   * cualquier bono o complemento fijo y ordinario percibido mensualmente.
   * El salario diario se obtiene dividiendo el mensual entre 30.
   */
  const salarioMensualTotal = salarioBase + bonosMensuales;
  const salarioDiario = redondear(salarioMensualTotal / DIAS_MES_LABORAL);

  // ── 3. INDEMNIZACIÓN POR TIEMPO DE SERVICIO ───────────────────────────────
  /**
   * Art. 82 CT (Decreto 1441) — En caso de despido injustificado, el patrono
   * debe pagar al trabajador una indemnización equivalente a un mes de salario
   * por cada año de servicios continuos, y proporcionalmente por fracciones.
   *
   * La base de cálculo se eleva al factor 14/12 para incluir la parte
   * proporcional de aguinaldo (Decreto 76-78) y Bono 14 (Decreto 42-92)
   * que forman parte del salario real devengado, según criterio consolidado
   * del MINTRAB y jurisprudencia de la Corte de Constitucionalidad.
   *
   * Solo aplica cuando el cese es por despido unilateral del patrono.
   * En caso de renuncia voluntaria NO hay indemnización (Art. 83 CT).
   */
  let indemnizacion = null;

  if (esDespidoUnilateral) {
    const baseIndemnizacion = redondear(salarioMensualTotal * FACTOR_INDEMNIZACION);
    const montoIndemnizacion = redondear(baseIndemnizacion * añosProporcionales);

    indemnizacion = {
      aplica: true,
      fundamentoLegal: "Art. 82 Código de Trabajo (Decreto 1441)",
      salarioMensualBase: salarioMensualTotal,
      factorAplicado: FACTOR_INDEMNIZACION,
      baseMensualConFactor: baseIndemnizacion,
      añosProporcionales: redondear(añosProporcionales),
      monto: montoIndemnizacion,
    };
  } else {
    indemnizacion = {
      aplica: false,
      fundamentoLegal: "Art. 83 CT — Renuncia voluntaria no genera derecho a indemnización",
      monto: 0,
    };
  }

  // ── 4. AGUINALDO PROPORCIONAL ─────────────────────────────────────────────
  /**
   * Decreto 76-78 (Ley Reguladora del Aguinaldo) — El aguinaldo equivale a
   * un salario mensual completo, devengado del 1 de diciembre al 30 de
   * noviembre del año siguiente. Se paga en dos partes: 50% del 1 al 15
   * de diciembre y el 50% restante del 1 al 15 de enero.
   *
   * Para el cálculo proporcional al egreso, se determinan los días
   * trabajados dentro del período de devengo vigente y se calcula
   * la fracción correspondiente del salario mensual total.
   */
  const aguinaldoCalc = (() => {
    // Determinar el período de aguinaldo vigente al momento del egreso
    // El período corre de Dic 1 a Nov 30 del año siguiente
    let inicioPeriodoAguinaldo, finPeriodoAguinaldo;

    const mesEgreso = fin.getMonth(); // 0 = enero, 11 = diciembre
    const anioEgreso = fin.getFullYear();

    if (mesEgreso === 11) {
      // Diciembre: el período nuevo ya comenzó el 1 de diciembre
      inicioPeriodoAguinaldo = new Date(anioEgreso, 11, 1);
      finPeriodoAguinaldo = new Date(anioEgreso + 1, 10, 30);
    } else {
      // Enero–Noviembre: el período comenzó el 1 de diciembre del año anterior
      inicioPeriodoAguinaldo = new Date(anioEgreso - 1, 11, 1);
      finPeriodoAguinaldo = new Date(anioEgreso, 10, 30);
    }

    const diasEnPeriodo = diasEnPeriodoBeneficio(
      inicio,
      fin,
      inicioPeriodoAguinaldo,
      finPeriodoAguinaldo
    );

    const diasTotalesPeriodo =
      Math.floor((finPeriodoAguinaldo - inicioPeriodoAguinaldo) / (1000 * 60 * 60 * 24)) + 1;

    const proporcion = diasEnPeriodo / diasTotalesPeriodo;
    const monto = redondear(salarioMensualTotal * proporcion);

    return {
      fundamentoLegal: "Decreto 76-78 — Ley Reguladora del Aguinaldo",
      periodoCubierto: {
        inicio: inicioPeriodoAguinaldo.toISOString().split("T")[0],
        fin: finPeriodoAguinaldo.toISOString().split("T")[0],
      },
      diasTrabajadosEnPeriodo: diasEnPeriodo,
      diasTotalesPeriodo,
      proporcion: redondear(proporcion),
      monto,
    };
  })();

  // ── 5. BONO 14 PROPORCIONAL ───────────────────────────────────────────────
  /**
   * Decreto 42-92 (Ley de Bonificación Anual para Trabajadores del Sector
   * Privado y Público — "Bono 14") — Equivale a un salario mensual completo,
   * devengado del 1 de julio al 30 de junio del año siguiente.
   * Se paga del 1 al 15 de julio de cada año.
   *
   * El cálculo proporcional sigue la misma lógica que el aguinaldo:
   * días trabajados en el período vigente / días totales del período × salario.
   */
  const bono14Calc = (() => {
    let inicioPeriodoBono14, finPeriodoBono14;

    const mesEgreso = fin.getMonth();
    const anioEgreso = fin.getFullYear();

    if (mesEgreso >= 6) {
      // Julio–Diciembre: el período actual comenzó el 1 de julio de este año
      inicioPeriodoBono14 = new Date(anioEgreso, 6, 1);
      finPeriodoBono14 = new Date(anioEgreso + 1, 5, 30);
    } else {
      // Enero–Junio: el período comenzó el 1 de julio del año anterior
      inicioPeriodoBono14 = new Date(anioEgreso - 1, 6, 1);
      finPeriodoBono14 = new Date(anioEgreso, 5, 30);
    }

    const diasEnPeriodo = diasEnPeriodoBeneficio(
      inicio,
      fin,
      inicioPeriodoBono14,
      finPeriodoBono14
    );

    const diasTotalesPeriodo =
      Math.floor((finPeriodoBono14 - inicioPeriodoBono14) / (1000 * 60 * 60 * 24)) + 1;

    const proporcion = diasEnPeriodo / diasTotalesPeriodo;
    const monto = redondear(salarioMensualTotal * proporcion);

    return {
      fundamentoLegal: "Decreto 42-92 — Ley de Bonificación Anual (Bono 14)",
      periodoCubierto: {
        inicio: inicioPeriodoBono14.toISOString().split("T")[0],
        fin: finPeriodoBono14.toISOString().split("T")[0],
      },
      diasTrabajadosEnPeriodo: diasEnPeriodo,
      diasTotalesPeriodo,
      proporcion: redondear(proporcion),
      monto,
    };
  })();

  // ── 6. VACACIONES PROPORCIONALES ──────────────────────────────────────────
  /**
   * Art. 130 CT — Todo trabajador tiene derecho a un período de vacaciones
   * remuneradas de 15 días hábiles (equivalente a 15 días de salario) después
   * de cada año de servicios continuos, que no pueden compensarse en dinero
   * excepto al finalizar la relación laboral.
   *
   * Al término del contrato, los días de vacaciones no gozados se pagan
   * a razón del salario diario real (Art. 136 CT).
   *
   * El usuario ingresa directamente los días pendientes según su registro
   * o lo acordado con el patrono.
   */
  const vacacionesCalc = (() => {
    const monto = redondear(diasVacacionesPendientes * salarioDiario);
    return {
      fundamentoLegal: "Art. 130 y 136 Código de Trabajo (Decreto 1441)",
      diasPendientes: diasVacacionesPendientes,
      salarioDiario,
      monto,
    };
  })();

  // ── 7. TOTALES ────────────────────────────────────────────────────────────
  /**
   * Las prestaciones irrenunciables son las que el trabajador recibe
   * independientemente de la causa de terminación del contrato.
   * Art. 102 lit. g), h), j) CPRG — Derechos laborales mínimos irrenunciables.
   */
  const totalIrrenunciables = redondear(
    bono14Calc.monto + aguinaldoCalc.monto + vacacionesCalc.monto
  );

  const granTotal = redondear(totalIrrenunciables + (indemnizacion?.monto ?? 0));

  // ── 8. RESULTADO ESTRUCTURADO ─────────────────────────────────────────────
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

    tiempoLaborado: {
      descripcion: "Tiempo efectivo de servicio",
      años: tiempoLaborado.años,
      meses: tiempoLaborado.meses,
      dias: tiempoLaborado.dias,
      totalDias: tiempoLaborado.totalDias,
      añosProporcionales: redondear(añosProporcionales),
    },

    indemnizacion,

    aguinaldo: aguinaldoCalc,

    bono14: bono14Calc,

    vacaciones: vacacionesCalc,

    resumen: {
      descripcion: "Resumen financiero del egreso",
      indemnizacion: indemnizacion?.monto ?? 0,
      aguinaldo: aguinaldoCalc.monto,
      bono14: bono14Calc.monto,
      vacaciones: vacacionesCalc.monto,
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

// ─── HELPERS EXPORTADOS (para uso en UI) ──────────────────────────────────────

/**
 * Formatea un monto en Quetzales guatemaltecos (GTQ).
 * @param {number} monto
 * @returns {string}  "Q 1,234.56"
 */
export function formatearQuetzales(monto) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(monto);
}

/**
 * Convierte el tiempo laborado a una cadena legible en español.
 * @param {{ años: number, meses: number, dias: number }} tiempo
 * @returns {string}  "3 años, 2 meses y 15 días"
 */
export function formatearTiempoLaborado({ años, meses, dias }) {
  const partes = [];
  if (años > 0) partes.push(`${años} ${años === 1 ? "año" : "años"}`);
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? "mes" : "meses"}`);
  if (dias > 0) partes.push(`${dias} ${dias === 1 ? "día" : "días"}`);
  if (partes.length === 0) return "Menos de un día";
  if (partes.length === 1) return partes[0];
  return partes.slice(0, -1).join(", ") + " y " + partes.at(-1);
}
