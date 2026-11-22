import type { Metadata } from 'next';
import Link from 'next/link';
import { Fuente } from '@/components/Fuente';
import { JsonLd } from '@/components/JsonLd';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { fechaCorta, fechaLarga, formatoNumero } from '@/lib/banxico/parse';
import { SERIES } from '@/lib/banxico/series';
import { datosTipoDeCambio, vistaDelDia } from '@/lib/banxico/tipo-de-cambio';
import { url } from '@/lib/sitio';

// Se regenera cada hora para que "hoy" cambie poco después de medianoche.
// Regenerar no llama a Banxico: los datos tienen su propia caché (6 h y 24 h).
export const revalidate = 3600;

const S = SERIES.tipoCambioDOF;
const D = S.decimales;
const FUENTE_SERIES = `${SERIES.tipoCambioDOF.id} y ${SERIES.fix.id}`;

export async function generateMetadata(): Promise<Metadata> {
  const d = await datosTipoDeCambio();
  const { publicacion } = vistaDelDia(d, d.hoy);
  const title = publicacion
    ? `Tipo de cambio DOF hoy: $${formatoNumero(publicacion.punto.valor, D)} (${fechaLarga(publicacion.punto.fecha)})`
    : 'Tipo de cambio DOF hoy';
  const description =
    'Tipo de cambio publicado hoy en el DOF, el que corresponde para registrar las operaciones del día y el FIX más reciente de Banxico, con historial por fecha.';
  return {
    title,
    description,
    alternates: { canonical: url(S.ruta) },
    openGraph: { title, description, url: url(S.ruta), type: 'website', locale: 'es_MX' },
  };
}

function Cifra({ valor, grande = false }: { valor: number; grande?: boolean }) {
  return (
    <p className={`font-bold tabular-nums text-text ${grande ? 'text-5xl' : 'text-3xl'}`}>
      ${formatoNumero(valor, D)}
    </p>
  );
}

