// Valores de referencia que no publica Banxico. Actualizar cada año:
// - UMA: INEGI la publica en el DOF en los primeros 10 días de enero y rige desde el 1 de febrero.
// - Salario mínimo: Conasami lo fija en diciembre y rige desde el 1 de enero.

export type Uma = { anio: number; diario: number; mensual: number; anual: number; vigencia: string };

/** UMA por año (INEGI). Mensual = diario × 30.4; anual = mensual × 12. */
export const UMA: Uma[] = [
  { anio: 2026, diario: 117.31, mensual: 3566.22, anual: 42794.64, vigencia: '2026-02-01' },
  { anio: 2025, diario: 113.14, mensual: 3439.46, anual: 41273.52, vigencia: '2025-02-01' },
  { anio: 2024, diario: 108.57, mensual: 3300.53, anual: 39606.36, vigencia: '2024-02-01' },
  { anio: 2023, diario: 103.74, mensual: 3153.7, anual: 37844.4, vigencia: '2023-02-01' },
];

export type SalarioMinimo = { anio: number; general: number; frontera: number };

/** Salario mínimo diario (Conasami): zona general y Zona Libre de la Frontera Norte (ZLFN). */
export const SALARIO_MINIMO: SalarioMinimo[] = [
  { anio: 2026, general: 315.04, frontera: 440.87 },
  { anio: 2025, general: 278.8, frontera: 419.88 },
  { anio: 2024, general: 248.93, frontera: 374.89 },
  { anio: 2023, general: 207.44, frontera: 312.41 },
];

/** Días promedio por mes que usan la LFT/LISR para convertir montos diarios a mensuales. */
export const DIAS_MES = 30.4;
