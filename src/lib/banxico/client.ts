import 'server-only';
import { cache } from 'react';
import { parseDato, parseFecha, type Punto } from './parse';

const BASE = 'https://www.banxico.org.mx/SieAPIRest/service/v1';

const SEIS_HORAS = 60 * 60 * 6;
const UN_DIA = 60 * 60 * 24;

export type Serie = { id: string; titulo: string; datos: Punto[] };

/** El token rebasó el límite de Banxico (respuesta 400 con secondsToReset). */
export class BanxicoLimiteError extends Error {
  constructor(
    public segundosParaDesbloqueo: number | null,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'BanxicoLimiteError';
  }
}

export class BanxicoError extends Error {
  constructor(
    public status: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'BanxicoError';
  }
}

type RespuestaSerie = {
  idSerie: string;
  titulo: string;
  datos?: { fecha: string; dato: string }[];
};

async function consultar(ruta: string, revalidate: number): Promise<Serie[]> {
  const token = process.env.BANXICO_TOKEN;
  if (!token) throw new Error('Falta BANXICO_TOKEN en las variables de entorno');

  const res = await fetch(`${BASE}/${ruta}`, {
    headers: { 'Bmx-Token': token, Accept: 'application/json' },
    // Desde Next.js 15 fetch no se guarda en caché por defecto: hay que declararlo.
    next: { revalidate, tags: ['banxico'] },
  });

  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    const segundos =
      cuerpo?.error?.secondsToReset ?? res.headers.get('Bmx-secondsToReset');
    if (res.status === 400 && segundos != null) {
      const error = new BanxicoLimiteError(
        Number(segundos),
        cuerpo?.error?.detalle ?? 'Límite de consultas de Banxico superado',
      );
      console.error(`[banxico] ${error.message} (ruta: ${ruta})`);
      throw error;
    }
    throw new BanxicoError(
      res.status,
      cuerpo?.error?.mensaje ?? `Banxico respondió ${res.status}`,
    );
  }

  const json = await res.json();
  const series: RespuestaSerie[] = json?.bmx?.series ?? [];
  return series.map((s) => ({
    id: s.idSerie,
    titulo: s.titulo,
    datos: (s.datos ?? []).map((d) => ({
      fecha: parseFecha(d.fecha),
      valor: parseDato(d.dato),
    })),
  }));
}

// cache() evita llamadas repetidas dentro de un mismo render (metadatos + página).
// Entre visitas, la caché de datos de Next.js (next.revalidate) hace el resto.
const consultarCache = cache(consultar);

/** Dato más reciente de varias series en UNA consulta (límite: 80/min, 40,000/día). */
export function obtenerOportunos(ids: readonly string[]): Promise<Serie[]> {
  return consultarCache(`series/${ids.join(',')}/datos/oportuno`, SEIS_HORAS);
}

/**
 * Datos de varias series entre dos fechas AAAA-MM-DD, en UNA consulta histórica.
 * Útil para series que publican valores futuros (UDIS, tasa objetivo): el dato oportuno
 * trae el último, que puede ser de una fecha que aún no llega.
 */
export function obtenerRango(
  ids: readonly string[],
  inicio: string,
  fin: string,
): Promise<Serie[]> {
  return consultarCache(`series/${ids.join(',')}/datos/${inicio}/${fin}`, SEIS_HORAS);
}

/**
 * Histórico completo de una serie (límite: 200 cada 5 min, 10,000/día).
 * Todas las páginas por fecha comparten esta misma URL, así que es una sola consulta al día.
 */
export async function obtenerHistorico(id: string): Promise<Serie | undefined> {
  const series = await consultarCache(`series/${id}/datos`, UN_DIA);
  return series[0];
}
