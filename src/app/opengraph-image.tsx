import { imagenOg, tamanoOg, tipoOg } from '@/lib/og';

export const size = tamanoOg;
export const contentType = tipoOg;
export const alt = 'Indicadores económicos de Banxico y calculadoras fiscales gratis';

export default function Imagen() {
  return imagenOg({
    etiqueta: 'Gratis y con datos oficiales',
    titulo: 'Tipo de cambio, UDIS, inflación y calculadoras fiscales',
    detalle: 'Aguinaldo, ISR, IVA y retenciones, recargos SAT',
  });
}
