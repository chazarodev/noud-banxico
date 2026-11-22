import Link from 'next/link';

export const metadata = { title: 'Página no encontrada', robots: { index: false } };

const ENLACES = [
  ['/tipo-de-cambio', 'Tipo de cambio DOF hoy'],
  ['/calculadora-aguinaldo', 'Calculadora de aguinaldo 2026'],
  ['/calculadora-isr-salarios', 'ISR por sueldos y salarios'],
  ['/calculadora-iva-retenciones', 'IVA y retenciones al facturar'],
  ['/tablero', 'La economía de México hoy'],
  ['/udis', 'Valor de la UDI hoy'],
];

export default function NoEncontrada() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-medium text-brand-ink">Error 404</p>
      <h1 className="mt-1 text-3xl font-semibold text-text">No encontramos esta página</h1>
      <p className="mt-2 text-text-soft">
        Puede que la dirección esté mal escrita o que la fecha que buscas aún no tenga datos. Prueba con alguna de estas:
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {ENLACES.map(([href, texto]) => (
          <li key={href}>
            <Link href={href} className="block rounded-2xl border border-border bg-card p-4 font-medium text-text shadow-sm transition hover:border-border-strong hover:shadow-md">
              {texto} →
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
