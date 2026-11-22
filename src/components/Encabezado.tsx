import Link from 'next/link';
import { NoudMark } from '@/components/NoudMark';
import { NOUD, conUtm, enlaceNoud } from '@/lib/sitio';

// Rutas internas (next/link agrega /indicadores solo). Agrega aquí cada página nueva.
const NAV = [
  { href: '/tipo-de-cambio', texto: 'Tipo de cambio' },
  { href: '/calculadora-aguinaldo', texto: 'Aguinaldo 2026' },
  { href: '/calculadora-isr-salarios', texto: 'ISR sueldos' },
  { href: '/convertidor-dolares-pesos', texto: 'Convertidor USD' },
];

export function Encabezado() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Indicadores Noud XML, inicio">
          <NoudMark />
          <span className="font-semibold text-text">
            Noud <span className="font-normal text-text-soft">· Indicadores</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-text-soft lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-text">
              {n.texto}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 text-sm">
          <a href={conUtm(NOUD.planes, 'encabezado', 'planes')} className="hidden text-text-soft hover:text-text sm:inline">
            Planes
          </a>
          <a href={NOUD.login} className="hidden text-text-soft hover:text-text sm:inline">
            Iniciar sesión
          </a>
          <a
            href={enlaceNoud('encabezado', 'boton-registro')}
            data-evento="click_noud"
            data-ubicacion="encabezado"
            className="rounded-xl bg-brand px-3.5 py-2 font-medium text-on-brand hover:bg-brand-hover"
          >
            Crear cuenta gratis
          </a>
        </div>
      </div>
    </header>
  );
}
