'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

/** Interruptor claro/oscuro (mismo patrón que Noud XML). Requiere <ThemeProvider attribute="data-theme">. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  // Antes de montar no se conoce el tema: hueco del mismo tamaño (sin salto ni error de hidratación).
  if (!montado) return <span className="h-10 w-10" aria-hidden />;

  const oscuro = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(oscuro ? 'light' : 'dark')}
      aria-label={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={oscuro ? 'Tema claro' : 'Tema oscuro'}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-text-soft transition-colors duration-200 hover:bg-brand-light hover:text-brand-ink"
    >
      {oscuro ? <Sun size={16} className="stroke-[2.2]" /> : <Moon size={16} className="stroke-[2.2]" />}
    </button>
  );
}
