import type { Metadata } from 'next';
import { CalculadoraUma } from '@/components/CalculadoraUma';
import { JsonLd } from '@/components/JsonLd';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { UMA } from '@/lib/fiscal/referencias';
import { url } from '@/lib/sitio';

const RUTA = '/uma';
const actual = UMA[0];
const pesos = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const metadata: Metadata = {
  title: `Valor de la UMA ${actual.anio}: $${pesos(actual.diario)} diaria, mensual y anual`,
  description: `La UMA ${actual.anio} vale $${pesos(actual.diario)} diaria, $${pesos(actual.mensual)} mensual y $${pesos(actual.anual)} anual. Convierte UMA a pesos y consulta los valores de años anteriores.`,
  alternates: { canonical: url(RUTA) },
};

export default function UmaPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <JsonLd
        datos={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `¿Cuánto vale la UMA en ${actual.anio}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Desde el 1 de febrero de ${actual.anio}: $${pesos(actual.diario)} diaria, $${pesos(actual.mensual)} mensual y $${pesos(actual.anual)} anual.`,
              },
            },
          ],
        }}
      />
      <p className="text-sm font-medium text-brand-ink">Unidad de Medida y Actualización</p>
      <h1 className="mt-1 text-3xl font-semibold text-text">Valor de la UMA {actual.anio}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {(
          [
            ['Diaria', actual.diario],
            ['Mensual', actual.mensual],
            ['Anual', actual.anual],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-text-soft">UMA {k.toLowerCase()}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-text">${pesos(v)}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-text-soft">
        Vigente del 1 de febrero de {actual.anio} al 31 de enero de {actual.anio + 1}. Fuente: INEGI, publicada en el DOF.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-text">Convierte UMA a pesos</h2>
      <CalculadoraUma umas={UMA} />

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text">Valores de la UMA por año</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-soft">
                <th className="py-2 font-medium">Año</th>
                <th className="py-2 text-right font-medium">Diaria</th>
                <th className="py-2 text-right font-medium">Mensual</th>
                <th className="py-2 text-right font-medium">Anual</th>
                <th className="py-2 text-right font-medium">Variación</th>
              </tr>
            </thead>
            <tbody>
              {UMA.map((u, i) => {
                const prev = UMA[i + 1];
                return (
                  <tr key={u.anio} className="border-b border-border tabular-nums">
                    <td className="py-2">{u.anio}</td>
                    <td className="py-2 text-right">${pesos(u.diario)}</td>
                    <td className="py-2 text-right">${pesos(u.mensual)}</td>
                    <td className="py-2 text-right">${pesos(u.anual)}</td>
                    <td className="py-2 text-right text-text-soft">
                      {prev ? `+${(((u.diario - prev.diario) / prev.diario) * 100).toFixed(2)} %` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 max-w-3xl space-y-3 text-sm text-text-soft">
        <h2 className="text-xl font-semibold text-text">¿Para qué se usa la UMA?</h2>
        <p>
          Desde 2016 sustituye al salario mínimo como referencia para multas, créditos, topes y exenciones en leyes
          federales y locales. Por ejemplo: la parte exenta del aguinaldo (30 UMA), el subsidio para el empleo, las
          multas de tránsito o el tope del salario base de cotización del IMSS (25 UMA).
        </p>
        <p>
          El INEGI la actualiza cada año con la inflación de diciembre, la publica en el DOF en los primeros días de enero
          y entra en vigor el 1 de febrero. La mensual es la diaria × 30.4 y la anual, la mensual × 12.
        </p>
      </section>

      <TarjetaNoud
        titulo="Exenciones, topes y retenciones sin calcular a mano"
        texto="Noud XML organiza tus CFDI de nómina y te ayuda a cuadrar retenciones e impuestos del mes."
        campana="uma"
        ubicacion="final"
      />
    </main>
  );
}
