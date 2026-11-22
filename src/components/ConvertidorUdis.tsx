'use client';

import { useMemo, useState } from 'react';
import { fechaLarga } from '@/lib/banxico/parse';
import { Input } from '@/components/ui/Input';
import { Segmentado } from '@/components/ui/Segmentado';
import { Ayuda } from '@/components/ui/Tooltip';

type Punto = { fecha: string; valor: number };
type Sentido = 'udis-pesos' | 'pesos-udis';

function ultimoHasta(puntos: Punto[], fecha: string) {
  for (let i = puntos.length - 1; i >= 0; i--) if (puntos[i].fecha <= fecha) return puntos[i];
  return undefined;
}

const mxn = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export function ConvertidorUdis({ puntos, hoy }: { puntos: Punto[]; hoy: string }) {
  const [sentido, setSentido] = useState<Sentido>('udis-pesos');
  const [monto, setMonto] = useState('100000');
  const [fecha, setFecha] = useState(hoy);

  const r = useMemo(() => {
    const n = Number(monto.replace(/[^\d.]/g, ''));
    const p = ultimoHasta(puntos, fecha);
    if (!p || !(n > 0)) return null;
    return { p, resultado: sentido === 'udis-pesos' ? n * p.valor : n / p.valor };
  }, [monto, fecha, sentido, puntos]);

  return (
    <section className="mt-6 grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
      <div className="space-y-4">
        <Segmentado
          label="Conversión"
          modo="fila"
          value={sentido}
          onChange={setSentido}
          options={[
            { value: 'udis-pesos', label: 'UDIS a pesos' },
            { value: 'pesos-udis', label: 'Pesos a UDIS' },
          ]}
        />
        <Input
          label={sentido === 'udis-pesos' ? 'Cantidad en UDIS' : 'Cantidad en pesos'}
          prefijo={sentido === 'pesos-udis' ? '$' : undefined}
          inputMode="decimal"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          extra={<Ayuda texto="Los créditos en UDIS (Infonavit, hipotecas, bonos) cambian de valor en pesos cada día con la inflación." />}
        />
        <Input
          label="Fecha"
          type="date"
          min={puntos[0]?.fecha}
          max={puntos.at(-1)?.fecha}
          value={fecha}
          onChange={(e) => e.target.value && setFecha(e.target.value)}
          ayuda="Puedes elegir fechas futuras ya publicadas por Banxico."
        />
      </div>
      <div aria-live="polite" className="flex flex-col justify-center">
        {r ? (
          <>
            <p className="text-sm text-text-soft">Resultado</p>
            <p className="text-4xl font-bold tabular-nums text-text">
              {sentido === 'udis-pesos'
                ? mxn(r.resultado)
                : `${r.resultado.toLocaleString('es-MX', { maximumFractionDigits: 2 })} UDIS`}
            </p>
            <p className="mt-1 text-sm text-text-soft">
              Valor de la UDI el {fechaLarga(r.p.fecha)}: ${r.p.valor.toFixed(6)}
            </p>
          </>
        ) : (
          <p className="text-sm text-text-soft">Escribe una cantidad para convertir.</p>
        )}
      </div>
    </section>
  );
}
