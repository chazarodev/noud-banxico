// Aguinaldo 2026: monto (art. 87 LFT), parte exenta (art. 93 fr. XIV LISR) e ISR por los dos
// métodos permitidos: art. 96 LISR y art. 174 del Reglamento. Revisar cada año.
import { calcularIsrMensual } from './isr-2026';

export const UMA_DIARIA_2026 = 117.31; // INEGI, DOF 09-ene-2026, vigente desde el 1-feb-2026
export const EXENTO_AGUINALDO_2026 = Math.round(UMA_DIARIA_2026 * 30 * 100) / 100; // 3,519.30
export const DIAS_MINIMOS_LFT = 15;
const DIAS_DEL_ANIO = 365; // 2026 no es bisiesto
const MES_PAGO = 12; // diciembre: define el subsidio aplicable en el método de ley

const r2 = (n: number) => Math.round(n * 100) / 100;

export type EntradaAguinaldo = {
  sueldoMensual: number; // sueldo ordinario mensual gravable
  diasAguinaldo: number; // 15 por ley, o los que dé la empresa
  fechaIngreso?: string; // AAAA-MM-DD; vacío = trabajó todo el año
};

export type MetodoIsr = { isr: number; neto: number; detalle: [string, number][] };

export type ResultadoAguinaldo = {
  salarioDiario: number;
  diasTrabajados: number;
  diasProporcionales: number;
  bruto: number;
  exento: number;
  gravado: number;
  ley: MetodoIsr;
  reglamento: MetodoIsr;
};

/** Días trabajados en 2026 desde la fecha de ingreso hasta el 31 de diciembre (inclusive). */
export function diasTrabajados2026(fechaIngreso?: string): number {
  if (!fechaIngreso || fechaIngreso <= '2026-01-01') return DIAS_DEL_ANIO;
  if (fechaIngreso > '2026-12-31') return 0;
  const inicio = Date.parse(`${fechaIngreso}T00:00:00Z`);
  const fin = Date.parse('2026-12-31T00:00:00Z');
  return Math.round((fin - inicio) / 86_400_000) + 1;
}

export function calcularAguinaldo(e: EntradaAguinaldo): ResultadoAguinaldo | null {
  if (!(e.sueldoMensual > 0) || !(e.diasAguinaldo > 0)) return null;

  const salarioDiario = r2(e.sueldoMensual / 30);
  const diasTrab = diasTrabajados2026(e.fechaIngreso);
  if (diasTrab === 0) return null;
  const diasProporcionales = Math.round(((e.diasAguinaldo * diasTrab) / DIAS_DEL_ANIO) * 10000) / 10000;

  const bruto = r2((e.sueldoMensual / 30) * diasProporcionales);
  const exento = Math.min(bruto, EXENTO_AGUINALDO_2026);
  const gravado = r2(bruto - exento);

  // Método de ley (art. 96): ISR del mes con aguinaldo gravado menos ISR del mes sin él.
  // Usa el ISR retenido, así que refleja si el aguinaldo hace perder el subsidio para el empleo.
  const conAguinaldo = calcularIsrMensual(e.sueldoMensual + gravado, MES_PAGO)!;
  const sinAguinaldo = calcularIsrMensual(e.sueldoMensual, MES_PAGO)!;
  const isrLey = gravado > 0 ? r2(Math.max(0, conAguinaldo.isrRetenido - sinAguinaldo.isrRetenido)) : 0;

  // Método del reglamento (art. 174 RLISR):
  // 1) gravado / 365 × 30.4 = promedio mensual; 2) ISR(sueldo + promedio) − ISR(sueldo);
  // 3) tasa = diferencia / promedio; 4) ISR = tasa × gravado.
  let isrReg = 0;
  let promedio = 0;
  let diferencia = 0;
  let tasa = 0;
  if (gravado > 0) {
    promedio = r2((gravado / DIAS_DEL_ANIO) * 30.4);
    const isrConPromedio = calcularIsrMensual(e.sueldoMensual + promedio, MES_PAGO)!.isrCausado;
    diferencia = r2(isrConPromedio - sinAguinaldo.isrCausado);
    tasa = diferencia / promedio;
    isrReg = r2(tasa * gravado);
  }

  return {
    salarioDiario,
    diasTrabajados: diasTrab,
    diasProporcionales,
    bruto,
    exento,
    gravado,
    ley: {
      isr: isrLey,
      neto: r2(bruto - isrLey),
      detalle: [
        ['ISR del mes con aguinaldo gravado', conAguinaldo.isrRetenido],
        ['ISR del mes sin aguinaldo', sinAguinaldo.isrRetenido],
      ],
    },
    reglamento: {
      isr: isrReg,
      neto: r2(bruto - isrReg),
      detalle: [
        ['Promedio mensual del gravado (÷365 ×30.4)', promedio],
        ['Diferencia de ISR', diferencia],
        ['Tasa aplicable (%)', r2(tasa * 100)],
      ],
    },
  };
}
