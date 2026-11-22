'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { etiquetaX, formatoValor, type EjeX, type Unidad } from './formato';

type Props = {
  puntos: { x: string; valor: number }[];
  unidad: Unidad;
  eje: EjeX;
  color?: string;
  altura?: number;
  titulo: string;
};

/** Barras de una sola serie (sin leyenda: el título la nombra). Extremos redondeados de 4 px y separación entre barras. */
export function GraficaBarras({ puntos, unidad, eje, color = 'var(--serie-1)', altura = 280, titulo }: Props) {
  const datos = puntos.map((p) => ({ x: p.x, valor: p.valor }));
  return (
    <div style={{ height: altura }} role="img" aria-label={titulo}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 8, right: 8, bottom: 4, left: 4 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="x"
            tickFormatter={(x: string) => etiquetaX(x, eje, true)}
            tick={{ fill: 'var(--color-text-soft)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border-strong)' }}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(v: number) => formatoValor(v, unidad, true)}
            tick={{ fill: 'var(--color-text-soft)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={76}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-bg-hover)' }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-md">
                  <p className="font-semibold text-text">{etiquetaX(String(label), eje)}</p>
                  <p className="text-text">{formatoValor(Number(payload[0].value), unidad)}</p>
                </div>
              ) : null
            }
          />
          <Bar dataKey="valor" fill={color} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
