import type { Metadata } from 'next';
import Link from 'next/link';
import { Fuente } from '@/components/Fuente';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { GraficaDolar } from '@/components/graficas/GraficaDolar';
import { datosDolarHistorico } from '@/lib/banxico/graficas';
import { fechaLarga } from '@/lib/banxico/parse';
import { url } from '@/lib/sitio';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Precio del dólar histórico en México (FIX de Banxico desde 1991)',
  description:
    'Gráfica del tipo de cambio peso-dólar FIX de Banxico: último mes, año, 5 años y desde 1991, con máximos, mínimos y variación del periodo.',
  alternates: { canonical: url('/dolar-historico') },
};

export default async function DolarHistoricoPage() {
  const d = await datosDolarHistorico();
  const anio = d.resumen['1a'];
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm font-medium text-brand-ink">Gráficas · Tipo de cambio FIX</p>
      <h1 className="mt-1 text-3xl font-semibold text-text">Precio del dólar histórico</h1>
      {d.ultimo && anio && (
        <p className="mt-2 max-w-3xl text-text-soft">
          El FIX del {fechaLarga(d.ultimo.fecha)} fue de <strong className="text-text">${d.ultimo.valor.toFixed(4)}</strong>{' '}
          pesos por dólar. En los últimos 12 meses el dólar {anio.variacion >= 0 ? 'subió' : 'bajó'}{' '}
          {Math.abs(anio.variacion).toFixed(2)}%, con un máximo de ${anio.maximo.valor.toFixed(4)} y un mínimo de $
          {anio.minimo.valor.toFixed(4)}.
        </p>
      )}

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <GraficaDolar diario={d.diario} mensual={d.mensual} desde={d.desde} resumen={d.resumen} />
        <Fuente serieId="SF43718" />
      </section>

      <p className="mt-6 text-sm text-text-soft">
        ¿Necesitas el tipo de cambio para facturar o pagar? Usa el{' '}
        <Link href="/tipo-de-cambio" className="underline underline-offset-2">tipo de cambio DOF de hoy</Link> o el{' '}
        <Link href="/convertidor-dolares-pesos" className="underline underline-offset-2">convertidor de dólares a pesos</Link>.
      </p>

      <TarjetaNoud
        titulo="¿Facturas o recibes pagos en dólares?"
        texto="Noud XML concilia tus complementos de pago en moneda extranjera a partir de tus XML de CFDI."
        campana="dolar-historico"
        ubicacion="final"
      />
    </main>
  );
}
