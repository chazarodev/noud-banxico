'use client';

import { clsx } from 'clsx';

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label?: string;
  /**
   * "fila": botones del mismo ancho en una línea. "envolver": se acomodan en varias líneas si no caben.
   * "rejilla": muchas opciones; en el celular, 3 columnas parejas; desde sm, todas en una línea.
   */
  modo?: 'fila' | 'envolver' | 'rejilla';
}

/** Grupo de opciones excluyentes (radiogroup) con la estética de Noud XML. */
export function Segmentado<T extends string>({ value, onChange, options, label, modo = 'envolver' }: Props<T>) {
  return (
    <div className="flex w-full flex-col gap-1.5 text-sm">
      {label && <span className="select-none text-xs font-bold uppercase tracking-wider text-text-soft">{label}</span>}
      <div
        role="radiogroup"
        aria-label={label}
        className={clsx(
          'rounded-xl border border-border-strong bg-card p-1',
          modo === 'fila' && 'grid auto-cols-fr grid-flow-col gap-1',
          modo === 'envolver' && 'flex flex-wrap gap-1',
          modo === 'rejilla' && 'grid grid-cols-3 gap-1 sm:grid-flow-col sm:auto-cols-fr sm:grid-cols-none',
        )}
      >
        {options.map((o) => {
          const activo = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => onChange(o.value)}
              className={clsx(
                'rounded-lg py-1.5 text-center transition-colors duration-150',
                modo === 'rejilla' ? 'px-1' : 'px-3',
                activo ? 'bg-brand font-semibold text-on-brand shadow-sm' : 'text-text-soft hover:bg-soft hover:text-text',
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}