import { imagenOg, tamanoOg, tipoOg } from '@/lib/og';

export const size = tamanoOg;
export const contentType = tipoOg;
export const alt = 'Verificador de tipo de cambio en CFDI';

export default function Imagen() {
  return imagenOg({
    etiqueta: 'Herramienta gratis para contadores',
    titulo: '¿Tus CFDI en dólares traen el tipo de cambio correcto?',
    detalle: 'Sube tus XML y compáralos con el DOF de Banxico. Tus archivos no salen de tu equipo.',
  });
}