// Catálogo de series usadas en el sitio. IDs tomados del catálogo del SIE de Banxico.
// Antes de publicar una página nueva, confirma título y unidad con GET /series/{id} (metadatos).

export type DefSerie = {
  id: string;
  nombre: string;
  unidad: string;
  decimales: number;
  ruta: string; // ruta de su página dentro del sitio
};

export const SERIES = {
  tipoCambioDOF: {
    id: 'SF60653',
    nombre: 'Tipo de cambio DOF',
    unidad: 'pesos por dólar',
    decimales: 4,
    ruta: '/tipo-de-cambio',
  },
  fix: {
    id: 'SF43718',
    nombre: 'Tipo de cambio FIX',
    unidad: 'pesos por dólar',
    decimales: 4,
    ruta: '/tipo-de-cambio-fix',
  },
  udis: {
    id: 'SP68257',
    nombre: 'Valor de la UDI',
    unidad: 'pesos',
    decimales: 6,
    ruta: '/udis',
  },
  tiie28: {
    id: 'SF43783',
    nombre: 'TIIE a 28 días',
    unidad: '% anual',
    decimales: 4,
    ruta: '/tiie',
  },
  inpc: {
    id: 'SP1',
    nombre: 'INPC',
    unidad: 'índice',
    decimales: 3,
    ruta: '/inflacion',
  },
  tasaObjetivo: {
    id: 'SF61745',
    nombre: 'Tasa objetivo de Banxico',
    unidad: '% anual',
    decimales: 2,
    ruta: '/tasa-objetivo',
  },
} as const satisfies Record<string, DefSerie>;
