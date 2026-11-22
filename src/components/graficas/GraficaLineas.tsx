'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { etiquetaX, formatoEje, formatoValor, type EjeX, type Unidad } from './formato';

export type SerieLinea = {
  clave: string;
  nombre: string;
  color: string; // var(--serie-n)
  puntos: { x: string; valor: number }[];
};

type Props = {
  series: SerieLinea[];
  unidad: Unidad;
  eje: EjeX;
  altura?: number;
  /** Franja de referencia (p. ej. el rango de la meta de inflación de Banxico). */
  banda?: { desde: number; hasta: number; etiqueta: string };
  /** Línea horizontal de referencia (p. ej. la meta de 3 %). */
  referencia?: { valor: number; etiqueta: string };
  /** Título accesible de la gráfica. */
  titulo: string;
};

/**
 * Gráfica de líneas (Recharts) con la estética de Noud: líneas de 2 px, rejilla discreta, una sola escala,
 * tooltip con línea guía y leyenda con nombre + último valor (la identidad nunca depende solo del color).
 */
export function GraficaLineas({ series, unidad, eje, altura = 320, banda, referencia, titulo }: Props) {
  // Une las series por fecha en filas { x, [clave]: valor }.
  const filas = new Map<string, Record<string, number | string>>();
  for (const s of series) for (const p of s.puntos) {
    if (!filas.has(p.x)) filas.set(p.x, { x: p.x });
    filas.get(p.x)![s.clave] = p.valor;
  }
  const datos = [...filas.values()].sort((a, b) => String(a.x).localeCompare(String(b.x)));

  return (
    <figure className="w-full">
      {series.length > 1 && (
        <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="Leyenda">
          {series.map((s) => {
            const ultimo = s.puntos.at(-1);
            return (
              <li key={s.clave} className="flex items-center gap-2">
                <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} aria-hidden />
                <span className="text-text-soft">{s.nombre}</span>
                {ultimo && <span className="font-semibold text-text">{formatoValor(ultimo.valor, unidad)}</span>}
              </li>
            );
          })}
        </ul>
      )}
      <div style={{ height: altura }} role="img" aria-label={titulo}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            {banda && (
              <ReferenceArea
                y1={banda.desde}
                y2={banda.hasta}
                fill="var(--banda-meta)"
                stroke="none"
                ifOverflow="extendDomain"
                label={{ value: banda.etiqueta, position: 'insideTopLeft', fill: 'var(--color-text-soft)', fontSize: 11 }}
              />
            )}
            {referencia && (
              <ReferenceLine y={referencia.valor} stroke="var(--color-brand-dark)" strokeWidth={1} ifOverflow="extendDomain" />
            )}
            <XAxis
              dataKey="x"
              tickFormatter={(x: string) => etiquetaX(x, eje, true)}
              tick={{ fill: 'var(--color-text-soft)', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border-strong)' }}
              minTickGap={28}
            />
            <YAxis
              tickFormatter={(v: number) => formatoEje(v, unidad)}
              tick={{ fill: 'var(--color-text-soft)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={unidad === 'pesos' ? 60 : 52}
              domain={['auto', 'auto']}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-border-strong)', strokeWidth: 1 }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-md">
                    <p className="mb-1 font-semibold text-text">{etiquetaX(String(label), eje)}</p>
                    {payload.map((p) => {
                      const s = series.find((x) => x.clave === p.dataKey);
                      return (
                        <p key={String(p.dataKey)} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: s?.color }} aria-hidden />
                          <span className="text-text-soft">{s?.nombre}</span>
                          <span className="ml-auto pl-3 font-semibold text-text">{formatoValor(Number(p.value), unidad)}</span>
                        </p>
                      );
                    })}
                  </div>
                ) : null
              }
            />
            {series.map((s) => (
              <Line
                key={s.clave}
                type="monotone"
                dataKey={s.clave}
                name={s.nombre}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-bg-card)' }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {referencia && (
        <figcaption className="mt-1 text-xs text-text-soft">Línea horizontal: {referencia.etiqueta}.</figcaption>
      )}
    </figure>
  );
}
