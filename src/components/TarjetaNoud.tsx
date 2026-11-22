import { NoudMark } from '@/components/NoudMark';
import { enlaceNoud } from '@/lib/sitio';

type Props = {
  titulo: string;
  texto: string;
  cta?: string;
  campana: string; // utm_campaign, p. ej. 'tipo-de-cambio'
  ubicacion: string; // utm_content, p. ej. 'bajo-dato'
};

/** Tarjeta hacia Noud XML con los colores de la marca. Altura estable para no mover la página (CLS). */
export function TarjetaNoud({ titulo, texto, cta = 'Crear cuenta gratis', campana, ubicacion }: Props) {
  return (
    <aside className="mt-8 flex gap-4 rounded-2xl border border-brand/30 bg-brand-light p-5">
      <NoudMark className="hidden h-10 w-10 shrink-0 sm:block" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brand-ink">Noud XML</p>
        <h2 className="mt-1 text-lg font-semibold text-text">{titulo}</h2>
        <p className="mt-1 text-sm text-text-soft">{texto}</p>
        <a
          href={enlaceNoud(campana, ubicacion)}
          data-evento="click_noud"
          data-ubicacion={ubicacion}
          className="mt-4 inline-block rounded-xl bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
        >
          {cta}
        </a>
        <p className="mt-2 text-xs text-text-soft">Plan gratuito sin tarjeta.</p>
      </div>
    </aside>
  );
}
