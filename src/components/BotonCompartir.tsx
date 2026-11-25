'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

type Props = {
  /** URL absoluta de la página (usa url() de lib/sitio). */
  enlace: string;
  /** Texto que acompaña al enlace al compartir. Nunca incluye datos que escribió el usuario. */
  texto: string;
  /** utm_campaign del enlace compartido, p. ej. 'aguinaldo-2026'. */
  campana: string;
  /** Dónde está el botón; se registra en Analytics. */
  ubicacion: string;
  etiqueta?: string;
};

/**
 * Compartir desde el celular: abre el menú nativo (WhatsApp, Telegram, etc.).
 * Los navegadores integrados de Reddit y Facebook en Android no siempre tienen navigator.share:
 * ahí se abre WhatsApp directamente. En escritorio sin menú nativo, copia el enlace.
 * El clic se registra como evento 'share' (evento recomendado de GA4) por data-evento.
 */
export function BotonCompartir({ enlace, texto, campana, ubicacion, etiqueta = 'Compartir' }: Props) {
  const [copiado, setCopiado] = useState(false);

  const destino = new URL(enlace);
  destino.searchParams.set('utm_source', 'compartir');
  destino.searchParams.set('utm_medium', 'boton');
  destino.searchParams.set('utm_campaign', campana);
  const enlaceFinal = destino.toString();

  const compartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: texto, url: enlaceFinal });
      } catch {
        /* el usuario cerró el menú: no pasa nada */
      }
      return;
    }
    const esCelular = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (esCelular) {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${texto} ${enlaceFinal}`)}`, '_blank', 'noopener');
      return;
    }
    try {
      await navigator.clipboard.writeText(enlaceFinal);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt('Copia el enlace:', enlaceFinal);
    }
  };

  return (
    <button
      type="button"
      onClick={compartir}
      data-evento="share"
      data-ubicacion={ubicacion}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand/40 bg-card px-4 py-2.5 text-sm font-medium text-text hover:bg-brand-light"
    >
      {copiado ? <Check className="h-4 w-4 text-brand-ink" aria-hidden /> : <Share2 className="h-4 w-4 text-brand-ink" aria-hidden />}
      {copiado ? 'Enlace copiado' : etiqueta}
    </button>
  );
}
