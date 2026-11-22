'use client';

import { useMemo, useState } from 'react';
import { fechaLarga } from '@/lib/banxico/parse';
import { Input } from '@/components/ui/Input';
import { Segmentado } from '@/components/ui/Segmentado';
import { Ayuda } from '@/components/ui/Tooltip';

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


  return (
    <section className="mt-6 grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
      <div className="space-y-4">
        <Segmentado
          label="Conversión"
          modo="fila"
          value={sentido}
          onChange={setSentido}
          options={[
            { value: 'usd-mxn', label: 'Dólares a pesos' },
            { value: 'mxn-usd', label: 'Pesos a dólares' },
          ]}
        />
        <Input
          label={`Monto en ${sentido === 'usd-mxn' ? 'dólares (USD)' : 'pesos (MXN)'}`}
          prefijo="$"
          inputMode="decimal"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
        <Input
          label="Fecha de la operación"
          type="date"
          min={minimo}
          max={maximo}
          value={fecha}
          onChange={(e) => e.target.value && setFecha(e.target.value)}
          ayuda={`La fecha de tu factura o de tu pago. Disponible desde el ${minimo ? fechaLarga(minimo) : '—'}.`}
          extra={<Ayuda texto="Se usa el tipo de cambio publicado en el DOF el día hábil anterior a esta fecha." />}
        />
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
