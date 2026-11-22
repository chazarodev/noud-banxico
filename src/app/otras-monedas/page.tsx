import type { Metadata } from 'next';
import Link from 'next/link';
import { fechaCorta } from '@/lib/banxico/parse';
import { datosMonedas } from '@/lib/banxico/monedas';
import { url } from '@/lib/sitio';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Tipo de cambio del euro, yen, dólar canadiense y otras monedas hoy',
  description:
    'Cuántos pesos vale hoy el euro, el dólar canadiense, el yen y otras divisas, con los tipos de cambio cruzados que publica el Banco de México.',
  alternates: { canonical: url('/otras-monedas') },
};

export default async function OtrasMonedasPage() {
  const monedas = await datosMonedas();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm font-medium text-brand-ink">Pesos por divisa · Banxico</p>
      <h1 className="mt-1 text-3xl font-semibold text-text">Tipo de cambio de otras monedas</h1>
      <p className="mt-2 max-w-2xl text-text-soft">
        Tipos de cambio cruzados: se calculan con el FIX del peso frente al dólar y la cotización de cada moneda frente
        al dólar. Para el dólar estadounidense consulta el{' '}
        <Link href="/tipo-de-cambio" className="underline underline-offset-2">
          tipo de cambio DOF
        </Link>
        .
      </p>

      {monedas.length === 0 ? (
        <p className="mt-6 text-text-soft">Los tipos de cambio no están disponibles en este momento.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {monedas.map((m) => (
            <Link
              key={m.slug}
              href={`/otras-monedas/${m.slug}`}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-border-strong hover:shadow-md"
            >
              <p className="text-sm font-medium text-text-soft">
                {m.nombre} <span className="text-xs">({m.codigo})</span>
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-text">${m.actual.valor.toFixed(m.decimales)}</p>
              <p className="text-xs text-text-soft">pesos por {m.nombre.toLowerCase()} · {fechaCorta(m.actual.fecha)}</p>
              <p className="mt-3 text-sm font-medium text-brand-ink">Ver detalle →</p>
            </Link>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-text-soft">
        Fuente: Banco de México, con datos del FMI y del Banco de Canadá. Valores informativos; para obligaciones
        fiscales en otras monedas, el SAT usa la tabla mensual de equivalencias que publica Banxico en el DOF.
      </p>
    </main>
  );
}
