// Formatos compartidos por las gráficas (cliente y servidor). Solo datos serializables entre ambos.

export type Unidad = 'porcentaje' | 'pesos' | 'millonesUsd' | 'indice';
export type EjeX = 'mes' | 'dia';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** 'AAAA-MM' → 'oct 2026' · 'AAAA-MM-DD' → '20 nov 2026' */
export function etiquetaX(x: string, eje: EjeX, corta = false): string {
  const mes = MESES[Number(x.slice(5, 7)) - 1];
  const anio = corta ? `’${x.slice(2, 4)}` : x.slice(0, 4);
  return eje === 'mes' ? `${mes} ${anio}` : `${Number(x.slice(8, 10))} ${mes}${corta ? '' : ` ${x.slice(0, 4)}`}`;
}

export const mesLargo = (x: string) => `${MESES_LARGOS[Number(x.slice(5, 7)) - 1]} de ${x.slice(0, 4)}`;

export function formatoValor(v: number, unidad: Unidad, compacto = false): string {
  switch (unidad) {
    case 'porcentaje':
      return `${v.toLocaleString('es-MX', { minimumFractionDigits: compacto ? 0 : 2, maximumFractionDigits: 2 })}%`;
    case 'pesos':
      return `$${v.toLocaleString('es-MX', { minimumFractionDigits: compacto ? 2 : 4, maximumFractionDigits: compacto ? 2 : 4 })}`;
    case 'millonesUsd':
      return compacto
        ? `${(v / 1000).toLocaleString('es-MX', { maximumFractionDigits: 1 })} mil mdd`
        : `${v.toLocaleString('es-MX', { maximumFractionDigits: 1 })} mdd`;
    default:
      return v.toLocaleString('es-MX', { maximumFractionDigits: 3 });
  }
}

/** Etiquetas cortas para el eje Y: la unidad va en el subtítulo de la gráfica, no en cada marca. */
export function formatoEje(v: number, unidad: Unidad): string {
  switch (unidad) {
    case 'porcentaje':
      return `${v.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%`;
    case 'pesos':
      return `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'millonesUsd':
      return `${(v / 1000).toLocaleString('es-MX', { maximumFractionDigits: 0 })} mil`;
    default:
      return v.toLocaleString('es-MX', { maximumFractionDigits: 1 });
  }
}
