'use client';

import { useMemo, useState } from 'react';
import { calcularIsrMensual, SUBSIDIO_2026 } from '@/lib/fiscal/isr-2026';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Ayuda } from '@/components/ui/Tooltip';

const pesos = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
const pct = (n: number) => `${n.toLocaleString('es-MX', { maximumFractionDigits: 2 })}%`;

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function CalculadoraIsr({ mesInicial }: { mesInicial: number }) {
  const [texto, setTexto] = useState('15000');
  const [mes, setMes] = useState(mesInicial);

  const sueldo = Number(texto.replace(/[^\d.]/g, ''));
  const r = useMemo(() => calcularIsrMensual(sueldo, mes), [sueldo, mes]);

  return (
    <section className="mt-6 grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
      <div className="space-y-4">
        <Input
          label="Sueldo mensual bruto"
          prefijo="$"
          inputMode="decimal"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          extra={<Ayuda texto="Lo que gana el trabajador antes de impuestos. Aquí se supone que todo es gravable (sin aguinaldo, horas extra ni otros exentos)." />}
        />
        <Select
          label="Mes del pago"
          value={mes}
          onChange={setMes}
          options={MESES.map((m, i) => ({ value: i + 1, label: `${m} 2026` }))}
          ayuda={`El subsidio para el empleo cambia en enero (${pesos(SUBSIDIO_2026.enero)}) y de febrero a diciembre (${pesos(SUBSIDIO_2026.febreroADiciembre)}).`}
        />
      </div>

      <div aria-live="polite">
        {r ? (
          <>
            <p className="text-sm font-medium text-text-soft">ISR a retener en el mes</p>
            <p className="text-4xl font-bold tabular-nums text-text">{pesos(r.isrRetenido)}</p>
            <p className="mt-1 text-sm text-text-soft">
              Sueldo después de ISR: <span className="font-medium text-text">{pesos(r.neto)}</span> · tasa
              efectiva {pct(r.tasaEfectiva)}
            </p>

            <dl className="mt-5 divide-y divide-border text-sm">
              {[
                ['Base gravable', pesos(r.base)],
                ['(−) Límite inferior', pesos(r.renglon.limiteInferior)],
                ['(=) Excedente', pesos(r.excedente)],
                [`(×) Tasa sobre excedente`, pct(r.renglon.porcentaje)],
                ['(=) Impuesto marginal', pesos(r.impuestoMarginal)],
                ['(+) Cuota fija', pesos(r.renglon.cuotaFija)],
                ['(=) ISR causado', pesos(r.isrCausado)],
                ['(−) Subsidio para el empleo', pesos(r.subsidio)],
                ['(=) ISR a retener', pesos(r.isrRetenido)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5">
                  <dt className="text-text-soft">{k}</dt>
                  <dd className="tabular-nums text-text">{v}</dd>
                </div>
              ))}
            </dl>
            {r.base > SUBSIDIO_2026.limiteIngresoMensual && (
              <p className="mt-3 text-xs text-text-soft">
                No aplica subsidio: el sueldo rebasa {pesos(SUBSIDIO_2026.limiteIngresoMensual)} mensuales.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-text-soft">Escribe un sueldo mensual para ver el cálculo.</p>
        )}
      </div>
    </section>
  );
}