export default async function TipoDeCambioPage() {
  const d = await datosTipoDeCambio();
  const { hoy } = d;
  const { publicacion, operacion, origenOperacion, fixReciente, publicacionDelFix } = vistaDelDia(d, hoy);

  if (!publicacion || !operacion) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold">Tipo de cambio DOF hoy</h1>
        <p className="mt-4 text-text-soft">No pudimos obtener el dato en este momento. Intenta más tarde.</p>
      </main>
    );
  }

  const cambio = publicacion.anterior ? publicacion.punto.valor - publicacion.anterior.valor : null;
  const recientes = d.publicaciones.filter((p) => p.fecha <= hoy).slice(-10).reverse();
  const proximas = d.liquidacion.filter((p) => p.fecha > hoy);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        datos={{
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: 'Tipo de cambio para solventar obligaciones en moneda extranjera (DOF)',
          description:
            'Pesos por dólar de EE. UU. determinados por el Banco de México y publicados en el Diario Oficial de la Federación.',
          url: url(S.ruta),
          creator: { '@type': 'Organization', name: 'Banco de México', url: 'https://www.banxico.org.mx' },
          temporalCoverage: `${d.primeraFecha}/${publicacion.punto.fecha}`,
          isAccessibleForFree: true,
          license: 'https://www.banxico.org.mx/footer-es/salvedad-politicas-uso-banco-.html',
        }}
      />

      <h1 className="text-3xl font-semibold text-text">Tipo de cambio DOF hoy</h1>
      <p className="mt-1 text-text-soft">Pesos por dólar · {fechaLarga(hoy)}</p>

      {/* Dato principal: coincide con la consulta del DOF */}
      <section className="mt-6 rounded-2xl border border-border bg-card shadow-sm p-6">
        <p className="text-sm font-medium text-text-soft">
          {publicacion.exacto
            ? 'Publicado hoy en el DOF'
            : `Última publicación en el DOF (${fechaLarga(publicacion.punto.fecha)})`}
        </p>
        <Cifra valor={publicacion.punto.valor} grande />
        {cambio !== null && (
          <p className="mt-2 text-sm text-text-soft">
            <span className="font-medium text-text">
              {cambio > 0 ? '▲ ' : cambio < 0 ? '▼ ' : ''}
              {formatoNumero(Math.abs(cambio), D)}
            </span>{' '}
            vs. la publicación anterior ({fechaCorta(publicacion.anterior!.fecha)})
          </p>
        )}
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card shadow-sm p-5">
          <p className="text-sm font-medium text-text-soft">Para registrar operaciones de hoy</p>
          <Cifra valor={operacion.punto.valor} />
          <p className="mt-2 text-xs text-text-soft">
            Publicado en el DOF el día hábil anterior
            {origenOperacion ? ` (${fechaLarga(origenOperacion.punto.fecha)})` : ''}.
          </p>
        </section>
        {fixReciente && (
          <section className="rounded-2xl border border-border bg-card shadow-sm p-5">
            <p className="text-sm font-medium text-text-soft">FIX más reciente</p>
            <Cifra valor={fixReciente.punto.valor} />
            <p className="mt-2 text-xs text-text-soft">
              Determinado por Banxico el {fechaLarga(fixReciente.punto.fecha)}.{' '}
              {publicacionDelFix && publicacionDelFix.fecha > hoy
                ? `Se publicará en el DOF el ${fechaLarga(publicacionDelFix.fecha)}.`
                : 'Se publica en el DOF el siguiente día hábil.'}
            </p>
          </section>
        )}
      </div>
      <Fuente serieId={FUENTE_SERIES} />

      <TarjetaNoud
        titulo="¿Facturas o recibes pagos en dólares?"
        texto="Noud XML concilia tus complementos de pago en moneda extranjera a partir de tus XML de CFDI."
        campana="tipo-de-cambio"
        ubicacion="bajo-dato"
      />

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text">Publicaciones recientes en el DOF</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-soft">
              <th className="py-2 font-medium">Fecha de publicación</th>
              <th className="py-2 text-right font-medium">Pesos por dólar</th>
            </tr>
          </thead>
          <tbody>
            {recientes.map((p) => (
              <tr key={p.fecha} className="border-b border-border">
                <td className="py-2">
                  <Link href={`${S.ruta}/${p.fecha}`} className="underline underline-offset-2">
                    {fechaCorta(p.fecha)}
                  </Link>
                </td>
                <td className="py-2 text-right tabular-nums">${formatoNumero(p.valor, D)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {proximas.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text">Para operaciones de los próximos días</h2>
          <p className="mt-1 text-sm text-text-soft">
            Ya se conocen porque el FIX se determina antes de publicarse y aplicarse.
          </p>
          <ul className="mt-3 divide-y divide-border text-sm">
            {proximas.map((p) => (
              <li key={p.fecha} className="flex justify-between py-2 tabular-nums">
                <Link href={`${S.ruta}/${p.fecha}`} className="underline underline-offset-2">
                  {fechaCorta(p.fecha)}
                </Link>
                <span>${formatoNumero(p.valor, D)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10 space-y-3 text-text-soft">
        <h2 className="text-xl font-semibold text-text">¿Cómo funciona el tipo de cambio DOF?</h2>
        <p>
          El Banco de México determina el tipo de cambio FIX cada día hábil bancario a partir de las 12:00 horas.
          Lo publica en el Diario Oficial de la Federación el siguiente día hábil, y ese valor se usa para
          solventar obligaciones en dólares que se liquidan en México al día siguiente de la publicación.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Día 1: Banxico determina el FIX.</li>
          <li>Día hábil siguiente: se publica en el DOF.</li>
          <li>Día siguiente a la publicación: se usa para liquidar obligaciones y registrar operaciones.</li>
        </ol>
        <p>
          Contablemente, las operaciones de un día suelen registrarse con el tipo de cambio publicado en el DOF
          el día hábil anterior. Confirma con tu contador el criterio que aplica a cada operación.
        </p>
      </section>
    </main>
  );
}
