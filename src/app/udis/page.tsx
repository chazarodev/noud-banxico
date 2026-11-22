import type { Metadata } from 'next';
import Link from 'next/link';
import { ConvertidorUdis } from '@/components/ConvertidorUdis';
import { Fuente } from '@/components/Fuente';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { fechaCorta, fechaLarga } from '@/lib/banxico/parse';
import { SERIES } from '@/lib/banxico/series';
import { sumarDias } from '@/lib/banxico/tipo-de-cambio';
import { datosUdis } from '@/lib/banxico/udis';
import { url } from '@/lib/sitio';

export const revalidate = 3600;
const RUTA = '/udis';
const udi = (n: number) => n.toFixed(6);

export async function generateMetadata(): Promise<Metadata> {
  const d = await datosUdis();
  const title = d.actual
    ? `Valor de la UDI hoy: $${udi(d.actual.punto.valor)} (${fechaLarga(d.hoy)})`
    : 'Valor de la UDI hoy';
  return {
    title,
    description:
      'Valor diario de las UDIS publicado por Banxico, valores ya conocidos de los próximos días y convertidor de UDIS a pesos para créditos Infonavit e hipotecarios.',
    alternates: { canonical: url(RUTA) },
  };
}

export default async function UdisPage() {
  const d = await datosUdis();
  const desde = sumarDias(d.hoy, -730);
  const recientes = d.puntos.filter((p) => p.fecha <= d.hoy).slice(-10).reverse();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm font-medium text-brand-ink">Unidades de Inversión · Banxico</p>
      <h1 className="mt-1 text-3xl font-semibold text-text">Valor de la UDI hoy</h1>

      {d.actual && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-text-soft">{fechaLarga(d.hoy)}</p>
          <p className="text-5xl font-bold tabular-nums text-text">${udi(d.actual.punto.valor)}</p>
          <p className="mt-1 text-sm text-text-soft">pesos por UDI</p>
          <Fuente serieId={SERIES.udis.id} fecha={d.actual.punto.fecha} />
        </section>
      )}

      <h2 className="mt-10 text-xl font-semibold text-text">Convertidor de UDIS a pesos</h2>
      <ConvertidorUdis hoy={d.hoy} puntos={d.puntos.filter((p) => p.fecha >= desde)} />

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold text-text">Últimos 10 días</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {recientes.map((p) => (
              <li key={p.fecha} className="flex justify-between py-2 tabular-nums">
                <Link href={`${RUTA}/${p.fecha}`} className="underline underline-offset-2">
                  {fechaCorta(p.fecha)}
                </Link>
                <span>${udi(p.valor)}</span>
              </li>
            ))}
          </ul>
        </section>
        {d.proximos.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-text">Ya publicados</h2>
            <p className="text-sm text-text-soft">Banxico da a conocer las UDIS por adelantado.</p>
            <ul className="mt-3 max-h-80 divide-y divide-border overflow-y-auto text-sm">
              {d.proximos.map((p) => (
                <li key={p.fecha} className="flex justify-between py-2 tabular-nums">
                  <Link href={`${RUTA}/${p.fecha}`} className="underline underline-offset-2">
                    {fechaCorta(p.fecha)}
                  </Link>
                  <span>${udi(p.valor)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <section className="mt-10 max-w-3xl space-y-3 text-sm text-text-soft">
        <h2 className="text-xl font-semibold text-text">¿Qué son las UDIS?</h2>
        <p>
          Las Unidades de Inversión son una unidad de cuenta que sube con la inflación. Se usan en créditos
          hipotecarios e Infonavit, bonos gubernamentales y algunos contratos, para que el monto mantenga su valor real.
          Para saber cuánto vale tu saldo en pesos, multiplica las UDIS por el valor de la UDI del día.
        </p>
      </section>

      <TarjetaNoud
        titulo="Tus números del mes, a partir de tus CFDI"
        texto="Noud XML convierte tus XML en papeles de trabajo: cuentas por pagar y cobrar, IVA, ISR y DIOT."
        campana="udis"
        ubicacion="final"
      />
    </main>
  );
}
