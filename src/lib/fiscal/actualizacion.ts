// Actualización (art. 17-A CFF) y recargos por mora (art. 21 CFF) de contribuciones pagadas tarde.
// Revisar cada año la tabla de tasas con la Ley de Ingresos de la Federación (LIF).

/** Tasa mensual de recargos por mora = tasa de prórroga de la LIF + 50 % (art. 21 CFF). */
export const TASA_MORA_POR_ANIO: Record<number, number> = {
  2021: 1.47, // LIF 2019-2025: prórroga 0.98 %
  2022: 1.47,
  2023: 1.47,
  2024: 1.47,
  2025: 1.47,
  2026: 2.07, // LIF 2026 (DOF 07-nov-2025): prórroga 1.38 %
  2027: 2.07, // LIF 2027 (aprobada oct-2026): sin cambio
};
export const PRIMER_ANIO = 2021;
const MAX_MESES_RECARGOS = 60; // los recargos no exceden los causados en 5 años

export type InpcMensual = { mes: string; valor: number }; // mes = 'AAAA-MM'

const r2 = (n: number) => Math.round(n * 100) / 100;
const trunc4 = (n: number) => Math.floor(n * 10000) / 10000;

/** '2026-03' → '2026-02' */
export function mesAnterior(mes: string): string {
  const [a, m] = mes.split('-').map(Number);
  return m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, '0')}`;
}

/** INPC de un mes; si aún no se publica, el último publicado (art. 17-A CFF). */
function inpcDe(serie: InpcMensual[], mes: string): (InpcMensual & { sustituto: boolean }) | null {
  for (let i = serie.length - 1; i >= 0; i--) {
    if (serie[i].mes <= mes) return { ...serie[i], sustituto: serie[i].mes !== mes };
  }
  return null;
}

/** Meses o fracción transcurridos desde el vencimiento hasta el pago (fechas AAAA-MM-DD). */
export function mesesDeMora(vencimiento: string, pago: string): number {
  if (pago <= vencimiento) return 0;
  const [a1, m1, d1] = vencimiento.split('-').map(Number);
  const [a2, m2, d2] = pago.split('-').map(Number);
  let meses = (a2 - a1) * 12 + (m2 - m1);
  if (d2 > d1) meses += 1;
  return Math.max(meses, 1);
}

export type ResultadoActualizacion = {
  inpcReciente: InpcMensual & { sustituto: boolean };
  inpcAntiguo: InpcMensual & { sustituto: boolean };
  factor: number;
  actualizada: number;
  actualizacion: number;
  meses: number;
  tramos: { anio: number; meses: number; tasa: number }[];
  tasaTotal: number; // % acumulado
  recargos: number;
  total: number;
  aviso?: string;
};

export function calcularActualizacion(
  monto: number,
  vencimiento: string,
  pago: string,
  inpc: InpcMensual[],
): ResultadoActualizacion | { error: string } {
  if (!(monto > 0)) return { error: 'Escribe el monto de la contribución.' };
  if (vencimiento < `${PRIMER_ANIO}-01-01`) return { error: `La fecha de vencimiento debe ser de ${PRIMER_ANIO} en adelante.` };
  if (pago < vencimiento) return { error: 'La fecha de pago es anterior al vencimiento: no hay actualización ni recargos.' };

  // Factor: INPC del mes anterior al de pago ÷ INPC del mes anterior al de vencimiento.
  const inpcReciente = inpcDe(inpc, mesAnterior(pago.slice(0, 7)));
  const inpcAntiguo = inpcDe(inpc, mesAnterior(vencimiento.slice(0, 7)));
  if (!inpcReciente || !inpcAntiguo) return { error: 'No hay INPC disponible para esas fechas.' };

  const factor = Math.max(1, trunc4(inpcReciente.valor / inpcAntiguo.valor));
  const actualizada = r2(monto * factor);

  // Recargos: suma de la tasa de cada mes de mora, según el año en que inicia ese mes.
  const meses = Math.min(mesesDeMora(vencimiento, pago), MAX_MESES_RECARGOS);
  const porAnio = new Map<number, number>();
  const [a0, m0] = vencimiento.split('-').map(Number);
  for (let k = 0; k < meses; k++) {
    const anio = a0 + Math.floor((m0 - 1 + k) / 12);
    porAnio.set(anio, (porAnio.get(anio) ?? 0) + 1);
  }
  let aviso: string | undefined;
  const tramos = [...porAnio.entries()].map(([anio, n]) => {
    const tasa = TASA_MORA_POR_ANIO[anio] ?? TASA_MORA_POR_ANIO[2027];
    if (!(anio in TASA_MORA_POR_ANIO)) aviso = `Para ${anio} se usó la última tasa conocida (2.07 %).`;
    return { anio, meses: n, tasa };
  });
  const tasaTotal = Math.round(tramos.reduce((s, t) => s + t.meses * t.tasa, 0) * 100) / 100;
  const recargos = r2((actualizada * tasaTotal) / 100);

  if (inpcReciente.sustituto) {
    aviso = `El INPC de ${inpcReciente.mes} se usó en lugar de uno aún no publicado, como indica el art. 17-A CFF.`;
  }

  return {
    inpcReciente,
    inpcAntiguo,
    factor,
    actualizada,
    actualizacion: r2(actualizada - monto),
    meses,
    tramos,
    tasaTotal,
    recargos,
    total: r2(actualizada + recargos),
    aviso,
  };
}
