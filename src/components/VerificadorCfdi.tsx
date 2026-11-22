'use client';

import { useCallback, useState } from 'react';
import { fechaCorta } from '@/lib/banxico/parse';
import { leerCfdi, revisar, type CfdiLeido, type Punto, type Revision } from '@/lib/cfdi/leer';
import { enlaceNoud } from '@/lib/sitio';

const MAX_ARCHIVOS = 20;

type Props = { liquidacion: Punto[]; publicaciones: Punto[] };

type Fila = { cfdi: CfdiLeido; indice: number; revision: Revision | null };

const tc = (n: number) => n.toFixed(4);
const mxn = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

function Estado({ r }: { r: Revision | null }) {
  if (!r) return <span className="text-danger-ink">No se pudo leer</span>;
  switch (r.estado) {
    case 'correcto':
      return <span className="rounded-md bg-brand-light px-2 py-0.5 font-medium text-brand-ink">Correcto</span>;
    case 'mismo-dia':
      return (
        <span className="rounded-md bg-warning-soft px-2 py-0.5 font-medium text-warning-ink">
          Usa el del mismo día
        </span>
      );
    case 'diferente':
      return <span className="rounded-md bg-danger-soft px-2 py-0.5 font-medium text-danger-ink">No coincide</span>;
    default:
      return <span className="text-text-soft">{r.motivo}</span>;
  }
}

export function VerificadorCfdi({ liquidacion, publicaciones }: Props) {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [omitidos, setOmitidos] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);

  const procesar = useCallback(
    async (lista: FileList | null) => {
      if (!lista) return;
      const xmls = Array.from(lista).filter((f) => f.name.toLowerCase().endsWith('.xml'));
      setOmitidos(Math.max(0, xmls.length - MAX_ARCHIVOS));
      const nuevas: Fila[] = [];
      for (const f of xmls.slice(0, MAX_ARCHIVOS)) {
        const cfdi = leerCfdi(f.name, await f.text());
        if (cfdi.error || cfdi.movimientos.length === 0) {
          nuevas.push({ cfdi, indice: 0, revision: null });
          continue;
        }
        cfdi.movimientos.forEach((m, i) =>
          nuevas.push({ cfdi, indice: i, revision: revisar(m, liquidacion, publicaciones) }),
        );
      }
      setFilas(nuevas);
    },
    [liquidacion, publicaciones],
  );

  const revisadas = filas.filter((f) => f.revision && f.revision.estado !== 'no-aplica');
  const conProblema = revisadas.filter((f) => f.revision!.estado !== 'correcto').length;

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          procesar(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          arrastrando ? 'border-brand bg-brand-light' : 'border-border-strong hover:border-brand'
        }`}
      >
        <span className="text-lg font-medium text-text">Arrastra tus XML aquí o haz clic para elegirlos</span>
        <span className="mt-1 text-sm text-text-soft">
          Hasta {MAX_ARCHIVOS} CFDI a la vez: facturas en dólares o complementos de pago. Se leen en tu navegador; no
          se suben a ningún servidor.
        </span>
        <input
          type="file"
          accept=".xml,text/xml,application/xml"
          multiple
          className="sr-only"
          onChange={(e) => procesar(e.target.files)}
        />
      </label>

      {filas.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-text">
            {revisadas.length === 0
              ? 'Ningún movimiento en dólares para revisar.'
              : conProblema === 0
                ? `Los ${revisadas.length} movimientos en dólares usan el tipo de cambio esperado.`
                : `${conProblema} de ${revisadas.length} movimientos en dólares no usan el tipo de cambio esperado.`}
          </p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-soft">
                  <th className="py-2 pr-3 font-medium">CFDI</th>
                  <th className="py-2 pr-3 font-medium">Fecha</th>
                  <th className="py-2 pr-3 text-right font-medium">TC del CFDI</th>
                  <th className="py-2 pr-3 text-right font-medium">TC esperado</th>
                  <th className="py-2 font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(({ cfdi, indice, revision }) => {
                  const m = cfdi.movimientos[indice];
                  return (
                    <tr key={`${cfdi.archivo}-${indice}`} className="border-b border-border align-top">
                      <td className="py-2 pr-3">
                        <p className="font-medium text-text">{cfdi.serieFolio ?? cfdi.archivo}</p>
                        <p className="text-xs text-text-soft">
                          {cfdi.tipo === 'P' ? `Pago ${indice + 1}` : `Tipo ${cfdi.tipo}`}
                          {cfdi.uuid ? ` · ${cfdi.uuid.slice(0, 8)}…` : ''}
                          {cfdi.error ? ` · ${cfdi.error}` : ''}
                        </p>
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">{m?.fecha ? fechaCorta(m.fecha) : '—'}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {m?.tipoCambio != null ? tc(m.tipoCambio) : '—'}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {revision && 'esperado' in revision ? tc(revision.esperado) : '—'}
                        {revision && 'origen' in revision && revision.origen && (
                          <p className="text-xs text-text-soft">DOF {fechaCorta(revision.origen)}</p>
                        )}
                      </td>
                      <td className="py-2">
                        <Estado r={revision} />
                        {revision?.estado === 'mismo-dia' && (
                          <p className="mt-1 text-xs text-text-soft">
                            Coincide con lo publicado en el DOF ese mismo día ({tc(revision.mismoDia)}).
                          </p>
                        )}
                        {revision?.estado === 'diferente' && (
                          <p className="mt-1 text-xs text-text-soft">
                            Diferencia {revision.diferencia > 0 ? '+' : ''}
                            {tc(revision.diferencia)} · impacto aprox. {mxn(revision.impactoMxn)} sobre{' '}
                            {m?.monto.toLocaleString('es-MX')} USD
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(omitidos > 0 || filas.length >= MAX_ARCHIVOS) && (
            <div className="mt-5 rounded-xl bg-brand-light p-4 text-sm text-text">
              {omitidos > 0 ? `Se omitieron ${omitidos} archivos. ` : ''}¿Tienes cientos de facturas?{' '}
              <a
                href={enlaceNoud('verificador-cfdi', 'limite-archivos')}
                data-evento="click_noud"
                data-ubicacion="verificador-limite"
                className="font-medium text-brand-ink underline underline-offset-2"
              >
                Noud XML revisa y concilia todas tus facturas en dólares
              </a>
              .
            </div>
          )}
        </div>
      )}
    </section>
  );
}
