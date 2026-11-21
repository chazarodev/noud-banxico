import type { Metadata } from 'next';
import Link from 'next/link';
import { Fuente } from '@/components/Fuente';
import { JsonLd } from '@/components/JsonLd';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { fechaCorta, fechaLarga, formatoNumero } from '@/lib/banxico/parse';
import { SERIES } from '@/lib/banxico/series';
import { resumenDOF } from '@/lib/banxico/tipo-de-cambio';
import { url } from '@/lib/sitio';

// La página se regenera como máximo cada 6 horas; las visitas no llaman a Banxico.
export const revalidate = 21600;

const S = SERIES.tipoCambioDOF;

export async function generateMetadata(): Promise<Metadata> {
  const { actual } = await resumenDOF();
  const title = actual
    ? `Tipo de cambio DOF hoy: $${formatoNumero(actual.valor, S.decimales)} (${fechaLarga(actual.fecha)})`
    : 'Tipo de cambio DOF hoy';
  const description =
    'Tipo de cambio para solventar obligaciones en moneda extranjera publicado por Banxico en el DOF: valor de hoy, publicaciones recientes e historial por fecha.';
  return {
    title,
    description,
    alternates: { canonical: url(S.ruta) },
    openGraph: { title, description, url: url(S.ruta), type: 'website', locale: 'es_MX' },
  };
}

export default async function TipoDeCambioPage() {
  const { puntos, actual, anterior } = await resumenDOF();

  if (!actual) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold">Tipo de cambio DOF hoy</h1>
        <p className="mt-4 text-neutral-600">No pudimos obtener el dato en este momento. Intenta más tarde.</p>
      </main>
    );
  }

  const cambio = anterior ? actual.valor - anterior.valor : null;
  const recientes = puntos.slice(-10).reverse();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        datos={{
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: 'Tipo de cambio para solventar obligaciones en moneda extranjera (DOF)',
          description:
            'Pesos por dólar de EE. UU. publicados por el Banco de México en el Diario Oficial de la Federación.',
          url: url(S.ruta),
          creator: { '@type': 'Organization', name: 'Banco de México', url: 'https://www.banxico.org.mx' },
          temporalCoverage: `${puntos[0]?.fecha}/${actual.fecha}`,
          isAccessibleForFree: true,
        }}
      />

      <h1 className="text-3xl font-semibold text-neutral-900">Tipo de cambio DOF hoy</h1>
      <p className="mt-1 text-neutral-600">
        Pesos por dólar para solventar obligaciones en moneda extranjera
      </p>

      <section className="mt-6 rounded-2xl border border-neutral-200 p-6">
        <p className="text-5xl font-bold tabular-nums text-neutral-900">
          ${formatoNumero(actual.valor, S.decimales)}
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          Publicado en el DOF el {fechaLarga(actual.fecha)}
          {cambio !== null && (
            <>
              {' · '}
              <span className={cambio > 0 ? 'text-red-700' : cambio < 0 ? 'text-green-700' : ''}>
                {cambio > 0 ? '+' : ''}
                {formatoNumero(cambio, S.decimales)}
              </span>{' '}
              vs. la publicación anterior
            </>
          )}
        </p>
        <Fuente serieId={S.id} fecha={actual.fecha} />
      </section>

      <TarjetaNoud
        titulo="¿Facturas o recibes pagos en dólares?"
        texto="Noud XML concilia tus complementos de pago en moneda extranjera a partir de tus XML de CFDI."
        campana="tipo-de-cambio"
        ubicacion="bajo-dato"
      />

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">Últimas publicaciones</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="py-2 font-medium">Fecha de publicación</th>
              <th className="py-2 text-right font-medium">Pesos por dólar</th>
            </tr>
          </thead>
          <tbody>
            {recientes.map((p: any) => (
              <tr key={p.fecha} className="border-b border-neutral-100">
                <td className="py-2">
                  <Link href={`${S.ruta}/${p.fecha}`} className="underline underline-offset-2">
                    {fechaCorta(p.fecha)}
                  </Link>
                </td>
                <td className="py-2 text-right tabular-nums">${formatoNumero(p.valor, S.decimales)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-10 space-y-3 text-neutral-700">
        <h2 className="text-xl font-semibold text-neutral-900">¿Qué es el tipo de cambio DOF?</h2>
        <p>
          Es el tipo de cambio que el Banco de México publica en el Diario Oficial de la Federación para
          solventar obligaciones denominadas en dólares de EE. UU. pagaderas en México. Se publica en días
          hábiles bancarios.
        </p>
        <p>
          En materia fiscal es el tipo de cambio de referencia para convertir operaciones en dólares. La fecha
          que corresponde a cada operación depende de las reglas aplicables; confírmala con tu contador.
        </p>
      </section>
    </main>
  );
}
