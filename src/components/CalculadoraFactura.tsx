'use client';

import { useMemo, useState } from 'react';
import {
  ACTIVIDADES,
  calcularFactura,
  impuestoMesResico,
  type Actividad,
  type Cliente,
  type Modo,
  type Regimen,
} from '@/lib/fiscal/factura';
import { Input } from '@/components/ui/Input';
import { Segmentado } from '@/components/ui/Segmentado';
import { Select } from '@/components/ui/Select';
import { Ayuda } from '@/components/ui/Tooltip';

const pesos = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const num = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const tasa6 = (pct: number) => (pct / 100).toFixed(6); // así va en el CFDI: 0.160000

const ETIQUETA_MODO: Record<Modo, string> = {
  subtotal: 'Precio sin IVA (subtotal)',
  total: 'Total de la factura con IVA',
  deposito: 'Lo que me depositaron',
};

export function CalculadoraFactura() {
  const [regimen, setRegimen] = useState<Regimen>('resico');
  const [actividad, setActividad] = useState<Actividad>('honorarios');
  const [cliente, setCliente] = useState<Cliente>('empresa');
  const [frontera, setFrontera] = useState(false);
  const [modo, setModo] = useState<Modo>('deposito');
  const [monto, setMonto] = useState('10000');
  const [ivaGastos, setIvaGastos] = useState('0');

  const f = useMemo(
    () => calcularFactura({ regimen, actividad, cliente, ivaFrontera: frontera, modo, monto: num(monto) }),
    [regimen, actividad, cliente, frontera, modo, monto],
  );
  const mes = useMemo(
    () => (f && regimen === 'resico' ? impuestoMesResico(f.subtotal, f.retIsr, f.iva, f.retIva, num(ivaGastos)) : null),
    [f, regimen, ivaGastos],
  );


  return (
    <>
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <Segmentado
              label="Tu régimen"
              modo="fila"
              value={regimen}
              onChange={setRegimen}
              options={[
                { value: 'resico', label: 'RESICO' },
                { value: 'general', label: 'Régimen general' },
              ]}
            />
            <Select
              label="¿Qué cobras?"
              value={actividad}
              onChange={setActividad}
              options={ACTIVIDADES.map((a) => ({ value: a.valor, label: a.texto }))}
            />
            <Segmentado
              label="¿A quién le facturas?"
              modo="fila"
              value={cliente}
              onChange={setCliente}
              options={[
                { value: 'empresa', label: 'Empresa (persona moral)' },
                { value: 'persona', label: 'Persona física o público' },
              ]}
            />
            <Segmentado
              label="Tasa de IVA"
              modo="fila"
              value={frontera ? '8' : '16'}
              onChange={(v) => setFrontera(v === '8')}
              options={[
                { value: '16', label: '16 % general' },
                { value: '8', label: '8 % región fronteriza' },
              ]}
            />
          </div>

          <div className="space-y-4">
            <Segmentado
              label="¿Qué cantidad conoces?"
              value={modo}
              onChange={setModo}
              options={(Object.keys(ETIQUETA_MODO) as Modo[]).map((m) => ({ value: m, label: ETIQUETA_MODO[m] }))}
            />
            <Input
              label={ETIQUETA_MODO[modo]}
              prefijo="$"
              inputMode="decimal"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="text-lg"
              ayuda={
                modo === 'deposito'
                  ? 'Calculamos cuánto debe decir la factura para que, después de retenciones, recibas esta cantidad.'
                  : undefined
              }
              extra={
                <Ayuda texto="Subtotal: precio antes de IVA. Total: lo que dice la factura con IVA. Depósito: lo que llega a tu cuenta después de retenciones." />
              }
            />
          </div>
        </div>

        {f && (
          <div aria-live="polite" className="mt-6 grid gap-6 border-t border-border pt-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-text-soft">Tu factura</p>
              <dl className="mt-2 divide-y divide-border text-sm">
                {(
                  [
                    ['Subtotal', f.subtotal, null],
                    [`(+) IVA trasladado ${f.tasaIva} %`, f.iva, f.tasaIva ? `Tasa ${tasa6(f.tasaIva)}` : 'Exento'],
                    ['(=) Total de la factura', f.total, null],
                    [`(−) ISR retenido ${f.tasaRetIsr} %`, f.retIsr, f.tasaRetIsr ? `Tasa ${tasa6(f.tasaRetIsr)}` : null],
                    [`(−) IVA retenido ${f.tasaRetIva} %`, f.retIva, f.tasaRetIva ? `Tasa ${tasa6(f.tasaRetIva)}` : null],
                  ] as [string, number, string | null][]
                ).map(([k, v, cfdi]) => (
                  <div key={k} className="flex justify-between gap-4 py-1.5">
                    <dt className="text-text-soft">
                      {k}
                      {cfdi && <span className="block text-xs">En el CFDI: {cfdi}</span>}
                    </dt>
                    <dd className="tabular-nums text-text">{pesos(v)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex items-baseline justify-between rounded-xl bg-brand-light px-3 py-2">
                <span className="text-sm font-medium text-text">Recibes en tu cuenta</span>
                <span className="text-2xl font-bold tabular-nums text-text">{pesos(f.deposito)}</span>
              </div>
              <p className="mt-2 text-xs text-text-soft">Régimen fiscal en el CFDI: {f.claveRegimen}</p>
              {f.notas.map((n) => (
                <p key={n} className="mt-1 text-xs text-text-soft">
                  {n}
                </p>
              ))}
            </div>

            <div>
              {mes ? (
                <>
                  <p className="text-sm font-medium text-text-soft">Si es tu único ingreso del mes (RESICO)</p>
                  <div className="mt-2">
                    <Input
                      label="IVA de tus gastos del mes"
                      prefijo="$"
                      inputMode="decimal"
                      value={ivaGastos}
                      onChange={(e) => setIvaGastos(e.target.value)}
                      extra={<Ayuda texto="El IVA que te cobraron en facturas de gastos de tu actividad (IVA acreditable)." />}
                    />
                  </div>
                  {mes.tasaIsr === null ? (
                    <p className="mt-3 text-sm text-text-soft">
                      Ingresos por arriba del límite mensual de RESICO: revisa tu régimen con tu contador.
                    </p>
                  ) : (
                    <dl className="mt-3 divide-y divide-border text-sm">
                      <div className="flex justify-between py-1.5">
                        <dt className="text-text-soft">ISR RESICO ({mes.tasaIsr} % de {pesos(f.subtotal)})</dt>
                        <dd className="tabular-nums text-text">{pesos(mes.isrCausado)}</dd>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <dt className="text-text-soft">(−) ISR que ya te retuvieron</dt>
                        <dd className="tabular-nums text-text">{pesos(f.retIsr)}</dd>
                      </div>
                      <div className="flex justify-between py-1.5 font-medium">
                        <dt className="text-text">ISR a pagar el día 17</dt>
                        <dd className="tabular-nums text-text">{pesos(mes.isrAPagar)}</dd>
                      </div>
                      <div className="flex justify-between py-1.5 font-medium">
                        <dt className="text-text">IVA a pagar el día 17</dt>
                        <dd className="tabular-nums text-text">{pesos(mes.ivaAPagar)}</dd>
                      </div>
                      {mes.saldoIva > 0 && (
                        <div className="flex justify-between py-1.5">
                          <dt className="text-text-soft">IVA a favor</dt>
                          <dd className="tabular-nums text-text">{pesos(mes.saldoIva)}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                  <p className="mt-2 text-xs text-text-soft">
                    IVA a pagar = IVA cobrado − IVA retenido − IVA de tus gastos. En RESICO el ISR se paga sobre lo
                    cobrado, sin deducciones.
                  </p>
                </>
              ) : (
                <p className="text-sm text-text-soft">
                  En régimen general, el ISR mensual depende de tus gastos deducibles y se calcula con la tarifa del
                  artículo 106 de la LISR; la retención de 10 % es un anticipo que restas en tu pago mensual.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
