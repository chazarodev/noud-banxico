'use client';

import { useMemo, useState } from 'react';
import { calcularActualizacion, PRIMER_ANIO, type InpcMensual } from '@/lib/fiscal/actualizacion';

const pesos = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const nombreMes = (mes: string) => `${MESES[Number(mes.slice(5, 7)) - 1]} ${mes.slice(0, 4)}`;

type Props = { inpc: InpcMensual[]; hoy: string };

export function CalculadoraActualizacion({ inpc, hoy }: Props) {
  const [monto, setMonto] = useState('10000');
  const [vencimiento, setVencimiento] = useState(`${hoy.slice(0, 4)}-03-17`);
  const [pago, setPago] = useState(hoy);

  const r = useMemo(
    () => calcularActualizacion(Number(monto.replace(/[^\d.]/g, '')), vencimiento, pago, inpc),
    [monto, vencimiento, pago, inpc],
  );

  const campo = 'mt-1 w-full rounded-xl border border-border-strong bg-card px-3 py-2.5 text-text';
  const filas: [string, string][] =
    'error' in r
      ? []
      : [
          [`INPC de ${nombreMes(r.inpcReciente.mes)} (mes anterior al pago)`, r.inpcReciente.valor.toFixed(3)],
          [`INPC de ${nombreMes(r.inpcAntiguo.mes)} (mes anterior al vencimiento)`, r.inpcAntiguo.valor.toFixed(3)],
          ['Factor de actualización', r.factor.toFixed(4)],
          ['Contribución actualizada', pesos(r.actualizada)],
          [`Meses de mora (mes o fracción)`, String(r.meses)],
          ...r.tramos.map(
            (t): [string, string] => [`Tasa ${t.anio}: ${t.meses} × ${t.tasa}%`, `${(t.meses * t.tasa).toFixed(2)}%`],
          ),
          ['Tasa de recargos acumulada', `${r.tasaTotal.toFixed(2)}%`],
        ];

  return (
    <section className="mt-6 grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-text">Monto de la contribución omitida</span>
          <input inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} className={`${campo} tabular-nums`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text">Fecha en que debió pagarse</span>
          <input
            type="date"
            min={`${PRIMER_ANIO}-01-01`}
            max={hoy}
            value={vencimiento}
            onChange={(e) => e.target.value && setVencimiento(e.target.value)}
            className={campo}
          />
          <span className="mt-1 block text-xs text-text-soft">
            Por ejemplo, el día 17 del mes siguiente para pagos provisionales mensuales.
          </span>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text">Fecha en que vas a pagar</span>
          <input
            type="date"
            min={vencimiento}
            value={pago}
            onChange={(e) => e.target.value && setPago(e.target.value)}
            className={campo}
          />
        </label>
      </div>

      <div aria-live="polite">
        {'error' in r ? (
          <p className="text-sm text-text-soft">{r.error}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-text-soft">Total a pagar</p>
            <p className="text-4xl font-bold tabular-nums text-text">{pesos(r.total)}</p>
            <p className="mt-1 text-sm text-text-soft">
              Actualización {pesos(r.actualizacion)} · Recargos {pesos(r.recargos)}
            </p>
            <dl className="mt-5 divide-y divide-border text-sm">
              {filas.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-1.5">
                  <dt className="text-text-soft">{k}</dt>
                  <dd className="tabular-nums text-text">{v}</dd>
                </div>
              ))}
            </dl>
            {r.aviso && <p className="mt-3 rounded-lg bg-info-soft p-2 text-xs text-info-ink">{r.aviso}</p>}
          </>
        )}
      </div>
    </section>
  );
}
