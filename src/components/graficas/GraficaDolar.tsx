'use client';

import { useState } from 'react';
import { Segmentado } from '@/components/ui/Segmentado';
import { GraficaLineas } from './GraficaLineas';
import { TablaDatos } from './TablaDatos';
import { etiquetaX } from './formato';

type Rango = '1m' | '6m' | '1a' | '5a' | 'todo';
type Extremo = { fecha: string; valor: number };
type Resumen = { inicio: Extremo; fin: Extremo; maximo: Extremo; minimo: Extremo; variacion: number };

type Props = {
  diario: { fecha: string; valor: number }[];
  mensual: { mes: string; valor: number }[];
  desde: Record<Rango, string>;
  resumen: Partial<Record<Rango, Resumen>>;
};

const pesos = (n: number) => `$${n.toFixed(4)}`;
const ETIQUETAS: Record<Rango, string> = { '1m': '1 mes', '6m': '6 meses', '1a': '1 año', '5a': '5 años', todo: 'Desde 1991' };

export function GraficaDolar({ diario, mensual, desde, resumen }: Props) {
  const [rango, setRango] = useState<Rango>('1a');
  const largo = rango === '5a' || rango === 'todo';
  const puntos = largo
    ? mensual.filter((p) => p.mes >= desde[rango].slice(0, 7)).map((p) => ({ x: p.mes, valor: p.valor }))
    : diario.filter((p) => p.fecha >= desde[rango]).map((p) => ({ x: p.fecha, valor: p.valor }));
  const r = resumen[rango];
  const fechaCorta = (f: string) => etiquetaX(f.slice(0, 10), 'dia');

  return (
    <div>
      <Segmentado
        label="Periodo"
        value={rango}
        onChange={setRango}
        options={(Object.keys(ETIQUETAS) as Rango[]).map((k) => ({ value: k, label: ETIQUETAS[k] }))}
      />

      {r && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className={`rounded-2xl border p-4 ${r.variacion >= 0 ? 'border-terracotta/40 bg-danger-soft' : 'border-brand/40 bg-brand-light'}`}>
            <p className="text-sm text-text-soft">Variación en el periodo</p>
            <p className="mt-1 text-2xl font-bold text-text">
              {r.variacion > 0 ? '▲' : r.variacion < 0 ? '▼' : ''} {Math.abs(r.variacion).toFixed(2)}%
            </p>
            <p className="text-xs text-text-soft">
              {pesos(r.inicio.valor)} → {pesos(r.fin.valor)} ({r.variacion >= 0 ? 'el peso se depreció' : 'el peso se apreció'})
            </p>
          </div>
          <div className="rounded-2xl border border-sand/60 bg-warning-soft p-4">
            <p className="text-sm text-text-soft">Máximo</p>
            <p className="mt-1 text-2xl font-bold text-text">{pesos(r.maximo.valor)}</p>
            <p className="text-xs text-text-soft">{fechaCorta(r.maximo.fecha)}</p>
          </div>
          <div className="rounded-2xl border border-info/30 bg-info-soft p-4">
            <p className="text-sm text-text-soft">Mínimo</p>
            <p className="mt-1 text-2xl font-bold text-text">{pesos(r.minimo.valor)}</p>
            <p className="text-xs text-text-soft">{fechaCorta(r.minimo.fecha)}</p>
          </div>
        </div>
      )}

      <div className="mt-5">
        <GraficaLineas
          titulo={`Tipo de cambio FIX, ${ETIQUETAS[rango]}`}
          unidad="pesos"
          eje={largo ? 'mes' : 'dia'}
          series={[{ clave: 'fix', nombre: 'FIX', color: 'var(--serie-1)', puntos }]}
        />
        {largo && <p className="mt-1 text-xs text-text-soft">En 5 años y desde 1991 la línea muestra promedios mensuales; el máximo y el mínimo son diarios.</p>}
        <TablaDatos
          columnas={['Pesos por dólar']}
          unidad="pesos"
          eje={largo ? 'mes' : 'dia'}
          filas={puntos.map((p) => ({ x: p.x, valores: [p.valor] }))}
          limite={largo ? 60 : 31}
        />
      </div>
    </div>
  );
}
