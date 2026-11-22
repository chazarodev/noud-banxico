import { imagenOg, tamanoOg, tipoOg } from '@/lib/og';
import { esFechaISO, fechaLarga, formatoNumero } from '@/lib/banxico/parse';
import { datosTipoDeCambio, fechaEnRango, vistaDelDia } from '@/lib/banxico/tipo-de-cambio';

export const size = tamanoOg;
export const contentType = tipoOg;
export const alt = 'Tipo de cambio DOF de la fecha';
export const revalidate = 86400;

// Sin esto, las páginas por fecha heredarían la imagen de "hoy" de la página padre.
export default async function Imagen({ params }: { params: Promise<{ fecha: string }> }) {
  const { fecha } = await params;
  const d = await datosTipoDeCambio();
  const v = esFechaISO(fecha) && fechaEnRango(d, fecha) ? vistaDelDia(d, fecha) : null;
  return imagenOg({
    etiqueta: 'Tipo de cambio DOF',
    titulo: esFechaISO(fecha) ? fechaLarga(fecha) : 'Fecha no válida',
    valor: v?.publicacion ? `$${formatoNumero(v.publicacion.punto.valor, 4)}` : undefined,
    detalle: v?.operacion ? `Para operaciones de ese día: $${formatoNumero(v.operacion.punto.valor, 4)}` : undefined,
  });
}
