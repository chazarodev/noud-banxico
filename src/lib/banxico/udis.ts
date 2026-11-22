import 'server-only';
import { obtenerHistorico } from './client';
import { esValido, hoyCDMX, type PuntoValido } from './parse';
import { SERIES } from './series';
import { buscarFecha } from './tipo-de-cambio';

/**
 * Valor de la UDI (SP68257). Banxico publica los valores por adelantado (hasta el día 10 del mes
 * siguiente), así que el histórico ya trae fechas futuras: "hoy" se busca por fecha, no por el último punto.
 */
export async function datosUdis() {
  const serie = await obtenerHistorico(SERIES.udis.id);
  const puntos: PuntoValido[] = (serie?.datos ?? [])
    .filter(esValido)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const hoy = hoyCDMX();
  return {
    hoy,
    puntos,
    actual: buscarFecha(puntos, hoy),
    proximos: puntos.filter((p) => p.fecha > hoy),
    primeraFecha: puntos[0]?.fecha,
    ultimaFecha: puntos.at(-1)?.fecha,
  };
}
