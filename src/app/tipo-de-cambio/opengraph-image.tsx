import { imagenOg, tamanoOg, tipoOg } from '@/lib/og';
import { fechaLarga, formatoNumero } from '@/lib/banxico/parse';
import { datosTipoDeCambio, vistaDelDia } from '@/lib/banxico/tipo-de-cambio';

export const size = tamanoOg;
export const contentType = tipoOg;
export const alt = 'Tipo de cambio DOF de hoy';
export const revalidate = 3600;

export default async function Imagen() {
  const d = await datosTipoDeCambio();
  const { publicacion } = vistaDelDia(d, d.hoy);
  return imagenOg({
    etiqueta: 'Tipo de cambio DOF hoy',
    titulo: 'Pesos por dólar',
    valor: publicacion ? `$${formatoNumero(publicacion.punto.valor, 4)}` : undefined,
    detalle: publicacion ? `Publicado en el DOF el ${fechaLarga(publicacion.punto.fecha)}` : undefined,
  });
}
