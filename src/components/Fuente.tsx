import { fechaLarga } from '@/lib/banxico/parse';

type Props = { serieId: string; fecha?: string };

/** Atribución que pide Banxico: fuente + su dirección de Internet. Va debajo de cada dato. */
export function Fuente({ serieId, fecha }: Props) {
  return (
    <p className="mt-3 text-xs text-neutral-500">
      Fuente:{' '}
      <a
        href="https://www.banxico.org.mx/SieInternet/"
        target="_blank"
        rel="noopener"
        className="underline underline-offset-2 hover:text-neutral-700"
      >
        Banco de México, Sistema de Información Económica (SIE)
      </a>
      , serie {serieId}
      {fecha ? `, dato del ${fechaLarga(fecha)}` : ''}.
    </p>
  );
}
