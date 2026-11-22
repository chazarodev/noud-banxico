import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fuente } from '@/components/Fuente';
import { esFechaISO, fechaCorta, fechaLarga } from '@/lib/banxico/parse';
import { SERIES } from '@/lib/banxico/series';
import { buscarFecha, sumarDias } from '@/lib/banxico/tipo-de-cambio';
import { datosUdis } from '@/lib/banxico/udis';
import { url } from '@/lib/sitio';

export const revalidate = 86400;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ fecha: string }> };
const udi = (n: number) => n.toFixed(6);

async function cargar(fecha: string) {
  if (!esFechaISO(fecha)) return null;
  const d = await datosUdis();
  if (!d.primeraFecha || !d.ultimaFecha || fecha < d.primeraFecha || fecha > d.ultimaFecha) return null;
  const r = buscarFecha(d.puntos, fecha);
  return r ? { d, r } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fecha } = await params;
  const x = await cargar(fecha);
  if (!x) return { title: 'Fecha no encontrada', robots: { index: false } };
  const title = `Valor de la UDI el ${fechaLarga(fecha)}: $${udi(x.r.punto.valor)}`;
  return {
    title,
    description: `El ${fechaLarga(fecha)} la UDI valió $${udi(x.r.punto.valor)} pesos, según el Banco de México.`,
    alternates: { canonical: url(`/udis/${fecha}`) },
  };
}

export default async function UdiFechaPage({ params }: Props) {
  const { fecha } = await params;
  const x = await cargar(fecha);
  if (!x) notFound();
  const { d, r } = x;
  const antes = sumarDias(fecha, -1);
  const despues = sumarDias(fecha, 1);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/udis" className="text-sm underline underline-offset-2">
        Valor de la UDI hoy
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-text">Valor de la UDI el {fechaLarga(fecha)}</h1>
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-5xl font-bold tabular-nums text-text">${udi(r.punto.valor)}</p>
        <p className="mt-1 text-sm text-text-soft">pesos por UDI</p>
        <Fuente serieId={SERIES.udis.id} fecha={r.punto.fecha} />
      </section>
      <nav className="mt-6 flex justify-between text-sm">
        {d.primeraFecha && antes >= d.primeraFecha ? (
          <Link href={`/udis/${antes}`} className="underline underline-offset-2">
            ← {fechaCorta(antes)}
          </Link>
        ) : (
          <span />
        )}
        {d.ultimaFecha && despues <= d.ultimaFecha && (
          <Link href={`/udis/${despues}`} className="underline underline-offset-2">
            {fechaCorta(despues)} →
          </Link>
        )}
      </nav>
    </main>
  );
}
