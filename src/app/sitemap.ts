import type { MetadataRoute } from 'next';
import { SERIES } from '@/lib/banxico/series';
import { datosTipoDeCambio } from '@/lib/banxico/tipo-de-cambio';
import { datosUdis } from '@/lib/banxico/udis';
import { MONEDAS } from '@/lib/banxico/monedas';
import { url } from '@/lib/sitio';

// Se sirve en /indicadores/sitemap.xml. Está declarado en el robots.ts de Noud XML.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [d, u] = await Promise.all([datosTipoDeCambio(), datosUdis()]);
  const ruta = SERIES.tipoCambioDOF.ruta;

  return [
    { url: url('/'), changeFrequency: 'daily', priority: 1 },
    { url: url(ruta), changeFrequency: 'daily', priority: 0.9 },
    { url: url('/convertidor-dolares-pesos'), changeFrequency: 'daily', priority: 0.8 },
    { url: url('/udis'), changeFrequency: 'daily', priority: 0.9 },
    { url: url('/uma'), changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/salario-minimo'), changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/otras-monedas'), changeFrequency: 'daily', priority: 0.7 },
    ...MONEDAS.map((m) => ({ url: url(`/otras-monedas/${m.slug}`), changeFrequency: 'daily' as const, priority: 0.7 })),
    ...u.puntos.filter((p) => p.fecha >= '2020-01-01').map((p) => ({
      url: url(`/udis/${p.fecha}`),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    })),
    { url: url('/verificador-tipo-cambio-cfdi'), changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/calculadora-iva-retenciones'), changeFrequency: 'monthly', priority: 0.9 },
    { url: url('/calculadora-actualizacion-recargos'), changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/calculadora-aguinaldo'), changeFrequency: 'monthly', priority: 0.9 },
    { url: url('/calculadora-isr-salarios'), changeFrequency: 'monthly', priority: 0.8 },
    // Una URL por día natural: cada día tiene su valor para operaciones, haya o no publicación.
    ...d.liquidacion.map((p) => ({
      url: url(`${ruta}/${p.fecha}`),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}
