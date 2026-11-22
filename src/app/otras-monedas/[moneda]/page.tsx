import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fuente } from '@/components/Fuente';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { fechaCorta, fechaLarga } from '@/lib/banxico/parse';
import { datosMonedas, MONEDAS } from '@/lib/banxico/monedas';
import { url } from '@/lib/sitio';

export const revalidate = 3600;
export const dynamicParams = false;
export function generateStaticParams() {
  return MONEDAS.map((m) => ({ moneda: m.slug }));
}

type Props = { params: Promise<{ moneda: string }> };

async function cargar(slug: string) {
  return (await datosMonedas()).find((m) => m.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moneda } = await params;
  const m = await cargar(moneda);
  if (!m) return { title: 'Moneda no disponible', robots: { index: false } };
  const title = `Tipo de cambio del ${m.nombre.toLowerCase()} hoy: $${m.actual.valor.toFixed(m.decimales)} pesos`;
  return {
    title,
    description: `Cuántos pesos vale el ${m.nombre.toLowerCase()} (${m.codigo}) según el Banco de México, con el historial de los últimos días.`,
    alternates: { canonical: url(`/otras-monedas/${m.slug}`) },
  };
}

export default async function MonedaPage({ params }: Props) {
  const { moneda } = await params;
  const m = await cargar(moneda);
  if (!m) notFound();
  const cambio = m.anterior ? m.actual.valor - m.anterior.valor : null;
  const recientes = m.puntos.slice(-15).reverse();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/otras-monedas" className="text-sm underline underline-offset-2">
        Otras monedas
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-text">
        Tipo de cambio del {m.nombre.toLowerCase()} hoy ({m.codigo} a MXN)
      </h1>
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-text-soft">{fechaLarga(m.actual.fecha)}</p>
        <p className="text-5xl font-bold tabular-nums text-text">${m.actual.valor.toFixed(m.decimales)}</p>
        <p className="mt-1 text-sm text-text-soft">
          pesos por {m.nombre.toLowerCase()}
          {cambio !== null && (
            <>
              {' · '}
              <span className="font-medium text-text">
                {cambio > 0 ? '▲' : cambio < 0 ? '▼' : ''} {Math.abs(cambio).toFixed(m.decimales)}
              </span>{' '}
              vs. el dato anterior
            </>
          )}
        </p>
        <Fuente serieId={m.id} fecha={m.actual.fecha} />
      </section>

      <h2 className="mt-10 text-xl font-semibold text-text">Últimos datos</h2>
      <ul className="mt-3 divide-y divide-border text-sm">
        {recientes.map((p) => (
          <li key={p.fecha} className="flex justify-between py-2 tabular-nums">
            <span>{fechaCorta(p.fecha)}</span>
            <span>${p.valor.toFixed(m.decimales)}</span>
          </li>
        ))}
      </ul>

      <TarjetaNoud
        titulo="¿Facturas en otras monedas?"
        texto="Noud XML lee tus CFDI en moneda extranjera y concilia sus pagos en tus papeles de trabajo."
        campana={`moneda-${m.slug}`}
        ubicacion="final"
      />
    </main>
  );
}
