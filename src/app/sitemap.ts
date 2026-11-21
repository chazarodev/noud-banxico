import type { MetadataRoute } from 'next';
import { SERIES } from '@/lib/banxico/series';
import { historialDOF } from '@/lib/banxico/tipo-de-cambio';
import { url } from '@/lib/sitio';

// Se sirve en /indicadores/sitemap.xml. Decláralo en el robots.txt de Noud XML.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const puntos = await historialDOF();
  const ruta = SERIES.tipoCambioDOF.ruta;

  return [
    { url: url(ruta), changeFrequency: 'daily', priority: 1 },
    // Solo fechas con publicación: los fines de semana apuntan a ellas con canonical.
    ...puntos.map((p: any) => ({
      url: url(`${ruta}/${p.fecha}`),
      lastModified: p.fecha,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}
