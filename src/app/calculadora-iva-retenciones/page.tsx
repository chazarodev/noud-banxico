import type { Metadata } from 'next';
import { CalculadoraFactura } from '@/components/CalculadoraFactura';
import { JsonLd } from '@/components/JsonLd';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { TABLA_RESICO_MENSUAL } from '@/lib/fiscal/factura';
import { url } from '@/lib/sitio';

const RUTA = '/calculadora-iva-retenciones';

export const metadata: Metadata = {
  title: 'Calculadora de IVA y retenciones 2026: honorarios, RESICO y arrendamiento',
  description:
    'Calcula cuánto facturar, el IVA, las retenciones de ISR e IVA y lo que recibes en tu cuenta. Incluye el cálculo inverso desde el depósito y el impuesto mensual estimado en RESICO.',
  alternates: { canonical: url(RUTA) },
};

const pesos = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FAQ: [string, string][] = [
  [
    '¿Cuánto me retienen si facturo honorarios a una empresa?',
    'En régimen general, 10 % de ISR y dos terceras partes del IVA (10.6667 % del subtotal). En RESICO, 1.25 % de ISR y también dos terceras partes del IVA.',
  ],
  [
    '¿Hay retenciones si le facturo a una persona física?',
    'No. Las retenciones de ISR e IVA de esta calculadora solo las hacen las personas morales (empresas).',
  ],
  [
    '¿Cuánto IVA se retiene en fletes?',
    'En autotransporte terrestre de carga, la empresa que contrata retiene 4 % del valor del servicio.',
  ],
  [
    'Me depositaron por transferencia, ¿cómo hago la factura?',
    'Usa la opción "Lo que me depositaron": la calculadora obtiene el subtotal, el IVA y las retenciones para que el neto de la factura coincida con el depósito.',
  ],
];

export default function CalculadoraIvaPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd
        datos={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
        }}
      />

      <h1 className="text-3xl font-semibold text-text">Calculadora de IVA y retenciones 2026</h1>
      <p className="mt-2 max-w-3xl text-text-soft">
        Para profesionistas, arrendadores, transportistas y pequeños negocios: cuánto debe decir tu factura, cuánto te
        retienen y cuánto recibes. También funciona al revés, desde lo que te depositaron.
      </p>

      <CalculadoraFactura />

      <p className="mt-3 text-xs text-text-soft">
        Cálculo informativo para personas físicas residentes en México. No cubre casos especiales como plataformas
        digitales, comisionistas o exportación de servicios. Valida tu caso con un contador.
      </p>

      <TarjetaNoud
        titulo="Lleva el control de lo que facturas y te retienen"
        texto="Noud XML lee tus CFDI emitidos y recibidos y arma tus papeles de trabajo de IVA e ISR del mes, retenciones incluidas."
        campana="iva-retenciones"
        ubicacion="bajo-calculadora"
      />

      <section className="mt-12 max-w-3xl space-y-3 text-text-soft">
        <h2 className="text-xl font-semibold text-text">Me pagan por transferencia y no estoy dado de alta en el SAT</h2>
        <p>
          Es una situación muy común entre quienes trabajan por su cuenta. Lo importante es saber que esos ingresos sí
          causan impuestos aunque no tengas factura, y que el SAT puede tomar como ingresos los depósitos en tus
          cuentas que no puedas justificar. Regularizarte suele costar menos de lo que parece:
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Inscríbete en el RFC con la actividad que realmente realizas.</li>
          <li>
            Si tus ingresos no pasan de 3.5 millones de pesos al año, revisa el RESICO: pagas de 1 % a 2.5 % sobre lo
            que cobras, sin calcular deducciones.
          </li>
          <li>Emite factura (CFDI) por cada cobro. Las empresas la necesitan para deducir tu pago.</li>
          <li>Presenta tu declaración mensual de ISR e IVA a más tardar el día 17 del mes siguiente.</li>
        </ol>
        <p className="text-sm">
          Si ya recibiste pagos sin estar inscrito, consulta a un contador antes de facturarlos: puede haber
          declaraciones atrasadas que convenga regularizar.
        </p>
      </section>

      <section className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-text">Tasas de ISR en RESICO (mensual)</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {TABLA_RESICO_MENSUAL.map((r, i) => (
                <tr key={r.hasta} className="border-b border-border">
                  <td className="py-1.5 text-text-soft">
                    {i === 0 ? 'Hasta' : `De $${pesos(TABLA_RESICO_MENSUAL[i - 1].hasta + 0.01)} a`} ${pesos(r.hasta)}
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-text">{r.tasa.toFixed(2)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-text-soft">Artículo 113-E de la LISR, sin cambios para 2026.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text">Preguntas frecuentes</h2>
          <div className="mt-2 divide-y divide-border">
            {FAQ.map(([q, a]) => (
              <details key={q} className="py-3">
                <summary className="cursor-pointer font-medium text-text">{q}</summary>
                <p className="mt-2 text-sm text-text-soft">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <p className="mt-8 text-xs text-text-soft">
        Fundamentos: artículos 1-A de la LIVA y 3 de su Reglamento (retención de IVA); 106, 116, 113-E y 113-J de la
        LISR; Decreto de estímulos fiscales región fronteriza norte y sur, vigente hasta el 31 de diciembre de 2026.
      </p>
    </main>
  );
}
