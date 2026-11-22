import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { TarjetaIndicador } from '@/components/TarjetaIndicador';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { resumenIndicadores } from '@/lib/banxico/indicadores';
import { datosMonedas } from '@/lib/banxico/monedas';
import { SALARIO_MINIMO, UMA } from '@/lib/fiscal/referencias';
import { fechaCorta, fechaLarga, hoyCDMX, mesLargo } from '@/lib/banxico/parse';
import { SERIES, formatoValor } from '@/lib/banxico/series';
import { datosTipoDeCambio, vistaDelDia } from '@/lib/banxico/tipo-de-cambio';
import { url } from '@/lib/sitio';

// Se regenera cada hora; los datos tienen su propia caché (6 h y 24 h).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: 'Indicadores económicos de Banxico hoy: tipo de cambio DOF, UDIS, TIIE e INPC' },
  description:
    'Consulta en un solo lugar el tipo de cambio DOF, la UDI, la tasa objetivo, la TIIE, los Cetes y el INPC con datos oficiales del Banco de México.',
  alternates: { canonical: url('/') },
};

async function tipoDeCambioSeguro() {
  try {
    const d = await datosTipoDeCambio();
    return { hoy: d.hoy, ...vistaDelDia(d, d.hoy) };
  } catch (error) {
    console.error('[portada] Tipo de cambio no disponible', error);
    return null;
  }
}

