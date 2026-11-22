import type { Metadata } from 'next';
import Link from 'next/link';
import { CalculadoraAguinaldo } from '@/components/CalculadoraAguinaldo';
import { JsonLd } from '@/components/JsonLd';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { EXENTO_AGUINALDO_2026, UMA_DIARIA_2026 } from '@/lib/fiscal/aguinaldo-2026';
import { url } from '@/lib/sitio';

const RUTA = '/calculadora-aguinaldo';
const exento = EXENTO_AGUINALDO_2026.toLocaleString('es-MX', { minimumFractionDigits: 2 });

export const metadata: Metadata = {
  title: 'Calculadora de aguinaldo 2026: cuánto te toca y cuánto ISR te retienen',
  description: `Calcula tu aguinaldo 2026 completo o proporcional, la parte exenta ($${exento}) y el ISR con los dos métodos que puede usar tu patrón. Gratis y paso a paso.`,
  alternates: { canonical: url(RUTA) },
};

const FAQ: [string, string][] = [
  [
    '¿Cuándo deben pagar el aguinaldo?',
    'Antes del 20 de diciembre, según el artículo 87 de la Ley Federal del Trabajo.',
  ],
  [
    '¿Cuántos días de aguinaldo me corresponden?',
    'Al menos 15 días de salario. Muchas empresas dan más; en ese caso usa los días de tu empresa en la calculadora.',
  ],
  [
    '¿Ya se aprobó el aguinaldo de 30 días?',
    'No. Al 21 de noviembre de 2026 hay iniciativas en el Congreso, pero ninguna se ha aprobado: el mínimo legal sigue siendo de 15 días.',
  ],
  [
    '¿Qué pasa si no trabajé todo el año?',
    'Te toca la parte proporcional a los días trabajados, aunque ya no trabajes en la empresa cuando llegue la fecha de pago.',
  ],
  [
    '¿Cuánto del aguinaldo está exento de ISR en 2026?',
    `Hasta 30 veces la UMA diaria: 30 × $${UMA_DIARIA_2026} = $${exento}. Solo lo que rebasa esa cantidad paga ISR.`,
  ],
  [
    '¿Por qué hay dos cálculos de ISR?',
    'La ley permite al patrón retener con la tarifa mensual del artículo 96 de la LISR o con el procedimiento opcional del artículo 174 de su Reglamento. Con aguinaldos altos, el segundo suele retener menos.',
  ],
];

export default function CalculadoraAguinaldoPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <JsonLd
        datos={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ.map(([q, a]) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }}
      />

      <h1 className="text-3xl font-semibold text-text">Calculadora de aguinaldo 2026</h1>
      <p className="mt-2 max-w-2xl text-text-soft">
        Calcula cuánto aguinaldo te toca, qué parte está exenta y cuánto ISR te pueden retener. Funciona para año
        completo o proporcional.
      </p>

      <CalculadoraAguinaldo />

      <p className="mt-3 text-xs text-text-soft">
        Cálculo informativo con sueldo mensual 100% gravable, salario diario = sueldo mensual ÷ 30 y pago en
        diciembre. No incluye otras percepciones del mes ni ausencias o incapacidades que tu empresa pueda descontar.
        Si recibes aguinaldo de dos patrones, la exención de 30 UMA aplica sobre el total.
      </p>

      <TarjetaNoud
        titulo="¿Calculas el aguinaldo de toda una plantilla?"
        texto="Noud XML organiza los CFDI de nómina de tus clientes o de tu empresa y los cruza con tus pagos provisionales."
        campana="aguinaldo"
        ubicacion="bajo-calculadora"
      />

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-text">Preguntas frecuentes</h2>
        <div className="mt-4 divide-y divide-border">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-3">
              <summary className="cursor-pointer list-none font-medium text-text">
                {q}
                <span className="float-right text-text-soft group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-text-soft">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-2 text-sm text-text-soft">
        <h2 className="text-xl font-semibold text-text">Cómo se calcula</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Salario diario = sueldo mensual ÷ 30.</li>
          <li>Días que te tocan = días de aguinaldo × días trabajados en el año ÷ 365.</li>
          <li>Aguinaldo bruto = salario diario × días que te tocan.</li>
          <li>Exento = hasta 30 UMA (${exento} en 2026). El resto es gravado.</li>
          <li>
            ISR del gravado, con la tarifa mensual que también usa la{' '}
            <Link href="/calculadora-isr-salarios" className="underline underline-offset-2">
              calculadora de ISR por sueldos
            </Link>
            .
          </li>
        </ol>
        <p className="pt-2 text-xs">
          Fuentes: artículo 87 de la Ley Federal del Trabajo; artículos 93, fracción XIV, y 96 de la LISR; artículo
          174 del Reglamento de la LISR; UMA 2026 publicada por el INEGI (DOF del 9 de enero de 2026).
        </p>
      </section>
    </main>
  );
}
