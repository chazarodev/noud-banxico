import { fechaLarga } from '@/lib/banxico/parse';

type Props = { serieId: string; fecha?: string };

/** Atribución que pide Banxico: fuente + su dirección de Internet. Va debajo de cada dato. */
export function Fuente({ serieId, fecha }: Props) {
  return (
    <p className="mt-3 text-xs text-text-soft">
      Fuente:{' '}
      <a
        href="https://www.banxico.org.mx/SieInternet/"
        target="_blank"
        rel="noopener"
        className="underline underline-offset-2 hover:text-text-soft"
      >
        Banco de México, Sistema de Información Económica (SIE)
      </a>
      , {serieId.includes(' ') ? 'series' : 'serie'} {serieId}
      {fecha ? `, dato del ${fechaLarga(fecha)}` : ''}.
    </p>
  );
}
