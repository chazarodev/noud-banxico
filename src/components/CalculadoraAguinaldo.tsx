'use client';

import { useMemo, useState } from 'react';
import { calcularAguinaldo, DIAS_MINIMOS_LFT, type MetodoIsr } from '@/lib/fiscal/aguinaldo-2026';
import { Input } from '@/components/ui/Input';
import { Segmentado } from '@/components/ui/Segmentado';
import { Ayuda } from '@/components/ui/Tooltip';

const pesos = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
const num = (t: string) => Number(t.replace(/[^\d.]/g, ''));

function Metodo({ titulo, m, mejor }: { titulo: string; m: MetodoIsr; mejor: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${mejor ? 'border-brand bg-brand-light' : 'border-border'}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <p className="text-sm font-medium text-text">{titulo}</p>
        {mejor && (
          <span className="whitespace-nowrap rounded-md bg-brand px-1.5 py-0.5 text-xs font-medium text-on-brand">
            Menor ISR
          </span>
        )}
      </div>
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


  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Sueldo mensual bruto"
          prefijo="$"
          inputMode="decimal"
          value={sueldo}
          onChange={(e) => setSueldo(e.target.value)}
        />
        <Input
          label="Días de aguinaldo"
          inputMode="numeric"
          value={dias}
          onChange={(e) => setDias(e.target.value)}
          ayuda="Mínimo por ley: 15. Usa más si tu empresa los da."
        />
        <div className="space-y-2">
          <Segmentado
            label="¿Trabajaste todo 2026?"
            modo="fila"
            value={todoElAnio ? 'si' : 'no'}
            onChange={(v) => setTodoElAnio(v === 'si')}
            options={[
              { value: 'si', label: 'Sí' },
              { value: 'no', label: 'No' },
            ]}
          />
          {!todoElAnio && (
            <Input
              label="Fecha de ingreso"
              type="date"
              min="2026-01-01"
              max="2026-12-31"
              value={ingreso}
              onChange={(e) => e.target.value && setIngreso(e.target.value)}
              extra={<Ayuda texto="Se calcula la parte proporcional a los días trabajados del ingreso al 31 de diciembre." />}
            />
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