export default async function Portada() {
  const [tc, indicadores, monedas] = await Promise.all([tipoDeCambioSeguro(), resumenIndicadores(), datosMonedas()]);
  const euro = monedas.find((m) => m.slug === 'euro');
  const pesos2 = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const hoy = tc?.hoy ?? hoyCDMX();
  const TC = SERIES.tipoCambioDOF;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd
        datos={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Indicadores Noud XML',
          url: url('/'),
          inLanguage: 'es-MX',
          publisher: { '@type': 'Organization', name: 'Noud XML', url: 'https://noudxml.com' },
        }}
      />

      <section className="max-w-3xl">
        <p className="text-sm font-medium text-brand-ink">{fechaLarga(hoy)}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          Indicadores económicos de Banxico, hoy
        </h1>
        <p className="mt-3 text-text-soft">
          Los datos que más usan contadores y pymes, tomados del Sistema de Información Económica del Banco de
          México y actualizados varias veces al día.
        </p>
      </section>

      {/* Indicador principal */}
      {tc?.publicacion && tc.operacion && (
        <Link
          href={TC.ruta}
          className="mt-8 grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-border-strong hover:shadow-md sm:grid-cols-2"
        >
          <div>
            <p className="text-sm font-medium text-text-soft">
              Tipo de cambio DOF ·{' '}
              {tc.publicacion.exacto ? 'publicado hoy' : `publicado el ${fechaCorta(tc.publicacion.punto.fecha)}`}
            </p>
            <p className="mt-1 text-5xl font-bold tabular-nums text-text">
              {formatoValor(TC, tc.publicacion.punto.valor)}
            </p>
            <p className="mt-1 text-xs text-text-soft">Pesos por dólar</p>
          </div>
          <div className="sm:border-l sm:border-border sm:pl-6">
            <p className="text-sm font-medium text-text-soft">Para registrar operaciones de hoy</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-text">
              {formatoValor(TC, tc.operacion.punto.valor)}
            </p>
            <p className="mt-1 text-xs text-text-soft">Publicado en el DOF el día hábil anterior</p>
            <p className="mt-4 text-sm font-medium text-brand-ink">Ver historial y próximos días →</p>
          </div>
        </Link>
      )}

      {/* Resto de indicadores */}
      {indicadores.length > 0 && (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {indicadores.map(({ clave, def, actual, proximoCambio }) => (
            <TarjetaIndicador
              key={clave}
              titulo={def.nombre}
              valor={formatoValor(def, actual.valor)}
              detalle={
                def.frecuencia === 'mensual'
                  ? `Dato de ${mesLargo(actual.fecha)}`
                  : actual.fecha === hoy
                    ? `Vigente hoy · ${def.unidad}`
                    : `Dato del ${fechaCorta(actual.fecha)} · ${def.unidad}`
              }
              descripcion={def.descripcion}
              nota={
                clave === 'tasaObjetivo' && proximoCambio
                  ? `Cambia a ${formatoValor(def, proximoCambio.valor)} el ${fechaCorta(proximoCambio.fecha)}`
                  : undefined
              }
              href={def.ruta}
            />
          ))}
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text">Valores de referencia</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {(
            [
              ['/uma', `UMA ${UMA[0].anio}`, `$${pesos2(UMA[0].diario)}`, 'diaria · multas, topes y exenciones'],
              ['/salario-minimo', `Salario mínimo ${SALARIO_MINIMO[0].anio}`, `$${pesos2(SALARIO_MINIMO[0].general)}`, `diario · frontera norte $${pesos2(SALARIO_MINIMO[0].frontera)}`],
              ...(euro
                ? [['/otras-monedas', 'Euro', `$${euro.actual.valor.toFixed(4)}`, `pesos por euro · ${fechaCorta(euro.actual.fecha)}`]]
                : []),
            ] as [string, string, string, string][]
          ).map(([href, titulo, valor, detalle]) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-border-strong hover:shadow-md"
            >
              <p className="text-sm font-medium text-text-soft">{titulo}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-text">{valor}</p>
              <p className="mt-1 text-xs text-text-soft">{detalle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text">Calculadoras</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/calculadora-aguinaldo"
            className="rounded-2xl border border-brand/40 bg-brand-light p-5 shadow-sm transition hover:border-brand hover:shadow-md"
          >
            <p className="font-semibold text-text">Calculadora de aguinaldo 2026</p>
            <p className="mt-1 text-sm text-text-soft">
              Cuánto te toca, la parte exenta y el ISR con los dos métodos permitidos.
            </p>
            <p className="mt-3 text-sm font-medium text-brand-ink">Calcular mi aguinaldo →</p>
          </Link>
          <Link
            href="/convertidor-dolares-pesos"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-border-strong hover:shadow-md"
          >
            <p className="font-semibold text-text">Convertidor de dólares a pesos</p>
            <p className="mt-1 text-sm text-text-soft">
              Con el tipo de cambio DOF que corresponde a la fecha de tu factura o pago.
            </p>
            <p className="mt-3 text-sm font-medium text-brand-ink">Convertir →</p>
          </Link>
          <Link
            href="/verificador-tipo-cambio-cfdi"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-border-strong hover:shadow-md"
          >
            <p className="font-semibold text-text">Verificador de tipo de cambio en CFDI</p>
            <p className="mt-1 text-sm text-text-soft">
              Sube tus XML en dólares y revisa si el tipo de cambio coincide con el del DOF.
            </p>
            <p className="mt-3 text-sm font-medium text-brand-ink">Verificar mis facturas →</p>
          </Link>
          <Link
            href="/calculadora-iva-retenciones"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-border-strong hover:shadow-md"
          >
            <p className="font-semibold text-text">IVA y retenciones al facturar</p>
            <p className="mt-1 text-sm text-text-soft">
              Honorarios, RESICO, rentas y fletes: cuánto facturar y cuánto recibes, incluso desde el depósito.
            </p>
            <p className="mt-3 text-sm font-medium text-brand-ink">Calcular mi factura →</p>
          </Link>
          <Link
            href="/calculadora-actualizacion-recargos"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-border-strong hover:shadow-md"
          >
            <p className="font-semibold text-text">Actualización y recargos SAT</p>
            <p className="mt-1 text-sm text-text-soft">
              Cuánto pagas si presentas un impuesto tarde: factor con INPC y recargos de 2026.
            </p>
            <p className="mt-3 text-sm font-medium text-brand-ink">Calcular →</p>
          </Link>
          <Link
            href="/calculadora-isr-salarios"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-border-strong hover:shadow-md"
          >
            <p className="font-semibold text-text">Calculadora de ISR por sueldos y salarios</p>
            <p className="mt-1 text-sm text-text-soft">
              Retención mensual con la tarifa 2026 y el subsidio para el empleo, paso a paso.
            </p>
            <p className="mt-3 text-sm font-medium text-brand-ink">Calcular →</p>
          </Link>
        </div>
      </section>

      <TarjetaNoud
        titulo="Lleva estos datos a tu contabilidad sin capturarlos"
        texto="Noud XML convierte tus XML de CFDI en papeles de trabajo: cuentas por pagar y cobrar, DIOT y pagos provisionales de IVA e ISR."
        campana="portada"
        ubicacion="bajo-indicadores"
      />

      <section className="mt-12 max-w-2xl space-y-3 text-sm text-text-soft">
        <h2 className="text-lg font-semibold text-text">¿De dónde salen estos datos?</h2>
        <p>
          Todos los valores provienen del Sistema de Información Económica (SIE) del Banco de México y se
          consultan a través de su API oficial. Cada indicador muestra la fecha del dato. Los fines de semana y
          días inhábiles se muestra el último valor disponible.
        </p>
      </section>
    </main>
  );
}
