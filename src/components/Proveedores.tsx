'use client';

import { ThemeProvider } from 'next-themes';

/** Proveedores de cliente. El tema usa el mismo interruptor que Noud XML: <html data-theme="dark">. */
export function Proveedores({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
