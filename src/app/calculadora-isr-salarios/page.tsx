import type { Metadata } from 'next';
import { CalculadoraIsr } from '@/components/CalculadoraIsr';
import { JsonLd } from '@/components/JsonLd';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { hoyCDMX } from '@/lib/banxico/parse';
import { EJERCICIO, SUBSIDIO_2026, TARIFA_MENSUAL_2026 } from '@/lib/fiscal/isr-2026';
import { url } from '@/lib/sitio';

const RUTA = '/calculadora-isr-salarios';

export const metadata: Metadata = {
  title: `Calculadora de ISR por sueldos y salarios ${EJERCICIO} (con subsidio al empleo)`,
  description: `Calcula el ISR que te retienen por sueldo mensual con la tarifa del artículo 96 de la LISR para ${EJERCICIO} y el subsidio para el empleo. Desglose paso a paso.`,
  alternates: { canonical: url(RUTA) },
};

// Contenido estático: se regenera una vez al día solo para que el mes inicial sea el actual.
export const revalidate = 86400;

const pesos = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CalculadoraIsrPage() {
  const mesActual = Number(hoyCDMX().slice(5, 7));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <JsonLd
        datos={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: `Calculadora de ISR por sueldos y salarios ${EJERCICIO}`,
          url: url(RUTA),
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          inLanguage: 'es-MX',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'MXN' },
        }}
      />

      <h1 className="text-3xl font-semibold text-text">Calculadora de ISR por sueldos y salarios {EJERCICIO}</h1>
      <p className="mt-2 max-w-2xl text-text-soft">
        Calcula cuánto ISR te retienen al mes con la tarifa del artículo 96 de la Ley del ISR y el subsidio para el
        empleo vigentes en {EJERCICIO}.
      </p>

      <CalculadoraIsr mesInicial={mesActual} />

      <p className="mt-3 text-xs text-text-soft">
        Cálculo informativo. Supone que todo el sueldo es gravable y que se paga de forma mensual; no incluye cuotas
        del IMSS, ingresos exentos (aguinaldo, prima vacacional, horas extra) ni el ajuste anual. Tu recibo puede
        variar según cómo calcule la nómina tu empleador.
      </p>

      <TarjetaNoud
        titulo="¿Llevas la nómina de tu empresa o de tus clientes?"
        texto="Noud XML organiza tus CFDI de nómina y los cruza con tus pagos provisionales de ISR."
        campana="calculadora-isr"
        ubicacion="bajo-calculadora"
      />

      <section className="mt-12 space-y-3 text-text-soft">
        <h2 className="text-xl font-semibold text-text">Cómo se calcula el ISR de tu sueldo</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Ubica tu sueldo mensual en la tarifa: el renglón donde queda entre el límite inferior y el superior.</li>
          <li>Réstale el límite inferior de ese renglón para obtener el excedente.</li>
          <li>Multiplica el excedente por el porcentaje del renglón.</li>
          <li>Súmale la cuota fija: ese es el ISR causado.</li>
          <li>
            Si tu sueldo no rebasa ${pesos(SUBSIDIO_2026.limiteIngresoMensual)} al mes, réstale el subsidio para el
            empleo (${pesos(SUBSIDIO_2026.febreroADiciembre)} de febrero a diciembre). El subsidio no puede ser mayor
            que el ISR, y la diferencia no se entrega.
          </li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text">Tarifa mensual de ISR {EJERCICIO} (artículo 96 LISR)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-soft">
                <th className="py-2 pr-4 font-medium">Límite inferior</th>
                <th className="py-2 pr-4 font-medium">Límite superior</th>
                <th className="py-2 pr-4 text-right font-medium">Cuota fija</th>
                <th className="py-2 text-right font-medium">% sobre excedente</th>
              </tr>
            </thead>
            <tbody>
              {TARIFA_MENSUAL_2026.map((r) => (
                <tr key={r.limiteInferior} className="border-b border-border tabular-nums">
                  <td className="py-2 pr-4">${pesos(r.limiteInferior)}</td>
                  <td className="py-2 pr-4">{r.limiteSuperior === null ? 'En adelante' : `$${pesos(r.limiteSuperior)}`}</td>
                  <td className="py-2 pr-4 text-right">${pesos(r.cuotaFija)}</td>
                  <td className="py-2 text-right">{r.porcentaje.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-text-soft">
          Fuentes: Anexo 8 de la Resolución Miscelánea Fiscal {EJERCICIO} (DOF del 28 de diciembre de 2025); decreto
          del subsidio para el empleo (DOF del 31 de diciembre de 2025); UMA {EJERCICIO} publicada por el INEGI (DOF
          del 9 de enero de 2026).
        </p>
      </section>
    </main>
  );
}
