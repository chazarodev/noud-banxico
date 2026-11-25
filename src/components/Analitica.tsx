'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

/**
 * Google Analytics 4 con Consent Mode v2.
 * - Se activa solo si existe NEXT_PUBLIC_GA_ID (G-XXXXXXX). Sin la variable no se carga nada (útil en local).
 * - Analítica habilitada por omisión (aviso informativo, como permite la LFPDPPP); si la persona elige
 *   "Rechazar", se guarda en localStorage y gtag deja de usar cookies de analítica.
 * - Publicidad siempre denegada: este sitio no hace remarketing.
 * - Registra como evento cada clic en un elemento con data-evento (p. ej. click_noud en las tarjetas de Noud XML).
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLAVE = 'noud-analitica'; // 'aceptada' | 'rechazada'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function Analitica() {
  const [mostrarAviso, setMostrarAviso] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    try {
      setMostrarAviso(!localStorage.getItem(CLAVE));
    } catch {
      /* navegación privada sin almacenamiento: no se muestra el aviso */
    }

    // Eventos de clic declarados en el HTML: <a data-evento="click_noud" data-ubicacion="...">
    const alClic = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-evento]');
      if (!el || !window.gtag) return;
      const href = el.getAttribute('href') ?? '';
      let campana: string | undefined;
      try {
        campana = new URL(href, location.href).searchParams.get('utm_campaign') ?? undefined;
      } catch {}
      window.gtag('event', el.dataset.evento, {
        ubicacion: el.dataset.ubicacion,
        campana,
        pagina: location.pathname,
        transport_type: 'beacon', // se envía aunque el clic lleve a otra página
      });
    };
    document.addEventListener('click', alClic);
    return () => document.removeEventListener('click', alClic);
  }, []);

  if (!GA_ID) return null;

  const decidir = (decision: 'aceptada' | 'rechazada') => {
    try {
      localStorage.setItem(CLAVE, decision);
    } catch {}
    window.gtag?.('consent', 'update', { analytics_storage: decision === 'aceptada' ? 'granted' : 'denied' });
    setMostrarAviso(false);
  };

  return (
    <>
      <Script id="ga-consentimiento" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
var rechazada = false;
try { rechazada = localStorage.getItem('${CLAVE}') === 'rechazada'; } catch (e) {}
gtag('consent', 'default', {
  analytics_storage: rechazada ? 'denied' : 'granted',
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
});
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />

      {mostrarAviso && (
        <div
          role="region"
          aria-label="Aviso de cookies"
          className="fixed inset-x-2 bottom-2 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg sm:inset-x-auto sm:bottom-3 sm:right-4 sm:block sm:rounded-2xl sm:p-4 sm:text-sm"
        >
          {/* En el celular es una sola franja (texto corto + botones) para no tapar el resultado. */}
          <p className="text-text">
            Usamos cookies de Google Analytics<span className="hidden sm:inline"> para saber qué páginas son útiles</span>. No las usamos para publicidad.
            {process.env.NEXT_PUBLIC_PRIVACIDAD_URL && (
              <>
                {' '}
                <a href={process.env.NEXT_PUBLIC_PRIVACIDAD_URL} className="underline underline-offset-2">
                  Aviso de privacidad
                </a>
                .
              </>
            )}
          </p>
          <div className="flex shrink-0 justify-end gap-1 sm:mt-3 sm:gap-2">
            <button
              type="button"
              onClick={() => decidir('rechazada')}
              className="rounded-lg px-2 py-1.5 text-text-soft hover:bg-soft hover:text-text sm:rounded-xl sm:px-3"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => decidir('aceptada')}
              className="rounded-lg bg-brand px-2.5 py-1.5 font-medium text-on-brand hover:bg-brand-hover sm:rounded-xl sm:px-3"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}