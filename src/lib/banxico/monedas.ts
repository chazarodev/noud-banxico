import 'server-only';
import { obtenerRango } from './client';
import { esValido, hoyCDMX, type PuntoValido } from './parse';
import { sumarDias } from './tipo-de-cambio';

/**
 * Tipos de cambio de otras divisas en pesos (cruzados con el FIX; fuente FMI/Banco de Canadá vía Banxico).
 * IDs POR CONFIRMAR con GET /series/{id}: si el título que devuelve Banxico no contiene `palabra`,
 * la moneda se oculta y se registra un aviso, para no publicar un dato equivocado.
 */
export const MONEDAS = [
  { slug: 'euro', nombre: 'Euro', codigo: 'EUR', id: 'SF46410', palabra: 'euro', decimales: 4 },
  { slug: 'dolar-canadiense', nombre: 'Dólar canadiense', codigo: 'CAD', id: 'SF60632', palabra: 'canad', decimales: 4 },
  { slug: 'yen', nombre: 'Yen japonés', codigo: 'JPY', id: 'SF46406', palabra: 'yen', decimales: 4 },
  { slug: 'libra-esterlina', nombre: 'Libra esterlina', codigo: 'GBP', id: 'SF46407', palabra: 'libra', decimales: 4 },
] as const;

export type Moneda = (typeof MONEDAS)[number];

export type DatosMoneda = Moneda & {
  titulo: string;
  puntos: PuntoValido[]; // últimos ~60 días
  actual: PuntoValido;
  anterior: PuntoValido | null;
};

/** Todas las monedas en UNA consulta por rango (60 días). Devuelve solo las que pasan la validación. */
export async function datosMonedas(): Promise<DatosMoneda[]> {
  const hoy = hoyCDMX();
  try {
    const series = await obtenerRango(MONEDAS.map((m) => m.id), sumarDias(hoy, -60), hoy);
    return MONEDAS.flatMap((m) => {
      const s = series.find((x) => x.id === m.id);
      if (!s || !s.titulo.toLowerCase().includes(m.palabra)) {
        console.warn(`[monedas] ${m.id} no parece ser ${m.nombre}: "${s?.titulo ?? 'sin datos'}". Se omite.`);
        return [];
      }
      const puntos = s.datos.filter(esValido).sort((a, b) => a.fecha.localeCompare(b.fecha));
      const actual = puntos.at(-1);
      if (!actual) return [];
      return [{ ...m, titulo: s.titulo, puntos, actual, anterior: puntos.at(-2) ?? null }];
    });
  } catch (error) {
    console.error('[monedas] No se pudieron obtener', error);
    return [];
  }
}
