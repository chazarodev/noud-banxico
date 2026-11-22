'use client';

import { useMemo, useState } from 'react';
import { calcularIsrMensual, SUBSIDIO_2026 } from '@/lib/fiscal/isr-2026';

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
        <label className="block">
          <span className="text-sm font-medium text-text">Sueldo mensual bruto (gravable)</span>
          <div className="mt-1 flex items-center rounded-xl border border-border-strong bg-card px-3 focus-within:border-brand">
            <span className="text-text-soft">$</span>
            <input
              inputMode="decimal"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full bg-transparent px-2 py-2.5 text-lg tabular-nums text-text outline-none"
              aria-label="Sueldo mensual bruto"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text">Mes del pago</span>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-border-strong bg-card px-3 py-2.5 text-text"
          >
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m} 2026
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-text-soft">
            El subsidio para el empleo cambia en enero ({pesos(SUBSIDIO_2026.enero)}) y de febrero a diciembre (
            {pesos(SUBSIDIO_2026.febreroADiciembre)}).
          </span>
        </label>
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
