import 'server-only';
import { obtenerHistorico, obtenerOportunos } from './client';
import { esValido, hoyCDMX, type Punto, type PuntoValido } from './parse';
import { SERIES } from './series';

/*
 * Un mismo FIX tiene tres fechas (Banxico):
 *   1. Determinación (día hábil t) ............ serie SF43718
 *   2. Publicación en el DOF (día hábil siguiente a t)
 *   3. Liquidación (día siguiente a la publicación) ... serie SF60653
 *
 * Banxico no expone una serie por fecha de publicación, así que se deriva:
 * SF60653 trae un valor por día natural, y el publicado en el DOF el día hábil p
 * es el que SF60653 trae para p + 1 día. Validado contra la consulta del DOF:
 * 17-nov 18.5525 · 18-nov 18.4677 · 19-nov 18.6723 · 20-nov 19.0270.
 *
 * Para registrar operaciones del día d se usa el publicado en el DOF el día hábil
 * anterior, que es justo SF60653(d).
 */

const ID_LIQ = SERIES.tipoCambioDOF.id; // SF60653
const ID_FIX = SERIES.fix.id; // SF43718

const ordenar = (puntos: Punto[]) =>
  puntos.filter(esValido).sort((a, b) => a.fecha.localeCompare(b.fecha));

/** Une el histórico (24 h) con el dato oportuno (6 h) si este es más reciente. */
function unir(historial: PuntoValido[], oportuno?: Punto): PuntoValido[] {
  if (oportuno && esValido(oportuno) && oportuno.fecha > (historial.at(-1)?.fecha ?? '')) {
    return [...historial, oportuno];
  }
  return historial;
}

/** '2026-11-20', 1 → '2026-11-21' */
export function sumarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/**
 * Deriva las publicaciones del DOF.
 * Días de publicación = días hábiles (fechas de SF43718) + el día anterior a cada cambio de
 * valor en SF60653 (cubre publicaciones futuras ya conocidas, como el lunes siguiente).
 */
export function calcularPublicaciones(
  liquidacion: PuntoValido[],
  diasHabiles: string[],
): PuntoValido[] {
  const valorPorFecha = new Map(liquidacion.map((p) => [p.fecha, p.valor]));
  const dias = new Set(diasHabiles);
  for (let i = 1; i < liquidacion.length; i++) {
    if (liquidacion[i].valor !== liquidacion[i - 1].valor) {
      dias.add(sumarDias(liquidacion[i].fecha, -1));
    }
  }
  return [...dias].sort().flatMap((fecha) => {
    const valor = valorPorFecha.get(sumarDias(fecha, 1));
    return valor === undefined ? [] : [{ fecha, valor }];
  });
}

export type ResultadoFecha = {
  punto: PuntoValido; // el que aplica a la fecha pedida
  exacto: boolean; // false = no hay punto en esa fecha; se usa el anterior
  anterior: PuntoValido | null;
  siguiente: PuntoValido | null;
};

/** Último punto en o antes de `fecha` (AAAA-MM-DD). Búsqueda binaria. */
export function buscarFecha(puntos: PuntoValido[], fecha: string): ResultadoFecha | null {
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

/** Todo lo que necesitan las páginas del tipo de cambio: 2 consultas históricas + 1 oportuna. */
export async function datosTipoDeCambio() {
  const [liqSerie, fixSerie, oportunos] = await Promise.all([
    obtenerHistorico(ID_LIQ),
    obtenerHistorico(ID_FIX),
    obtenerOportunos([ID_LIQ, ID_FIX]),
  ]);
  const oportuno = (id: string) => oportunos.find((s) => s.id === id)?.datos[0];

  const liquidacion = unir(ordenar(liqSerie?.datos ?? []), oportuno(ID_LIQ));
  const fix = unir(ordenar(fixSerie?.datos ?? []), oportuno(ID_FIX));
  const publicaciones = calcularPublicaciones(
    liquidacion,
    fix.map((p) => p.fecha),
  );

  return {
    hoy: hoyCDMX(),
    liquidacion,
    fix,
    publicaciones,
    primeraFecha: liquidacion[0]?.fecha,
    ultimaFecha: liquidacion.at(-1)?.fecha,
  };
}

export type DatosTipoDeCambio = Awaited<ReturnType<typeof datosTipoDeCambio>>;

/** Vista de un día: publicado en el DOF ese día y tipo de cambio para operaciones de ese día. */
export function vistaDelDia(d: DatosTipoDeCambio, fecha: string) {
  const publicacion = buscarFecha(d.publicaciones, fecha); // último publicado en o antes de `fecha`
  const operacion = buscarFecha(d.liquidacion, fecha); // para registrar operaciones de `fecha`
  // La publicación de la que viene el valor para operaciones: la última antes de `fecha`.
  const origenOperacion = buscarFecha(d.publicaciones, sumarDias(fecha, -1));
  const fixReciente = buscarFecha(d.fix, fecha);
  // El FIX se publica el siguiente día hábil: la primera publicación posterior a su determinación.
  const publicacionDelFix = fixReciente
    ? (d.publicaciones.find((p) => p.fecha > fixReciente.punto.fecha) ?? null)
    : null;
  return { publicacion, operacion, origenOperacion, fixReciente, publicacionDelFix };
}

/** Lista de fechas permitidas para páginas por fecha. */
export function fechaEnRango(d: DatosTipoDeCambio, fecha: string): boolean {
  if (!d.primeraFecha || !d.ultimaFecha) return false;
  const limite = d.ultimaFecha > d.hoy ? d.ultimaFecha : d.hoy;
  return fecha >= d.primeraFecha && fecha <= limite;
}
