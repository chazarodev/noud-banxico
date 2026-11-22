import { etiquetaX, formatoValor, type EjeX, type Unidad } from './formato';

/** Vista de tabla de una gráfica (accesibilidad y lectura sin pasar el cursor). Plegada por defecto. */
export function TablaDatos({
  columnas,
  filas,
  unidad,
  eje,
  limite = 24,
}: {
  columnas: string[];
  filas: { x: string; valores: (number | undefined)[] }[];
  unidad: Unidad;
  eje: EjeX;
  limite?: number;
}) {
  const visibles = filas.slice(-limite).reverse();
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-text-soft hover:text-text">Ver datos en tabla</summary>
      <div className="mt-2 max-h-72 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-text-soft">
              <th className="py-1.5 font-medium">Fecha</th>
              {columnas.map((c) => (
                <th key={c} className="py-1.5 text-right font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibles.map((f) => (
              <tr key={f.x} className="border-b border-border tabular-nums">
                <td className="py-1.5">{etiquetaX(f.x, eje)}</td>
                {f.valores.map((v, i) => (
                  <td key={i} className="py-1.5 text-right">
                    {v === undefined ? '—' : formatoValor(v, unidad)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
