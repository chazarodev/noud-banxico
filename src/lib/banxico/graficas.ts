import 'server-only';
import { obtenerHistorico } from './client';
import { esValido, hoyCDMX, type PuntoValido } from './parse';
import { sumarDias } from './tipo-de-cambio';

/**
 * Datos para la sección de gráficas. Todas las series salen del histórico (caché de 24 h), así que las
 * páginas no hacen consultas por visita. IDs confirmados con los metadatos del SIE el 22-nov-2026.
 */
export const SERIES_GRAFICAS = {
  inflacionAnual: 'SP30578', // INPC variación anual, %, mensual
  subyacenteIndice: 'SP74625', // INPC subyacente, índice, mensual (la variación anual se calcula)
  inpc: 'SP1', // INPC general, índice, mensual
  fix: 'SF43718', // tipo de cambio FIX, diario
  tasaObjetivo: 'SF61745', // %, diaria
  cetes91: 'SF60634', // %, semanal (subasta)
  remesas: 'SE27803', // millones de dólares, mensual
  reservas: 'SF43707', // millones de dólares, saldo
} as const;

export type PuntoMes = { mes: string; valor: number }; // mes = 'AAAA-MM'

async function serie(id: string): Promise<PuntoValido[]> {
  const s = await obtenerHistorico(id);
  return (s?.datos ?? []).filter(esValido).sort((a, b) => a.fecha.localeCompare(b.fecha));
}

const r = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/** Agrupa por mes: promedio (precios, tasas) o último dato del mes (saldos). */
export function mensualizar(puntos: PuntoValido[], modo: 'promedio' | 'ultimo', decimales = 4): PuntoMes[] {
  const grupos = new Map<string, number[]>();
  for (const p of puntos) {
    const mes = p.fecha.slice(0, 7);
    if (!grupos.has(mes)) grupos.set(mes, []);
    grupos.get(mes)!.push(p.valor);
  }
  return [...grupos.entries()].map(([mes, v]) => ({
    mes,
    valor: r(modo === 'promedio' ? v.reduce((a, b) => a + b, 0) / v.length : v[v.length - 1], decimales),
  }));
}

/** Variación anual (%) de un índice mensual: (mes / mismo mes del año anterior − 1) × 100. */
export function variacionAnual(indice: PuntoMes[]): PuntoMes[] {
  const porMes = new Map(indice.map((p) => [p.mes, p.valor]));
  return indice.flatMap((p) => {
    const anio = Number(p.mes.slice(0, 4)) - 1;
    const base = porMes.get(`${anio}${p.mes.slice(4)}`);
    return base ? [{ mes: p.mes, valor: r((p.valor / base - 1) * 100) }] : [];
  });
}

const aMes = (puntos: PuntoValido[]): PuntoMes[] => puntos.map((p) => ({ mes: p.fecha.slice(0, 7), valor: p.valor }));

// ---------- Inflación ----------
export async function datosInflacion() {
  const [anual, subyIdx, inpc] = await Promise.all([
    serie(SERIES_GRAFICAS.inflacionAnual),
    serie(SERIES_GRAFICAS.subyacenteIndice),
    serie(SERIES_GRAFICAS.inpc),
  ]);
  const general = aMes(anual).filter((p) => p.mes >= '2000-01');
  const subyacente = variacionAnual(aMes(subyIdx)).filter((p) => p.mes >= '2000-01');
  const indice = aMes(inpc).filter((p) => p.mes >= '1990-01');
  const ultimo = indice.at(-1);
  const penultimo = indice.at(-2);
  return {
    general,
    subyacente,
    indice, // para la calculadora de poder adquisitivo
    mensual: ultimo && penultimo ? r((ultimo.valor / penultimo.valor - 1) * 100) : null,
  };
}

