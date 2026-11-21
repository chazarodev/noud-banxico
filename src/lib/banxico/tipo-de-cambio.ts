import 'server-only';
import { obtenerHistorico, obtenerOportunos } from './client';
import { esValido, type PuntoValido } from './parse';
import { SERIES } from './series';

const ID = SERIES.tipoCambioDOF.id;

/** Histórico del tipo de cambio DOF, sin huecos (N/E) y de la fecha más antigua a la más reciente. */
export async function historialDOF(): Promise<PuntoValido[]> {
  const serie = await obtenerHistorico(ID);
  return (serie?.datos ?? [])
    .filter(esValido)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/**
 * Histórico + el dato oportuno. El histórico se refresca cada 24 h y el oportuno cada 6 h;
 * si el oportuno es más reciente, se agrega al final.
 */
export async function resumenDOF() {
  const [historial, oportunos] = await Promise.all([
    historialDOF(),
    obtenerOportunos([ID]),
  ]);
  const ultimo = oportunos[0]?.datos.find(esValido);
  const puntos =
    ultimo && ultimo.fecha > (historial.at(-1)?.fecha ?? '')
      ? [...historial, ultimo]
      : historial;
  return { puntos, actual: puntos.at(-1), anterior: puntos.at(-2) };
}

export type ResultadoFecha = {
  punto: PuntoValido; // publicación que aplica a la fecha pedida
  exacto: boolean; // false = ese día no hubo publicación (fin de semana o inhábil)
  anterior: PuntoValido | null;
  siguiente: PuntoValido | null;
};

/** Busca la última publicación en o antes de `fecha` (AAAA-MM-DD). */
export function buscarFecha(puntos: PuntoValido[], fecha: string): ResultadoFecha | null {
  // Búsqueda binaria: el histórico tiene miles de puntos.
  let lo = 0;
  let hi = puntos.length - 1;
  let i = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (puntos[mid].fecha <= fecha) {
      i = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (i < 0) return null;
  return {
    punto: puntos[i],
    exacto: puntos[i].fecha === fecha,
    anterior: puntos[i - 1] ?? null,
    siguiente: puntos[i + 1] ?? null,
  };
}
