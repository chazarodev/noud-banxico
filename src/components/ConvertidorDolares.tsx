'use client';

import { useMemo, useState } from 'react';
import { fechaLarga } from '@/lib/banxico/parse';

type Punto = { fecha: string; valor: number };

type Props = {
  hoy: string;
  liquidacion: Punto[]; // SF60653: tipo de cambio para operaciones de cada día
  publicaciones: Punto[]; // derivado: publicado en el DOF cada día hábil
};

/** Último punto en o antes de `fecha` (listas ordenadas de menor a mayor). */
function ultimoHasta(puntos: Punto[], fecha: string): Punto | undefined {
  for (let i = puntos.length - 1; i >= 0; i--) if (puntos[i].fecha <= fecha) return puntos[i];
  return undefined;
}

const diaAnterior = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

const mxn = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const usd = (n: number) => `${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;

export function ConvertidorDolares({ hoy, liquidacion, publicaciones }: Props) {
  const [monto, setMonto] = useState('1000');
  const [sentido, setSentido] = useState<'usd-mxn' | 'mxn-usd'>('usd-mxn');
  const [fecha, setFecha] = useState(hoy);

  const minimo = liquidacion[0]?.fecha;
  const maximo = liquidacion.at(-1)?.fecha ?? hoy;

  const calculo = useMemo(() => {
    const cantidad = Number(monto.replace(/[^\d.]/g, ''));
    const tc = ultimoHasta(liquidacion, fecha);
    if (!tc || !Number.isFinite(cantidad) || cantidad <= 0) return null;
    const origen = ultimoHasta(publicaciones, diaAnterior(fecha));
    const resultado = sentido === 'usd-mxn' ? cantidad * tc.valor : cantidad / tc.valor;
    return { cantidad, tc, origen, resultado };
  }, [monto, sentido, fecha, liquidacion, publicaciones]);

  const campo = 'mt-1 w-full rounded-xl border border-border-strong bg-card px-3 py-2.5 text-text';

  return (
    <section className="mt-6 grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
      <div className="space-y-4">
        <div className="inline-flex rounded-xl border border-border-strong p-1 text-sm">
          {(['usd-mxn', 'mxn-usd'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSentido(s)}
              className={`rounded-lg px-3 py-1.5 ${sentido === s ? 'bg-brand text-on-brand' : 'text-text-soft'}`}
            >
              {s === 'usd-mxn' ? 'Dólares a pesos' : 'Pesos a dólares'}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="text-sm font-medium text-text">
            Monto en {sentido === 'usd-mxn' ? 'dólares (USD)' : 'pesos (MXN)'}
          </span>
          <input
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className={`${campo} text-lg tabular-nums`}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-text">Fecha de la operación</span>
          <input
            type="date"
            value={fecha}
            min={minimo}
            max={maximo}
            onChange={(e) => e.target.value && setFecha(e.target.value)}
            className={campo}
          />
          <span className="mt-1 block text-xs text-text-soft">
            La fecha de tu factura o de tu pago. Disponible desde el {minimo ? fechaLarga(minimo) : '—'}.
          </span>
        </label>
      </div>

      <div aria-live="polite">
        {calculo ? (
          <>
            <p className="text-sm font-medium text-text-soft">Resultado</p>
            <p className="text-4xl font-bold tabular-nums text-text">
              {sentido === 'usd-mxn' ? mxn(calculo.resultado) : usd(calculo.resultado)}
            </p>
            <p className="mt-3 text-sm text-text-soft">
              Tipo de cambio para operaciones del {fechaLarga(fecha)}:{' '}
              <span className="font-medium tabular-nums text-text">${calculo.tc.valor.toFixed(4)}</span>
            </p>
            {calculo.origen && (
              <p className="mt-1 text-xs text-text-soft">
                Publicado en el DOF el {fechaLarga(calculo.origen.fecha)} (día hábil anterior a la operación).
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-text-soft">Escribe un monto para ver la conversión.</p>
        )}
      </div>
    </section>
  );
}
