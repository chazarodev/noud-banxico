// Parámetros fiscales 2026 para retención de ISR por sueldos y salarios (art. 96 LISR).
// Fuentes:
// - Tarifa mensual: Anexo 8 de la RMF 2026, DOF 28-dic-2025 (verificar contra el DOF antes de cada año).
// - Subsidio para el empleo: decreto DOF 31-dic-2025 → 15.02 % de la UMA mensual (15.59 % de la UMA 2025 en enero),
//   para ingresos de hasta $11,492.66 mensuales.
// - UMA 2026: INEGI, DOF 09-ene-2026 → mensual $3,566.22, vigente desde el 1-feb-2026.
// Revisa y actualiza este archivo cada enero.

export type RenglonTarifa = {
  limiteInferior: number;
  limiteSuperior: number | null; // null = en adelante
  cuotaFija: number;
  porcentaje: number; // % sobre el excedente del límite inferior
};

export const EJERCICIO = 2026;

export const TARIFA_MENSUAL_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 844.59, cuotaFija: 0, porcentaje: 1.92 },
  { limiteInferior: 844.6, limiteSuperior: 7168.51, cuotaFija: 16.22, porcentaje: 6.4 },
  { limiteInferior: 7168.52, limiteSuperior: 12598.02, cuotaFija: 420.95, porcentaje: 10.88 },
  { limiteInferior: 12598.03, limiteSuperior: 14644.64, cuotaFija: 1011.68, porcentaje: 16 },
  { limiteInferior: 14644.65, limiteSuperior: 17533.64, cuotaFija: 1339.14, porcentaje: 17.92 },
  { limiteInferior: 17533.65, limiteSuperior: 35362.83, cuotaFija: 1856.84, porcentaje: 21.36 },
  { limiteInferior: 35362.84, limiteSuperior: 55736.68, cuotaFija: 5665.16, porcentaje: 23.52 },
  { limiteInferior: 55736.69, limiteSuperior: 106410.5, cuotaFija: 10457.09, porcentaje: 30 },
  { limiteInferior: 106410.51, limiteSuperior: 141880.66, cuotaFija: 25659.23, porcentaje: 32 },
  { limiteInferior: 141880.67, limiteSuperior: 425641.99, cuotaFija: 37009.69, porcentaje: 34 },
  { limiteInferior: 425642, limiteSuperior: null, cuotaFija: 133488.54, porcentaje: 35 },
];

const UMA_MENSUAL_2026 = 3566.22; // desde febrero
const UMA_MENSUAL_2025 = 3439.46; // aplica en enero de 2026

export const SUBSIDIO_2026 = {
  limiteIngresoMensual: 11492.66,
  enero: redondear(UMA_MENSUAL_2025 * 0.1559), // 536.21
  febreroADiciembre: redondear(UMA_MENSUAL_2026 * 0.1502), // 535.65
};

function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}

export type ResultadoIsr = {
  base: number;
  renglon: RenglonTarifa;
  excedente: number;
  impuestoMarginal: number;
  isrCausado: number;
  subsidio: number;
  isrRetenido: number;
  neto: number; // sueldo menos ISR, antes de IMSS y otras deducciones
  tasaEfectiva: number; // % del sueldo
};

/**
 * ISR mensual a retener por sueldos (art. 96 LISR), con subsidio para el empleo.
 * Supone que todo el sueldo es gravable. El subsidio no puede exceder el ISR causado
 * y, si lo excede, la diferencia no se entrega al trabajador.
 */
export function calcularIsrMensual(sueldoMensual: number, mes: number): ResultadoIsr | null {
  if (!Number.isFinite(sueldoMensual) || sueldoMensual <= 0) return null;
  const base = redondear(sueldoMensual);
  const renglon =
    TARIFA_MENSUAL_2026.find((r) => r.limiteSuperior === null || base <= r.limiteSuperior) ??
    TARIFA_MENSUAL_2026[TARIFA_MENSUAL_2026.length - 1];

  const excedente = redondear(base - renglon.limiteInferior);
  const impuestoMarginal = redondear((excedente * renglon.porcentaje) / 100);
  const isrCausado = redondear(renglon.cuotaFija + impuestoMarginal);

  const montoSubsidio = mes === 1 ? SUBSIDIO_2026.enero : SUBSIDIO_2026.febreroADiciembre;
  const subsidio =
    base <= SUBSIDIO_2026.limiteIngresoMensual ? Math.min(montoSubsidio, isrCausado) : 0;

  const isrRetenido = redondear(isrCausado - subsidio);
  return {
    base,
    renglon,
    excedente,
    impuestoMarginal,
    isrCausado,
    subsidio,
    isrRetenido,
    neto: redondear(base - isrRetenido),
    tasaEfectiva: redondear((isrRetenido / base) * 100),
  };
}
