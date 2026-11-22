'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NoudMark } from '@/components/NoudMark';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NOUD, conUtm, enlaceNoud } from '@/lib/sitio';

// Rutas internas (next/link agrega /indicadores solo). Agrega aquí cada página nueva.
const INDICADORES = [
  { href: '/', texto: 'Todos los indicadores' },
  { href: '/tipo-de-cambio', texto: 'Tipo de cambio DOF hoy' },
  { href: '/udis', texto: 'Valor de la UDI hoy' },
  { href: '/uma', texto: 'UMA 2026' },
  { href: '/salario-minimo', texto: 'Salario mínimo 2026' },
  { href: '/otras-monedas', texto: 'Euro y otras monedas' },
];
const HERRAMIENTAS = [
  { href: '/calculadora-aguinaldo', texto: 'Calculadora de aguinaldo 2026' },
  { href: '/calculadora-isr-salarios', texto: 'ISR por sueldos y salarios' },
  { href: '/calculadora-iva-retenciones', texto: 'IVA y retenciones al facturar' },
  { href: '/calculadora-actualizacion-recargos', texto: 'Actualización y recargos SAT' },
  { href: '/convertidor-dolares-pesos', texto: 'Convertidor de dólares a pesos' },
  { href: '/verificador-tipo-cambio-cfdi', texto: 'Verificador de tipo de cambio en CFDI' },
];

/** Menú desplegable de escritorio. Se cierra al hacer clic fuera o al navegar. */
function Desplegable({ titulo, items }: { titulo: string; items: { href: string; texto: string }[] }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setAbierto(false), [pathname]);
  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener('mousedown', cerrar);
    return () => document.removeEventListener('mousedown', cerrar);
  }, [abierto]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex items-center gap-1 whitespace-nowrap hover:text-text"
      >
        {titulo}
        <span className={`text-xs transition ${abierto ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {abierto && (
        <div className="absolute left-0 top-full z-30 mt-3 w-72 rounded-2xl border border-border bg-card p-2 shadow-lg">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="block rounded-xl px-3 py-2 text-text hover:bg-soft"
            >
              {i.texto}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Encabezado() {
  const [movilAbierto, setMovilAbierto] = useState(false);
  const pathname = usePathname();
  useEffect(() => setMovilAbierto(false), [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Indicadores Noud XML, inicio">
          <NoudMark />
          <span className="whitespace-nowrap font-semibold text-text">
            Noud <span className="font-normal text-text-soft">· Indicadores</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-text-soft md:flex">
          <Desplegable titulo="Indicadores" items={INDICADORES} />
          <Desplegable titulo="Calculadoras" items={HERRAMIENTAS} />
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          <ThemeToggle />
          <a href={conUtm(NOUD.planes, 'encabezado', 'planes')} className="hidden whitespace-nowrap text-text-soft hover:text-text lg:inline">
            Planes
          </a>
          <a href={NOUD.login} className="hidden whitespace-nowrap text-text-soft hover:text-text lg:inline">
            Iniciar sesión
          </a>
          <a
            href={enlaceNoud('encabezado', 'boton-registro')}
            data-evento="click_noud"
            data-ubicacion="encabezado"
            className="whitespace-nowrap rounded-xl bg-brand px-3.5 py-2 font-medium text-on-brand hover:bg-brand-hover"
          >
            Crear cuenta gratis
          </a>
          <button
            type="button"
            onClick={() => setMovilAbierto((v) => !v)}
            aria-expanded={movilAbierto}
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-text md:hidden"
          >
            {movilAbierto ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {movilAbierto && (
        <nav className="border-t border-border bg-card px-4 py-4 text-sm md:hidden">
          <p className="px-1 text-xs font-medium uppercase tracking-wide text-text-soft">Indicadores</p>
          {INDICADORES.map((i) => (
            <Link key={i.href} href={i.href} className="block rounded-lg px-1 py-2 text-text">
              {i.texto}
            </Link>
          ))}
          <p className="mt-3 px-1 text-xs font-medium uppercase tracking-wide text-text-soft">Calculadoras</p>
          {HERRAMIENTAS.map((i) => (
            <Link key={i.href} href={i.href} className="block rounded-lg px-1 py-2 text-text">
              {i.texto}
            </Link>
          ))}
          <div className="mt-3 flex gap-4 border-t border-border px-1 pt-3 text-text-soft">
            <a href={conUtm(NOUD.planes, 'menu-movil', 'planes')}>Planes</a>
            <a href={NOUD.login}>Iniciar sesión</a>
          </div>
        </nav>
      )}
    </header>
  );
}
