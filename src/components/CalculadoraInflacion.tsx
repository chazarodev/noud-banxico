'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Ayuda } from '@/components/ui/Tooltip';
import { mesLargo } from '@/components/graficas/formato';

type PuntoMes = { mes: string; valor: number };
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const pesos = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

/** "¿Cuánto valen hoy X pesos de otra fecha?" con el INPC: monto × INPC destino ÷ INPC origen. */
export function CalculadoraInflacion({ indice }: { indice: PuntoMes[] }) {
  const ultimo = indice.at(-1)!.mes;
  const anios = [...new Set(indice.map((p) => Number(p.mes.slice(0, 4))))].sort((a, b) => b - a);
  const [monto, setMonto] = useState('1000');
  const [anioO, setAnioO] = useState(Number(ultimo.slice(0, 4)) - 10);
  const [mesO, setMesO] = useState(Number(ultimo.slice(5, 7)));
  const [anioD, setAnioD] = useState(Number(ultimo.slice(0, 4)));
  const [mesD, setMesD] = useState(Number(ultimo.slice(5, 7)));

  const porMes = useMemo(() => new Map(indice.map((p) => [p.mes, p.valor])), [indice]);
  const clave = (a: number, m: number) => `${a}-${String(m).padStart(2, '0')}`;
  const origen = clave(anioO, mesO);
  const destino = clave(anioD, mesD);
  const n = Number(monto.replace(/[^\d.]/g, ''));
  const io = porMes.get(origen);
  const id = porMes.get(destino);
  const resultado = io && id && n > 0 ? { valor: (n * id) / io, acumulada: (id / io - 1) * 100 } : null;

  const opcMes = MESES.map((m, i) => ({ value: i + 1, label: m }));
  const opcAnio = anios.map((a) => ({ value: a, label: String(a) }));

  return (
    <section className="grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
      <div className="space-y-4">
        <Input
          label="Cantidad"
          prefijo="$"
          inputMode="decimal"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          extra={<Ayuda texto="Se actualiza con el Índice Nacional de Precios al Consumidor (INPC) del INEGI, publicado por Banxico." />}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Mes de origen" value={mesO} onChange={setMesO} options={opcMes} />
          <Select label="Año de origen" value={anioO} onChange={setAnioO} options={opcAnio} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Mes de destino" value={mesD} onChange={setMesD} options={opcMes} />
          <Select label="Año de destino" value={anioD} onChange={setAnioD} options={opcAnio} />
        </div>
      </div>
      <div aria-live="polite" className="flex flex-col justify-center rounded-2xl bg-brand-light p-5">
        {resultado ? (
          <>
            <p className="text-sm text-text-soft">
              {pesos(n)} de {mesLargo(origen)} equivalen a
            </p>
            <p className="text-4xl font-bold text-text">{pesos(resultado.valor)}</p>
            <p className="mt-1 text-sm text-text-soft">en {mesLargo(destino)}</p>
            <p className="mt-4 text-sm text-text">
              Inflación acumulada:{' '}
              <span className="font-semibold">
                {resultado.acumulada.toLocaleString('es-MX', { maximumFractionDigits: 2 })}%
              </span>
            </p>
          </>
        ) : (
          <p className="text-sm text-text-soft">
            No hay INPC para alguno de esos meses. Elige meses hasta {mesLargo(ultimo)}.
          </p>
        )}
      </div>
    </section>
  );
}
