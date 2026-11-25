import { formatoValor, mesLargo } from '@/components/graficas/formato';
import { datosTablero } from '@/lib/banxico/graficas';
import { fechaLarga } from '@/lib/banxico/parse';
import { imagenOg, tamanoOg, tipoOg, type CifraOg } from '@/lib/og';

export const size = tamanoOg;
export const contentType = tipoOg;
export const alt = 'La economía de México hoy: dólar, inflación, tasa objetivo y Cetes';
export const revalidate = 3600;

export default async function Imagen() {
  const d = await datosTablero();
  // Colores de serie del modo claro (los mismos de las gráficas del tablero).
  const cifras = [
    d.fix.ultimo && { etiqueta: 'Dólar (FIX)', valor: formatoValor(d.fix.ultimo.valor, 'pesos', true), color: '#1f9a63' },
    d.inflacion.ultimo && { etiqueta: 'Inflación anual', valor: formatoValor(d.inflacion.ultimo.valor, 'porcentaje'), color: '#d9663f' },
    d.tasa.ultimo && { etiqueta: 'Tasa objetivo', valor: formatoValor(d.tasa.ultimo.valor, 'porcentaje'), color: '#5d5abf' },
    d.cetes.ultimo && { etiqueta: 'Cetes 91 días', valor: formatoValor(d.cetes.ultimo.valor, 'porcentaje'), color: '#ae8210' },
  ].filter(Boolean) as CifraOg[];

  const fecha = d.fix.ultimo ? `Dólar al ${fechaLarga(d.fix.ultimo.fecha)}` : null;
  const infl = d.inflacion.ultimo ? `inflación de ${mesLargo(d.inflacion.ultimo.mes)}` : null;

  return imagenOg({
    etiqueta: 'Tablero gratuito',
    titulo: 'La economía de México hoy',
    detalle: [fecha, infl].filter(Boolean).join(' · ') || undefined,
    cifras,
  });
}