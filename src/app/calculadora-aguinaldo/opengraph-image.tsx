import { imagenOg, tamanoOg, tipoOg } from '@/lib/og';

export const size = tamanoOg;
export const contentType = tipoOg;
export const alt = 'Calculadora de aguinaldo 2026';

export default function Imagen() {
  return imagenOg({
    etiqueta: 'Calculadora gratis',
    titulo: '¿Cuánto aguinaldo te toca en 2026?',
    detalle: 'Monto completo o proporcional, parte exenta e ISR con los dos métodos',
  });
}
