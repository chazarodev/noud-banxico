// Utilidades puras: sin token ni llamadas de red, se pueden usar en cliente y servidor.

export type Punto = { fecha: string; valor: number | null };
export type PuntoValido = { fecha: string; valor: number };

export const esValido = (p: Punto): p is PuntoValido => p.valor !== null;

/** "17,234.5000" → 17234.5 · "N/E" → null */
export function parseDato(dato: string | undefined): number | null {
  if (!dato) return null;
  const limpio = dato.replace(/,/g, '').trim();
  if (limpio === '' || limpio.toUpperCase() === 'N/E') return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

/** "31/01/2023" → "2023-01-31" */
export function parseFecha(fecha: string): string {
  const [dd, mm, aaaa] = fecha.split('/');
  return `${aaaa}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

/** Verifica formato AAAA-MM-DD y que la fecha exista (rechaza 2026-02-30). */
export function esFechaISO(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Fecha de hoy en la Ciudad de México, como AAAA-MM-DD. */
export function hoyCDMX(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date());
}

// timeZone UTC: las fechas ISO se interpretan a medianoche UTC; así no se recorren un día.
const fmtLarga = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const fmtCorta = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2026-11-20" → "20 de noviembre de 2026" */
export const fechaLarga = (iso: string) => fmtLarga.format(new Date(`${iso}T00:00:00Z`));
/** "2026-11-20" → "20 nov 2026" */
export const fechaCorta = (iso: string) => fmtCorta.format(new Date(`${iso}T00:00:00Z`));

export function formatoNumero(valor: number, decimales: number): string {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor);
}
