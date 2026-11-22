import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fuente } from '@/components/Fuente';
import { MigasDePan } from '@/components/MigasDePan';
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
  const variacion = r.anterior ? ((r.punto.valor / r.anterior.valor - 1) * 100) : null;
  const mes = fecha.slice(0, 7);
  const delMes = d.puntos.filter((p) => p.fecha.startsWith(mes));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <MigasDePan migas={[{ nombre: 'UDIS', ruta: '/udis' }, { nombre: fechaLarga(fecha) }]} />
      <h1 className="mt-2 text-3xl font-semibold text-text">Valor de la UDI el {fechaLarga(fecha)}</h1>
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-5xl font-bold tabular-nums text-text">${udi(r.punto.valor)}</p>
        <p className="mt-1 text-sm text-text-soft">
          pesos por UDI
          {variacion !== null && ` · ${variacion >= 0 ? '+' : ''}${variacion.toFixed(4)}% vs. el día anterior`}
        </p>
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

      {delMes.length > 1 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text">
            UDIS de {fechaLarga(`${mes}-01`).replace(/^1 de /, '')}
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-3">
            {delMes.map((p) => (
              <li key={p.fecha} className="flex justify-between border-b border-border py-1.5 tabular-nums">
                {p.fecha === fecha ? (
                  <span className="font-semibold text-text">{fechaCorta(p.fecha)}</span>
                ) : (
                  <Link href={`/udis/${p.fecha}`} className="underline underline-offset-2">
                    {fechaCorta(p.fecha)}
                  </Link>
                )}
                <span>{p.valor.toFixed(6)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
