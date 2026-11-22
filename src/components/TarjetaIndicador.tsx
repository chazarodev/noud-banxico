import Link from 'next/link';

type Props = {
  titulo: string;
  valor: string;
  detalle: string; // fecha o periodo del dato
  descripcion: string;
  nota?: string; // p. ej. un cambio ya anunciado
  href?: string; // página propia, si existe
};

/** Tarjeta de un indicador en la portada. Con href, toda la tarjeta es enlace. */
export function TarjetaIndicador({ titulo, valor, detalle, descripcion, nota, href }: Props) {
  const contenido = (
    <>
      <p className="text-sm font-medium text-text-soft">{titulo}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-text">{valor}</p>
      <p className="mt-1 text-xs text-text-soft">{detalle}</p>
      {nota && (
        <p className="mt-3 inline-block rounded-lg bg-info-soft px-2 py-1 text-xs font-medium text-info-ink">
          {nota}
        </p>
      )}
      <p className="mt-3 text-sm text-text-soft">{descripcion}</p>
      {href && <p className="mt-3 text-sm font-medium text-brand-ink">Ver detalle e historial →</p>}
    </>
  );

  const clases = 'block rounded-2xl border border-border bg-card p-5 shadow-sm';
  return href ? (
    <Link href={href} className={`${clases} transition hover:border-border-strong hover:shadow-md`}>
      {contenido}
    </Link>
  ) : (
    <div className={clases}>{contenido}</div>
  );
}
