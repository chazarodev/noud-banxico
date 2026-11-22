// URLs absolutas del sitio. Next.js NO agrega el basePath a las URLs de metadatos
// (canonical, Open Graph, sitemap), por eso se construyen aquí a partir de NEXT_PUBLIC_SITE_URL.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000/indicadores'
).replace(/\/$/, '');

/** url('/tipo-de-cambio') → 'https://noudxml.com/indicadores/tipo-de-cambio' */
export const url = (ruta = '') => `${SITE_URL}${ruta}`;

/**
 * Enlaces a Noud XML. Es otra app (mismo dominio, otro despliegue): se enlazan con <a>,
 * NUNCA con next/link, que les agregaría el prefijo /indicadores.
 */
export const NOUD = {
  inicio: 'https://noudxml.com/',
  planes: 'https://noudxml.com/#planes',
  login: 'https://noudxml.com/login',
  registro: process.env.NEXT_PUBLIC_NOUD_SIGNUP_URL ?? 'https://noudxml.com/register',
};

/** Agrega UTM a un enlace de Noud XML para medir qué ubicación convierte. */
export function conUtm(destino: string, campana: string, ubicacion: string): string {
  const u = new URL(destino);
  u.searchParams.set('utm_source', 'indicadores');
  u.searchParams.set('utm_medium', 'referral');
  u.searchParams.set('utm_campaign', campana);
  u.searchParams.set('utm_content', ubicacion);
  return u.toString();
}

/** Enlace al registro de Noud XML con UTM. */
export const enlaceNoud = (campana: string, ubicacion: string) =>
  conUtm(NOUD.registro, campana, ubicacion);
