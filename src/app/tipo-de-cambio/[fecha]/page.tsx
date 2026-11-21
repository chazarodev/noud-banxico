import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fuente } from '@/components/Fuente';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { esFechaISO, fechaCorta, fechaLarga, formatoNumero, hoyCDMX } from '@/lib/banxico/parse';
import { SERIES } from '@/lib/banxico/series';
import { buscarFecha, resumenDOF } from '@/lib/banxico/tipo-de-cambio';
import { url } from '@/lib/sitio';

// Ninguna fecha se genera en el build: cada una se crea en su primera visita y queda en caché.
// Todas leen el mismo histórico en caché, así que no hay una consulta a Banxico por fecha.
export const revalidate = 86400;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

const S = SERIES.tipoCambioDOF;

type Props = { params: Promise<{ fecha: string }> };

async function cargar(fecha: string) {
  if (!esFechaISO(fecha) || fecha > hoyCDMX()) return null;
  const { puntos } = await resumenDOF();
  return buscarFecha(puntos, fecha);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fecha } = await params;
  const r = await cargar(fecha);
  if (!r) return { title: 'Fecha no encontrada', robots: { index: false } };

  const valor = formatoNumero(r.punto.valor, S.decimales);
  const title = `Tipo de cambio DOF del ${fechaLarga(fecha)}: $${valor}`;
  const description = r.exacto
    ? `El tipo de cambio publicado en el DOF el ${fechaLarga(fecha)} fue de $${valor} pesos por dólar.`
    : `El ${fechaLarga(fecha)} no hubo publicación en el DOF. La última publicada fue la del ${fechaLarga(r.punto.fecha)}: $${valor} pesos por dólar.`;

  return {
    title,
    description,
    // Los días sin publicación apuntan a la fecha publicada para no duplicar contenido.
    alternates: { canonical: url(`${S.ruta}/${r.punto.fecha}`) },
    openGraph: { title, description, url: url(`${S.ruta}/${fecha}`), locale: 'es_MX' },
  };
}

export default async function TipoDeCambioFechaPage({ params }: Props) {
  const { fecha } = await params;
  const r = await cargar(fecha);
  if (!r) notFound();

  const { punto, exacto, anterior, siguiente } = r;
  const cambio = exacto && anterior ? punto.valor - anterior.valor : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm">
        <Link href={S.ruta} className="underline underline-offset-2">
          Tipo de cambio DOF hoy
        </Link>
      </p>

      <h1 className="mt-2 text-3xl font-semibold text-neutral-900">
        Tipo de cambio DOF del {fechaLarga(fecha)}
      </h1>

      {!exacto && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          El {fechaLarga(fecha)} no hubo publicación en el DOF (fin de semana o día inhábil). Se muestra la
          última publicación anterior, del {fechaLarga(punto.fecha)}.
        </p>
      )}

      <section className="mt-6 rounded-2xl border border-neutral-200 p-6">
        <p className="text-5xl font-bold tabular-nums text-neutral-900">
          ${formatoNumero(punto.valor, S.decimales)}
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          Pesos por dólar · publicado el {fechaLarga(punto.fecha)}
          {cambio !== null && (
            <>
              {' · '}
              {cambio > 0 ? '+' : ''}
              {formatoNumero(cambio, S.decimales)} vs. la publicación anterior
            </>
          )}
        </p>
        <Fuente serieId={S.id} fecha={punto.fecha} />
      </section>

      <nav className="mt-6 flex justify-between text-sm">
        {anterior ? (
          <Link href={`${S.ruta}/${anterior.fecha}`} className="underline underline-offset-2">
            ← {fechaCorta(anterior.fecha)}
          </Link>
        ) : (
          <span />
        )}
        {siguiente && (
          <Link href={`${S.ruta}/${siguiente.fecha}`} className="underline underline-offset-2">
            {fechaCorta(siguiente.fecha)} →
          </Link>
        )}
      </nav>

      <TarjetaNoud
        titulo="Convierte tus facturas en dólares sin hacerlo a mano"
        texto="Noud XML toma tus XML de CFDI y concilia los pagos en moneda extranjera por ti."
        campana="tipo-de-cambio-fecha"
        ubicacion="bajo-navegacion"
      />
    </main>
  );
}
