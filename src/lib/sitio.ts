// URLs absolutas del sitio. Next.js NO agrega el basePath a las URLs de metadatos
// (canonical, Open Graph, sitemap), por eso se construyen aquí a partir de NEXT_PUBLIC_SITE_URL.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000/indicadores'
).replace(/\/$/, '');

/** url('/tipo-de-cambio') → 'https://noudxml.com/indicadores/tipo-de-cambio' */
export const url = (ruta = '') => `${SITE_URL}${ruta}`;

/** Enlace al registro de Noud XML con UTM, para medir qué ubicación convierte. */
export function enlaceNoud(campana: string, ubicacion: string): string {
  const destino = new URL(
    process.env.NEXT_PUBLIC_NOUD_SIGNUP_URL ?? 'https://noudxml.com',
  );
  destino.searchParams.set('utm_source', 'indicadores');
  destino.searchParams.set('utm_medium', 'referral');
  destino.searchParams.set('utm_campaign', campana);
  destino.searchParams.set('utm_content', ubicacion);
  return destino.toString();
}
