import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { DIAS_MES, SALARIO_MINIMO } from '@/lib/fiscal/referencias';
import { url } from '@/lib/sitio';

const RUTA = '/salario-minimo';
const actual = SALARIO_MINIMO[0];
const previo = SALARIO_MINIMO[1];
const pesos = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const variacion = (a: number, b: number) => `${(((a - b) / b) * 100).toFixed(1)} %`;

export const metadata: Metadata = {
  title: `Salario mínimo ${actual.anio}: $${pesos(actual.general)} diarios (frontera $${pesos(actual.frontera)})`,
  description: `Salario mínimo ${actual.anio} en México: $${pesos(actual.general)} diarios en la zona general y $${pesos(actual.frontera)} en la Zona Libre de la Frontera Norte. Por día, semana, quincena y mes.`,
  alternates: { canonical: url(RUTA) },
};

const PERIODOS: [string, number][] = [
  ['Por día', 1],
  ['Por semana (7 días)', 7],
  ['Por quincena (15 días)', 15],
  [`Por mes (${DIAS_MES} días)`, DIAS_MES],
];

export default function SalarioMinimoPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <JsonLd
        datos={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `¿Cuál es el salario mínimo en ${actual.anio}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `$${pesos(actual.general)} diarios en la zona general y $${pesos(actual.frontera)} diarios en la Zona Libre de la Frontera Norte, vigentes desde el 1 de enero de ${actual.anio}.`,
              },
            },
          ],
        }}
      />
      <p className="text-sm font-medium text-brand-ink">Conasami · vigente desde el 1 de enero de {actual.anio}</p>
      <h1 className="mt-1 text-3xl font-semibold text-text">Salario mínimo {actual.anio}</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(
          [
            ['Zona general', 'Todo el país, excepto la frontera norte', actual.general, previo.general],
            ['Zona Libre de la Frontera Norte', 'Municipios fronterizos del norte', actual.frontera, previo.frontera],
          ] as const
        ).map(([zona, desc, valor, antes]) => (
          <section key={zona} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-text-soft">{zona}</p>
            <p className="mt-1 text-4xl font-bold tabular-nums text-text">${pesos(valor)}</p>
            <p className="text-xs text-text-soft">
              diarios · {desc} · +{variacion(valor, antes)} vs. {previo.anio}
            </p>
            <dl className="mt-4 divide-y divide-border text-sm">
              {PERIODOS.map(([k, dias]) => (
                <div key={k} className="flex justify-between py-1.5">
                  <dt className="text-text-soft">{k}</dt>
                  <dd className="tabular-nums text-text">${pesos(valor * dias)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text">Salario mínimo por año</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-soft">
              <th className="py-2 font-medium">Año</th>
              <th className="py-2 text-right font-medium">Zona general</th>
              <th className="py-2 text-right font-medium">Frontera norte</th>
            </tr>
          </thead>
          <tbody>
            {SALARIO_MINIMO.map((s, i) => {
              const p = SALARIO_MINIMO[i + 1];
              return (
                <tr key={s.anio} className="border-b border-border tabular-nums">
                  <td className="py-2">{s.anio}</td>
                  <td className="py-2 text-right">
                    ${pesos(s.general)} {p && <span className="text-xs text-text-soft">(+{variacion(s.general, p.general)})</span>}
                  </td>
                  <td className="py-2 text-right">
                    ${pesos(s.frontera)} {p && <span className="text-xs text-text-soft">(+{variacion(s.frontera, p.frontera)})</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-text-soft">
          Montos diarios fijados por la Comisión Nacional de los Salarios Mínimos (Conasami). El salario mínimo de{' '}
          {actual.anio + 1} se define en diciembre; esta página se actualiza cuando se publique.
        </p>
      </section>

      <section className="mt-10 max-w-3xl space-y-3 text-sm text-text-soft">
        <h2 className="text-xl font-semibold text-text">Salario mínimo y UMA no son lo mismo</h2>
        <p>
          El salario mínimo es lo menos que se puede pagar por una jornada de trabajo. Las multas, topes y exenciones
          fiscales se calculan con la UMA, que desde 2016 se desvinculó del salario mínimo y hoy vale mucho menos.
        </p>
      </section>

      <TarjetaNoud
        titulo="¿Llevas nómina?"
        texto="Noud XML organiza los CFDI de nómina y te ayuda a cuadrar retenciones e impuestos del mes."
        campana="salario-minimo"
        ubicacion="final"
      />
    </main>
  );
}
