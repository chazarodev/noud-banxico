import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BotonCompartir } from '@/components/BotonCompartir';
import { url } from '@/lib/sitio';

type Props = {
  /** Ruta de la página actual, sin basePath: '/calculadora-aguinaldo'. */
  ruta: string;
  texto: string;
  campana: string;
  /** Nombre corto para Analytics: 'aguinaldo', 'isr'… */
  ubicacion: string;
  atajos: { href: string; etiqueta: string }[];
};

/** Debajo del resultado: compartir y dos accesos a otras herramientas. Pensado para el celular. */
export function AccionesResultado({ ruta, texto, campana, ubicacion, atajos }: Props) {
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <BotonCompartir
        enlace={url(ruta)}
        texto={texto}
        campana={campana}
        ubicacion={`resultado-${ubicacion}`}
        etiqueta="Compártela con tus compañeros"
      />
      <div className="flex flex-wrap gap-2">
        {atajos.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            data-evento="atajo"
            data-ubicacion={`resultado-${ubicacion}${a.href}`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-text hover:border-brand/40"
          >
            {a.etiqueta}
            <ArrowRight className="h-3.5 w-3.5 text-text-soft" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}