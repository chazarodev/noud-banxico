'use client';

import { Label, Field, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export interface Opcion<T extends string | number> {
  value: T;
  label: string;
}

interface Props<T extends string | number> {
  value: T;
  onChange: (v: T) => void;
  options: Opcion<T>[];
  label?: string;
  ayuda?: string;
  className?: string;
  disabled?: boolean;
}

/** Selector animado (Headless UI), inspirado en el AnimatedSelect de Noud XML. Accesible con teclado. */
export function Select<T extends string | number>({ value, onChange, options, label, ayuda, className, disabled }: Props<T>) {
  const igual = (a: unknown, b: unknown) => String(a ?? '') === String(b ?? '');
  const seleccionada = options.find((o) => igual(o.value, value));

  return (
    <Field disabled={disabled} className={clsx('flex w-full flex-col gap-1.5 text-sm', className)}>
      {label && (
        <Label className="select-none text-xs font-bold uppercase tracking-wider text-text-soft">{label}</Label>
      )}
      <Listbox value={value} onChange={onChange} by={igual}>
        <ListboxButton
          className={clsx(
            'flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border-strong bg-card px-3 text-left text-text',
            'transition-all duration-200 focus:outline-none data-[focus]:border-brand data-[focus]:ring-4 data-[focus]:ring-brand/15',
            'data-[open]:border-brand data-[open]:ring-4 data-[open]:ring-brand/15',
            'cursor-pointer data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60',
          )}
        >
          <span className="min-w-0 truncate font-medium">{seleccionada?.label ?? 'Selecciona una opción'}</span>
          <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-text-soft transition-transform duration-200 in-data-[open]:rotate-180" />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom start"
          transition
          className={clsx(
            'z-50 mt-1 max-h-64 w-[var(--button-width)] overflow-y-auto rounded-xl border border-border-strong bg-card p-1.5 shadow-md',
            'origin-top transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none',
          )}
        >
          {options.map((o) => (
            <ListboxOption
              key={String(o.value)}
              value={o.value}
              className="group flex cursor-pointer select-none items-center justify-between gap-2 rounded-lg px-3 py-2 text-text data-[focus]:bg-brand-light data-[focus]:text-brand-ink data-[selected]:font-semibold"
            >
              {o.label}
              <Check aria-hidden className="invisible h-4 w-4 text-brand-ink group-data-[selected]:visible" />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
      {ayuda && <p className="text-xs text-text-soft">{ayuda}</p>}
    </Field>
  );
}
