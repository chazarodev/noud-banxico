import type { Metadata } from 'next';
import Link from 'next/link';
import { Fuente } from '@/components/Fuente';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { VerificadorCfdi } from '@/components/VerificadorCfdi';
import { SERIES } from '@/lib/banxico/series';
import { datosTipoDeCambio, sumarDias } from '@/lib/banxico/tipo-de-cambio';
import { url } from '@/lib/sitio';

const RUTA = '/verificador-tipo-cambio-cfdi';

export const metadata: Metadata = {
  title: 'Verificador de tipo de cambio en CFDI (facturas y pagos en dólares)',
  description:
    'Sube tus XML de CFDI en dólares y revisa si el TipoCambio coincide con el publicado por Banxico en el DOF. Gratis, sin registro y sin subir tus archivos a ningún servidor.',
  alternates: { canonical: url(RUTA) },
};

export const revalidate = 3600;

// Dos años de tipos de cambio (~730 por serie): cubre las facturas que se suelen revisar.
const DIAS = 730;

export default async function VerificadorPage() {
  const d = await datosTipoDeCambio();
  const desde = sumarDias(d.hoy, -DIAS);
  const recorte = <T extends { fecha: string }>(xs: T[]) => xs.filter((p) => p.fecha >= desde);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-text">Verificador de tipo de cambio en CFDI</h1>
      <p className="mt-2 max-w-3xl text-text-soft">
        Revisa si tus facturas y complementos de pago en dólares usan el tipo de cambio que corresponde a su fecha: el
        publicado por Banxico en el DOF el día hábil anterior. Tus archivos se leen en tu navegador y no se envían a
        ningún servidor.
      </p>

      <VerificadorCfdi liquidacion={recorte(d.liquidacion)} publicaciones={recorte(d.publicaciones)} />
      <Fuente serieId={`${SERIES.tipoCambioDOF.id} y ${SERIES.fix.id}`} />

      <TarjetaNoud
        titulo="Revisa todas tus facturas en dólares, no de 20 en 20"
        texto="Noud XML lee todos tus CFDI, valida el tipo de cambio de cada uno y concilia tus complementos de pago en moneda extranjera."
        campana="verificador-cfdi"
        ubicacion="bajo-verificador"
      />

      <section className="mt-12 max-w-3xl space-y-3 text-sm text-text-soft">
        <h2 className="text-xl font-semibold text-text">Qué revisa y cómo leer el resultado</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-text">Facturas (ingreso o egreso):</strong> compara el atributo TipoCambio con el
            tipo de cambio para la fecha de emisión.
          </li>
          <li>
            <strong className="text-text">Complementos de pago:</strong> revisa el TipoCambioP de cada pago contra su
            FechaPago.
          </li>
          <li>
            <strong className="text-text">Correcto:</strong> coincide con lo publicado en el DOF el día hábil anterior.
          </li>
          <li>
            <strong className="text-text">Usa el del mismo día:</strong> coincide con lo publicado ese mismo día. Es una
            diferencia de criterio frecuente; confírmala con tu contador.
          </li>
          <li>
            <strong className="text-text">No coincide:</strong> no corresponde a ninguna de las dos publicaciones. Se
            muestra la diferencia y su impacto aproximado en pesos.
          </li>
        </ul>
        <p>
          Por ahora solo se revisan CFDI en dólares (USD) de los últimos dos años. Para fechas anteriores consulta el{' '}
          <Link href={SERIES.tipoCambioDOF.ruta} className="underline underline-offset-2">
            historial del tipo de cambio DOF
          </Link>
          . Revisión informativa: no sustituye la validación del SAT ni la opinión de tu contador.
        </p>
      </section>
    </main>
  );
}
