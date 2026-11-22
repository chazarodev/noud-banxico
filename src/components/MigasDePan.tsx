import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { url } from '@/lib/sitio';

type Miga = { nombre: string; ruta?: string }; // la última va sin ruta (página actual)

/** Ruta de navegación visible + BreadcrumbList para Google (la muestra en lugar de la URL). */
export function MigasDePan({ migas }: { migas: Miga[] }) {
  const todas: Miga[] = [{ nombre: 'Indicadores', ruta: '/' }, ...migas];
  return (
    <>
      <JsonLd
        datos={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: todas.map((m, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: m.nombre,
            ...(m.ruta !== undefined ? { item: url(m.ruta === '/' ? '' : m.ruta) } : {}),
          })),
        }}
      />
      <nav aria-label="Ruta de navegación" className="text-sm text-text-soft">
        <ol className="flex flex-wrap items-center gap-1.5">
          {todas.map((m, i) => (
            <li key={m.nombre} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>›</span>}
              {m.ruta !== undefined ? (
                <Link href={m.ruta} className="hover:text-text hover:underline">
                  {m.nombre}
                </Link>
              ) : (
                <span aria-current="page" className="text-text">
                  {m.nombre}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
