import type { Metadata } from 'next';
import Link from 'next/link';
import { ConvertidorDolares } from '@/components/ConvertidorDolares';
import { Fuente } from '@/components/Fuente';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { SERIES } from '@/lib/banxico/series';
import { datosTipoDeCambio, sumarDias } from '@/lib/banxico/tipo-de-cambio';
import { url } from '@/lib/sitio';

const RUTA = '/convertidor-dolares-pesos';

export const metadata: Metadata = {
  title: 'Convertidor de dólares a pesos con el tipo de cambio DOF',
  description:
    'Convierte dólares a pesos (y pesos a dólares) con el tipo de cambio que corresponde a la fecha de tu factura o pago, según lo publicado por Banxico en el DOF.',
  alternates: { canonical: url(RUTA) },
};

export const revalidate = 3600;

// Se envían al navegador ~13 meses de datos (unos 400 por serie): suficiente para facturas recientes
// sin cargar todo el histórico.
const DIAS = 400;

export default async function ConvertidorPage() {
  const d = await datosTipoDeCambio();
  const desde = sumarDias(d.hoy, -DIAS);
  const recorte = <T extends { fecha: string }>(xs: T[]) => xs.filter((p) => p.fecha >= desde);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-text">Convertidor de dólares a pesos (tipo de cambio DOF)</h1>
      <p className="mt-2 max-w-2xl text-text-soft">
        Usa el tipo de cambio que corresponde a la fecha de la operación: el publicado por Banxico en el Diario
        Oficial de la Federación el día hábil anterior.
      </p>

      <ConvertidorDolares hoy={d.hoy} liquidacion={recorte(d.liquidacion)} publicaciones={recorte(d.publicaciones)} />
      <Fuente serieId={`${SERIES.tipoCambioDOF.id} y ${SERIES.fix.id}`} />

      <p className="mt-4 text-sm text-text-soft">
        ¿Necesitas una fecha más antigua? Consulta el{' '}
        <Link href={SERIES.tipoCambioDOF.ruta} className="underline underline-offset-2">
          historial del tipo de cambio DOF
        </Link>
        .
      </p>

      <TarjetaNoud
        titulo="Deja de convertir factura por factura"
        texto="Noud XML lee tus CFDI en dólares, toma el tipo de cambio de cada uno y concilia tus complementos de pago en moneda extranjera."
        campana="convertidor"
        ubicacion="bajo-calculadora"
      />

      <section className="mt-12 space-y-3 text-text-soft">
        <h2 className="text-xl font-semibold text-text">¿Qué tipo de cambio usar?</h2>
        <p>
          Para operaciones en dólares que se pagan en México se usa el tipo de cambio que Banxico publica en el DOF.
          Contablemente, las operaciones de un día suelen registrarse con el publicado el día hábil anterior; en fines
          de semana y días inhábiles se toma la última publicación. Confirma con tu contador el criterio de cada
          operación.
        </p>
      </section>
    </main>
  );
}
