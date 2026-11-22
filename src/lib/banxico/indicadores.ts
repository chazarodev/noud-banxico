import 'server-only';
import { obtenerRango } from './client';
import { esValido, hoyCDMX, type PuntoValido } from './parse';
import { SERIES, type ClaveSerie, type DefSerie } from './series';
import { buscarFecha, sumarDias } from './tipo-de-cambio';

// Indicadores de la portada (además del tipo de cambio, que tiene su propio módulo).
const CLAVES = ['udis', 'tasaObjetivo', 'fondeo', 'tiie28', 'cetes91', 'inpc'] as const satisfies readonly ClaveSerie[];

export type ResumenIndicador = {
  clave: ClaveSerie;
  def: DefSerie;
  actual: PuntoValido; // vigente hoy (fecha <= hoy)
  anterior: PuntoValido | null;
  proximoCambio: PuntoValido | null; // primer valor futuro distinto del actual, si ya se publicó
};

/**
 * Valor vigente hoy de cada indicador, con UNA consulta histórica por rango
 * (100 días atrás para cubrir series semanales y mensuales, 45 adelante para valores ya publicados).
 * Si Banxico falla, devuelve [] para que la portada siga mostrando lo demás.
 */
export async function resumenIndicadores(): Promise<ResumenIndicador[]> {
  const hoy = hoyCDMX();
  try {
    const series = await obtenerRango(
      CLAVES.map((c) => SERIES[c].id),
      sumarDias(hoy, -100),
      sumarDias(hoy, 45),
    );
    return CLAVES.flatMap((clave) => {
      const def: DefSerie = SERIES[clave];
      const puntos = (series.find((s) => s.id === def.id)?.datos ?? [])
        .filter(esValido)
        .sort((a, b) => a.fecha.localeCompare(b.fecha));
      const r = buscarFecha(puntos, hoy);
      if (!r) return [];
      const proximoCambio =
        puntos.find((p) => p.fecha > hoy && p.valor !== r.punto.valor) ?? null;
      return [{ clave, def, actual: r.punto, anterior: r.anterior, proximoCambio }];
    });
  } catch (error) {
    console.error('[indicadores] No se pudo obtener el resumen', error);
    return [];
  }
}
