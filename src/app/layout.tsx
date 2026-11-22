import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Encabezado } from '@/components/Encabezado';
import { PiePagina } from '@/components/PiePagina';
import { Proveedores } from '@/components/Proveedores';
import { SITE_URL } from '@/lib/sitio';
import './globals.css';

// Inter, la misma tipografía de Noud XML. next/font la sirve desde tu dominio (sin llamar a Google en cada visita).
const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: {
    default: 'Indicadores económicos de Banxico hoy | Noud XML',
    template: '%s | Indicadores Noud XML',
  },
  description:
    'Tipo de cambio DOF, UDIS, TIIE, tasa objetivo e inflación con datos oficiales del Banco de México, actualizados para contadores y pymes.',
  applicationName: 'Indicadores Noud XML',
  openGraph: { siteName: 'Indicadores Noud XML', locale: 'es_MX', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-bg text-text antialiased`}>
        <Proveedores>
          <Encabezado />
          {children}
          <PiePagina />
        </Proveedores>
      </body>
    </html>
  );
}
