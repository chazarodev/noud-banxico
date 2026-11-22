import type { MetadataRoute } from 'next';
import { SERIES } from '@/lib/banxico/series';
import { datosTipoDeCambio } from '@/lib/banxico/tipo-de-cambio';
import { url } from '@/lib/sitio';

// Se sirve en /indicadores/sitemap.xml. Está declarado en el robots.ts de Noud XML.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const d = await datosTipoDeCambio();
  const ruta = SERIES.tipoCambioDOF.ruta;

  return [
    { url: url('/'), changeFrequency: 'daily', priority: 1 },
    { url: url(ruta), changeFrequency: 'daily', priority: 0.9 },
    // Una URL por día natural: cada día tiene su valor para operaciones, haya o no publicación.
    ...d.liquidacion.map((p) => ({
      url: url(`${ruta}/${p.fecha}`),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}
