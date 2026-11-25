'use client';

import { useMemo, useState } from 'react';
import { calcularIsr, PERIODOS, SUBSIDIO_2026, type Periodo } from '@/lib/fiscal/isr-2026';
import { Input } from '@/components/ui/Input';
import { Segmentado } from '@/components/ui/Segmentado';
import { Select } from '@/components/ui/Select';
import { Ayuda } from '@/components/ui/Tooltip';
import { AccionesResultado } from '@/components/AccionesResultado';

const pesos = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
const pct = (n: number) => `${n.toLocaleString('es-MX', { maximumFractionDigits: 2 })}%`;

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const NOMBRE: Record<Periodo, string> = {
  diario: 'diario',
  semanal: 'semanal',
  decenal: 'decenal',
  quincenal: 'quincenal',
  mensual: 'mensual',
};

export function CalculadoraIsr({ mesInicial }: { mesInicial: number }) {
  const [texto, setTexto] = useState('7500');
  const [periodo, setPeriodo] = useState<Periodo>('quincenal');
  const [mes, setMes] = useState(mesInicial);

  const sueldo = Number(texto.replace(/[^\d.]/g, ''));
  const r = useMemo(() => calcularIsr(sueldo, periodo, mes), [sueldo, periodo, mes]);
  const dias = PERIODOS.find((p) => p.valor === periodo)!.dias;

  /** Al cambiar de periodo, convierte el sueldo escrito para que el ejemplo siga siendo comparable. */
  const cambiarPeriodo = (nuevo: Periodo) => {
    const diasNuevo = PERIODOS.find((p) => p.valor === nuevo)!.dias;
    if (sueldo > 0) setTexto(String(Math.round((sueldo / dias) * diasNuevo * 100) / 100));
    setPeriodo(nuevo);
  };

  return (
    <section className="mt-6 grid gap-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 md:grid-cols-2">
      <div className="space-y-4">
        <Segmentado
          label="¿Cada cuánto te pagan?"
          value={periodo}
          onChange={cambiarPeriodo}
          modo="rejilla"
          options={PERIODOS.map((p) => ({ value: p.valor, label: p.texto }))}
        />
        <Input
          label={`Sueldo ${NOMBRE[periodo]} bruto`}
          prefijo="$"
          inputMode="decimal"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          ayuda={
            sueldo > 0 && periodo !== 'mensual'
              ? `Equivale a ${pesos((sueldo / dias) * 30.4)} al mes (${dias} días por periodo, mes de 30.4 días).`
              : undefined
          }
          extra={
            <Ayuda texto="Lo que se gana en el periodo antes de impuestos. Se supone que todo es gravable (sin aguinaldo, horas extra ni otros exentos)." />
          }
        />
        <Select
          label="Mes del pago"
          value={mes}
          onChange={setMes}
          options={MESES.map((m, i) => ({ value: i + 1, label: `${m} 2026` }))}
          ayuda={`El subsidio mensual es ${pesos(SUBSIDIO_2026.enero)} en enero y ${pesos(SUBSIDIO_2026.febreroADiciembre)} de febrero a diciembre; en periodos menores a un mes se prorratea por días.`}
        />
      </div>

      <div aria-live="polite">
        {r ? (
          <>
            <div className="rounded-2xl bg-brand-light p-4 sm:p-5">
              <p className="text-sm font-medium text-brand-ink">ISR a retener en el periodo {NOMBRE[periodo]}</p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-text">{pesos(r.isrRetenido)}</p>
              <p className="mt-1 text-sm text-text-soft">
                Sueldo después de ISR: <span className="font-medium text-text">{pesos(r.neto)}</span> · tasa efectiva{' '}
                {pct(r.tasaEfectiva)}
              </p>
              <AccionesResultado
                ruta="/calculadora-isr-salarios"
                texto="Calcula cuánto ISR te retienen de tu sueldo (semanal, quincenal o mensual):"
                campana="isr-2026"
                ubicacion="isr"
                atajos={[
                  { href: '/calculadora-aguinaldo', etiqueta: 'Tu aguinaldo 2026' },
                  { href: '/tablero', etiqueta: 'La economía hoy' },
                ]}
              />
            </div>

            <dl className="mt-5 divide-y divide-border text-sm">
              {[
                ['Base gravable', pesos(r.base)],
                ['(−) Límite inferior', pesos(r.renglon.limiteInferior)],
                ['(=) Excedente', pesos(r.excedente)],
                ['(×) Tasa sobre excedente', pct(r.renglon.porcentaje)],
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
            {(r.base / dias) * 30.4 > SUBSIDIO_2026.limiteIngresoMensual && (
              <p className="mt-3 text-xs text-text-soft">
                No aplica subsidio: el sueldo, llevado a mes, rebasa {pesos(SUBSIDIO_2026.limiteIngresoMensual)}.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-text-soft">Escribe un sueldo para ver el cálculo.</p>
        )}
      </div>
    </section>
  );
}