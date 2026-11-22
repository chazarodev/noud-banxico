import type { Metadata } from 'next';
import { CalculadoraActualizacion } from '@/components/CalculadoraActualizacion';
import { Fuente } from '@/components/Fuente';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { obtenerHistorico } from '@/lib/banxico/client';
import { esValido, hoyCDMX } from '@/lib/banxico/parse';
import { SERIES } from '@/lib/banxico/series';
import { PRIMER_ANIO, TASA_MORA_POR_ANIO, type InpcMensual } from '@/lib/fiscal/actualizacion';
import { url } from '@/lib/sitio';

const RUTA = '/calculadora-actualizacion-recargos';

export const metadata: Metadata = {
  title: 'Calculadora de actualización y recargos SAT 2026 (INPC)',
  description:
    'Calcula la actualización con INPC y los recargos por mora de impuestos pagados tarde, con el factor del art. 17-A CFF y la tasa de recargos de 2.07 % mensual vigente en 2026.',
  alternates: { canonical: url(RUTA) },
};

export const revalidate = 3600;

export default async function ActualizacionPage() {
  const serie = await obtenerHistorico(SERIES.inpc.id);
  // INPC mensual desde un mes antes del primer año soportado (para el "mes anterior").
  const inpc: InpcMensual[] = (serie?.datos ?? [])
    .filter(esValido)
    .map((p) => ({ mes: p.fecha.slice(0, 7), valor: p.valor }))
    .filter((p) => p.mes >= `${PRIMER_ANIO - 1}-12`)
    .sort((a, b) => a.mes.localeCompare(b.mes));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-text">Calculadora de actualización y recargos</h1>
      <p className="mt-2 max-w-2xl text-text-soft">
        Si pagas un impuesto después de la fecha límite, el SAT cobra la actualización por inflación y recargos por
        cada mes o fracción de retraso. Calcula ambos con el INPC oficial.
      </p>

      <CalculadoraActualizacion inpc={inpc} hoy={hoyCDMX()} />
      <Fuente serieId={SERIES.inpc.id} />

      <p className="mt-3 text-xs text-text-soft">
        Cálculo informativo de contribuciones federales pagadas de forma espontánea. No incluye multas, pagos en
        parcialidades (que usan otras tasas) ni reducciones que pueda otorgar el SAT. Revisa el resultado con tu
        contador o con la línea de captura del SAT.
      </p>

      <TarjetaNoud
        titulo="Que no se te pase el día 17"
        texto="Noud XML prepara tus papeles de trabajo de IVA e ISR a partir de tus CFDI, para que presentes tus pagos provisionales a tiempo."
        campana="actualizacion-recargos"
        ubicacion="bajo-calculadora"
      />

      <section className="mt-12 space-y-3 text-sm text-text-soft">
        <h2 className="text-xl font-semibold text-text">Cómo se calcula</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            <strong className="text-text">Factor de actualización</strong> (art. 17-A CFF): INPC del mes anterior al
            pago ÷ INPC del mes anterior al vencimiento, hasta el diezmilésimo. Si da menos de 1, se usa 1. Si el INPC
            del mes anterior al pago aún no se publica, se usa el último publicado.
          </li>
          <li>
            <strong className="text-text">Contribución actualizada</strong> = monto × factor.
          </li>
          <li>
            <strong className="text-text">Recargos</strong> (art. 21 CFF): contribución actualizada × la suma de la tasa
            mensual de cada mes o fracción de retraso, con un máximo de 5 años.
          </li>
        </ol>

        <h3 className="pt-4 font-semibold text-text">Tasa mensual de recargos por mora</h3>
        <table className="w-full max-w-sm">
          <tbody>
            {Object.entries(TASA_MORA_POR_ANIO).map(([anio, tasa]) => (
              <tr key={anio} className="border-b border-border">
                <td className="py-1.5">{anio}</td>
                <td className="py-1.5 text-right tabular-nums">{tasa.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs">
          La tasa por mora es la tasa de prórroga de la Ley de Ingresos de la Federación más 50 %. En 2026 la de
          prórroga subió de 0.98 % a 1.38 %, por lo que la de mora pasó de 1.47 % a 2.07 % mensual.
        </p>
      </section>
    </main>
  );
}
