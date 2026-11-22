'use client';

import { useId } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Texto de ayuda bajo el campo (se enlaza con aria-describedby). */
  ayuda?: React.ReactNode;
  /** Símbolo dentro del campo, a la izquierda (p. ej. "$"). */
  prefijo?: string;
  /** Elemento junto a la etiqueta, p. ej. un <Ayuda> con tooltip. */
  extra?: React.ReactNode;
}

/** Campo de texto con la estética de Noud XML. Funciona en tema claro y oscuro. */
export function Input({ label, ayuda, prefijo, extra, className, id, ...props }: InputProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const ayudaId = ayuda ? `${inputId}-ayuda` : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5 text-sm">
      {label && (
        <div className="flex items-center gap-1.5">
          <label htmlFor={inputId} className="select-none text-xs font-bold uppercase tracking-wider text-text-soft">
            {label}
          </label>
          {extra}
        </div>
      )}
      <div className="relative">
        {prefijo && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-soft">{prefijo}</span>
        )}
        <input
          id={inputId}
          aria-describedby={ayudaId}
          {...props}
          className={clsx(
            'h-10 w-full rounded-xl border border-border-strong bg-card px-3 text-text tabular-nums',
            prefijo && 'pl-7',
            'transition-all duration-200 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15',
            'disabled:cursor-not-allowed disabled:opacity-60',
            className,
          )}
        />
      </div>
      {ayuda && (
        <p id={ayudaId} className="text-xs text-text-soft">
          {ayuda}
        </p>
      )}
    </div>
  );
}
