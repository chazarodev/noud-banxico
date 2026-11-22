import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fuente } from '@/components/Fuente';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { esFechaISO, fechaCorta, fechaLarga, formatoNumero } from '@/lib/banxico/parse';
import { SERIES } from '@/lib/banxico/series';
import {
  datosTipoDeCambio,
  fechaEnRango,
  sumarDias,
  vistaDelDia,
} from '@/lib/banxico/tipo-de-cambio';
import { url } from '@/lib/sitio';

// Ninguna fecha se genera en el build: cada una se crea en su primera visita y queda en caché.
// Todas leen los mismos históricos en caché: no hay una consulta a Banxico por fecha.
export const revalidate = 86400;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

const S = SERIES.tipoCambioDOF;
const D = S.decimales;

type Props = { params: Promise<{ fecha: string }> };

async function cargar(fecha: string) {
  if (!esFechaISO(fecha)) return null;
  const d = await datosTipoDeCambio();
  if (!fechaEnRango(d, fecha)) return null;
  const vista = vistaDelDia(d, fecha);
  if (!vista.publicacion || !vista.operacion) return null;
  return { d, ...vista, publicacion: vista.publicacion, operacion: vista.operacion };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fecha } = await params;
  const r = await cargar(fecha);
  if (!r) return { title: 'Fecha no encontrada', robots: { index: false } };

  const pub = formatoNumero(r.publicacion.punto.valor, D);
  const op = formatoNumero(r.operacion.punto.valor, D);
  const title = r.publicacion.exacto
    ? `Tipo de cambio DOF del ${fechaLarga(fecha)}: $${pub}`
    : `Tipo de cambio del ${fechaLarga(fecha)}: $${op} para operaciones`;
  const description = r.publicacion.exacto
    ? `El ${fechaLarga(fecha)} se publicó en el DOF un tipo de cambio de $${pub} pesos por dólar. Para registrar operaciones de ese día corresponde $${op}.`
    : `El ${fechaLarga(fecha)} no hubo publicación en el DOF. Para registrar operaciones de ese día corresponde $${op} pesos por dólar.`;

  return {
    title,
    description,
    alternates: { canonical: url(`${S.ruta}/${fecha}`) },
    openGraph: { title, description, url: url(`${S.ruta}/${fecha}`), locale: 'es_MX' },
  };
}

export default async function TipoDeCambioFechaPage({ params }: Props) {
  const { fecha } = await params;
  const r = await cargar(fecha);
  if (!r) notFound();

  const { d, publicacion, operacion, origenOperacion, fixReciente } = r;
  const diaAnterior = sumarDias(fecha, -1);
  const diaSiguiente = sumarDias(fecha, 1);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm">
        <Link href={S.ruta} className="underline underline-offset-2">
          Tipo de cambio DOF hoy
        </Link>
      </p>

      <h1 className="mt-2 text-3xl font-semibold text-text">
        Tipo de cambio DOF del {fechaLarga(fecha)}
      </h1>

      <section className="mt-6 rounded-2xl border border-border bg-card shadow-sm p-6">
        {publicacion.exacto ? (
          <p className="text-sm font-medium text-text-soft">Publicado en el DOF este día</p>
        ) : (
          <p className="text-sm font-medium text-warning-ink">
            Este día no hubo publicación en el DOF (fin de semana o día inhábil). Última publicación:{' '}
            {fechaLarga(publicacion.punto.fecha)}.
          </p>
        )}
        <p className="text-5xl font-bold tabular-nums text-text">
          ${formatoNumero(publicacion.punto.valor, D)}
        </p>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card shadow-sm p-5">
          <p className="text-sm font-medium text-text-soft">Para registrar operaciones de este día</p>
          <p className="text-3xl font-bold tabular-nums text-text">
            ${formatoNumero(operacion.punto.valor, D)}
          </p>
          <p className="mt-2 text-xs text-text-soft">
            Publicado en el DOF el día hábil anterior
            {origenOperacion ? ` (${fechaLarga(origenOperacion.punto.fecha)})` : ''}.
          </p>
        </section>
        {fixReciente && (
          <section className="rounded-2xl border border-border bg-card shadow-sm p-5">
            <p className="text-sm font-medium text-text-soft">
              {fixReciente.exacto ? 'FIX determinado este día' : 'Último FIX determinado'}
            </p>
            <p className="text-3xl font-bold tabular-nums text-text">
              ${formatoNumero(fixReciente.punto.valor, D)}
            </p>
            <p className="mt-2 text-xs text-text-soft">
              {fixReciente.exacto
                ? 'Se publica en el DOF el siguiente día hábil.'
                : `Determinado el ${fechaLarga(fixReciente.punto.fecha)}.`}
            </p>
          </section>
        )}
      </div>
      <Fuente serieId={`${SERIES.tipoCambioDOF.id} y ${SERIES.fix.id}`} />

      <nav className="mt-6 flex justify-between text-sm">
        {fechaEnRango(d, diaAnterior) ? (
          <Link href={`${S.ruta}/${diaAnterior}`} className="underline underline-offset-2">
            ← {fechaCorta(diaAnterior)}
          </Link>
        ) : (
          <span />
        )}
        {fechaEnRango(d, diaSiguiente) && (
          <Link href={`${S.ruta}/${diaSiguiente}`} className="underline underline-offset-2">
            {fechaCorta(diaSiguiente)} →
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
