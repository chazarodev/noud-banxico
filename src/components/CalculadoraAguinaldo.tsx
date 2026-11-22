'use client';

import { useMemo, useState } from 'react';
import { calcularAguinaldo, DIAS_MINIMOS_LFT, type MetodoIsr } from '@/lib/fiscal/aguinaldo-2026';

const pesos = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
const num = (t: string) => Number(t.replace(/[^\d.]/g, ''));

function Metodo({ titulo, m, mejor }: { titulo: string; m: MetodoIsr; mejor: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${mejor ? 'border-brand bg-brand-light' : 'border-border'}`}>
      <p className="text-sm font-medium text-text">
        {titulo}
        {mejor && <span className="ml-2 rounded-md bg-brand px-1.5 py-0.5 text-xs text-on-brand">Menor ISR</span>}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-text">{pesos(m.neto)}</p>
      <p className="text-xs text-text-soft">Aguinaldo neto · ISR {pesos(m.isr)}</p>
      <dl className="mt-3 space-y-1 text-xs">
        {m.detalle.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-text-soft">{k}</dt>
            <dd className="tabular-nums text-text">{k.includes('%') ? `${v}%` : pesos(v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function CalculadoraAguinaldo() {
  const [sueldo, setSueldo] = useState('15000');
  const [dias, setDias] = useState(String(DIAS_MINIMOS_LFT));
  const [todoElAnio, setTodoElAnio] = useState(true);
  const [ingreso, setIngreso] = useState('2026-07-01');

  const r = useMemo(
    () =>
      calcularAguinaldo({
        sueldoMensual: num(sueldo),
        diasAguinaldo: num(dias),
        fechaIngreso: todoElAnio ? undefined : ingreso,
      }),
    [sueldo, dias, todoElAnio, ingreso],
  );

  const campo = 'mt-1 w-full rounded-xl border border-border-strong bg-card px-3 py-2.5 text-text';

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-text">Sueldo mensual bruto</span>
          <input inputMode="decimal" value={sueldo} onChange={(e) => setSueldo(e.target.value)} className={`${campo} tabular-nums`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text">Días de aguinaldo</span>
          <input inputMode="numeric" value={dias} onChange={(e) => setDias(e.target.value)} className={`${campo} tabular-nums`} />
          <span className="mt-1 block text-xs text-text-soft">Mínimo por ley: 15. Usa más si tu empresa los da.</span>
        </label>
        <div>
          <span className="text-sm font-medium text-text">¿Trabajaste todo 2026?</span>
          <div className="mt-1 flex gap-2">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setTodoElAnio(v)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm ${
                  todoElAnio === v ? 'border-brand bg-brand text-on-brand' : 'border-border-strong text-text-soft'
                }`}
              >
                {v ? 'Sí' : 'No'}
              </button>
            ))}
          </div>
          {!todoElAnio && (
            <label className="mt-2 block">
              <span className="text-xs text-text-soft">Fecha de ingreso</span>
              <input
                type="date"
                min="2026-01-01"
                max="2026-12-31"
                value={ingreso}
                onChange={(e) => e.target.value && setIngreso(e.target.value)}
                className={campo}
              />
            </label>
          )}
        </div>
      </div>

      <div aria-live="polite" className="mt-6 border-t border-border pt-6">
        {r ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-text-soft">Aguinaldo bruto</p>
                <p className="text-3xl font-bold tabular-nums text-text">{pesos(r.bruto)}</p>
                <p className="text-xs text-text-soft">
                  {r.diasProporcionales.toLocaleString('es-MX', { maximumFractionDigits: 2 })} días ×{' '}
                  {pesos(r.salarioDiario)} diarios
                  {r.diasTrabajados < 365 ? ` · ${r.diasTrabajados} días trabajados` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-soft">Exento de ISR</p>
                <p className="text-xl font-semibold tabular-nums text-text">{pesos(r.exento)}</p>
                <p className="text-xs text-text-soft">Hasta 30 UMA</p>
              </div>
              <div>
                <p className="text-sm text-text-soft">Gravado</p>
                <p className="text-xl font-semibold tabular-nums text-text">{pesos(r.gravado)}</p>
                <p className="text-xs text-text-soft">Sobre esta parte se calcula el ISR</p>
              </div>
            </div>

            {r.gravado > 0 ? (
              <>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Metodo titulo="Método de ley (art. 96 LISR)" m={r.ley} mejor={r.ley.isr < r.reglamento.isr} />
                  <Metodo
                    titulo="Método del reglamento (art. 174 RLISR)"
                    m={r.reglamento}
                    mejor={r.reglamento.isr < r.ley.isr}
                  />
                </div>
                <p className="mt-3 text-xs text-text-soft">
                  Tu patrón elige el método. Si te retienen de más, puedes recuperarlo en tu declaración anual.
                </p>
              </>
            ) : (
              <p className="mt-5 rounded-xl bg-brand-light p-4 text-sm text-text">
                Tu aguinaldo completo está exento: no te deben retener ISR. Recibes {pesos(r.bruto)}.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-text-soft">Escribe tu sueldo y los días de aguinaldo para ver el cálculo.</p>
        )}
      </div>
    </section>
  );
}
