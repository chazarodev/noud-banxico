import { enlaceNoud } from '@/lib/sitio';

type Props = {
  titulo: string;
  texto: string;
  cta?: string;
  campana: string; // utm_campaign, p. ej. 'tipo-de-cambio'
  ubicacion: string; // utm_content, p. ej. 'bajo-dato'
};

/** Tarjeta hacia Noud XML. Altura estable para no mover la página al cargar (CLS). */
export function TarjetaNoud({ titulo, texto, cta = 'Crear cuenta gratis', campana, ubicacion }: Props) {
  return (
    <aside className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Noud XML</p>
      <h2 className="mt-1 text-lg font-semibold text-neutral-900">{titulo}</h2>
      <p className="mt-1 text-sm text-neutral-700">{texto}</p>
      <a
        href={enlaceNoud(campana, ubicacion)}
        data-evento="click_noud"
        data-ubicacion={ubicacion}
        className="mt-4 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
      >
        {cta}
      </a>
    </aside>
  );
}
