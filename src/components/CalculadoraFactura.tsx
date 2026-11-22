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

const pesos = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const num = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const tasa6 = (pct: number) => (pct / 100).toFixed(6); // así va en el CFDI: 0.160000

function Opciones<T extends string>({
  valor,
  opciones,
  onChange,
}: {
  valor: T;
  opciones: { valor: T; texto: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => onChange(o.valor)}
          className={`rounded-xl border px-3 py-2 text-sm ${
            valor === o.valor ? 'border-brand bg-brand text-on-brand' : 'border-border-strong text-text-soft'
          }`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

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

  const campo = 'mt-1 w-full rounded-xl border border-border-strong bg-card px-3 py-2.5 text-text';

  return (
    <>
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-text">Tu régimen</span>
              <Opciones
                valor={regimen}
                onChange={setRegimen}
                opciones={[
                  { valor: 'resico', texto: 'RESICO' },
                  { valor: 'general', texto: 'Régimen general (honorarios, arrendamiento, empresarial)' },
                ]}
              />
            </div>
            <label className="block">
              <span className="text-sm font-medium text-text">¿Qué cobras?</span>
              <select value={actividad} onChange={(e) => setActividad(e.target.value as Actividad)} className={campo}>
                {ACTIVIDADES.map((a) => (
                  <option key={a.valor} value={a.valor}>
                    {a.texto}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="text-sm font-medium text-text">¿A quién le facturas?</span>
              <Opciones
                valor={cliente}
                onChange={setCliente}
                opciones={[
                  { valor: 'empresa', texto: 'A una empresa (persona moral)' },
                  { valor: 'persona', texto: 'A una persona física o público en general' },
                ]}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" checked={frontera} onChange={(e) => setFrontera(e.target.checked)} />
              Aplico IVA de 8 % (región fronteriza)
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-text">¿Qué cantidad conoces?</span>
              <Opciones
                valor={modo}
                onChange={setModo}
                opciones={(Object.keys(ETIQUETA_MODO) as Modo[]).map((m) => ({ valor: m, texto: ETIQUETA_MODO[m] }))}
              />
            </div>
            <label className="block">
              <span className="text-sm font-medium text-text">{ETIQUETA_MODO[modo]}</span>
              <input inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} className={`${campo} text-lg tabular-nums`} />
              {modo === 'deposito' && (
                <span className="mt-1 block text-xs text-text-soft">
                  Calculamos cuánto debe decir la factura para que, después de retenciones, recibas esta cantidad.
                </span>
              )}
            </label>
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
                  <label className="mt-2 block">
                    <span className="text-xs text-text-soft">IVA de tus gastos del mes (facturas que te hicieron)</span>
                    <input inputMode="decimal" value={ivaGastos} onChange={(e) => setIvaGastos(e.target.value)} className={`${campo} tabular-nums`} />
                  </label>
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
