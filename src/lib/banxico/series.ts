import { formatoNumero } from './parse';

// Catálogo de series usadas en el sitio. IDs tomados del catálogo del SIE de Banxico.
// Antes de publicar una página nueva, confirma título y unidad con GET /series/{id} (metadatos).

export type DefSerie = {
  id: string;
  nombre: string;
  unidad: string;
  decimales: number;
  frecuencia: 'diaria' | 'mensual';
  prefijo?: string; // '$' para montos en pesos
  sufijo?: string; // '%' para tasas
  ruta?: string; // página propia dentro del sitio (si ya existe)
  descripcion: string; // una línea para la portada
};

export const SERIES = {
  tipoCambioDOF: {
    id: 'SF60653', // fecha de liquidación; la fecha de publicación DOF se deriva (tipo-de-cambio.ts)
    nombre: 'Tipo de cambio DOF',
    unidad: 'pesos por dólar',
    decimales: 4,
    frecuencia: 'diaria',
    prefijo: '$',
    ruta: '/tipo-de-cambio',
    descripcion: 'Para solventar obligaciones en dólares y registrar operaciones en moneda extranjera.',
  },
  fix: {
    id: 'SF43718', // fecha de determinación; sus fechas sirven como calendario de días hábiles
    nombre: 'Tipo de cambio FIX',
    unidad: 'pesos por dólar',
    decimales: 4,
    frecuencia: 'diaria',
    prefijo: '$',
    descripcion: 'Determinado por Banxico cada día hábil a partir de las 12:00 horas.',
  },
  udis: {
    id: 'SP68257', // confirmar con metadatos
    nombre: 'Valor de la UDI',
    unidad: 'pesos',
    decimales: 6,
    frecuencia: 'diaria',
    prefijo: '$',
    ruta: '/udis',
    descripcion: 'Unidad de inversión para créditos y actualización de montos.',
  },
  tiie28: {
    id: 'SF43783',
    nombre: 'TIIE a 28 días',
    unidad: '% anual',
    decimales: 4,
    frecuencia: 'diaria',
    sufijo: '%',
    descripcion: 'Tasa de referencia de muchos créditos bancarios.',
  },
  tasaObjetivo: {
    id: 'SF61745',
    nombre: 'Tasa objetivo de Banxico',
    unidad: '% anual',
    decimales: 2,
    frecuencia: 'diaria',
    sufijo: '%',
    descripcion: 'Tasa de política monetaria que fija la Junta de Gobierno.',
  },
  fondeo: {
    id: 'SF43773',
    nombre: 'Tasa de fondeo bancario',
    unidad: '% anual',
    decimales: 2,
    frecuencia: 'diaria',
    sufijo: '%',
    descripcion: 'Costo del dinero a un día entre bancos (mediana ponderada por volumen).',
  },
  cetes91: {
    id: 'SF60634',
    nombre: 'Cetes a 91 días',
    unidad: '% anual',
    decimales: 2,
    frecuencia: 'diaria',
    sufijo: '%',
    descripcion: 'Rendimiento en la subasta semanal de Cetes.',
  },
  inpc: {
    id: 'SP1', // confirmar con metadatos
    nombre: 'INPC',
    unidad: 'índice',
    decimales: 3,
    frecuencia: 'mensual',
    descripcion: 'Índice Nacional de Precios al Consumidor, para actualizar contribuciones.',
  },
} as const satisfies Record<string, DefSerie>;

export type ClaveSerie = keyof typeof SERIES;

/** 18.4235 → "$18.4235" · 7.25 → "7.25%" según la serie. */
export function formatoValor(def: DefSerie, valor: number): string {
  return `${def.prefijo ?? ''}${formatoNumero(valor, def.decimales)}${def.sufijo ?? ''}`;
}