// ---------- Dólar histórico ----------
export type RangoDolar = '1m' | '6m' | '1a' | '5a' | 'todo';
export type ResumenRango = {
  inicio: { fecha: string; valor: number };
  fin: { fecha: string; valor: number };
  maximo: { fecha: string; valor: number };
  minimo: { fecha: string; valor: number };
  variacion: number; // %
};

export async function datosDolarHistorico() {
  const fix = await serie(SERIES_GRAFICAS.fix);
  const hoy = hoyCDMX();
  const desde: Record<RangoDolar, string> = {
    '1m': sumarDias(hoy, -31),
    '6m': sumarDias(hoy, -183),
    '1a': sumarDias(hoy, -366),
    '5a': sumarDias(hoy, -1827),
    todo: '0000',
  };
  // Los máximos y mínimos se calculan con datos diarios, aunque la gráfica larga use promedios mensuales.
  const resumen = {} as Record<RangoDolar, ResumenRango>;
  for (const rango of Object.keys(desde) as RangoDolar[]) {
    const tramo = fix.filter((p) => p.fecha >= desde[rango]);
    if (!tramo.length) continue;
    const max = tramo.reduce((a, b) => (b.valor > a.valor ? b : a));
    const min = tramo.reduce((a, b) => (b.valor < a.valor ? b : a));
    const ini = tramo[0];
    const fin = tramo.at(-1)!;
    resumen[rango] = { inicio: ini, fin, maximo: max, minimo: min, variacion: r((fin.valor / ini.valor - 1) * 100) };
  }
  return {
    diario: fix.filter((p) => p.fecha >= desde['1a']).map((p) => ({ fecha: p.fecha, valor: p.valor })),
    mensual: mensualizar(fix, 'promedio'),
    desde,
    resumen,
    ultimo: fix.at(-1) ?? null,
  };
}

// ---------- Tablero ----------
export async function datosTablero() {
  const [fix, anual, tasa, cetes, remesas, reservas] = await Promise.all([
    serie(SERIES_GRAFICAS.fix),
    serie(SERIES_GRAFICAS.inflacionAnual),
    serie(SERIES_GRAFICAS.tasaObjetivo),
    serie(SERIES_GRAFICAS.cetes91),
    serie(SERIES_GRAFICAS.remesas),
    serie(SERIES_GRAFICAS.reservas),
  ]);
  const hoy = hoyCDMX();
  const tasaVigente = tasa.filter((p) => p.fecha <= hoy); // la serie trae cambios anunciados a futuro

  const inflacionMes = aMes(anual);
  const tasaMes = mensualizar(tasaVigente, 'ultimo', 2);
  const cetesMes = mensualizar(cetes, 'promedio', 2);
  const remesasMes = aMes(remesas).map((p) => ({ ...p, valor: r(p.valor, 1) }));
  const reservasMes = mensualizar(reservas, 'ultimo', 0);

  return {
    fix: { ultimo: fix.at(-1) ?? null, chispa: fix.slice(-90).map((p) => p.valor) },
    inflacion: { ultimo: inflacionMes.at(-1) ?? null, chispa: inflacionMes.slice(-24).map((p) => p.valor) },
    tasa: { ultimo: tasaVigente.at(-1) ?? null, chispa: tasaMes.slice(-24).map((p) => p.valor) },
    cetes: { ultimo: cetes.at(-1) ?? null, chispa: cetesMes.slice(-24).map((p) => p.valor) },
    remesas: { ultimo: remesasMes.at(-1) ?? null, chispa: remesasMes.slice(-24).map((p) => p.valor), serie: remesasMes },
    reservas: { ultimo: reservas.at(-1) ?? null, chispa: reservasMes.slice(-24).map((p) => p.valor), serie: reservasMes },
    tasasVsInflacion: {
      tasa: tasaMes.filter((p) => p.mes >= '2018-01'),
      cetes: cetesMes.filter((p) => p.mes >= '2018-01'),
      inflacion: inflacionMes.filter((p) => p.mes >= '2018-01'),
    },
  };
}
